<template>
  <div class="container">
    <van-tabs @change="changeChannel" :lazy-render="false" swipeable v-model="activeIndex">
      <van-tab :key="channel.id" v-for="channel in myChannels" :title="channel.name">
        <div ref="scroll-wrapper" class="scroll-wrapper" @scroll="remember($event)">
          <!-- v-model="downLoading"  是否正在下拉刷新中 true  结束了加载 false -->
          <!-- :success-text="refreshSuccessText"  加载数据后（更新成功|暂无更新）的提示文案 -->
          <!-- @refresh="onRefresh" 下拉刷新事件：下拉刷新的时候松手的时候 -->
          <van-pull-refresh
            v-model="channel.downLoading"
            @refresh="onRefresh"
            :success-text="refreshSuccessText"
          >
            <van-list
              v-model="channel.upLoading"
              :finished="channel.finished"
              finished-text="没有更多文章了"
              @load="onLoad"
            >
              <van-cell v-for="item in channel.articles" :key="item.art_id.toString()">
                <div class="article_item">
                  <h3 class="van-ellipsis">{{item.title}}</h3>
                  <div class="img_box" v-if="item.cover.type===3">
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[0]" />
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[1]" />
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[2]" />
                  </div>
                  <div class="img_box" v-if="item.cover.type===1">
                    <van-image lazy-load class="w100" fit="cover" :src="item.cover.images[0]" />
                  </div>
                  <div class="info_box">
                    <span>{{item.aut_name}}</span>
                    <span>{{item.comm_count}}评论</span>
                    <span>{{item.pubdate|relTime}}</span>
                    <span
                      @click="openMoreAction(item.art_id.toString())"
                      class="close"
                      v-if="user.token"
                    >
                      <van-icon name="cross"></van-icon>
                    </span>
                  </div>
                </div>
              </van-cell>
            </van-list>
          </van-pull-refresh>
        </div>
      </van-tab>
    </van-tabs>
    <!-- 频道按钮 -->
    <span @click="openChannelEdit" class="bar_btn" slot="nav-right">
      <van-icon name="wap-nav"></van-icon>
    </span>
    <!-- 更多操作 -->
    <!-- v-model语法糖 :value="showMoreAction" @input="showMoreAction=$event"-->
    <more-action
      v-if="user.token"
      v-model="showMoreAction"
      :articleId="articleId"
      @on-disLikes="removeArticle"
      @on-report="removeArticle"
    ></more-action>
    <!-- 频道管理 -->
    <!-- sync 同步  语法糖：一个组件需要多个数据进行双向绑定 提供的解决方案 -->
    <!-- :activeIndex="activeIndex" @update="activeIndex=$event" -->
    <channel-edit
    v-model="showChannelEdit"
    :myChannels="myChannels"
    :activeIndex.sync="activeIndex"
    ></channel-edit>
  </div>
</template>

