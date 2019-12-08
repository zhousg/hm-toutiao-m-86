// 提供文章相关的API函数
import request from '@/utils/request'

/**
 * 获取文章列表
 * @param {Integer} channelId - 频道ID
 * @param {Integer} timestamp - 时间戳
 */
export const getArticles = (channelId, timestamp) => {
  return request('/app/v1_1/articles', 'get', {
    channel_id: channelId,
    timestamp,
    with_top: 1
  })
}

/**
 * 对文章不喜欢
 * @param {String} articleId - 文章的ID
 */
export const disLikes = (articleId) => {
  return request('/app/v1_0/article/dislikes', 'post', {
    target: articleId
  })
}
/**
 * 取消对文章不喜欢
 * @param {String} articleId - 文章的ID
 */
export const unDisLikes = (articleId) => {
  return request(`/app/v1_0/article/dislikes/${articleId}`, 'delete')
}

/**
 * 对文章点赞
 * @param {String} articleId - 文章的ID
 */
export const likings = (articleId) => {
  return request('/app/v1_0/article/likings', 'post', {
    target: articleId
  })
}
/**
 * 取消对文章点赞
 * @param {String} articleId - 文章的ID
 */
export const unLikings = (articleId) => {
  return request(`/app/v1_0/article/likings/${articleId}`, 'delete')
}

/**
 * 举报文章
 * @param {String} articleId - 文章的ID
 * @param {Integer} type - 举报类型
 */
export const report = (articleId, type) => {
  return request('/app/v1_0/article/reports', 'post', {
    target: articleId,
    type
  })
}

/**
 * 文章关键字 联想建议
 * @param {String} q - 搜索关键字
 */
export const suggest = (q) => {
  return request('/app/v1_0/suggestion', 'get', { q })
}

/**
 * 搜索文章
 * @param {Integer} page - 页码 默认1
 * @param {Integer} perPage - 每页多少条  默认10
 * @param {String} q - 搜索关键字
 */
export const searchArticles = ({ page = 1, perPage = 10, q }) => {
  return request('/app/v1_0/search', 'get', {
    page,
    per_page: perPage,
    q
  })
}

/**
 * 获取文章详情
 * @param {String} articleId - 文章ID
 */
export const getArticle = (articleId) => {
  return request('/app/v1_0/articles/' + articleId, 'get')
}

/**
 * 获取 评论列表 或者 回复列表
 * @param {String} type - a 获取评论  c 获取回复
 * @param {String} source - 获取评论 文章ID  获取回复 评论ID
 * @param {String} offset - null 获取第一页数据   上一次的返回列表最后一个ID
 */
export const getCommentsOrReplys = ({ type, source, offset = null }) => {
  return request('/app/v1_0/comments', 'get', { type, source, offset })
}

/**
 * 进行评论或者回复
 * @param {String} target - 做评论的时候文章ID  做回复的时候评论ID
 * @param {String} content - 发表内容
 * @param {String} artId - 当你是做回复的时候 文章ID
 */
export const commentOrReply = (target, content, artId = null) => {
  return request('/app/v1_0/comments', 'post', { target, content, art_id: artId })
}
