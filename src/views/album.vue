<template>
  <div class="album">
    <music-list
      :songs="songs"
      :title="title"
      :pic="pic"
      :loading="loading"
    ></music-list>
  </div>
</template>

<script>
import createDetailComponent from "@/assets/js/create-detail-component";
import { ALBUM_KEY } from "@/assets/js/constant";
import { getAlbum } from "@/service/recommend";

export default createDetailComponent("album", ALBUM_KEY, getAlbum);

// 此处采用组件函数式封装的方式来对相同歌曲列表的vue实例进行调用
</script>

<style lang="scss" scoped>
.album {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: $color-background;
}
</style>