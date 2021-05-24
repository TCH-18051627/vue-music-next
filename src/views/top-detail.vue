<template>
  <div class="top-detail">
    <music-list
      :songs="songs"
      :title="title"
      :pic="pic"
      :loading="loading"
      rank
    ></music-list>
  </div>
</template>

<script>
import { getTopDetail } from "@/service/top-list";
import { TOP_KEY } from "@/assets/js/constant";
import createDetailComponent from "@/assets/js/create-detail-component";

export default createDetailComponent("top-detail", TOP_KEY, getTopDetail);

// 此处采用组件函数式封装的方式来对相同歌曲列表的vue实例进行调用
</script>

<style lang="scss" scoped>
.top-detail {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: $color-background;
}
</style>