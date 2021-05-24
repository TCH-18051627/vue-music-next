// 二级路由
<template>
  <div class="singer-detail">
    <music-list
      :songs="songs"
      :title="title"
      :pic="pic"
      :loading="loading"
    ></music-list>
  </div>
</template>

<script>
import { getSingerDetail } from "@/service/singer";
import { SINGER_KEY } from "@/assets/js/constant";
import createDetailComponent from "@/assets/js/create-detail-component";

export default createDetailComponent(
  "singer-detail",
  SINGER_KEY,
  getSingerDetail
);

// 此处采用组件函数式封装的方式来对相同歌曲列表的vue实例进行调用
// {
//   name: "singer-detail",
//   components: { MusicList },
//   props: {
//     singer: Object,
//   },
//   data() {
//     return {
//       songs: [],
//       loading: true,
//     };
//   },
//   computed: {
//     computedSinger() {
//       let ret = null;
//       const singer = this.singer;
//       if (singer) {
//         ret = singer;
//       } else {
//         // 如果props没有传入singer，就从storage.session中取
//         const cachedSinger = storage.session.get(SINGER_KEY);
//         // 当缓存的singer.mid与当前页面的id参数相同时，就将ret赋值为缓存singer
//         if (cachedSinger && cachedSinger.mid === this.$route.params.id) {
//           ret = cachedSinger;
//         }
//       }
//       return ret;
//     },
//     pic() {
//       const singer = this.computedSinger;
//       return singer && singer.pic;
//     },
//     title() {
//       const singer = this.computedSinger;
//       return singer && singer.name;
//     },
//   },
//   async created() {
//     if (!this.computedSinger) {
//       // 如果computedSinger不存在的话，退回到一级路由，matched[0]即匹配到的第一个路由
//       const path = this.$route.matched[0].path;
//       this.$router.push({
//         path,
//       });
//       return;
//     }
//     const result = await getSingerDetail(this.computedSinger);
//     // console.log(result);
//     this.songs = await processSongs(result.songs);
//     this.loading = false;
//     console.log(this.songs);
//   },
// };
</script>

<style lang="scss" scoped>
.singer-detail {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: $color-background;
}
</style>