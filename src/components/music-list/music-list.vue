<template>
  <div class="music-list">
    <div class="back" @click="goBack">
      <i class="icon-back"></i>
    </div>
    <h1 class="title">{{ title }}</h1>
    <div class="bg-image" :style="bgImageStyle" ref="bgImage">
      <div class="play-btn-wrapper" :style="playBtnStyle">
        <div v-show="songs.length > 0" class="play-btn" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" :style="filterStyle"></div>
    </div>
    <scroll
      class="list"
      :style="scrollStyle"
      v-loading="loading"
      v-no-result:[noResultText]="noResult"
      :probe-type="3"
      @scroll="onScroll"
    >
      <div class="song-list-wrapper">
        <song-list :songs="songs" @select="selectItem" :rank="rank"></song-list>
      </div>
    </scroll>
  </div>
</template>

<script>
import SongList from "@/components/base/song-list/song-list";
import Scroll from "@/components/wrap-scroll";
import { mapActions, mapState } from "vuex";

// 歌曲列表上拉时遗留背景图片的最小高度值
const RESERVED_HEIGHT = 40;

export default {
  name: "music-list",
  components: {
    SongList,
    Scroll,
  },
  props: {
    songs: {
      type: Array,
      default() {
        return [];
      },
    },
    title: String,
    pic: String,
    loading: Boolean,
    noResultText: {
      type: String,
      defalut: "抱歉，没有找到可播放的歌曲",
    },
    rank: Boolean,
  },
  data() {
    return {
      imageHeight: 0,
      scrollY: 0,
      maxTranslateY: 0,
    };
  },
  computed: {
    noResult() {
      // 突发边界情况获取不到歌曲时，loading为false即数据已经加载完了，并且歌曲长度为空时，noResult返回true
      return !this.loading && !this.songs.length;
    },
    playBtnStyle() {
      let display = "";
      if (this.scrollY >= this.maxTranslateY) {
        display = "none";
      }
      return {
        display,
      };
    },
    bgImageStyle() {
      const scrollY = this.scrollY;
      let zIndex = 0;
      let paddingTop = "70%";
      let height = 0;
      // 为处理ios兼容问题,对定位层级覆盖不兼容
      let translateZ = 0;

      // 设置图片缩放值
      let scale = 1;
      // 歌曲列表往下拉的时候scrollY < 0
      if (scrollY < 0) {
        scale = 1 + Math.abs(scrollY / this.imageHeight);
      }

      if (scrollY > this.maxTranslateY) {
        zIndex = 10;
        paddingTop = 0;
        height = `${RESERVED_HEIGHT}px`;
        translateZ = 1;
      }
      return {
        paddingTop,
        height,
        zIndex,
        backgroundImage: `url(${this.pic})`,
        transform: `scale(${scale})translateZ(${translateZ}px)`,
      };
    },
    ...mapState(["playlist"]),
    scrollStyle() {
      const bottom = this.playlist.length ? "60px" : "0";
      return {
        top: `${this.imageHeight}px`,
        bottom,
      };
    },
    // 列表上拉实现图片动态模糊效果
    filterStyle() {
      // ❤ 好的习惯：当在一个计算属性中，一个响应式变量取的次数大于一次时，一定要用一个本地的局部变量来缓存，例如此处的scrollY
      // 分析：因为每次调用this.***时，就是一次依赖收集getter()过程，尤其时次数多了会影响性能
      let blur = 0;
      const scrollY = this.scrollY;
      const imageHeight = this.imageHeight;
      if (scrollY >= 0) {
        blur =
          Math.min(this.maxTranslateY / imageHeight, scrollY / imageHeight) *
          20;
      }
      return {
        backdropFilter: `blur(${blur}px)`,
      };
    },
  },
  mounted() {
    // dom挂载渲染后动态获取dom数值
    // 动态获取背景图片所在dom层的高度
    this.imageHeight = this.$refs.bgImage.clientHeight;
    // 计算歌曲列表最大上拉距离
    this.maxTranslateY = this.imageHeight - RESERVED_HEIGHT;
  },
  methods: {
    goBack() {
      this.$router.back();
    },
    onScroll(pos) {
      // 接收scroll组件派发的scroll事件传递来的pos参数
      this.scrollY = -pos.y;
    },
    // 利用vuex中的 mapActions 派发actions
    ...mapActions(["selectPlay", "randomPlay"]),
    selectItem({ song, index }) {
      // 顺序播放
      this.selectPlay({
        list: this.songs,
        index,
      });
    },
    random() {
      // 随机播放
      this.randomPlay(this.songs);
    },
  },
};
</script>

<style lang="scss" scoped>
.music-list {
  position: relative;
  height: 100%;
  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 20;
    transform: translateZ(2px);
    .icon-back {
      display: block;
      padding: 10px;
      font-size: $font-size-large-x;
      color: $color-theme;
    }
  }
  .title {
    position: absolute;
    top: 0;
    left: 10%;
    width: 80%;
    z-index: 20;
    transform: translateZ(2px);
    @include no-wrap();
    text-align: center;
    line-height: 40px;
    font-size: $font-size-large;
    color: $color-text;
  }
  .bg-image {
    position: relative;
    width: 100%;
    transform-origin: top;
    background-size: cover;
    .play-btn-wrapper {
      position: absolute;
      bottom: 20px;
      z-index: 10;
      width: 100%;
      .play-btn {
        box-sizing: border-box;
        width: 135px;
        padding: 7px 0;
        margin: 0 auto;
        text-align: center;
        border: 1px solid $color-theme;
        color: $color-theme;
        border-radius: 100px;
        font-size: 0;
      }
      .icon-play {
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
        font-size: $font-size-medium-x;
      }
      .text {
        display: inline-block;
        vertical-align: middle;
        font-size: $font-size-small;
      }
    }
    .filter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(7, 17, 27, 0.4);
    }
  }
  .list {
    position: absolute;
    bottom: 0;
    width: 100%;
    z-index: 0;
    .song-list-wrapper {
      padding: 20px 30px;
      background: $color-background;
    }
  }
}
</style>