const co = require('.')


co(function(){
  return 1;
}).then(function(data){
  console.log(data)
})