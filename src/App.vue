<template>
  <m-header></m-header>
  <tab></tab>
  <!-- 路由占位符通过name来区分，除/user外视图出现均不需要动画过渡效果 -->
  <!-- 使用keep-alive实现组件的缓存，不用每次切换页面都重新渲染页面 -->
  <router-view :style="viewStyle" v-slot="{ Component }">
    <keep-alive>
      <component :is="Component"></component>
    </keep-alive>
  </router-view>
  <router-view name="user" v-slot="{ Component }" :style="viewStyle">
    <transition appear name="slide">
      <keep-alive>
        <component :is="Component"></component>
      </keep-alive>
    </transition>
  </router-view>
  <player></player>
</template>

<script>
import Header from "./components/header/header";
import Tab from "./components/tab/tab";
import Player from "./components/player/player";
import { mapState } from "vuex";
export default {
  components: {
    MHeader: Header,
    Tab,
    Player,
  },
  computed: {
    ...mapState(["playlist"]),
    viewStyle() {
      // 设置scroll滚动页面的bottom值，如果当前有播放列表，则会显示mini播放器，将bottom设置为mini播放器的高度，避免被覆盖
      const bottom = this.playlist.length ? "60px" : "0";
      return {
        bottom,
      };
    },
  },
};
</script>

<style lang="scss" scoped></style>
