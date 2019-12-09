<template>
  <div class='container'>
    <van-nav-bar left-arrow @click-left="$router.back()" title="编辑资料" right-text="保存" @click-right="save()"></van-nav-bar>
    <van-cell-group>
      <van-cell is-link title="头像" @click="showPhoto=true" center>
        <van-image
          slot="default"
          width="1.5rem"
          height="1.5rem"
          fit="cover"
          round
          :src="photo"
        />
      </van-cell>
      <van-cell is-link title="名称" @click="showName=true" :value="user.name" />
      <van-cell is-link title="性别" @click="showGender=true" :value="user.gender===0?'男':'女'" />
      <van-cell is-link title="生日" @click="openDate()" :value="user.birthday" />
    </van-cell-group>
    <!-- 头像 -->
    <van-popup v-model="showPhoto" position="bottom">
      <van-cell @click="$refs.fileInput.click()" value="本地相册选择" is-link/>
      <van-cell value="拍照" is-link/>
    </van-popup>
    <!-- 名字 -->
    <van-popup v-model="showName" position="bottom">
      <van-field v-model="user.name" required placeholder="请输入用户名" />
    </van-popup>
    <!-- 性别 -->
    <van-popup v-model="showGender" position="bottom">
      <van-cell value="男" @click="changeGender(0)" is-link/>
      <van-cell value="女" @click="changeGender(1)" is-link/>
    </van-popup>
    <!-- 生日 -->
    <van-popup v-model="showBirthday" position="bottom">
      <van-datetime-picker
        title="选择生日"
        v-model="nowDate"
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
        @cancel="showBirthday=false"
        @confirm="confirmDate"
      />
    </van-popup>
    <!-- 输入框 file类型 -->
    <input @change="preview()" style="display:none" ref="fileInput" type="file">
  </div>
</template>

<script>
// 1. 封装API  修改头像  修改信息（性别BUG） 获取用户信息
// 2. 组件初始化 获取个人信息  填充组件
// 3. 上传头像
// 4. 点击 van-cell 打开选择图片资源管理器
// 5. 选中图片后  预览
// 6. 等以后点击 保存 按钮后进行上传
// 7. 注意：保存头像的同时  保存用户的其他信息。
import dayjs from 'dayjs'
import { updateUserPhoto, updateUserInfo, getUserProfile } from '@/api/user'
export default {
  name: 'user-profile',
  data () {
    return {
      // 头像上传对话框显示
      showPhoto: false,
      // 输入名称的对话框显示
      showName: false,
      // 性别显示
      showGender: false,
      // 生日显示
      showBirthday: false,
      // 日期控件绑定数据
      nowDate: new Date(),
      // 最小可选择时间
      minDate: new Date('1949-10-01'),
      // 最大可选择时间
      maxDate: new Date(),
      // 头像
      photo: 'https://img.yzcdn.cn/vant/cat.jpeg',
      // 用户信息
      user: {
        name: '用户名称',
        gender: 0,
        birthday: '2018-10-01'
      }
    }
  },
  async created () {
    const data = await getUserProfile()
    this.user = data
    this.photo = data.photo
  },
  methods: {
    // 预览
    preview () {
      // 从本地读取图片信息（base64位数据）
      const fileReader = new FileReader()
      // 根据文件对象读取文件信息base64
      fileReader.readAsDataURL(this.$refs.fileInput.files[0])
      fileReader.onload = () => {
        // 读取成功 fileReader.result 就是图片数据
        this.photo = fileReader.result
        // 关闭对话框
        this.showPhoto = false
      }
    },
    // 选择性别
    changeGender (gender) {
      this.user.gender = gender
      this.showGender = false
    },
    // 打开时间控件
    openDate () {
      this.showBirthday = true
      // 有生日数据就赋值
      if (this.user.birthday) {
        this.nowDate = new Date(this.user.birthday)
      }
    },
    // 确认时间
    confirmDate () {
      this.showBirthday = false
      // 把选择的时间给单元格
      this.user.birthday = dayjs(this.nowDate).format('YYYY-MM-DD')
    },
    async save () {
      try {
        // 同时保存  头像  信息
        await updateUserPhoto(this.$refs.fileInput.files[0])
        await updateUserInfo(this.user)
        this.$toast.success('保存成功')
      } catch (e) {
        this.$toast.fail('保存失败')
      }
    }
  }
}
</script>

<style scoped lang='less'></style>
