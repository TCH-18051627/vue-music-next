import BScroll from "@better-scroll/core";
import Slide from "@better-scroll/slide";

// compositionAPI暴露onMounted等生命周期钩子函数的API
// 此处剥离出slider的逻辑模块，体现逻辑分离目的
// 导入onMounted(挂载),onUnmounted(卸载)生命周期钩子
import { onMounted, onUnmounted, onActivated, onDeactivated, ref } from "vue";

BScroll.use(Slide);

export default function useSlider(wrapperRef) {
  // 在外部定义slider，能够被onMounted和onUnmouted同时用到
  // ❤ ref将值类型的数据包装成编程响应式的引用类型的数据
  // 通过返回值的 value 属性获取响应式的值，修改也需要对 .value进行修改
  const slider = ref(null);

  // 定义currentPageIndex
  const currentPageIndex = ref(0);

  onMounted(() => {
    // wrapperRef.value对应容器的dom对象
    const sliderVal = (slider.value = new BScroll(wrapperRef.value, {
      // BetterScroll默认会无视原生dom的click事件，需要手动设为true
      click: true,
      // 设置为横向滚动，纵向滚动设为false
      scrollX: true,
      scrollY: false,
      // 当快速在屏幕上滑动一段距离的时候，会根据滑动的距离和时间计算出动量，并生成滚动动画。设置为 true 则开启动画。
      momentum: false,
      // 当滚动超过边缘的时候会有一小段回弹动画。设置为 true 则开启动画，由于轮播图的需求是滚动到最后一个时弹回至第一个图片，故设置为false
      bounce: false,
      // 0，在任何时候都不派发 scroll 事件，
      // 1，仅仅当手指按在滚动区域上，每隔 momentumLimitTime(默认300) 毫秒派发一次 scroll 事件，
      // 2，仅仅当手指按在滚动区域上，一直派发 scroll 事件，
      // 3，任何时候都派发 scroll 事件，包括调用 scrollTo 或者触发 momentum 滚动动画
      probeType: 2,
      // 使用slide的默认配置(即直接true)就能实现大多交互效果了
      slide: true
    }));

    // slider.on监听slideWillChange这个事件
    // 获取下一个将要进入的页面信息
    sliderVal.on("slideWillChange", page => {
      currentPageIndex.value = page.pageX;
    });
  });

  // 卸载时销毁,避免内存泄漏
  onUnmounted(() => {
    slider.value.destroy();
  });

  // ❤ 引入keep-alive组件后，页面会缓存所以只会渲染一次，因此需要每次进入页面(activate)都重新启动并执行slider组件的刷新
  onActivated(() => {
    slider.value.enable();
    slider.value.refresh();
  });

  // 离开页面(deactivate)时禁用页面slider组件
  onDeactivated(() => {
    slider.value.disable();
  });

  return {
    slider,
    currentPageIndex
  };
}
