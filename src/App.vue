<template>
  <div id="app">
    <!-- 一级路由对应的组件渲染的容器 -->
    <!-- 1. 组件需要被keep-alive包裹才能缓存 -->
    <!-- 2. 如果组件不需要被缓存，放在keep-alive外面 -->
    <!-- 3. 如果当前路由指定的组件是 首页 文章详情 那么使用keep-alive包裹。  -->
    <!-- 4. 在路由规则中加入元信息 meta:{isKeepAlive:true} -->
    <!-- 5. 开始判断 如果当前访问的路由 路由信息中指定了需要缓存  包裹对应的组件 -->
    <keep-alive>
      <router-view v-if="$route.meta.isKeepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.isKeepAlive"></router-view>
  </div>
</template>

<style lang="less"></style>
