// 导出调用用户相关接口的API函数
import request from '@/utils/request'

/**
 * 进行登录
 * @param {Object} loginForm - 用户信息（mobile,code）
 */
export const login = (loginForm) => {
  return request('/app/v1_0/authorizations', 'post', loginForm)
}

/**
 * 关注
 * @param {Integer} userId - 用户ID
 */
export const followings = (userId) => {
  return request('/app/v1_0/user/followings', 'post', {
    target: userId
  })
}
/**
 * 取消关注
 * @param {Integer} userId - 用户ID
 */
export const unFollowings = (userId) => {
  return request(`/app/v1_0/user/followings/${userId}`, 'delete')
}

/**
 * 获取（个人中心的）用户信息
 */
export const getUserInfo = () => {
  return request('/app/v1_0/user', 'get')
}
