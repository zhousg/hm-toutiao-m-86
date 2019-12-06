import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 自动设置rem的基准值
import 'amfe-flexible'

// 组件库  插件形态
import Vant, { Lazyload } from 'vant'
import 'vant/lib/index.less'

// 覆盖vant的样式
import '@/styles/index.less'

// 导入自己插件
import plugin from '@/utils/plugin'
Vue.use(plugin)

Vue.use(Vant)
Vue.use(Lazyload)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
