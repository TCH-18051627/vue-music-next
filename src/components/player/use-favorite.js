import { useStore } from 'vuex'
import { computed } from 'vue'
import { save, remove } from '@/assets/js/array-store'
import { FAVORITE_KEY } from '@/assets/js/constant'

export default function useFavorite() {
    const store = useStore()
    const favoriteList = computed(() => store.state.favoriteList)
    // 自定义播放记录最多100条，实际开发业务中大多由后端派发对应数据
    const maxLen = 100

    // 点击图标触发 收藏/取消收藏
    function toggleFavorite(song) {
        let list
        if (isFavorite(song)) {
            // storage -> remove 并返回处理后的数组
            list = remove(FAVORITE_KEY, compare)
        } else {
            // storage -> save 并返回处理后的数组
            list = save(song, FAVORITE_KEY, compare, maxLen)
        }

        function compare(item) {
            return item.id === song.id
        }

        store.commit('setFavoriteList', list)
    }
    
    // 根据状态返回对应样式
    function getFavoriteIcon(song) {
        return isFavorite(song) ? 'icon-favorite' : 'icon-not-favorite'
    }

    function isFavorite(song) {
        // 判断歌曲是否在收藏列表中,若是，则索引>-1,返回为true
        return favoriteList.value.findIndex((item) => {
            return item.id === song.id
        }) > -1
    }

    return {
        getFavoriteIcon,
        toggleFavorite
    }
}