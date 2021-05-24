<template>
  <teleport to="body">
    <!-- vue组件以组件树的结构形式生成dom结构 -->
    <!-- vue3新增teleport组件, 可指定对应组件(playlist)渲染挂载到指定位置 -->
    <!-- 通常全屏类组件都可使用这种方式，以免父组件对其产生影响 -->
    <transition name="list-fade">
      <div class="playlist" v-show="visible && playlist.length" @click="hide">
        <!-- 内部的click事件要设置stop指令,防止事件冒泡影响到hide -->
        <div class="list-wrapper" @click.stop>
          <div class="list-header">
            <h1 class="title">
              <i class="icon" :class="modeIcon" @click="changeMode"> </i>
              <span class="text">{{ modeText }}</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
          </div>
          <scroll class="list-content" ref="scrollRef">
            <transition-group ref="listRef" name="list" tag="ul">
              <!-- 此处将原本的ul标签改成transition-group 因为这里要实现删除歌曲后列表移动的过渡效果选中li元素的height 40px -> 0 -->
              <li
                class="item"
                v-for="song in sequenceList"
                :key="song.id"
                @click="selectItem(song)"
              >
                <i class="current" :class="getCurrentIcon(song)"></i>
                <span class="text">{{ song.name }}</span>
                <span class="favorite" @click="toggleFavorite(song)">
                  <i :class="getFavoriteIcon(song)"></i>
                </span>
                <!-- 删除按钮需要加上stop阻止冒泡 -->
                <span
                  class="delete"
                  @click.stop="removeSong(song)"
                  :class="{ disable: removing }"
                >
                  <i class="icon-delete"></i>
                </span>
              </li>
            </transition-group>
          </scroll>
          <div class="list-add">
            <div class="add" @click="showAddSong">
              <i class="icon-add"></i>
              <span class="text">添加歌曲到列表</span>
            </div>
          </div>
          <div class="list-footer" @click="hide">
            <span>关闭</span>
          </div>
        </div>
        <confirm
          ref="confirmRef"
          text="是否清空列表"
          confirmBtnText="清空"
          @confirm="confirmClear"
        ></confirm>
        <add-song ref="addSongRef"></add-song>
      </div>
    </transition>
  </teleport>
</template>

<script>
import Scroll from "@/components/base/scroll/scroll";
import Confirm from "@/components/base/confirm/confirm";
import AddSong from "@/components/add-song/add-song";
import { ref, computed, watch, nextTick } from "vue";
import { useStore } from "vuex";
import useMode from "./use-mode";
import useFavorite from "./use-favorite";

