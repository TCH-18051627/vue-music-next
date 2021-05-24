// 处理歌词相关逻辑
import { useStore } from "vuex";
import { computed, watch, ref } from "vue";
import { getLyric } from "@/service/song";
// 导入第三方库Lyric解析歌词数据
import Lyric from "lyric-parser";

export default function useLyric(songReady, currentTime) {
  // 定义Lyric-parser实例的对象
  const currentLyric = ref(null);
  const currentLineNum = ref(0);
  const pureMusicLyric = ref("");
  const playingLyric = ref("");
  const lyricScrollRef = ref(null);
  const lyricListRef = ref(null);

  const store = useStore();
  const currentSong = computed(() => store.getters.currentSong);

  // 监听currentSong发生变化时，调用获取歌词的服务
  watch(currentSong, async newSong => {
    if (!newSong.url || !newSong.id) {
      return;
    }

    // ❤由于currentSong切换后, currentLyirc仍然存在, 这时需要再一开始执行一次停止歌词播放操作
    // 但是由于只是停止了上一首歌的歌词播放, 而currentLyric还存在
    // 此时若下一首歌还在getLyric过程中(即还未获取到下一首歌的歌词)且此时下一首歌触发了canplay事件执行回调函数ready(), 那么仍将执行上一首歌的currentLyric
    // 而当下一首歌getLyric过程执行完之后又会执行下一首歌歌词的播放, 此时就会来回跳转了, 因此需要在停止之后将上一首歌的currentLyric和currentLineNum……等等重置, 这样上一首歌的playLyric()就不会执行了,
    stopLyric();
    currentLyric.value = null;
    currentLineNum.value = 0;
    pureMusicLyric.value = "";
    playingLyric.value = "";

    // 异步过程(1): 获取歌词
    // 异步过程(2): audio的canplay事件触发ready()回调函数
    // ❤两个异步过程有先后顺序，因此歌词的播放需要考虑两种情况
    const lyric = await getLyric(newSong);
    // 通过mutation的方式将歌词缓存入state数据中
    store.commit("addSongLyric", {
      song: newSong,
      lyric
    });

    // 由于获取歌词是异步过程,需要判断是否有后续操作来继续或终止当前请求
    // 例如从歌曲A->B过程获取歌词过程中 B->C, 那么就不需要再执行获取B歌词的过程了
    // 此时当获取lyric后,又切换了一次歌,使得currentSong发生变化,此时currentSong和newSong就不一样了,直接return终止
    if (currentSong.value.lyric !== lyric) {
      return;
    }

    // 在每次初始化lyric-parser参数实例的时候
    // 在播放歌词过程中每次歌词跳到下一行,都会执行handleLyric回调函数
    currentLyric.value = new Lyric(lyric, handleLyric);

    // Lyric获取之后发现歌曲canready事件触发ready()回调, 播放歌词
    // 如果Lyric先获取到了而ready()未回调, 则需要再ready()内部再调用playLyric

    const hasLyric = currentLyric.value.lines.length;
    if (hasLyric) {
      // 如果有歌词长度, 就正常播放歌词
      if (songReady.value) {
        playLyric();
      }
    } else {
      // 反之, 则为清音乐
      // 通过正则匹配后端返回歌词数据前面的时间戳替换为空
      playingLyric.value = pureMusicLyric.value = lyric.replace(
        /\[(\d{2}):(\d{2}):(\d{2})\]/g,
        ""
      );
    }
  });

  // 歌词切换的处理逻辑函数,接收当前歌词所在行数lineNum和该行歌词文案txt
  function handleLyric({ lineNum, txt }) {
    currentLineNum.value = lineNum;
    // 给正在播放的那行歌词赋值文案
    playingLyric.value = txt;
    // scrollComp获取scroll组件实例
    const scrollComp = lyricScrollRef.value;
    // listEl获取lyric dom对象实例
    const listEl = lyricListRef.value;

    if (!listEl) {
      // 因为该dom对象绑定了v-if="currentLyric"
      // 因此没有获取到歌词就不会渲染该dom节点, listEl为null也就不需要作处理了
      return;
    }

    if (lineNum > 5) {
      // 当歌词所在行超过5行时,开始滚动
      // 通过listEl.children获取到每一行line对应的dom实例
      // 为了让高亮的位置偏中间,获取当前所在行lineNum - 5的dom行
      const lineEl = listEl.children[lineNum - 5];
      // 调用scrollToElement方法页面顶部自动滚动到对应dom位置
      scrollComp.scroll.scrollToElement(lineEl, 1000);
    } else {
      scrollComp.scroll.scrollToElement(0, 0, 1000);
    }
  }

  // 播放歌词
  function playLyric() {
    const currentLyricVal = currentLyric.value;
    if (currentLyricVal) {
      // 根据每行歌词的时间戳来切换歌词
      currentLyricVal.seek(currentTime.value * 1000);
    }
  }

  function stopLyric() {
    const currentLyricVal = currentLyric.value;
    if (currentLyricVal) {
      // 停止歌词播放
      currentLyricVal.stop();
    }
  }

  return {
    currentLyric,
    currentLineNum,
    pureMusicLyric,
    playingLyric,
    lyricScrollRef,
    lyricListRef,
    playLyric,
    stopLyric
  };
}
