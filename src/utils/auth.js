// auth认证  token身份认证

// 用户信息存储在本地：
// 1. 约定key  hm-toutiao-m-86-user
// 2. 约定value  json字符串  {token:'',refresh_token:''}
const KEY = 'hm-toutiao-m-86-user'
// 获取
export const getUser = () => {
  return JSON.parse(window.localStorage.getItem(KEY) || '{}')
}
// 设置
export const setUser = (user) => {
  window.localStorage.setItem(KEY, JSON.stringify(user))
}

// 删除
export const delUser = () => {
  window.localStorage.removeItem(KEY)
}
