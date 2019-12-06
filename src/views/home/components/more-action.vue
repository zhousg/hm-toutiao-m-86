<template>
  <van-popup :value="value" @input="$emit('input',$event)" @open="isReport=false">
    <van-cell-group v-if="!isReport">
      <van-cell @click="disLikes()">不感兴趣</van-cell>
      <van-cell is-link @click="isReport=true">反馈垃圾内容</van-cell>
      <van-cell>拉黑作者</van-cell>
    </van-cell-group>
    <van-cell-group v-else>
      <van-cell icon="arrow-left" @click="isReport=false">返回</van-cell>
      <van-cell @click="report(item.value)" v-for="item in reports" :key="item.value">{{item.label}}</van-cell>
    </van-cell-group>
  </van-popup>
</template>

<script>
// 对文章不感兴趣
// 1. 定义调用接口API
// 2. 获取当前点击的文章ID
// 3. 点击不感兴趣，调用API
// 4. 成功：把文章从列表中移除+提示+关闭更多操作对话框
// 5. 失败：提示错误
// 举报文章
// 1. 使用前后端约定好的举报类型 定义成常量数据
// 2. 定义调用接口举报API
// 3. 点击举报的类型后，调用举报接口
// 4. 成功：提示+关闭更多操作对话框+把文章从列表中移除
// 5. 失败：提示错误

import { disLikes, report } from '@/api/article'
import { reports } from '@/api/constants'
export default {
  name: 'more-action',
  props: {
    // 接收父组件的value值
    value: {
      type: Boolean,
      default: false
    },
    // 文章的ID
    articleId: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      // 控制显示隐藏
      show: false,
      // 控制状态：正在举报  没有在举报
      isReport: false,
      reports
    }
  },
  methods: {
    // 举报
    async report (type) {
      try {
        await report(this.articleId, type)
        this.$toast.success('举报成功')
        this.$emit('input', false)
        // this.$emit('on-report')
      } catch (e) {
        // 举报失败（重复举报：特殊提示）
        if (e.response.status === 409) {
          return this.$toast.fail('已经举报')
        }
        this.$toast.fail('举报失败')
      }
    },
    // 不感兴趣
    async disLikes () {
      try {
        // 调用接口
        await disLikes(this.articleId)
        // 提示
        this.$toast.success('操作成功')
        // 通知父组件 关闭对话框
        this.$emit('input', false)
        // 通知父组件 删除当前点击的文章
        this.$emit('on-disLikes')
      } catch (e) {
        this.$toast.fail('操作失败')
      }
    }
  }
}
</script>

<style scoped lang='less'>
.van-popup {
  width: 80%;
  border-radius: 4px;
}
</style>
