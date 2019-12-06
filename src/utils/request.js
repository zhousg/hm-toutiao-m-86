// 准备一个配置好的axios，导出一个调用接口函数
import axios from 'axios'
import JSONBIGINT from 'json-bigint'
// 1. 处理js最大安全数值
// 2. 在每次请求头中携带token
// 3. 处理响应数据（剥离无效数据）
// 4. 自动刷新token
// 5. 导出一个调用配置好的axios发请求的函数

// vuex的仓库  vuex实例
import store from '@/store'
// router实例
import router from '@/router'

// 使用一个新的axios实例来配置
const instance = axios.create({
  // 基准地址
  baseURL: 'http://ttapi.research.itcast.cn/',
  // js最大安全数值处理
  transformResponse: [(data) => {
    // data是原始后端给的字符串数据 格式json字符串
    // JSON.parse进行转换  id会有误差
    try {
      return JSONBIGINT.parse(data)
    } catch (e) {
      return data
    }
  }]
})

// 请求拦截器 （在请求头携带token）
instance.interceptors.request.use(config => {
  // 添加配置
  if (store.state.user.token) {
    config.headers.Authorization = `Bearer ${store.state.user.token}`
  }
  return config
}, err => {
  // axios要求遇见错误时候，必须返回一个错误的promise对象
  return Promise.reject(err)
})

// 响应拦截器
instance.interceptors.response.use(res => {
  // 剥离无效数据  res.data.data 有效数据
  // 将来调用axios获取到的数据：直接就是data数据
  try {
    return res.data.data
  } catch (e) {
    return res
  }
}, async err => {
  // token刷新
  // 跳转登录的路由配置
  // 获取路由信息 $route  调用路由函数 $router  根据 $router 获取当前路由信息
  // router.currentRoute  ===  获取路由信息 $route
  const loginConfig = { path: '/login', query: { redirectUrl: router.currentRoute.path } }
  try {
    if (err.response && err.response.status === 401) {
      // 1. 判断是否登录
      const { user } = store.state
      if (!user.token || !user.refresh_token) {
        // 去登录页面
        router.push(loginConfig)
        // 阻止程序运行
        return Promise.reject(err)
      }
      // 2. token失效了
      // 2.1 发请求给后台获取新的token
      // 2.2 成功 刷新程序中的token  继续请求
      // 2.3 失败 去登录页面
      const res = await axios({
        url: 'http://ttapi.research.itcast.cn/app/v1_0/authorizations',
        method: 'put',
        // 传递请求头数据
        headers: {
          Authorization: `Bearer ${user.refresh_token}`
        }
      })
      // 成功 刷新程序中的token
      store.commit('setUser', {
        token: res.data.data.token,
        refresh_token: user.refresh_token
      })
      // 成功 继续请求  之前错误的请求
      // instance({之前错误的请求配置})
      // 错误的请求配置：err.config
      return instance(err.config)
    }
  } catch (e) {
    // 出错 登录页面
    router.push(loginConfig)
    // 阻止程序运行
    return Promise.reject(e)
  }
  return Promise.reject(err)
})

/**
 * 调用接口
 * @param {String} url - 接口地址
 * @param {String} method - 请求方式
 * @param {Object} data - 传后台参数
 */
export default (url, method, data) => {
  // 调用接口，使用axios，返回的是promise
  // jquery发请求：简写 $.get()  $.post() 完整 $.ajax({请求配置})
  // axios发请求：简写 axios.get() axios.post() ... 完整 axios({请求配置})
  return instance({
    url,
    method,
    // 不同的请求方式传递参数的配置选项不一样
    // get请求传参：params:{数据}  其他方式传参： data:{数据}
    // 需要根据method来判断 传参写在那个配置选项中
    // 支持的 get Get GET 都行
    [method.toLowerCase() === 'get' ? 'params' : 'data']: data
  })
}
