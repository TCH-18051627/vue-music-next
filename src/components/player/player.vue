<template>
  <div class="player" v-show="playlist.length">
    <!-- 如果当前实际播放歌曲列表为空,则不显示整个player组件 -->
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <!-- 可以包裹一层template,如果currentSong为空,则不去执行渲染 -->
        <div class="background">
          <img :src="currentSong.pic" />
        </div>
        <div class="top">
          <div class="back" @click.stop="goBack">
            <i class="icon-back"></i>
          </div>
          <h1 class="title">{{ currentSong.name }}</h1>
          <h2 class="subtitle">{{ currentSong.singer }}</h2>
        </div>
        <div
          class="middle"
          @touchstart.prevent="onMiddleTouchStart"
          @touchmove.prevent="onMiddleTouchMove"
          @touchend.prevent="onMiddleTouchEnd"
        >
          <div class="middle-l" :style="middleLStyle">
            <div class="cd-wrapper" ref="cdWrapperRef">
              <div ref="cdRef" class="cd">
                <img
                  ref="cdImageRef"
                  :src="currentSong.pic"
                  class="image"
                  :class="cdCls"
                />
              </div>
            </div>
            <!-- 当前正在播放的那一行歌词 -->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{ playingLyric }}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricScrollRef" :style="middleRStyle">
            <div class="lyric-wrapper">
              <div v-if="currentLyric" ref="lyricListRef">
                <!-- currentLyric是一个lyric-parser的对象实例 -->
                <!-- currentLyric.lines也就是解析完成的一行行歌词 -->
                <p
                  class="text"
                  :class="{ current: currentLineNum === index }"
                  v-for="(line, index) in currentLyric.lines"
                  :key="line.num"
                >
                  {{ line.txt }}
                </p>
              </div>
              <!-- 纯音乐 -->
              <div class="pure-music" v-show="pureMusicLyric">
                <p>{{ pureMusicLyric }}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{ active: currentShow === 'cd' }"></span>
            <span
              class="dot"
              :class="{ active: currentShow === 'lyric' }"
            ></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{ formatTime(currentTime) }}</span>
            <div class="progress-bar-wrapper">
              <progress-bar
                ref="barRef"
                :progress="progress"
                @progress-changing="onProgressChanging"
                @progress-changed="onProgressChanged"
              ></progress-bar>
            </div>
            <span class="time time-r">{{
              formatTime(currentSong.duration)
            }}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="modeIcon" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlay"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i
                :class="getFavoriteIcon(currentSong)"
                @click="toggleFavorite(currentSong)"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <mini-player :progress="progress" :togglePlay="togglePlay"></mini-player>
    <audio
      ref="audioRef"
      @pause="pause"
      @canplay="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
    ></audio>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, watch, ref, nextTick } from "vue";
import { formatTime } from "@/assets/js/util";
import { PLAY_MODE } from "@/assets/js/constant";
import useMode from "./use-mode";
import useFavorite from "./use-favorite";
import useCd from "./use-cd";
import useLyric from "./use-lyric";
import useMiddleInteractive from "./use-middle-interactive";
import useAnimation from "./use-animation";
import usePlayHistory from "./use-play-history";
import ProgressBar from "./progress-bar";
import Scroll from "@/components/base/scroll/scroll";
import MiniPlayer from "./mini-player";

