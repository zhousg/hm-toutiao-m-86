<template>
  <div class='container'>
    <van-nav-bar title="搜索中心" left-arrow @click-left="$router.back()" />
    <!-- 搜索框 -->
    <van-search v-model.trim="q" placeholder="请输入搜索关键词" shape="round" @search="onSearch"/>
    <!-- 联想词条 -->
    <van-cell-group class="suggest-box" v-if="q">
      <van-cell @click="onSearch(item.replace(`<span>${q}</span>`,q))" icon="search" v-for="item in options" :key="item"> <p v-html="item"></p> </van-cell>
    </van-cell-group>
    <!-- 历史搜索 -->
    <div class="history-box" v-else-if="historyList.length">
      <div class="head">
        <span>历史记录</span>
        <van-icon name="delete" @click="clearHistory()"></van-icon>
      </div>
      <van-cell-group>
        <van-cell v-for="(item,i) in historyList" :key="item">
          <a @click="toSearch(item)" class="word_btn">{{item}}</a>
          <van-icon @click="delHistory(i)" class="close_btn" slot="right-icon" name="cross"/>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script>
import { suggest } from '@/api/article'
// 历史记录存储在本地的，约定好KEY和Value
// value 是字符串  数组 ["电脑","手机","啊啊啊"]
const KEY = 'hm-toutiao-m-86-history'
// 渲染列表  删除  点击文字进行搜索 清空  搜索后存储历史
export default {
  name: 'search-index',
  data () {
    return {
      // 查询文章使用的文字（搜索关键字）
      q: '',
      // 历史记录
      historyList: JSON.parse(window.localStorage.getItem(KEY) || '[]'),
      // 可选词条
      options: [],
      // 计时器
      timer: null
    }
  },
  watch: {
    // 需求：等用户输入后500ms再发请求，当用户在500ms内又输入内容，终止上一次计时，开始新的计时。
    // 调用一个函数的时候，单位时间内如果再次调用这个函数，终止上一次的函数执行，开启新函数的调用
    q () {
      if (!this.q) {
        window.clearTimeout(this.timer)
        return false
      }
      window.clearTimeout(this.timer)
      this.timer = window.setTimeout(async () => {
        // 获取联想建议词条
        const data = await suggest(this.q)
        // 赋值 options
        this.options = data.options.map(item => item.toLowerCase().replace(this.q, `<span>${this.q}</span>`))
      }, 500)
    }
  },
  methods: {
    // 确认搜索时候触发（PC端按下回车键触发，M端点击虚拟键盘中的enter键|搜索）
    onSearch (key) {
      // key 搜索的内容
      if (!key) return false
      // 1. 存储历史 (不能重复)
      const set = new Set(this.historyList)
      set.add(key) // Array.from(set) 得到数组  [...set] 得到数组
      window.localStorage.setItem(KEY, JSON.stringify([...set]))
      // 2. 跳转搜索结果
      this.$router.push({ path: '/search/result', query: { q: key } })
    },
    // 删除
    delHistory (index) {
      // 删除组件
      this.historyList.splice(index, 1)
      // 更新本地
      window.localStorage.setItem(KEY, JSON.stringify(this.historyList))
    },
    // 去搜索
    toSearch (key) {
      this.$router.push({ path: '/search/result', query: { q: key } })
    },
    // 清空
    clearHistory () {
      // 组件清空
      this.historyList = []
      // 删除本地存储
      window.localStorage.removeItem(KEY)
    }
  }
}
</script>

<style scoped lang='less'>
.history-box {
  padding: 0 20px;
  .head{
    line-height: 36px;
    color: #999;
    .van-icon{
      font-size: 16px;
      float: right;
      margin-top: 10px;;
    }
  }
  .van-cell{
    padding: 10px 0;
  }
  .word_btn{
    color:#3296fa;
  }
  .close_btn{
    margin-top:5px;
    color: #999;
  }
}
.suggest-box{
  /deep/ .van-cell{
    padding: 10px 20px;
    color: #999;
    p{
      span{
        color: red;
      }
    }
  }
}
</style>
