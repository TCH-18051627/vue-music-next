
// getters相当于computed属性
// 根据当前歌曲的索引计算当前播放的歌曲
export const currentSong = (state) => {
    // 当取不到歌曲时返回一个空对象，防止返回undefined报错
    return state.playlist[state.currentIndex] || {}
}