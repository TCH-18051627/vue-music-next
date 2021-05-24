// 中间视图层手指交互相关逻辑
import { ref } from "vue";

export default function useMiddleInteractive() {
  const currentShow = ref("cd");
  const middleLStyle = ref(null);
  const middleRStyle = ref(null);

  const touch = {};
  // 定义一个当前实际视图层显示的样式
  // 不直接用currentShow操作是因为它会直接影响到父组件的逻辑
  let currentView = "cd";

  function onMiddleTouchStart(e) {
    touch.startX = e.touches[0].pageX;
    touch.startY = e.touches[0].pageY;
    // 设置方向锁以避免斜着滑动的问题
    touch.directionLocked = "";
  }

  function onMiddleTouchMove(e) {
    const deltaX = e.touches[0].pageX - touch.startX;
    const deltaY = e.touches[0].pageY - touch.startY;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (!touch.directionLocked) {
      // 根据第一次手指移动的横纵偏移量大小来决定是左右还是上下拖动
      touch.directionLocked = absDeltaX >= absDeltaY ? "h" : "v";
    }

    if (touch.directionLocked === "v") {
      // 如果判定为纵向滑动,则与中间键逻辑无关,return不做操作
      return;
    }

    // 获取当前页面的初始left值, 如果实际视图显示是cd, 则left为0, 否则为 -屏幕宽度, 视图为'lyric'
    const left = currentView === "cd" ? 0 : -window.innerWidth;
    // 计算页面偏移量offsetWidth并控制在[0, window.innerWidth]之间
    const offsetWidth = Math.min(
      0,
      Math.max(-window.innerWidth, left + deltaX)
    );
    // 计算偏移量占屏幕宽度的绝对值
    touch.percent = Math.abs(offsetWidth / window.innerWidth);

    if (currentView === "cd") {
      if (touch.percent > 0.2) {
        currentShow.value = "lyric";
      } else {
        currentShow.value = "cd";
      }
    } else {
      if (touch.percent < 0.8) {
        currentShow.value = "cd";
      } else {
        currentShow.value = "lyric";
      }
    }

    middleLStyle.value = {
      opacity: 1 - touch.percent
    };

    middleRStyle.value = {
      transform: `translate3d(${offsetWidth}px, 0, 0)`
    };
  }

  function onMiddleTouchEnd() {
    let offsetWidth;
    let opacity;
    if (currentShow.value === "cd") {
      currentView = "cd";
      offsetWidth = 0;
      opacity = 1;
    } else {
      currentView = "lyric";
      offsetWidth = -window.innerWidth;
      opacity = 0;
    }

    const duration = 300;
    middleLStyle.value = {
      opacity,
      transitionDuration: `${duration}ms`
    };

    middleRStyle.value = {
      transform: `translate3d(${offsetWidth}px, 0, 0)`,
      transitionDuration: `${duration}ms`
    };
  }

  return {
    currentShow,
    middleLStyle,
    middleRStyle,
    onMiddleTouchStart,
    onMiddleTouchMove,
    onMiddleTouchEnd
  };
}
