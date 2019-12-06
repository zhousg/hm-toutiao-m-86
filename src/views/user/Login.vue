<template>
  <div class="container">
    <van-nav-bar left-arrow @click-left="$router.back()" title="登录"></van-nav-bar>
    <van-cell-group>
      <van-field v-model.trim="loginForm.mobile" :error-message="errMsg.mobile" @blur="checkMobile" label="手机号" placeholder="请输入手机号" />
      <van-field v-model.trim="loginForm.code" :error-message="errMsg.code" @blur="checkCode" label="验证码" placeholder="请输入验证码">
        <van-button class="p5" slot="button" size="mini" type="primary">发送验证码</van-button>
      </van-field>
    </van-cell-group>
    <div class="btn_box">
      <van-button type="info" @click="login" block round>登 录</van-button>
    </div>
  </div>
</template>

<script>
import { login } from '@/api/user'
import { mapMutations } from 'vuex'
export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        mobile: '13911111111',
        code: '246810'
      },
      errMsg: {
        mobile: '',
        code: ''
      }
    }
  },
  methods: {
    checkMobile () {
      // 1. 校验非空
      if (!this.loginForm.mobile) {
        // 提示
        this.errMsg.mobile = '请输入手机号'
        return false
      }
      // 2. 校验格式
      if (!/^1[3-9]\d{9}$/.test(this.loginForm.mobile)) {
        // 提示
        this.errMsg.mobile = '手机号格式错误'
        return false
      }
      // 3. 校验成功
      this.errMsg.mobile = ''
    },
    checkCode () {
      // 1. 校验非空
      if (!this.loginForm.code) {
        // 提示
        this.errMsg.code = '请输入验证码'
        return false
      }
      // 2. 校验格式
      if (!/^\d{6}$/.test(this.loginForm.code)) {
        // 提示
        this.errMsg.code = '验证码6个数字'
        return false
      }
      // 3. 校验成功
      this.errMsg.code = ''
    },
    ...mapMutations(['setUser']),
    async login () {
      // 对表单进行整体校验
      this.checkMobile()
      this.checkCode()
      // 判断是否校验成功
      // 当errMsg对象中mobile 和 code 没有值
      if (!this.errMsg.mobile && !this.errMsg.code) {
        // 发请求去登录
        // 1. 需要发登录请求的API函数
        // 2. 导入函数
        // 3. 调用即可
        // 4. 成功：更新vuex中用户信息  进行跳转（redirectUrl|个人中心）
        // 5. 失败：提示错误
        try {
          const data = await login(this.loginForm)
          // 成功
          this.setUser(data)
          // 跳转
          this.$router.push(this.$route.query.redirectUrl || '/user')
          // 成功提示
          this.$toast.success('登录成功')
        } catch (e) {
          // 错误提示
          this.$toast.fail('用户名或验证码错误')
        }
      }
    }
  }
}
</script>

<style scoped lang='less'>
.p5{
  padding: 0 5px;
}
.btn_box{
  padding: 10px;
  .van-button{
    height: 32px;
    line-height: 30px;
  }
}
</style>
