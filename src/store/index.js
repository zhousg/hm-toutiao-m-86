import Vue from 'vue'
import Vuex from 'vuex'

// 全部导入 指定成员
import * as auth from '@/utils/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用户信息
    user: auth.getUser()
  },
  mutations: {
    // 设置信息
    setUser (state, user) {
      // vuex的更新用户信息
      state.user = user
      // 更新本地存储
      auth.setUser(user)
    },
    // 删除信息
    delUser (state) {
      // vuex的更新用户信息
      state.user = {}
      // 更新本地存储
      auth.delUser()
    }
  },
  actions: {
  }
})
