<template>
  <div class="singer" v-loading="!singers.length">
    <!-- v-bind绑定data属性,子组件通过props属性获取data数据 -->
    <index-list :data="singers" @select="selectSinger"></index-list>
    <!-- 此处router-view用来渲染SingerDetail -->
    <!-- 通过transition标签的方式管理name为"slide"开头的transition样式实现路由跳转的过渡效果 -->
    <router-view v-slot="{ Component }">
      <transition appear name="slide">
        <component :is="Component" :data="selectedSinger" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import { getSingerList } from "@/service/singer";
import IndexList from "@/components/index-list/index-list";
import storage from "good-storage";
import { SINGER_KEY } from "@/assets/js/constant";

export default {
  name: "singer",
  components: {
    IndexList,
  },
  data() {
    return {
      singers: [],
      selectedSinger: null,
    };
  },
  async created() {
    // 异步获取歌手列表数据
    const result = await getSingerList();
    // console.log(result);
    // 将歌手数据赋值给singers数组
    this.singers = result.singers;
  },
  methods: {
    selectSinger(singer) {
      // singer即子组件index-list通过emit派发来的item
      this.selectedSinger = singer;
      this.cacheSinger(singer);
      // 完成页面跳转
      this.$router.push({
        path: `/singer/${singer.mid}`,
      });
    },
    cacheSinger(singer) {
      // 缓存浏览器歌手详情singer对象，刷新页面时导入渲染缓存数据
      // 采用session方式，关闭页面时清除缓存，不同于local方法的长缓存
      storage.session.set(SINGER_KEY, singer);
    },
  },
};
</script>

<style lang="scss" scoped>
.singer {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
}
</style>
