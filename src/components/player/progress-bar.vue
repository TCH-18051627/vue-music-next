<template>
  <div class="progress-bar" @click="onClick">
    <div class="bar-inner">
      <div class="progress" ref="progress" :style="progressStyle"></div>
      <div
        class="progress-btn-wrapper"
        :style="btnStyle"
        @touchstart.prevent="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend.prevent="onTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
const progressBtnWidth = 16;

export default {
  name: "progress-bar",
  // 在手指还在移动时，派发progress-changing事件
  // 在手指离开的时候，派发progress-changed事件
  emits: ["progress-changing", "progress-changed"],
  props: {
    // 接收进度数据,当前播放进度的百分比
    progress: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      // 通过progress计算进度偏移量
      offset: 0,
    };
  },
  computed: {
    progressStyle() {
      return `width:${this.offset}px`;
    },
    btnStyle() {
      return `transform:translate3d(${this.offset}px,0,0)`;
    },
  },
  watch: {
    progress(newProgress) {
      this.setOffset(newProgress);
    },
  },
  created() {
    // 放在created中而不是data中是因为这里并不要求touch为响应式的,touch只是作为中间存储触碰坐标的对象
    // 当不需要数据为响应式在模板中使用而又希望能够在上下文使用它时，则定义在created中
    this.touch = {};
  },
  methods: {
    onTouchStart(e) {
      // 1.获取开始点击的位置x1
      // 2.获取左侧进度条的宽度beginWidth
      this.touch.x1 = e.touches[0].pageX;
      this.touch.beginWidth = this.$refs.progress.clientWidth;
    },
    onTouchMove(e) {
      const delta = e.touches[0].pageX - this.touch.x1;
      // 位移过后的左侧进度条宽度
      const tempWidth = this.touch.beginWidth + delta;
      // 总宽度
      const barWidth = this.$el.clientWidth - progressBtnWidth;
      // 计算出播放进度百分比，限定在0和1之间
      const progress = Math.min(1, Math.max(0, tempWidth / barWidth));
      this.offset = barWidth * progress;
      this.$emit("progress-changing", progress);
    },
    onTouchEnd() {
      const barWidth = this.$el.clientWidth - progressBtnWidth;
      const progress = this.$refs.progress.clientWidth / barWidth;
      this.$emit("progress-changed", progress);
    },
    onClick(e) {
      // 获取progress-bar进度条左边界到页面left=0边界的距离rect.left
      // 进度条偏移量offsetWidth即点击处的pageX与rect.left的差
      const rect = this.$el.getBoundingClientRect();
      const offseWidth = e.pageX - rect.left;
      const barWidth = this.$el.clientWidth - progressBtnWidth;
      const progress = offseWidth / barWidth;
      this.$emit("progress-changed", progress);
    },
    setOffset(progress) {
      // 获取进度条的宽度barWidth
      // el.clientWidth即progress-bar整个组件的宽度
      // progressBtnWidth即进度按钮的宽度
      const barWidth = this.$el.clientWidth - progressBtnWidth;
      this.offset = barWidth * progress;
    },
  },
};
</script>

<style lang="scss" scoped>
.progress-bar {
  height: 30px;
  .bar-inner {
    // 整个黑色进度条
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);
    .progress {
      // 左侧已播放黄色进度条
      position: absolute;
      height: 100%;
      background: $color-theme;
    }
    .progress-btn-wrapper {
      // 进度按钮
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;
      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid $color-text;
        border-radius: 50%;
        background: $color-theme;
      }
    }
  }
}
</style>