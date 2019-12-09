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

/**
 * 修改头像
 * @param {File} photo - 头像文件对象
 */
export const updateUserPhoto = (photo) => {
  // xhr异步提交文件数据，提前包装formData
  const formData = new FormData()
  formData.append('photo', photo)
  // 调用接口进行提交
  return request('/app/v1_0/user/photo', 'patch', formData)
}

/**
 * 修改用户信息
 * @param {String} name - 用户名
 * @param {Integer} gender - 性别  0 男  1 女
 * @param {String} birthday - 生日
 */
export const updateUserInfo = ({ name, gender, birthday }) => {
  return request('/app/v1_0/user/profile', 'patch', { name, gender, birthday })
}

/**
 * 获取用户资料
 */
export const getUserProfile = () => {
  return request('/app/v1_0/user/profile', 'get')
}
