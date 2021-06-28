import Vue from 'vue'
import VueRouter from 'vue-router'

//导入路由(懒加载)
const Login = () =>
    import ('../components/Login.vue')
const Home = () =>
    import ('../components/Home.vue')
const Welcome = () =>
    import ('../components/Welcome.vue')
const Users = () =>
    import ('../components/user/Users.vue')
const Rights = () =>
    import ('../components/power/Rights.vue')
const Roles = () =>
    import ('../components/power/Roles.vue')
const Categories = () =>
    import ('../components/goods/Categories.vue')
const Params = () =>
    import ('../components/goods/Params.vue')
const Goods = () =>
    import ('../components/goods/Goods.vue')
const Add = () =>
    import ('../components/goods/Add.vue')
const Orders = () =>
    import ('../components/orders/Orders.vue')
const Reports = () =>
    import ('../components/reports/Reports.vue')

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
// import Users from '../components/user/Users.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
// import Categories from '../components/goods/Categories.vue'
// import Params from '../components/goods/Params.vue'
// import Goods from '../components/goods/Goods.vue'
// import Add from '../components/goods/Add.vue'
// import Orders from '../components/orders/Orders.vue'
// import Reports from '../components/reports/Reports.vue'
Vue.use(VueRouter)

const routes = [
    { path: '', redirect: '/login' },
    { path: '/login', component: Login },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [
            { path: '/welcome', component: Welcome },
            { path: '/users', component: Users },
            { path: '/rights', component: Rights },
            { path: '/roles', component: Roles },
            { path: '/categories', component: Categories },
            { path: '/params', component: Params },
            { path: '/goods', component: Goods },
            { path: '/add', component: Add },
            { path: '/orders', component: Orders },
            { path: '/reports', component: Reports }
        ]
    },
]

const router = new VueRouter({
    routes
});

//路由导航守卫控制访问权限, 问题:如果用户没有登录,但是通过URL访问特定的页面,则需要强制跳转到登录页面登录后,才可访问特定的页面
router.beforeEach((to, from, next) => {
    //to 表示将要访问的地址
    //from 表示从那个路径跳转而来
    //next 是一个函数, next()表示放行, next('/login')表示强制跳转
    if (to.path === '/login') return next();
    //获取token
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login');
    next()
});

export default router