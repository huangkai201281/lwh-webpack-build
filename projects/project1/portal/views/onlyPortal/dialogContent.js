/**
 * Created by Allen Liu on 2019/5/30.
 */
export default function(context){
    return {
        template:'按钮：<button @click="clickMe()">{{btnValue}}</button>',
        data:{
            btnValue:'点我点我'
        },
        methods:{
            clickMe(){
                //改变当前页面的data数据
                context.fuck = '66666'
            }
        },
        mounted(){
            console.log('弹窗被挂载');
        }
    }
}