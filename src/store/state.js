// state相当于data属性
// vuex相当于内存级别的storage,页面刷新数据就会初始化为state中的数据
// 因此需要长期存储的业务数据需要使用本地local-storage
import { PLAY_MODE, SEARCH_KEY } from "@/assets/js/constant";
import { load } from "@/assets/js/array-store";

const state = {
  // 播放列表原始数据
  sequenceList: [],
  // 真正的播放列表
  playlist: [],
  // 当前播放状态：播放/不在播放
  playing: false,
  // 三种播放模式
  playMode: PLAY_MODE.sequence,
  // 当前播放歌曲的索引
  currentIndex: 0,
  // 缩放状态：全屏/缩放
  fullScreen: false,
  // 收藏列表,main.js初始化时从本地存储中读取
  favoriteList: [],
  // 历史搜索记录,从本地存储中获取
  searchHistory: load(SEARCH_KEY),
  // 播放历史记录,main.js初始化时从本地存储中读取
  playHistory: []
};

export default state;
