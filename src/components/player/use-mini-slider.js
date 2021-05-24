// mini播放器滑动部分逻辑
import {
  ref,
  onMounted,
  onUnmounted,
  onActivated,
  onDeactivated,
  computed,
  watch,
  nextTick
} from "vue";
import { useStore } from "vuex";
import BScroll from "@better-scroll/core";
import Slide from "@better-scroll/slide";

BScroll.use(Slide);

export default function useMiniSlider() {
  // 注意一定要在mini-player显示的时候去初始化slider
  // 因为mini-player的显示使用v-show，页面已经渲染但不显示，此时去初始化没有意义
  const sliderWrapperRef = ref(null);
  const slider = ref(null);

  const store = useStore();
  const fullScreen = computed(() => store.state.fullScreen);
  const playlist = computed(() => store.state.playlist);
  const currentIndex = computed(() => store.state.currentIndex);

  const sliderShow = computed(() => {
    // 表示当页面缩小且存在实际正在播放列表时，可初始化slider
    return !fullScreen.value && !!playlist.value;
  });

  onMounted(() => {
    let sliderVal;
    // 当fullScreen 从true->false时,页面缩小，此时渲染slider实例
    // ❤ sliderShow从false变为true时，需要等待一个next-tick dom页面才能真正渲染，渲染之后才能再去获取dom数据再由BScroll重新计算渲染
    watch(sliderShow, async newSliderShow => {
      if (newSliderShow) {
        await nextTick();
        if (!sliderVal) {
          sliderVal = slider.value = new BScroll(sliderWrapperRef.value, {
            click: true,
            scrollX: true,
            scrollY: false,
            momentum: false,
            bounce: false,
            probeType: 2,
            // ❤ 此处slide不能设置为默认了，需要把自动滑动给关闭
            slide: {
              autoplay: false,
              loop: true
            }
          });

          // 创建完slider实例之后
          // slider.on监听slidePageChanged这个事件
          // 获取切换后的页面page信息并将对应索引值赋值给state中的currentIndex，且播放状态变更为true
          sliderVal.on("slidePageChanged", page => {
            store.commit("setCurrentIndex", page.pageX);
          });
        } else {
          // new BScroll初始化只执行一次就够了
          // 当sliderShow再变换为true时refresh将实例刷新就行
          sliderVal.refresh();
        }
        // 根据索引跳转slider到对应页面 goToPage(pageX,pageY,[time],[easing])
        // goToPage本质上是在dom层面上改变transform的操作，故要在dom渲染了的情况下才能正常执行
        sliderVal.goToPage(currentIndex.value, 0, 0);
      }
    });

    // 当一首歌曲播放完后，currentIndex会自动发生变化
    // 此时需要监听currentIndex的变化，然后再去执行一次goToPage
    watch(currentIndex, newIndex => {
      if (sliderVal && sliderShow.value) {
        // 当有slider实例且sliderShow为true时(即页面中miniSlider已经渲染了情况下)
        sliderVal.goToPage(newIndex, 0, 0);
      }
    });

    // ❤ 监听playlist，若发生变化(如顺序->随机播放，歌曲删除等等)
    // 刷新slider实例对象，因为在playlist列表中操作时，sliderShow并没有发生变化，也就没有在sliderPage dom页面更改后执行refresh
    // 注意此处playlist变化后，同样要等待next-tick完成对sliderPage dom页面更改渲染后再执行refresh
    watch(playlist, async newList => {
      // 同时要注意sliderPage发生变化只会发生在已有slider实例创建且播放器为缩放状态时(sliderShow.value为true)
      // 要注意slider实例refresh方法至少需要一个滑动dom对象
      // 因此list长度 > 0
      if (sliderVal && sliderShow.value && newList.length) {
        await nextTick();
        sliderVal.refresh();
      }
    });
  });

  onUnmounted(() => {
    if (slider.value) {
      // 如果sliderShow一直没变化过，也就不会执行slider实例初始化
      slider.value.destroy();
    }
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
    sliderWrapperRef
  };
}
