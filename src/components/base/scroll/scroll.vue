<template>
  <div ref="rootRef">
    <slot></slot>
  </div>
</template>

<script>
import useScroll from "./use-scroll";
import { ref } from "vue";

export default {
  name: "scroll",
  // 由于BS中click默认无效，故需要重新定义其默认属性值
  props: {
    click: {
      type: Boolean,
      default: true,
    },
    // 设置滚动类型1,2,3
    probeType: {
      type: Number,
      default: 0,
    },
  },
  // 自定义事件派发
  emits: ["scroll"],
  // 将props传入setup()函数中
  setup(props, { emit }) {
    const rootRef = ref(null);
    const scroll = useScroll(rootRef, props, emit);

    return {
      rootRef,
      scroll,
    };
  },
};
</script>

<style>
</style>