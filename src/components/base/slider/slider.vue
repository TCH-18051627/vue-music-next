<template>
  <!-- 使用BetterScroll需要获取dom节点, 此时给容器添加ref属性 -->
  <div class="slider" ref="rootRef">
    <div class="slider-group">
      <div class="slider-page" v-for="item in sliders" :key="item.id">
        <a href="item.link">
          <img :src="item.pic" />
        </a>
      </div>
    </div>
    <div class="dots-wrapper">
      <span
        class="dot"
        v-for="(item, index) in sliders"
        :key="item.id"
        :class="{ active: currentPageIndex === index }"
      >
      </span>
    </div>
  </div>
</template>

<script>
// ref详解：
// 1. 将基础数据–>响应式数据 ==> 把值类型的数据包装编程响应式的引用类型的数据
// 2. 函数
// 通过返回值的 value 属性获取响应式的值 ，修改也需要对 .value进行修改。
// 3. 获取元素
// 在Vue2.x通过给元素添加ref=‘xxx’,,然后使用refs.xxx的方式来获取元素
// 在Vue3.x中我们也可以通过ref来获取元素
import { ref } from "vue";
import useSlider from "./use-slider";

export default {
  name: "slider",
  props: {
    sliders: {
      type: Array,
      default() {
        // 默认为空，有数据传进来时覆盖
        return [];
      },
    },
  },
  setup() {
    const rootRef = ref(null);
    // 使用对象解构赋值下一页图片对应的索引
    const { currentPageIndex } = useSlider(rootRef);

    return {
      rootRef,
      currentPageIndex,
    };
  },
};
</script>

<style lang="scss" scoped>
.slider {
  min-height: 1px;
  font-size: 0;
  touch-action: pan-y;
  .slider-group {
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    .slider-page {
      display: inline-block;
      transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
      a {
        display: block;
        width: 100%;
      }
      img {
        display: block;
        width: 100%;
      }
    }
  }
  .dots-wrapper {
    position: absolute;
    left: 50%;
    bottom: 12px;
    line-height: 12px;
    transform: translateX(-50%);
    .dot {
      display: inline-block;
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
}
</style>