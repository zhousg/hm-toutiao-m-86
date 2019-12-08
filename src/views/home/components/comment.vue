<template>
  <div class="comment">
    <!-- 评论列表 -->
    <van-list :immediate-check="false" @load="getComments" v-model="loading" :finished="finished" finished-text="没有更多评论了">
      <div class="item van-hairline--bottom van-hairline--top" v-for="item in comments"  :key="item.com_id.toString()">
        <van-image round width="1rem" height="1rem" fit="fill" :src="item.aut_photo" />
        <div class="info">
          <p>
            <span class="name">{{item.aut_name}}</span>
            <span style="float:right">
              <span class="van-icon van-icon-good-job-o zan"></span>
              <span class="count">{{item.like_count}}</span>
            </span>
          </p>
          <p class="content">{{item.content}}</p>
          <p>
            <span class="time">{{item.pubdate|relTime}}</span>&nbsp;
            <van-tag plain @click="openReplyDialog(item.com_id.toString())">{{item.reply_count}} 回复</van-tag>
          </p>
        </div>
      </div>
    </van-list>
    <!-- 底部输入框 -->
    <div class="reply-container van-hairline--top">
      <van-field v-model.trim="value" :placeholder="showReply?'写回复...':'写评论...'">
        <van-loading v-if="submiting" slot="button" type="spinner" size="16px"></van-loading>
        <span @click="submit()" class="submit" v-else slot="button">提交</span>
      </van-field>
    </div>
    <!-- 回复 -->
    <van-action-sheet v-model="showReply" class="reply_dailog" title="回复评论">
      <van-list :immediate-check="false" @load="getReplys" v-model="reply.loading" :finished="reply.finished" finished-text="没有更多回复了">
        <div class="item van-hairline--bottom van-hairline--top" v-for="item in reply.list" :key="item.com_id.toString()">
          <van-image round width="1rem" height="1rem" fit="fill" :src="item.aut_photo" />
          <div class="info">
            <p><span class="name">{{item.aut_name}}</span></p>
            <p>{{item.content}}</p>
            <p><span class="time">{{item.pubdate|relTime}}</span></p>
          </div>
        </div>
      </van-list>
    </van-action-sheet>
  </div>
</template>

<script>
// 渲染评论列表
// 1. 定义获取评论的接口
// 2. 在组件激活的时候 获取数据  每次需要看到最新评论
// 3. van-list @load事件 获取数据  禁止：在组件初始化的时候主动触发一次
// 4. 获取数据 是一个函数   激活的时候  和触发 @load 的时候调用
// 5. 渲染评论列表

// 渲染回复列表
// 1. getCommentsOrReplys 支持回复列表
// 2. 打开 回复 对话框的时候  获取数据
// 3. van-list @load事件 获取数据 禁止：在组件初始化的时候主动触发一次
// 4. 获取数据 是一个函数 打开回复对话框 和 触发@load的时候调用
// 5. 渲染回复列表

// 对文章进行评论  对评论进行回复  同一个逻辑
// 1. 定义发表 评论或回复 的接口
// 2. 点击 提交 按钮 调用接口（区分操作行为）
// 3. 对话框的状态可以判断  showReply false 评论 true 回复
// 4. 发请求，提交中状态需要开启
// 5. 响应后，提交中状态需要关闭
// 6. 成功后，提示 + 给当前列表顶部追加  发表的内容（评论|回复）
// 7. 异常处理
import { getCommentsOrReplys, commentOrReply } from '@/api/article'
export default {
  data () {
    return {
      // 评论列表加载中
      loading: false,
      // 评论列表是否全部加载完毕
      finished: false,
      // 获取评论偏移量
      offset: null,
      // 评论列表
      comments: [],
      // 输入内容
      value: '',
      // 提交中
      submiting: false,
      // 控制回复显示隐藏
      showReply: false,
      // 回复列表相关的数据
      reply: {
        loading: false,
        finished: false,
        offset: null,
        list: []
      },
      commentId: null
    }
  },
  activated () {
    // 激活组件，清空评论，获取最新评论，开启加载效果，重置完成加载状态
    this.comments = []
    this.offset = null
    this.loading = true
    this.finished = false
    this.getComments()
  },
  methods: {
    // 提交
    async submit () {
      // 看是否有内容
      if (!this.value) return false
      // 正在提交
      this.submiting = true
      await this.$sleep()
      try {
        if (this.showReply) {
        // 回复
          const data = await commentOrReply(this.commentId, this.value, this.$route.params.id)
          this.$toast.success('回复成功')
          // 在回复列表顶部追加 一条 新的回复(data.new_obj)
          this.reply.list.unshift(data.new_obj)
          // 评论列表对应的评论的回复数量需要累加
          const comment = this.comments.find(item => item.com_id.toString() === this.commentId)
          comment.reply_count++
        } else {
        // 评论
          const data = await commentOrReply(this.$route.params.id, this.value)
          this.$toast.success('评论成功')
          this.comments.unshift(data.new_obj)
        }
        // 结束提交
        this.submiting = false
        this.value = ''
      } catch (e) {
        this.$toast.fail('操作失败')
        // 结束提交
        this.submiting = false
      }
    },
    // 打开回复对话框
    openReplyDialog (id) {
      this.showReply = true
      // 记录点击的评论ID
      this.commentId = id
      // 清空list数据 开启加载效果  重置完成加载状态 偏移量需要为null
      this.reply.list = []
      this.reply.loading = true
      this.reply.finished = false
      this.reply.offset = null
      // 获取数据
      this.getReplys()
    },
    // 获取回复列表
    async getReplys () {
      await this.$sleep()
      const data = await getCommentsOrReplys({
        type: 'c',
        source: this.commentId,
        offset: this.reply.offset
      })
      this.reply.list.push(...data.results)
      // 结束加载
      this.reply.loading = false
      // 判断是否还有数据
      if (data.last_id > data.end_id) {
        this.reply.offset = data.last_id
      } else {
        this.reply.finished = true
      }
    },
    // 获取评论列表
    async getComments () {
      await this.$sleep()
      const data = await getCommentsOrReplys({
        type: 'a',
        source: this.$route.params.id,
        offset: this.offset
      })
      this.comments.push(...data.results)
      // 结束加载效果
      this.loading = false
      // 判断是否还有数据
      if (data.last_id > data.end_id) {
        // 使用这次的最后一条数据的ID做为偏移量
        this.offset = data.last_id
      } else {
        this.finished = true
      }
    }
  }
}
</script>

<style scoped lang='less'>
// 评论列表
.comment {
  margin-top: 10px;
  /deep/ .item {
    display: flex;
    padding: 10px 0;
    .info {
      flex: 1;
      padding-left: 10px;
      width: 100%;
      overflow: hidden;
      .name{
        color:#069;
      }
      .zan{
        vertical-align:middle;
        padding-right:2px;
      }
      .count{
        vertical-align:middle;
        font-size:10px;
        color: #666;
      }
      .time{
        color: #666;
      }
      p {
        padding: 5px 0;
        margin: 0;
      }
    }
  }
  /deep/ .van-button:active::before {
    background: transparent;
  }
}
// 输入框
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
  .submit {
    font-size: 12px;
    color: #3296fa;
  }
}
// 回复列表
.van-popup--bottom{
  &.van-popup--round{
    border-radius: 0;
  }
}
.reply_dailog {
  height: 100%;
  max-height: 100%;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
  .van-action-sheet__content{
    flex: 1;
    overflow-y: auto;
    padding: 0 10px 44px;
  }
}
</style>
