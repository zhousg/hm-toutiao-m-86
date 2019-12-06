
// 在Vue构造函数下  挂载一些 全局组件注册 工具函数 注册 过滤器 自定义指令
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime)

const sleep = () => {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      resolve()
    }, 1500)
  })
}

// value 是使用过滤器的管道符前的js表达式执行结果
const relTime = (value) => {
  // 处理时间格式 moment 插件  体积较大
  // 处理时间格式 dayjs 插件  较为轻量
  return dayjs().locale('zh-cn').from(value)
}

// 定义一个VUE插件的固定写法
// 导出一个对象，必须有一个属性install，指向一个函数，函数会有默认传参Vue构造函数
// 当你在main.js 使用Vue.use(plugin) 这个时候 Vue构造函数 进来了
export default {
  install (Vue) {
    // 扩展原有的功能（插件）
    Vue.prototype.$sleep = sleep
    // 定一个过滤器
    Vue.filter('relTime', relTime)
  }
}
