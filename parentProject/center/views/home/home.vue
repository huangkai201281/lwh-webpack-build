<template>
    <div class="main">
        <div v-if="$route.name==='home'">
            <div>parent Hello Home!11112</div>
            <!--<img src="@center/images/afei.jpg">
            <img src="@center/images/皮卡22.jpg">-->
            <ul>
                <li><a href="javascript:void(0)" @click="goState('home')">/center</a></li>
                <li><a href="javascript:void(0)" @click="goState('test1')">home/test1</a></li>
                <li><a href="javascript:void(0)" @click="goState('test2')">home/test2</a></li>
                <li><a href="javascript:void(0)" @click="goState('onlyCenter')">我是center子项目独有的</a></li>
            </ul>
            <div class="lwh">lwh</div>
            <div class="bgImg"></div>
        </div>
        <transition name="fuck" appear>
            <keep-alive>
                <router-view v-if="$route.meta.keepAlive || $route.meta.keepAlive===undefined"></router-view>
            </keep-alive>
        </transition>
        <transition name="fuck" appear>
            <router-view v-if="$route.meta.keepAlive===false"></router-view>
        </transition>
    </div>
</template>

<script>
    export default {
        mounted() {
//            console.log(this.$http,'this');
            this.$http.get('/aaa', {
                params: {
                    a: '1'
                },
                headers: {
                    fuck: '2222'
                }
            }).then((data) => {
                if(data){
                    console.log(data.data, 'this');
                }
            })
        },
        methods: {
            goState: function (stateName) {
                this.$router.push({name: stateName});
            },
            goPath: function (path) {
                this.$router.push({path: path});
            }
        }
    }
</script>

<style scoped lang="less">
    /*如果在scoped的情况下引用的less里面带全局的标签例如body那么body就会变成body[data-1212]{}引用不到*/
    /*@import "~@center/style/color.css";*/
    /*@import "~@center/less/style1.less";*/
    .main {
        color: green;
        .lwh {
            color: red;
        }
    }

    .bgImg {
        width: 850px;
        height: 700px;
        background: url('~@center/images/皮卡22.jpg');
        background-size: cover;
        background-repeat: no-repeat;
    }
</style>
<!--要想全局的body能吃到样式就必须再开一个不带scope的style标签-->
<style lang="less">
    @import "~@center/less/style1.less";
</style>