<script>
// 渲染列表
// 1. 封装API 获取文章列表
// 2. 上拉加载  获取数据进行渲染
// 3. 下拉刷新  获取数据进行渲染
import { getMyChannels } from '@/api/channel'
import { getArticles } from '@/api/article'
import { mapState } from 'vuex'
import MoreAction from './components/more-action'
import ChannelEdit from './components/channel-edit'
export default {
  name: 'article-list',
  components: { MoreAction, ChannelEdit },
  data () {
    return {
      // // 是否正在加载
      // upLoading: false,
      // // 是否正在刷新
      // downLoading: false,
      // // 刷新后的文案
      refreshSuccessText: '',
      // // 是否已经全部加载完毕
      // finished: false,
      // // 文章列表
      // articles: [],
      // 我的频道
      myChannels: [],
      // 当前激活标签（频道）的索引
      activeIndex: 0,
      // 控制更多操作的显示隐藏
      showMoreAction: false,
      // 当前点击的文章ID
      articleId: null,
      // 控制频道编辑显示隐藏
      showChannelEdit: false
    }
  },
  computed: {
    ...mapState(['user']),
    activeChannel () {
      return this.myChannels[this.activeIndex]
    }
  },
  watch: {
    // 监听 对象下的属性数据变化
    'user.refresh_token': function () {
      // 激活频道改成推荐
      this.activeIndex = 0
      // 更新频道信息
      this.getMyChannels()
      // 获取文章数据
      this.onLoad()
    }
  },
  created () {
    // 获取我的频道
    this.getMyChannels()
  },
  // 激活组件（进入组件后触发钩子）
  activated () {
    // 让当前激活频道的文章列表dom  根据之前记录的位置进行滚动
    // const dom = this.$refs['scroll-wrapper'] dom数组
    if (this.$refs['scroll-wrapper']) {
      const dom = this.$refs['scroll-wrapper'][this.activeIndex]
      dom.scrollTop = this.activeChannel.scrollTop
    }
  },
  methods: {
    // 打开频道编辑
    openChannelEdit () {
      this.showChannelEdit = true
    },
    // 移除文章
    removeArticle () {
      // 删除的文章在当前激活频道的文章列表中
      // 从数组中移除一项数据，需要索引
      const list = this.activeChannel.articles
      const index = list.findIndex(
        item => item.art_id.toString() === this.articleId
      )
      list.splice(index, 1)
    },
    // 打开更多操作
    openMoreAction (articleId) {
      this.showMoreAction = true
      // 记录当前的文章ID
      this.articleId = articleId
    },
    // 记住滚动位置
    remember (e) {
      // 获取滚动位置  e.target.scrollTop
      // 每个频道对应的文章列表 都需要自己的滚动位置
      this.activeChannel.scrollTop = e.target.scrollTop
    },
    // 选择频道
    changeChannel () {
      // 当你切换的频道下没有文章数据 主动去加载数据
      if (!this.activeChannel.articles.length) {
        // 开启加载中效果
        this.activeChannel.upLoading = true
        // 清除之前没有数据的提示
        this.activeChannel.finished = false
        // 主动加载
        this.onLoad()
      } else {
        // 操作当前列表，滚动到阅读位置
        // 这个操作被tab组件默认行为覆盖了
        // 让下面两段代码在 tabs组件执行之后
        // 原始写法：
        // window.setTimeout(() => {
        //   const dom = this.$refs['scroll-wrapper'][this.activeIndex]
        //   dom.scrollTop = this.activeChannel.scrollTop
        // }, 0)
        // vue写法：
        // 下一帧：延时一会执行
        this.$nextTick(() => {
          const dom = this.$refs['scroll-wrapper'][this.activeIndex]
          dom.scrollTop = this.activeChannel.scrollTop
        })
      }
    },
    // 获取我的频道
    async getMyChannels () {
      const data = await getMyChannels()
      // 根据原有的数组 得到一个新数组 长度是一样的。
      // map 遍历数组，每次遍历会执行回调函数，函数的返回值做为新数组中的每一项的值。
      // tabs组件没有依赖新数据的顺序进行更新
      // 小技巧：先置空数据，然后在赋值
      this.myChannels = []
      this.$nextTick(() => {
        this.myChannels = data.channels.map(item => {
          return {
            id: item.id,
            name: item.name,
            articles: [],
            upLoading: false,
            downLoading: false,
            finished: false,
            timestamp: Date.now(),
            scrollTop: 0
          }
        })
      })
    },
    // 刷新事件
    async onRefresh () {
      // window.setTimeout(() => {
      //   // 模拟加载数据
      //   const data = [1, 2, 3, 4, 5, 6]
      //   if (data.length) {
      //     // 替换
      //     this.articles = data
      //     // 结束刷新效果
      //     this.downLoading = false
      //     // 提示文案
      //     this.refreshSuccessText = '更新成功'
      //     // 修改  全部加载完成的状态
      //     this.finished = false
      //     // 防止不满一屏  自己主动去加载一次数据
      //     this.onLoad()
      //   } else {
      //     this.downLoading = false
      //     this.refreshSuccessText = '暂无更新'
      //   }
      // }, 2000)
      // 把当前激活频道对应的时间戳改成当前时间
      await this.$sleep()
      this.activeChannel.timestamp = Date.now()
      // 发请求获取数据
      const data = await getArticles(
        this.activeChannel.id,
        this.activeChannel.timestamp
      )
      if (data.results.length) {
        this.activeChannel.articles = data.results
        this.activeChannel.downLoading = false
        this.refreshSuccessText = '更新成功'
        // 记录时间戳 下一次请求数据想需要
        this.activeChannel.timestamp = data.pre_timestamp
        this.onLoad()
        this.activeChannel.finished = false
      } else {
        this.activeChannel.downLoading = false
        this.refreshSuccessText = '暂无更新'
      }
    },
    // 加载事件
    async onLoad () {
      // window.setTimeout(() => {
      //   // 模拟加载数据
      //   const data = []
      //   for (let i = this.articles.length; i < this.articles.length + 10; i++) {
      //     data.push(i + 1)
      //   }
      //   // 追加
      //   this.articles.push(...data)
      //   // 结束加载效果
      //   this.upLoading = false
      //   // 模拟全部加载完毕情况
      //   if (this.articles.length >= 40) {
      //     this.finished = true
      //   }
      // }, 2000)

      // （频道数据没有加载完成）如果没有当前频道  严谨处理
      if (!this.activeChannel) return false

      await this.$sleep()
      // 当前激活频道的ID  当前激活频道的时间戳
      // const activeChannel = this.myChannels[this.activeIndex]
      const data = await getArticles(
        this.activeChannel.id,
        this.activeChannel.timestamp
      )
      // 把文章追加到当前激活频道的文章列表中
      this.activeChannel.articles.push(...data.results)
      this.activeChannel.upLoading = false
      // 判断是否有数据
      if (data.pre_timestamp) {
        // 把时间戳存在 当前激活频道中的时间戳
        this.activeChannel.timestamp = data.pre_timestamp
      } else {
        this.activeChannel.finished = true
      }
    }
  }
}
</script>

