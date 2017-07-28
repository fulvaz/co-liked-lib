// co内部处理全部的脏活, 包括对错误的处理
// 错误处理的方式是将异常bubble到主要流程中

// 可以处理generator、
function coLike(gen) {
  const ctx = this
  // 如果传入的是一个function， 应该直接打包成promise返回

  return new Promise((resolve, reject) => {
    if (typeof gen === 'function') gen = gen.call(ctx)
    if (!gen || 'function' !== typeof gen.next) resolve(gen)
    onResolve()

    function next(ret) {
      if (ret.done) return resolve(ret.value)
      // 将任意代码转换为Promise, 然后为他们绑定处理方法
      let promise = toPromise.call(ctx, ret.value)
      if (promise && isPromise(promise)) return promise.then(onResolve, onReject)
      return onReject(new TypeError('Type Error: you pass the wrong type'))
    }

    function onReject(res) {
      let ret
      try {
        ret = gen.throw(res)
      } catch (e) {
        reject(e)
      }
      next(ret) // 就算出错也要干活
    }

    function onResolve(res) {
      let ret
      try {
        ret = gen.next(res) // 这里通常返回的是函数, res其实是上次的执行结果, 然后将结果返回generator
      } catch (e) {
        reject(e)
      }
      next(ret)
    }
  })
}

// 其实是一个比较重要的函数, co的扩展都是在这里进行的
// 对类型不同的输入都转换到一个特定的协议进行处理---这里是Promise
function toPromise(obj) {
  // 检查输入变量
  if (!obj) return obj
  if (isPromise(obj)) return obj
  if (isGenerator(obj)) return coLike.call(this, obj)
  // 将function转换为promise
  // 这里假设你的函数是一个thunk---同一标准, 不然没法处理了
  // 另外, 都会很正常地认为你传进来的是一个异步函数. 当然不是异步的也没关系, 同步代码会在promise中全执行了
  if ('function' === typeof obj) return thunkToPromise.call(this, obj)
  // co这里还扩展了对array于object输入的处理, 我就不管了
}

function isPromise(obj) {
  // 检查是否有then
  return 'function' === typeof obj.then // 已经检查了空的情况
}

function isGenerator(obj) {
  // 构造器函数返回的是一个类
  const constructor = obj.constructor
  if (!constructor) return false

  // 特征1 
  if (constructor.name === 'GeneratorFunction') return true

  // 特征2
  const conProto = constructor.prototype
  return 'function' === typeof conProto.next && 'function' === typeof conProto.throw
}

function thunkToPromise(thunkFunc) {
  return new Promise((resolve, reject) => {
    thunkFunc((err, res) => {
      // 当有多个返回值的话, 就以数组的形式resolve多个
      if (err) reject(err)
      if (arguments.length > 2) res = arguments.slice(1)
      resolve(res)
    })
  })
}

module.exports = coLike