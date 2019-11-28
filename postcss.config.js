// 后处理器（支持很多插件，例如 加私有前缀  px转成rem）
module.exports = {
  plugins: {
    // 自动加上私有前缀
    'autoprefixer': {},
    'postcss-pxtorem': {
      // rem的基准值  按iPhone6做为标准设备
      rootValue: 37.5,
      // 所有css属性的px单位全部转换
      propList: ['*']
    }
  }
}
