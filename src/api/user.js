// 导出调用用户相关接口的API函数
import request from '@/utils/request'

/**
 * 进行登录
 * @param {Object} loginForm - 用户信息（mobile,code）
 */
export const login = (loginForm) => {
  return request('/app/v1_0/authorizations', 'post', loginForm)
}
