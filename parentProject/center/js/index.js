
console.log('当前是否开发环境'+dev);
alert('parent的center')
//require('style/style1.css');
//require('@/less/style1.less');
//let data1 = require('data/data1.js')
//let data2 = require('@/data/data2.js')
//require('jquery')
// console.log(data2);
if(module.hot){
    module.hot.accept();
}

