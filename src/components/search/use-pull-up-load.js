// 用BScroll实现上拉加载功能模块
import BScroll from "@better-scroll/core";
import PullUp from "@better-scroll/pull-up";
import ObserveDOM from "@better-scroll/observe-dom";
import {
  ref,
  watch,
  computed,
  onMounted,
  onUnmounted,
  onActivated,
  onDeactivated
} from "vue";

BScroll.use(PullUp);
BScroll.use(ObserveDOM);

export default function usePullUpLoad(requestData, preventPullUpLoad) {
  const scroll = ref(null);
  const rootRef = ref(null);

  // 判定拉取事件回调是否结束的标志，true正在执行，false不在执行
  const isPullUpLoad = ref(false);

  // 在组件挂载渲染之后创建scroll实例对象
  onMounted(() => {
    const scrollVal = (scroll.value = new BScroll(rootRef.value, {
      pullUpLoad: true,
      observeDOM: true,
      click: true
    }));

    // scroll实例对象监听pullingUp事件(上拉页面滚动到底部时)
    // 执行回调函数pullingUpHandler()
    scrollVal.on("pullingUp", pullingUpHandler);

    // ❤ 注意此时内部会进行数据获取的异步操作
    async function pullingUpHandler() {
      if (preventPullUpLoad.value) {
        // 如果pullingUp事件锁为true则直接结束pullUp事件并return
        scrollVal.finishPullUp();
        return;
      }
      isPullUpLoad.value = true;
      await requestData();
      // 请求数据获取完成，结束上拉加载行为。
      scrollVal.finishPullUp();
      // scroll实例重新计算页面
      scrollVal.refresh();
      isPullUpLoad.value = false;
    }
  });

  onUnmounted(() => {
    scroll.value.destroy();
  });

  // ❤ 引入keep-alive组件后，页面会缓存所以只会渲染一次，因此需要每次进入页面(activate)都重新启动并执行scroll组件的刷新
  onActivated(() => {
    scroll.value.enable();
    scroll.value.refresh();
  });

  // 离开页面(deactivate)时禁用页面scroll组件
  onDeactivated(() => {
    scroll.value.disable();
  });

  return {
    scroll,
    rootRef,
    isPullUpLoad
  };
}