export default {
  name: "player",
  components: {
    ProgressBar,
    Scroll,
    MiniPlayer,
  },
  setup() {
    // data部分：
    const audioRef = ref(null);
    const songReady = ref(false);
    const currentTime = ref(0);
    let progressChanging = false;
    const barRef = ref(null);

    // vuex：
    // 首先获取fullScreen和currentSong(vuex的store中定义的)
    // 此处的store可以理解为vuex中createStore返回的实例对象
    const store = useStore();
    // 此处引入computed计算属性，因为我们希望数据是一个响应式的数据
    const fullScreen = computed(() => store.state.fullScreen);
    const currentSong = computed(() => store.getters.currentSong);
    const currentIndex = computed(() => store.state.currentIndex);
    const playlist = computed(() => store.state.playlist);

    // hooks：
    const { modeIcon, changeMode } = useMode();
    const { getFavoriteIcon, toggleFavorite } = useFavorite();
    const { cdCls, cdRef, cdImageRef } = useCd();
    const {
      currentLyric,
      currentLineNum,
      pureMusicLyric,
      playingLyric,
      lyricScrollRef,
      lyricListRef,
      playLyric,
      stopLyric,
    } = useLyric(songReady, currentTime);
    const {
      currentShow,
      middleLStyle,
      middleRStyle,
      onMiddleTouchStart,
      onMiddleTouchMove,
      onMiddleTouchEnd,
    } = useMiddleInteractive();
    const {
      cdWrapperRef,
      enter,
      afterEnter,
      leave,
      afterLeave,
    } = useAnimation();
    const { savePlay } = usePlayHistory();

    // 获取当前歌曲播放状态(播放/暂停)
    const playing = computed(() => store.state.playing);
    const playIcon = computed(() => {
      return playing.value ? "icon-pause" : "icon-play";
    });
    const progress = computed(() => {
      return currentTime.value / currentSong.value.duration;
    });

    // 模拟快速切换时无法操作样式
    const disableCls = computed(() => {
      return songReady.value ? "" : "disable";
    });

    // watch：
    // watch监听当前播放歌曲currentSong变化,动态改变当前audio标签播放的歌曲
    watch(currentSong, (newSong) => {
      if (!newSong.id || !newSong.url) {
        // 如果新歌曲获取不到，就直接返回什么都不做
        return;
      }
      // 每次切歌时，将歌曲播放时间置为0
      currentTime.value = 0;
      // 每次切歌时，将songReady置为false来作缓冲
      songReady.value = false;
      // 获取audio dom对象
      const audioEl = audioRef.value;
      // 获取新的currentSong的url播放地址给audio dom对象
      audioEl.src = newSong.url;
      // 执行audio的播放方法play，等待canplay事件触发后会执行回调函数ready置songReady为true
      audioEl.play();
      // 每次切歌时，都设置为播放状态
      store.commit("setPlayingState", true);
    });

    // watch监听playing变化,动态设置audio标签播放或暂停
    watch(playing, (newPlaying) => {
      if (!songReady.value) {
        // 如果歌曲没缓冲好，就直接返回什么都不做
        return;
      }
      const audioEl = audioRef.value;
      if (newPlaying) {
        audioEl.play();
        playLyric();
      } else {
        audioEl.pause();
        stopLyric();
      }
    });

    // ❤ 歌曲页面缩小时，如果将歌曲暂停，此时progress不再变化，offset值不再计算
    // 而再回到歌曲页面展开时，由于progress-bar中只有在progress变化时才会计算offset值，并对进度条作样式的变换
    // 因此还需要监听fullScreen的变化，再计算一次offset，防止在歌曲暂停情况下展开页面时进度条为0(即offset === 0)
    watch(fullScreen, async (newFullScreen) => {
      if (newFullScreen) {
        // ❤ 由于setOffset中需要获取dom元素的数据($el.clientWidth)
        // 而vue中数据的更改到dom的变化相隔一个next-tick
        // 因此需要在next-tick之后才能正确获取到歌曲页面展开后的dom数据
        // 也就是在监听到newFullScreen更改后，等待next-tick后页面dom变化完成再执行setOffset，这个过程是异步的，用到async和await
        await nextTick();
        barRef.value.setOffset(progress.value);
      }
    });

    // methods：
    function goBack() {
      // 全屏播放state设置为false
      store.commit("setFullScreen", false);
    }

    function togglePlay() {
      if (!songReady.value) {
        return;
      }
      store.commit("setPlayingState", !playing.value);
    }

    // 原生dom中的audio标签中的pause事件触发(例如电脑待机等)时,执行回调函数puase()暂停
    function pause() {
      store.commit("setPlayingState", false);
    }

    // 播放上一首
    function prev() {
      // ❤computed获取的数据一定要用.value形式提取
      const list = playlist.value;

      if (!songReady.value || !list.length) {
        // 如果没有歌曲，就直接返回不做处理
        return;
      }

      if (list.length === 1) {
        // 如果只有一首歌，就循环播放
        loop();
      } else {
        let index = currentIndex.value - 1;
        // 如果是第一首，则跳转到最后一首去
        if (index === -1) {
          index = list.length - 1;
        }
        store.commit("setCurrentIndex", index);
      }
    }

    // 播放下一首
    function next() {
      const list = playlist.value;

      if (!songReady.value || !list.length) {
        return;
      }

      if (list.length === 1) {
        // 如果只有一首歌，就循环播放
        loop();
      } else {
        let index = currentIndex.value + 1;
        if (index === list.length) {
          index = 0;
        }
        store.commit("setCurrentIndex", index);
      }
    }

    // 循环播放函数
    function loop() {
      const audioEl = audioRef.value;
      // 通过audio标签的dom API currentTime来直接重置歌曲播放时间为0
      audioEl.currentTime = 0;
      audioEl.play();
      // 由于audio触发ended事件时会同时触发puase事件,导致playingState切换为false,从而使得暂停键显示为暂停样式
      store.commit("setPlayingState", true);
    }

    function ready() {
      // 歌曲缓冲
      if (songReady.value) {
        // 已经为true了就什么都不做
        return;
      }
      songReady.value = true;

      // 为防止歌词获取之后songReady为false而导致歌词未能播放
      // 再执行一次playLyric
      playLyric();
      savePlay(currentSong.value);
    }

    function error() {
      // 当audio播放触发error事件时，直接将songReady设置为true，允许歌曲切换操作
      songReady.value = true;
    }

    function updateTime(e) {
      // audio的timeupdate事件触发后,调用回调函数updateTime,再通过事件参数e的e.target.currentTime实时更新currentTime
      if (!progressChanging) {
        currentTime.value = e.target.currentTime;
      }
    }

    function onProgressChanging(progress) {
      // ❤在播放过程中，由于updateTime()中的currentTime也在发生变化，所以这边手指离开后，currentTime值又会被修改回updateTime()中的值，故此时需要给updateTime()那边加上一个控制位限制，使得手指移动导致的进度条变化优先级高于进度条的自动变化

      progressChanging = true;
      currentTime.value = currentSong.value.duration * progress;

      // 在手指拖动进度条过程中,先更新歌词同步偏移到当前时间戳播放位置,再停止歌词的播放,注意 实时(播放->停止) 仅发生在进度条手指拖动过程, 最后状态总是停止的,故在手指离开时仍需再执行playLyric()重新播放
      playLyric();
      stopLyric();
    }

    function onProgressChanged(progress) {
      progressChanging = false;
      audioRef.value.currentTime = currentTime.value =
        currentSong.value.duration * progress;
      if (!playing.value) {
        // 如果原本是暂停状态，则拖动完成后将其设置为播放状态
        store.commit("setPlayingState", true);
      }
      playLyric();
    }

    function end() {
      currentTime.value = 0;
      const playMode = computed(() => store.state.playMode);
      if (playMode.value === PLAY_MODE.loop) {
        loop();
      } else {
        next();
      }
    }

    return {
      playlist,
      audioRef,
      fullScreen,
      currentTime,
      currentSong,
      playIcon,
      progress,
      barRef,
      goBack,
      togglePlay,
      pause,
      prev,
      next,
      loop,
      end,
      ready,
      disableCls,
      error,
      // mode
      modeIcon,
      changeMode,
      // favorite
      getFavoriteIcon,
      toggleFavorite,

      updateTime,
      formatTime,
      onProgressChanging,
      onProgressChanged,
      // cd
      cdCls,
      cdRef,
      cdImageRef,
      // lyric
      currentLyric,
      currentLineNum,
      pureMusicLyric,
      playingLyric,
      lyricScrollRef,
      lyricListRef,
      // middle-interactive
      currentShow,
      middleLStyle,
      middleRStyle,
      onMiddleTouchStart,
      onMiddleTouchMove,
      onMiddleTouchEnd,
      // cd-animation
      cdWrapperRef,
      enter,
      afterEnter,
      leave,
      afterLeave,
    };
  },
};
</script>

