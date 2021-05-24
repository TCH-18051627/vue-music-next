<template>
  <scroll class="index-list" :probe-type="3" @scroll="onScroll" ref="scrollRef">
    <ul ref="groupRef">
      <!-- 每个li表示一个组group,即热组,A字母组,B字母组…… -->
      <li v-for="group in data" :key="group.title" class="group">
        <!-- 每个group下面再嵌套一个列表 -->
        <h2 class="title">{{ group.title }}</h2>
        <ul>
          <!-- 每个li表示一个歌手,包含头像和名字 -->
          <li
            v-for="item in group.list"
            :key="item.id"
            class="item"
            @click="onItemClick(item)"
          >
            <img class="avatar" v-lazy="item.pic" />
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="fixed">
      <div class="fixed-title" v-show="fixedTitle" :style="fixedStyle">
        {{ fixedTitle }}
      </div>
    </div>
    <!-- stop阻止touch事件冒泡, prevent阻止浏览器默认刷新行为 -->
    <!-- 给父元素绑定touch事件, 传入参数e即触摸事件 -->
    <div
      class="shortcut"
      @touchstart.stop.prevent="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
      @touchend.stop.prevent
    >
      <!-- 绑定:data-index, 就能通过dom的dataset API获取绑定属性对应的值index -->
      <ul>
        <li
          v-for="(item, index) in shortcutList"
          :key="item"
          :data-index="index"
          class="item"
          :class="{ current: currentIndex === index }"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </scroll>
</template>

<script>
import Scroll from "@/components/wrap-scroll";
import useFixed from "./use-fixed";
import useShortcut from "./use-shortcut";

export default {
  name: "index-list",
  components: {
    Scroll,
  },
  props: {
    data: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  emits: ["select"],
  setup(props, { emit }) {
    const {
      groupRef,
      onScroll,
      fixedTitle,
      fixedStyle,
      currentIndex,
    } = useFixed(props);
    const {
      shortcutList,
      onShortcutTouchStart,
      scrollRef,
      onShortcutTouchMove,
    } = useShortcut(props, groupRef);

    // 点击歌手跳转到对应歌手详情二级路由页面
    // 每个item就是一个singer数据结构，将其派发给父组件singer.vue
    function onItemClick(item) {
      emit("select", item);
    }

    return {
      onItemClick,
      // fixed
      groupRef,
      onScroll,
      fixedTitle,
      fixedStyle,
      currentIndex,
      // shortcut
      shortcutList,
      scrollRef,
      onShortcutTouchStart,
      onShortcutTouchMove,
    };
  },
};
</script>

<style lang="scss" scoped>
.index-list {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;
  .group {
    padding-bottom: 30px;
    .title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
    .item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;
      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }
  .fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }
  .shortcut {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;
    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;
      // 当前字幕组的索引显示高亮
      &.current {
        color: $color-theme;
      }
    }
  }
}
</style>