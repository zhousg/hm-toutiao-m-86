import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

// 路由级别组件
const Layout = () => import('@/views/Layout')
const Home = () => import('@/views/home/Index')
const Question = () => import('@/views/question/Index')
const Video = () => import('@/views/video/Index')
const User = () => import('@/views/user/Index')
const UserProfile = () => import('@/views/user/Profile')
const UserChat = () => import('@/views/user/Chat')
const Login = () => import('@/views/user/Login')
const Search = () => import('@/views/search/Index')
const SearchResult = () => import('@/views/search/Result')
const Article = () => import('@/views/home/Article')

Vue.use(VueRouter)

// 路由规则
const routes = [
  // 首页 问答 视频 我的 公用布局组件
  {
    path: '/',
    component: Layout,
    children: [
      // 首页
      { path: '/', name: 'home', component: Home, meta: { isKeepAlive: true } },
      // 问答
      { path: '/question', name: 'question', component: Question },
      // 视频
      { path: '/video', name: 'video', component: Video },
      // 我的 个人中心
      { path: '/user', name: 'user', component: User }
    ]
  },
  // 编辑资料
  { path: '/user/profile', name: 'user-profile', component: UserProfile },
  // 小智同学
  { path: '/user/chat', name: 'user-chat', component: UserChat },
  // 登录
  { path: '/login', name: 'login', component: Login },
  // 搜索中心
  { path: '/search', name: 'search', component: Search },
  // 搜索结果
  { path: '/search/result', name: 'search-result', component: SearchResult },
  // 文章详情
  { path: '/article', name: 'article', component: Article, meta: { isKeepAlive: true } }
]

const router = new VueRouter({
  routes
})

// 跳转路由前：个人中心 /user 编辑资料 /user/profile  小智同学 /user/chat 判断登录状态
router.beforeEach((to, from, next) => {
  const { user } = store.state
  // 当你访问的是以上三个页面中的一个，并且此时没有做登录，拦截到登录页面（回跳）
  const loginConfig = { path: '/login', query: { redirectUrl: to.path } }
  if (to.path.startsWith('/user') && !user.token) return next(loginConfig)
  next()
})

export default router
