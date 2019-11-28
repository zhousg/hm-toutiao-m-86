import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 自动设置rem的基准值
import 'amfe-flexible'

// 组件库  插件形态
import Vant from 'vant'
import 'vant/lib/index.css'
Vue.use(Vant)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
