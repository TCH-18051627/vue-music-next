// 全局初始化
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 引入基于vue3的图片懒加载
import lazyPlugin from 'vue3-lazy'

// 引入全局样式，这些都是实体样式文件
import './assets/scss/index.scss'

// 全局引入自定义指令
import loadingDirective from '@/components/base/loading/directive'
import noResultDirective from '@/components/base/no-result/directive'

import { load, saveAll } from '@/assets/js/array-store'
import { FAVORITE_KEY, PLAY_KEY } from '@/assets/js/constant'
import { processSongs } from '@/service/song'

const favoriteSongs = load(FAVORITE_KEY)
const historySongs = load(PLAY_KEY)

if (favoriteSongs.length > 0) {
  // 由于歌曲的url会在一段时间后变化
  // 此时需要重新批量更新本地收藏歌曲对象中的的url
  processSongs(favoriteSongs).then((songs) => {
    // 先填充到state中
    store.commit('setFavoriteList', songs)
    // 再保存更新到storage中
    saveAll(songs, FAVORITE_KEY)
  })
}

if (historySongs.length > 0) {
  processSongs(historySongs).then((songs) => {
    // 先填充到state中
    store.commit('setPlayHistory', songs)
    // 再保存更新到storage中
    saveAll(songs, PLAY_KEY)
  })
}

createApp(App).use(store).use(router).use(lazyPlugin, {
  loading: require('@/assets/images/default.png')
}).directive('loading', loadingDirective).directive('no-result', noResultDirective).mount('#app')