<style scoped lang='less'>
.van-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  /deep/ .van-tabs__wrap {
    height: 36px;
    padding-right: 36px;
    .van-tab {
      line-height: 36px;
    }
    .van-tabs__line {
      background-color: #3296fa;
      height: 2px;
    }
  }
  /deep/ .van-tabs__content {
    flex: 1;
    overflow: hidden;
  }
  /deep/ .van-tab__pane {
    height: 100%;
    .scroll-wrapper {
      height: 100%;
      overflow-y: auto;
    }
  }
}
// 按钮
.bar_btn {
  width: 36px;
  height: 35px;
  position: absolute;
  top: 0;
  right: 0;
  &::before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 999;
    box-shadow: 0 0 10px #999;
    transform: scale(1, 0.6);
  }
  .van-icon-wap-nav {
    width: 100%;
    height: 100%;
    background: #fff;
    text-align: center;
    line-height: 35px;
    position: relative;
    z-index: 1000;
    &::before {
      font-size: 20px;
    }
  }
}
// 文章列表
.article_item {
  h3 {
    font-weight: normal;
    line-height: 2;
  }
  .img_box {
    display: flex;
    justify-content: space-between;
    .w33 {
      width: 33%;
      height: 90px;
    }
    .w100 {
      width: 100%;
      height: 180px;
    }
  }
  .info_box {
    color: #999;
    line-height: 2;
    position: relative;
    font-size: 12px;
    span {
      padding-right: 10px;
      &.close {
        border: 1px solid #ddd;
        border-radius: 2px;
        line-height: 15px;
        height: 12px;
        width: 16px;
        text-align: center;
        padding-right: 0;
        font-size: 8px;
        position: absolute;
        right: 0;
        top: 7px;
      }
    }
  }
}
</style>