<style lang="scss" scoped>
.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;
    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);

      img {
        width: 100%;
        height: 100%;
      }
    }
    .top {
      position: relative;
      margin-bottom: 25px;
      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
      }
      .icon-back {
        display: block;
        padding: 9px;
        font-size: $font-size-large-x;
        color: $color-theme;
        transform: rotate(-90deg);
      }
      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        @include no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }
      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }
    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;
      .middle-l {
        display: inline-block;
        // display: none;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;
        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;
          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            img {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }
            .playing {
              animation: rotate 20s linear infinite;
            }
          }
        }
        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;
          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }
      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;
          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
            &.current {
              color: $color-text;
            }
          }
          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }
    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;
      .dot-wrapper {
        text-align: center;
        font-size: 0;
        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;
          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0 auto;
        padding: 10px 0;
        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 40px;
          line-height: 30px;
          width: 40px;
          &.time-l {
            text-align: left;
          }
          &.time-r {
            text-align: right;
          }
        }
        .progress-bar-wrapper {
          flex: 1;
        }
      }
      .operators {
        display: flex;
        align-items: center;
        .icon {
          flex: 1;
          color: $color-theme;
          &.disable {
            color: $color-theme-d;
          }
          i {
            font-size: 30px;
          }
        }
        .i-left {
          text-align: right;
        }
        .i-center {
          padding: 0 20px;
          text-align: center;
          i {
            font-size: 40px;
          }
        }
        .i-right {
          text-align: left;
        }
        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }
    &.normal-enter-active,
    &.normal-leave-active {
      transition: all 0.6s;
      .top,
      .bottom {
        transition: all 0.6s cubic-bezier(0.45, 0, 0.55, 1);
      }
    }
    &.normal-enter-from,
    &.normal-leave-to {
      opacity: 0;
      .top {
        transform: translate3d(0, -100px, 0);
      }
      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }
}
</style>