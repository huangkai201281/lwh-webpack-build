
console.log('当前是否开发环境'+dev);
console.log('project1的9999999999')
require('../style/style2.css');
//require('@/less/style1.less');
//let data1 = require('data/data1.js')
//let data2 = require('@/data/data2.js')
//console.log(data2);
require('jquery')
require('portal/assets/test.js')
// require('portal/assets/vue.min.js')
// let data1 = require('portal/data/data1.js')
// console.log(data1);
//require('portal/assets/vueAll_dll.js')
if(module.hot){
    module.hot.accept();
}
