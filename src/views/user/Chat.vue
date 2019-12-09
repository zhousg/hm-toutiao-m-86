<template>
  <div class="container">
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="小智同学"></van-nav-bar>
    <!-- 聊天记录 -->
    <div class="chat-list" ref="list">
      <div class="chat-item" :class="{left:item.name==='xz',right:item.name==='self'}" v-for="(item,i) in list" :key="i">
        <van-image v-if="item.name==='xz'" fit="cover" round :src="xzAvatar" />
        <div class="chat-pao">{{item.msg}}</div>
        <van-image v-if="item.name==='self'" fit="cover" round :src="photo" />
      </div>
    </div>
    <!-- 输入框 -->
    <div class="reply-container van-hairline--top">
      <van-field v-model.trim="value" placeholder="说点什么...">
        <span @click="send()" slot="button" style="font-size:12px;color:#999">提交</span>
      </van-field>
    </div>
  </div>
</template>

<script>
// 注意：组件上src对应资源 和 :src 绑定的资源  都是不会打包
// 解决：自己通过import导入
import xzAvatar from '@/assets/xz.png'
import { mapState } from 'vuex'
import io from 'socket.io-client'
export default {
  name: 'user-chat',
  computed: {
    ...mapState(['photo', 'user'])
  },
  data () {
    return {
      // 输入的内容
      value: '',
      xzAvatar,
      // 聊天记录
      // 约定：xz {name:'xz',msg:''} 自己 {name:'self':msg:''}
      list: [],
      // socket实例
      socketio: null
    }
  },
  beforeDestroy () {
    this.socketio.close()
  },
  created () {
    // 1. 建立连接
    this.socketio = io('http://ttapi.research.itcast.cn', {
      query: {
        token: this.user.token
      }
    })
    // 2. 连接成功
    this.socketio.on('connect', () => {
      // 连接成功
      // 默认让小智同学 打招呼 信息
      this.list.push({ name: 'xz', msg: '你好，想知道点啥？' })
    })
    // 3. 收消息
    this.socketio.on('message', (data) => {
      // 小智回复消息
      this.list.push({ name: 'xz', msg: data.msg })
      this.scrollBottom()
    })
  },
  methods: {
    send () {
      if (!this.value) return false
      // 发送信息
      this.socketio.emit('message', {
        msg: this.value,
        timestamp: Date.now()
      })
      // 记录聊天
      this.list.push({ name: 'self', msg: this.value })
      // 清空内容
      this.value = ''
      this.scrollBottom()
    },
    scrollBottom () {
      this.$nextTick(() => {
        this.$refs.list.scrollTop = this.$refs.list.scrollHeight // 可以滚动高度
      })
    }
  }
}
</script>

<style scoped lang='less'>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background:#fafafa;
  padding: 46px 0 50px 0;
  .chat-list {
    height: 100%;
    overflow-y: scroll;
    .chat-item{
      padding: 10px;
      .van-image{
        vertical-align: top;
        width: 40px;
        height: 40px;
      }
      .chat-pao{
        vertical-align: top;
        display: inline-block;
        min-width: 40px;
        max-width: 70%;
        min-height: 40px;
        line-height: 38px;
        border: 0.5px solid #c2d9ea;
        border-radius: 4px;
        position: relative;
        padding: 0 10px;
        background-color: #e0effb;
        word-break: break-all;
        font-size: 14px;
        color: #333;
        &::before{
          content: "";
          width: 10px;
          height: 10px;
          position: absolute;
          top: 12px;
          border-top:0.5px solid #c2d9ea;
          border-right:0.5px solid #c2d9ea;
          background: #e0effb;
        }
      }
    }
  }
}
.chat-item.right{
  text-align: right;
  .chat-pao{
    margin-left: 0;
    margin-right: 15px;
    &::before{
      right: -6px;
      transform: rotate(45deg);
    }
  }
}
.chat-item.left{
  text-align: left;
  .chat-pao{
    margin-left: 15px;
    margin-right: 0;
    &::before{
      left: -5px;
      transform: rotate(-135deg);
    }
  }
}
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
}
</style>
