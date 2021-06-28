import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

Vue.config.productionTip = false

//全局过滤器，用于对时间进行格式化
Vue.filter('dateFormat', function(originVal) {
    const dt = new Date(originVal * 1000)
    const y = dt.getFullYear() //年
    const m = (dt.getMonth() + 1 + '').padStart(2, '0') //月  //padStart(2,'0')表示不足两位时，用0填充
    const d = (dt.getDate() + '').padStart(2, '0') //日
    const hh = (dt.getHours() + '').padStart(2, '0') //时
    const mm = (dt.getMinutes() + '').padStart(2, '0') //分
    const ss = (dt.getSeconds() + '').padStart(2, '0') //秒
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
});

//导入全局样式
import '../src/assets/css/global.css'
//导入icon
import '../src/assets/fonts/iconfont.css'
//导入axios
import axios from 'axios'
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/" //配置请求的根路径

//导入插件vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

//导入进度条效果,以及对应的css样式
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
//将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor, /* { default global options } */ )

//请求拦截器,也就是在发生请求之前执行的操作
axios.interceptors.request.use(config => {
    NProgress.start(); //显示进度条效果
    // console.log(config);
    //为请求头对象,添加Token验证的Authorization 字段
    config.headers.Authorization = window.sessionStorage.getItem('token');
    //必须在最后return config
    return config
});
//响应拦截器,也就是对响应数据做点什么
axios.interceptors.response.use(config => {
    NProgress.done(); //隐藏进度条效果
    return config
});
Vue.prototype.$http = axios;
//注册插件vue-table-with-tree-grid
Vue.component('tree-table', TreeTable)

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')