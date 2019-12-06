<template>
  <!-- @closed="editing=false" 关闭屉式菜单  重置编辑状态为不编辑 -->
  <van-action-sheet
    :value="value"
    @input="$emit('input', $event)"
    @closed="editing=false"
    title="编辑频道"
  >
    <div class="channel">
      <div class="tit">
        我的频道：
        <span class="tip">点击可进入频道</span>
        <van-button v-if="!editing" @click="editing=true" size="mini" type="info" plain>编辑</van-button>
        <van-button v-else @click="editing=false" size="mini" type="danger" plain>完成</van-button>
      </div>
      <van-grid class="van-hairline--left">
        <van-grid-item v-for="(item,i) in myChannels" :key="item.id">
          <span @click="enterChannel(i)" class="f12" :class="{red:activeIndex===i}">{{item.name}}</span>
          <van-icon @click="delChannel(item.id,i)" v-show="editing && i!==0" class="btn" name="cross"></van-icon>
        </van-grid-item>
      </van-grid>
    </div>
    <div class="channel">
      <div class="tit">可选频道：</div>
      <van-grid class="van-hairline--left">
        <van-grid-item v-for="item in optionalChannels" :key="item.id">
          <span class="f12">{{item.name}}</span>
          <van-icon @click="addChannel(item)" class="btn" name="plus"></van-icon>
        </van-grid-item>
      </van-grid>
    </div>
  </van-action-sheet>
</template>

<script>
// 渲染可选频道
// 1. 定义获取全部频道的API
// 2. 在组件初始化获取全部频道数据
// 3. 在data中存储 全部频道数据
// 4. 得到（计算属性）可选频道 = 全部频道数据 - 我的频道
// 5. 遍历完事
import { getAllChannels, delChannel, addChannel } from '@/api/channel'
export default {
  props: {
    // 控制显示隐藏的
    value: {
      type: Boolean,
      default: false
    },
    // 我的频道
    myChannels: {
      type: Array,
      default: () => []
    },
    // 当前激活的频道索引
    activeIndex: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      // 控制我的频道删除按钮显示隐藏，控制显示的是 编辑按钮  完成按钮
      editing: false,
      // 全部频道
      allChannels: []
    }
  },
  computed: {
    // 可选频道
    optionalChannels () {
      // 可选频道 = 全部频道数据 - 我的频道
      // 减法逻辑:
      // 1. 先遍历全部频道，每次遍历的时候，拿着频道ID去我的频道中查找是否有相同的频道ID
      // 2. 如果ID相同，排除  false
      // 3. 如果ID不同，往新的数组中追加即可  true
      // 根据一个数组，得到一些符合条件的选项，得到新的数组，使用 filter
      // this.allChannels.filter(item => false|true) false 不追加  true 追加  新数组
      // this.myChannels.findIndex(myItem => item.id === myItem.id) === -1  ID相同 false| ID不同 true
      return this.allChannels.filter(item => this.myChannels.findIndex(myItem => item.id === myItem.id) === -1)
    }
  },
  created () {
    this.getAllChannels()
  },
  methods: {
    // 添加频道
    async addChannel (item) {
      // 1. 如果是本地添加 {id:'',name:''}
      // 2. 如果是接口添加 [{id:'',seq:'排序'},...] 序号是：从1开始，不需要推荐频道
      // 3. 封装API去进行添加，需要的传参要支持两种情况的添加，把数据组织好再传递给API
      // 4. 结论：数据结构 [{id:'',name:'',seq:''},...] 最后一项就是追加到本地的数据
      const orderChannels = this.myChannels.map((item, i) => {
        return {
          id: item.id,
          name: item.name,
          seq: i
        }
      })
      // 追加需要添加的频道
      orderChannels.push({ ...item, seq: orderChannels.length })
      // 剔除推荐频道
      orderChannels.shift()
      try {
        // 调用添加频道的API
        await addChannel(orderChannels)
        // 提示
        this.$toast.success('添加成功')
        // myChannels我的频道上追加一个频道
        this.myChannels.push({
          id: item.id,
          name: item.name,
          articles: [],
          upLoading: false,
          downLoading: false,
          finished: false,
          timestamp: Date.now(),
          scrollTop: 0
        })
      } catch (e) {
        this.$toast.fail('添加失败')
      }
    },
    // 删除频道
    async delChannel (channelId, index) {
      try {
        await delChannel(channelId)
        this.$toast.success('删除成功')
        // 删除 我的频道（父组件数据） 中对应的选项
        // 父传子的数据，只读。不可修改（简单数据类型：不能重新赋值，复杂数据类型：不能修改引用地址）
        // 大白话：复杂数据类型，不去重新赋值，数据可以修改。
        this.myChannels.splice(index, 1)
        // 条件：当你删除的频道的索引小于等于当前激活频道的索引，激活频道索引减一
        if (index <= this.activeIndex) {
          this.$emit('update:activeIndex', this.activeIndex - 1)
        }
      } catch (e) {
        this.$toast.fail('删除失败')
      }
    },
    // 进入频道
    enterChannel (index) {
      // 关闭对话框
      this.$emit('input', false)
      // index 将要切换到的频道的索引
      // 把 index 的值传递给父组件 让父组件修改activeIndex的值为index即可
      // 如果绑定数据的时候   :attrName.sync="数据"
      // 在子组件去触发事件   $emit('update:attrName',数据)
      this.$emit('update:activeIndex', index)
    },
    // 获取全部频道
    async getAllChannels () {
      const data = await getAllChannels()
      this.allChannels = data.channels
    }
  }
}
</script>

<style scoped lang='less'>
.van-popup--bottom{
  &.van-popup--round{
    border-radius: 0;
  }
}
.van-action-sheet {
  max-height: 100%;
  height: 100%;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
}
.channel {
  padding: 10px;
  .tit{
    line-height: 3;
    .tip {
      font-size: 10px;
      color: #999;
    }
  }
  .van-button {
    float: right;
    margin-top: 7px;
  }
  .btn{
    position: absolute;
    bottom: 0;
    right: 0;
    background: #ddd;
    font-size: 12px;
    color: #fff;
  }
  .f12{
      font-size:12px;
      color: #555;
  }
  .red{
    color: red;
  }
}
</style>