export default {
  name: "playlist",
  components: {
    Scroll,
    Confirm,
    AddSong,
  },
  setup() {
    const visible = ref(null);
    const removing = ref(false);
    const scrollRef = ref(null);
    const listRef = ref(null);
    const confirmRef = ref(null);
    const addSongRef = ref(null);

    const store = useStore();
    const playlist = computed(() => store.state.playlist);
    const sequenceList = computed(() => store.state.sequenceList);
    const currentSong = computed(() => store.getters.currentSong);

    const { modeIcon, modeText, changeMode } = useMode();
    const { getFavoriteIcon, toggleFavorite } = useFavorite();

    watch(currentSong, async (newSong) => {
      // ❤ 监听currentSong变化使得展开列表顶部实时滚动到当前播放的歌曲位置
      // 因为可能会在currentSong发生变化后再进行一些删除操作
      // 此时需要保证dom渲染完成再进行scrollTocurrent操作，故等待next-tick
      if (!visible.value || !newSong.id) {
        // 若列表未展开，且currentSong为空对象时
        return;
      }
      await nextTick();
      scrollToCurrent();
    });

    function getCurrentIcon(song) {
      // 正在播放的歌曲图标
      if (song.id === currentSong.value.id) {
        return "icon-play";
      }
    }

    async function show() {
      // 显示正在播放列表
      visible.value = true;
      // ❤ 由于visible更改后，列表展开的dom页面渲染需要间隔next-tick
      // 而scroll组件正确计算加载需要使用渲染之后的dom页面的数据
      // 因此需要等待一个next-tick
      await nextTick();
      refreshScroll();
      scrollToCurrent();
    }

    function hide() {
      // 隐藏正在播放列表
      visible.value = false;
    }

    function selectItem(song) {
      //
      const index = playlist.value.findIndex((item) => {
        return song.id === item.id;
      });
      store.commit("setCurrentIndex", index);
      store.commit("setPlayingState", true);
    }

    function removeSong(song) {
      // 防抖，避免快速点击而出现异步操作报错
      if (removing.value) {
        return;
      }
      removing.value = true;
      store.dispatch("removeSong", song);
      setTimeout(() => {
        // 等待动画加载完(300ms)
        removing.value = false;
      }, 300);
    }

    function refreshScroll() {
      // ❤ scroll组件实例化的时候(scroll onMounted)正在播放列表的页面并没有渲染，高度计算都不对，所以需要重新初始化一次scroll实例
      // 此处scrollRef.value是scroll组件对象，组件对象中的scroll也就是BScroll实例对象，通过实例对象就可以直接调用refresh刷新方法
      scrollRef.value.scroll.refresh();
    }

    function scrollToCurrent() {
      // 每次打开正在播放列表时，页面顶部都滚动到当前正在播放的歌曲
      const index = sequenceList.value.findIndex((song) => {
        return currentSong.value.id === song.id;
      });
      if (index === -1) {
        // 快速点击删除时会判定为多次删除一首歌(动画加载需要时间)，第二次的点击currentSong会返回一个空对象
        return;
      }
      const target = listRef.value.$el.children[index];
      // scrollToElement(el, time)
      // 滚动到目标dom元素
      scrollRef.value.scroll.scrollToElement(target, 300);
      if (playlist.value.length === 0) {
        // 列表没有歌曲后，执行hide
        hide();
      }
    }

    function showConfirm() {
      confirmRef.value.show();
    }

    function confirmClear() {
      // 派发一个"clearSonglist" action
      store.dispatch("clearSongList");
      // 清空播放列表之后，执行一次hide()让visible设为false
      hide();
    }

    function showAddSong() {
      addSongRef.value.show();
    }

    return {
      visible,
      scrollRef,
      listRef,
      hide,
      show,
      selectItem,
      removeSong,
      removing,
      playlist,
      sequenceList,
      getCurrentIcon,
      // mode
      modeIcon,
      modeText,
      changeMode,
      // favorite
      getFavoriteIcon,
      toggleFavorite,
      // confirm
      confirmRef,
      showConfirm,
      confirmClear,
      // addSong
      showAddSong,
      addSongRef,
    };
  },
};
</script>

<style lang="scss" scoped>
.playlist {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 200;
  background-color: $color-background-d;
  &.list-fade-enter-active,
  &.list-fade-leave-active {
    transition: opacity 0.3s;
    .list-wrapper {
      transition: all 0.3s;
    }
  }
  &.list-fade-enter-from,
  &.list-fade-leave-to {
    opacity: 0;
    .list-wrapper {
      transform: translate3d(0, 100%, 0);
    }
  }
  .list-wrapper {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 210;
    width: 100%;
    background-color: $color-highlight-background;
    .list-header {
      position: relative;
      padding: 20px 30px 10px 20px;
      .title {
        display: flex;
        align-items: center;
        .icon {
          margin-right: 10px;
          font-size: 24px;
          color: $color-theme-d;
        }
        .text {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-l;
        }
        .clear {
          @include extend-click();
          .icon-clear {
            font-size: $font-size-medium;
            color: $color-text-d;
          }
        }
      }
    }
    .list-content {
      max-height: 240px;
      overflow: hidden;
      .item {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 30px 0 20px;
        overflow: hidden;
        .current {
          flex: 0 0 20px;
          width: 20px;
          font-size: $font-size-small;
          color: $color-theme-d;
        }
        .text {
          flex: 1;
          @include no-wrap();
          font-size: $font-size-medium;
          color: $color-text-d;
        }
        .favorite {
          @include extend-click();
          margin-right: 15px;
          font-size: $font-size-small;
          color: $color-theme;
          .icon-favorite {
            color: $color-sub-theme;
          }
        }
        .delete {
          @include extend-click();
          font-size: $font-size-small;
          color: $color-theme;
          &.disable {
            color: $color-theme-d;
          }
        }
      }
    }
    .list-add {
      width: 140px;
      margin: 20px auto 30px auto;
      .add {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border: 1px solid $color-theme;
        border-radius: 100px;
        color: $color-theme;
        .icon-add {
          margin-right: 5px;
          font-size: $font-size-small-s;
        }
        .text {
          font-size: $font-size-small;
        }
      }
    }
    .list-footer {
      text-align: center;
      line-height: 50px;
      background: $color-background;
      font-size: $font-size-medium-x;
      color: $color-text-l;
    }
  }
}
</style>