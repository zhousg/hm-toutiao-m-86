<template>
  <div ref="container" class='container' @scroll="remember($event)">
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="文章详情"></van-nav-bar>
    <!-- 详情内容 -->
    <div class="detail">
      <h3 class="title">{{article.title}}</h3>
      <div class="author">
        <van-image round width="1rem" height="1rem" fit="fill" :src="article.aut_photo" />
        <div class="text">
          <p class="name">{{article.aut_name}}</p>
          <p class="time">{{article.pubdate|relTime}}</p>
        </div>
        <van-button round size="small" type="info" @click="toggleFollow">
          {{article.is_followed?'已关注':'+ 关注'}}
        </van-button>
      </div>
      <div class="content" v-html="article.content"></div>
      <div class="zan">
        <van-button @click="toggleStatus(1)" round size="small" :class="{active:article.attitude===1}" plain icon="like-o">点赞</van-button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <van-button @click="toggleStatus(0)" round size="small" :class="{active:article.attitude===0}" plain icon="delete">不喜欢</van-button>
      </div>
      <!-- 评论组件 -->
      <comment></comment>
    </div>
  </div>
</template>

<script>
import { getArticle, disLikes, unDisLikes, likings, unLikings } from '@/api/article'
import { followings, unFollowings } from '@/api/user'
// 渲染文章详情
// 1. 在组件激活的时候获取数据
// 2. 当前你浏览的文章和上一篇浏览的文章不同时候，获取数据
// 3. 进行渲染

// 关注与取消关注
// 1. 定义API接口
// 2. 点击 已关注|+ 关注 按钮 进行操作
// 3. 成功提示 + 组件按钮

// 点赞与取消点赞  不喜欢与取消不喜欢
// 1. 定义API接口  4个接口
// 2. 点赞按钮  不喜欢按钮  绑定同一个点击处理函数
// 3. 区分 点赞相关  不喜欢相关 逻辑
// 4. 操作成功 提示 + 组件按钮状态
// 5. 异常处理
import Comment from './components/comment'
export default {
  name: 'article-item',
  components: { Comment },
  data () {
    return {
      // 文章详情数据
      article: {
        art_id: ''
      },
      // 阅读位置
      scrollTop: 0
    }
  },
  activated () {
    // 不同文章
    if (this.$route.params.id !== this.article.art_id.toString()) {
      // 重置数据
      this.scrollTop = 0
      // 获取数据
      this.getArticle()
    } else {
      // 滚动到阅读位置
      this.$refs.container.scrollTop = this.scrollTop
    }
  },
  methods: {
    // 点赞 取消点赞 不喜欢 取消不喜欢
    async toggleStatus (btnType) {
      try {
        if (btnType === 1) {
          if (this.article.attitude === 1) {
          // 取消点赞
            await unLikings(this.article.art_id)
            this.article.attitude = -1
          } else {
          // 点赞
            await likings(this.article.art_id)
            this.article.attitude = 1
          }
        } else {
          if (this.article.attitude === 0) {
          // 取消不喜欢
            await unDisLikes(this.article.art_id)
            this.article.attitude = -1
          } else {
          // 不喜欢
            await disLikes(this.article.art_id)
            this.article.attitude = 0
          }
        }
        this.$toast.success('操作成功')
      } catch (e) {
        this.$toast.fail('操作失败')
      }
    },
    // 切换 关注 与 取消关注
    async toggleFollow () {
      try {
        if (this.article.is_followed) {
          // 取消关注
          await unFollowings(this.article.aut_id)
          this.$toast.success('取消关注成功')
          this.article.is_followed = false
        } else {
          // 添加关注
          await followings(this.article.aut_id)
          this.$toast.success('添加关注成功')
          this.article.is_followed = true
        }
      } catch (e) {
        this.$toast.fail('操作失败')
      }
    },
    // 记住阅读位置
    remember (e) {
      this.scrollTop = e.target.scrollTop
    },
    // 获取文章数据
    async getArticle () {
      const data = await getArticle(this.$route.params.id)
      this.article = data
    }
  }
}
</script>

<style scoped lang='less'>
.container {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
.detail {
  padding: 46px 10px 44px;
  .title {
    font-size: 18px;
    line-height: 2;
  }
  .zan{
    text-align: center;
    padding: 10px 0;
    .active{
      border-color:red;
      color: red;
    }
  }
  .author {
    padding: 10px 0;
    display: flex;
    .text {
      flex: 1;
      padding-left: 10px;
      line-height: 1.5;
      .name {
        font-size: 14px;
        margin: 0;
      }
      .time {
        margin: 0;
        font-size: 12px;
        color: #999;
      }
    }
  }
  // 内容中包含：img 特别宽  code pre 不能换行
  .content {
    padding: 20px 0;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-all;
    word-wrap: break-word;
    /deep/ img{
      max-width:100%;
      background: #f9f9f9;
    }
    /deep/ code{
      white-space: pre-wrap;
    }
    /deep/ pre{
      white-space: pre-wrap;
    }
  }
}
</style>
