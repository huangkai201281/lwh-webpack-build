
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');//构建进度条插件
const glob = require('glob');
const PurifyCSSPlugin = require('purifycss-webpack');
const copyWebpackPlugin = require('copy-webpack-plugin');
const Happypack = require('happypack')
const config = require('./config/config.js')
const MoveAssetsToDirPlugin = require('./plugins/moveAssetsToDirPlugin.js')
const NotFoudEntryPlugin = require('./plugins/notFoudEntryPlugin.js')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");//提取css到单独文件的插件
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');//压缩css插件
const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')


function getExports(project){

    let entry = {}
    let cacheGroups = {}
    let plugins = []
    let alias = {}
    config.apps.forEach((app)=>{
        entry[app] = `${config.mainDir}/${project}/${app}/main.js`
        cacheGroups[`${app}Assets`] = {
            chunks: 'initial',// 只对入口文件处理
            test: path.resolve(`${config.mainDir}/${project}/${app}/assets`),
            // test: /assets/,
            name: `${app}/assets`,
            priority: 10,
            enforce: true,
            minChunks:1//最小被引用两次的公共库才被抽离到公共代码
        }
        //'@':path.resolve(`${config.mainDir}/${project}`)
        alias[`@${app}`] = path.resolve(`${config.mainDir}/${project}/${app}`)
        plugins.push(new HtmlWebpackPlugin({
            filename: `${app}/index.html`,//真正输出的地址output.path+filename=./dist/index.html
            template:`${config.mainDir}/${project}/${app}/index.html`,//INdex的模板
            inject: true,
            hash:true,
            title:app,
            minify: {
                removeAttributeQuotes: true, // 移除属性的引号
                collapseWhitespace:true,//html片段变成一行
                removeComments: true
            },
            excludeChunks: config.apps.filter((item)=> {
                return item !== app
            }),
            chunks:[app]//按需映入入口JS
        }))
    })
    let rules = []
    config.apps.forEach((app)=>{
        let reg  = new RegExp(`${app}\\\\images\\\\.+\\.(gif|png|jpg|svg)`)
        rules.push(
            {
                test:reg,
                use:{
                    loader:'url-loader',
                    options: {
                        outputPath:`/${app}/images`,
                        // publicPath:'dist/images',
                        name:'[name].[hash:8].[ext]',
                        limit:1024*1//小于8KB会被转成base64
                    }
                },
                exclude:[path.resolve('./dist'),/node_modules/]//排除解析dist文件夹
                //include:[path.resolve('./projects/project1/src')]//只编译src文件夹 但是node_modules除外
            }
        )
    })
    config.apps.forEach((app)=>{
        let reg = new RegExp(`[\\\\/]${app}[\\\\/](style|less)[\\\\/].+\\.(less|css)`)
        rules.push({
            test:function(url){
                return reg.test(url)
            },
            use:[
                {
                    loader: MiniCssExtractPlugin.loader,//注意这边
                    options: {
                        publicPath: '../'//解决css下的图片路径错误问题
                    }
                },
                {
                    loader:'css-loader'
                },
                {loader:'postcss-loader'}//配合postcss.config文件来加CSS前缀
            ],
            exclude:[path.resolve('./dist'),/node_modules/],//排除解析dist文件夹
            include:[path.resolve(`${config.mainDir}/${project}`,app),path.resolve(`${config.parentMainDir}`,app)]//只编译src文件夹 但是node_modules除外
        })
    })

    return {
        entry: Object.assign(entry,{}),
        output:{
            path:path.resolve(__dirname,'dist',project),
            filename:'js/[name].[hash:8].bundle.js',
            publicPath: ""
            //publicPath:"dist"//页面上引入的路径 比如js/xxx就会变成dist/js/xxx
        },
        externals: {
            // 使用动态连接库的VUE模块，这样就可以直接在项目中require('Vue')使用 webpack不会进行打包
            //'Vue': 'window._dll_vueAll(\'./node_modules/vue/dist/vue.min.js\')'
        },
        resolve: {
            //import时可以省去后缀名js vue json默认require先找.js从左到右
            //作用于项目中，webpack配置文件中无法使用
            extensions: ['.js', '.vue', '.json','.less'],
            //require('xxx')先去src目录下找没有才去node_modules从左到右
            //作用于项目中，webpack配置文件中无法使用
            // path.resolve(config.parentMainDir)
            modules: [path.resolve("node_modules")/*path.resolve(`${config.mainDir}/${project}`)*/],
            //原本在文件夹里去找package.json只会找main和module现在fuck和shit也会去找优先级从左到右
            mainFields:['main','module','fuck','shit'], 
            //给引入的模块取个别名可以是文件全路径也可以是文件夹
            alias:Object.assign(alias,{
                '@parent':path.resolve(config.parentMainDir)
            })
        },
        resolveLoader: {
            // alias: {
            //     testLoader:path.resolve('./loaders/testLoader.js')
            // },
            mainFields:['main'],
            modules: [path.resolve("node_modules"),path.resolve("loaders")]
        },
        module:{
            //不去解析的文件
            noParse: [/lwh\.js/],
            rules:rules.concat([
                //解析html页面上的img标签 但是htmlWebpackPlugin.options.title无法读取 可用express静态资源解决
                {
                    test:/\.(html|htm)/,
                    loader:'html-withimg-loader'
                },
                // env（替代es2015那些），stage-0，transform-runtime垫片
                {
                    test:/\.js/,
                    use: ['happypack/loader?id=babel'],
                    // 不设置这个会报错
                    exclude: /node_modules/
                },
                {
                    test:/(\.js)/,
                    use:{
                        loader:'notFoudLoader',
                        options:{
                            mainDir:config.mainDir.replace('./','')
                        }
                    },
                    exclude:[path.resolve('./dist'),/node_modules/],
                    include:[path.resolve(`${config.mainDir}`),path.resolve(`${config.parentMainDir}`)]
                }
            ])
        },
        optimization: {
            splitChunks: {
                cacheGroups:Object.assign(cacheGroups,{
                    vendor: {
                        chunks: 'initial',// 只对入口文件处理
                        test:/[\\/]node_modules[\\/]/,
                        name: 'vendor',
                        priority: 10,
                        enforce: true,
                        // minChunks:1//最小被引用两次的公共库才被抽离到公共代码
                    }
                })
            },
            //抽取webpack运行文件代码
            runtimeChunk: {
                name: 'manifest'
            },
            minimizer: [
                new OptimizeCssAssetsPlugin()
            ]
        },
        plugins: plugins.concat([

            /*//在这边配置全局引入后哪个模块不用require都可以用
             new webpack.ProvidePlugin({
             $:'jquery'
             }),*/
            new CleanWebpackPlugin(['./dist/'+project]),//删除文件夹插件
            //清除没用到的样式，只有在抽离css的模式生效,指定的是模板html文件
            new PurifyCSSPlugin({
                // Give paths to parse for rules. These should be absolute!
                paths: glob.sync(path.join(__dirname, './*.html')),
            }),
            //new uglifyjsWebpackPlugin(),//webpack4会对JS进行自动压缩
            //指定html位置指定后打包的js会自动被引入
            new ProgressBarPlugin(),
            new webpack.DefinePlugin({
                dev:false
            }),
            new Happypack({
                //ID是标识符的意思，ID用来代理当前的happypack是用来处理一类特定的文件的
                id: 'babel',
                use:[{
                    loader:'babel-loader',
                    query:{
                        presets:['env','stage-0','react'],//把es6 es7转成es语法
                        plugins: [
                            [
                                'transform-runtime',
                                {
                                    corejs: true,
                                    helpers: true,
                                    regenerator: true,
                                    useESModules: true,
                                    moduleName: 'babel-runtime'
                                }
                            ]
                        ]
                    }
                }],
                threads: 3,//你要开启多少个子进程去处理这一类型的文件
                verbose: true//是否要输出详细的日志 verbose
            }),
            new NotFoudEntryPlugin({
                mainDir:config.mainDir,
                parentDir:config.parentMainDir
            }),
            new MiniCssExtractPlugin({
                filename: "[name]/css/[name]Style.css",
                chunkFilename: "[name]/css/[name]Style.[hash:8].css"}),
            new WebpackParallelUglifyPlugin({
                uglifyJS: {
                    output: {
                        beautify: false, //不需要格式化
                        comments: false //不保留注释
                    },
                    compress: {
                        warnings: false, // 在UglifyJs删除没有用到的代码时不输出警告
                        drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
                        collapse_vars: true, // 内嵌定义了但是只用到一次的变量
                        reduce_vars: true // 提取出出现多次但是没有定义成变量去引用的静态值
                    }
                }
            }),
            new MoveAssetsToDirPlugin()
            //抽取CSS
        ])
    }
}


module.exports = getExports(config.project)