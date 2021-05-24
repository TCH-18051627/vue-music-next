// 处理异步，改变数据状态还是通过commit方式调用mutations
import { PLAY_MODE } from '@/assets/js/constant'
import { shuffle } from '@/assets/js/util'


// 点击选择播放歌曲，发生状态改变
// 第一个参数context = {commit, state}
// 第二个参数payload为需要传递的数据，此处包括{list, index}

// 顺序播放
export function selectPlay({ commit, state }, { list, index }) {
    commit('setPlayMode', PLAY_MODE.sequence)
    commit('setSequenceList', list)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
    commit('setPlaylist', list)
    commit('setCurrentIndex', index)
}

// 随机播放
export function randomPlay({ commit }, list) {
    commit('setPlayMode', PLAY_MODE.random)
    commit('setSequenceList', list)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
    commit('setPlaylist', shuffle(list))
    commit('setCurrentIndex', 0)
}

export function changeMode({ commit, state, getters }, mode) {
    // 先缓存一下当前播放的歌曲id
    const currentId = getters.currentSong.id
    // 若mode变更为随机模式，则重新打乱实际播放列表
    if (mode === PLAY_MODE.random) {
        commit('setPlaylist', shuffle(state.sequenceList))
    } else {
        commit('setPlaylist', state.sequenceList)
    }
    // 通过findIndex()根据id找到缓存的歌曲的索引
    const index = state.playlist.findIndex((song) => {
        return song.id === currentId
    })

    // 重新设置一下之前缓存的索引，防止切换random模式时切歌
    commit('setCurrentIndex', index)
    commit('setPlayMode', mode)
}

export function removeSong({ commit, state }, song) {
    // playlist列表中删除歌曲
    // 因为只能通过mutation来操作vuex中的state状态，因此先slice复制一份
    const sequenceList = state.sequenceList.slice()
    const playlist = state.playlist.slice()

    const sequenceIndex = findIndex(sequenceList, song)
    const playIndex = findIndex(playlist, song)
    if (sequenceIndex < 0 || playIndex < 0) {
        return
    }

    sequenceList.splice(sequenceIndex, 1)
    playlist.splice(playIndex, 1)

    let currentIndex = state.currentIndex
    if (playIndex < currentIndex || currentIndex === playlist.length) {
        // 如果删除的歌在当前播放歌曲的前面或者currentIndex是最后一首歌且要删除这首歌时
        // 则要让当前歌曲索引前移一个单位
        currentIndex--
    }

    commit('setSequenceList', sequenceList)
    commit('setPlaylist', playlist)
    commit('setCurrentIndex', currentIndex)
    if (playlist.length === 0) {
        // 歌曲清空时就不播放了
        commit('setPlayingState', false)
    }
}

export function clearSongList({ commit, state }) {
    // 清空播放歌曲列表，index归零，同时播放状态设置为false
    // ❤ 讲道理currentIndex为0，playlist为空，currentSong为空对象了歌曲应该不在播放了才对
    // 然而因为此时audio的src还保留着之前的url未清空，因此需要手动设置playing为false
    commit('setSequenceList', [])
    commit('setPlaylist', [])
    commit('setCurrentIndex', 0)
    commit('setPlayingState', false)
}

export function addSong({ commit, state }, song) {
    const playlist = state.playlist.slice()
    const sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex

    const playIndex = findIndex(playlist, song)
    const sequenceIndex = findIndex(sequenceList, song)

    if (playIndex > -1) {
        currentIndex = playIndex
    } else {
        playlist.push(song)
        currentIndex = playlist.length - 1
    }

    if (sequenceIndex === -1) {
        sequenceList.push(song)
    }

    commit('setSequenceList', sequenceList)
    commit('setPlaylist', playlist)
    commit('setCurrentIndex', currentIndex)
    commit('setFullScreen', true)
    commit('setPlayingState', true)
}

function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}