// 准备一个配置好的axios，导出一个调用接口函数
import axios from 'axios'
import JSONBIGINT from 'json-bigint'

// vuex的仓库  vuex实例
import store from '@/store'

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
  return Promise.reject(err)
})

// 响应拦截器
