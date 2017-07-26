// co内部处理全部的脏活, 包括对错误的处理
// 错误处理的方式是将异常bubble到主要流程中
function coLike(gen) {
  const it = gen()

  return new Promise((resolve, reject) => {
    onResolve()
  })

  function next(work) {
    // 将任意代码转换为Promise, 然后为他们绑定处理方法
    let promise = toPromise(work)
  }

  function onReject(res) {
    let ret
    try {
      ret = it.throw(res)
    } catch(e) {
      reject(e)
    }
    next(work) // 就算出错也要干活
  }

  function onResolve(res) {
    let work
    try {
      work = it.next(res) // 这里通常返回的是函数, res其实是上次的执行结果, 然后将结果返回generator
    } catch(e) {
      reject(e)
    }
    next(work)
  }
}

function toPromise(obj) {
  // 检查输入变量
  if (!obj) return obj
  if ()
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

