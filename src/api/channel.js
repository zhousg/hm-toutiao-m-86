// 提供频道相关的API函数
import request from '@/utils/request'
import store from '@/store'
// 定义存储本地频道的KEY和VALUE 数组
const KEY = 'hm-toutiao-m-86-channel'
/**
 * 获取我的频道（未登录状态下：获取的是默认频道）
 */
export const getMyChannels = () => {
  // 1. 登录状态：获取后台我的频道数据
  // 2. 未登录状态：
  // 2.1 本地没有存储频道数据，获取默认的频道数据，存储在本地
  // 2.2 本地已经存储频道数据，使用本地数据即可
  // return request('/app/v1_0/user/channels', 'get')
  // 确定：该接口返回的是什么？promise对象
  return new Promise(async (resolve, reject) => {
    const { user } = store.state
    // 判断登录
    if (user.token) {
      const data = await request('/app/v1_0/user/channels', 'get')
      resolve(data)
    } else {
      // 本地频道
      const localChannels = JSON.parse(window.localStorage.getItem(KEY) || '[]')
      if (!localChannels.length) {
        // 获取默认的频道数据
        const data = await request('/app/v1_0/user/channels', 'get')
        // 存储在本地
        window.localStorage.setItem(KEY, JSON.stringify(data.channels))
        resolve(data)
      } else {
        // 返回本地频道数据
        resolve({ channels: localChannels })
      }
    }
  })
}

/**
 * 删除我的频道
 * @param {Integer} channelId - 频道ID
 */
export const delChannel = (channelId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { user } = store.state
      if (user.token) {
        // 调用接口删除
        await request(`/app/v1_0/user/channels/${channelId}`, 'delete')
        resolve()
      } else {
        // 删除本地
        const localChannels = JSON.parse(window.localStorage.getItem(KEY) || '[]')
        const index = localChannels.findIndex(item => item.id === channelId)
        localChannels.splice(index, 1)
        window.localStorage.setItem(KEY, JSON.stringify(localChannels))
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 添加频道（重置式）
 * @param {Array} orderChannels - 排序好的频道列表
 */
export const addChannel = (orderChannels) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { user } = store.state
      if (user.token) {
        // 调用接口进行添加
        await request('/app/v1_0/user/channels', 'put', {
          channels: orderChannels
        })
        resolve()
      } else {
        // 使用本地存储添加
        const localChannels = JSON.parse(window.localStorage.getItem(KEY) || '[]')
        const { id, name } = orderChannels[orderChannels.length - 1]
        localChannels.push({ id, name })
        window.localStorage.setItem(KEY, JSON.stringify(localChannels))
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 获取全部频道
 */
export const getAllChannels = () => {
  return request('/app/v1_0/channels', 'get')
}
