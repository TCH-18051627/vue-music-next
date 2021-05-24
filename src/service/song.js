// 批量获取歌曲url
import { get } from "./base";

export function processSongs(songs) {
  // 有可能一首歌曲都获取不到
  if (!songs.length) {
    return Promise.resolve(songs);
  }

  return get("/api/getSongsUrl", {
    // 传入一个包含一个歌手全部歌曲mid的数组
    mid: songs.map(song => {
      return song.mid;
    })
  }).then(result => {
    // map即包含该歌手所有对应键为"mid"的歌曲播放url的{对象}
    const map = result.map;
    return songs
      .map(song => {
        song.url = map[song.mid];
        return song;
      })
      .filter(song => {
        // 能播放的url会含有vkey这样的加密策略字符串
        // 当请求传入的mid有问题时，song.url为undefine，indexOf会报错
        // 此时再作一层song.url的保护措施
        return song.url && song.url.indexOf("vkey") > -1;
      });
  });
}

// 为避免不同的歌曲对象mid相同(例如不同歌单中的同一首歌)
// 设置lyricMap, key是mid,值是lyric
const lyricMap = {};
export function getLyric(song) {
  // 当currentSong发生变化时，调用该服务
  if (song.lyric) {
    // 如果歌曲此时已有缓存，就不再向后端发送请求
    return Promise.resolve(song.lyric);
  }
  const mid = song.mid;
  const lyric = lyricMap[mid];
  if (lyric) {
    return Promise.resolve(song.lyric);
  }

  return get("/api/getLyric", {
    mid
  }).then(result => {
    // 如果歌词请求失败则显示失败提示词
    const lyric = result ? result.lyric : "[00:00:00]该歌曲暂时无法获取歌词";
    // 将歌曲缓存入lyricMap
    lyricMap[mid] = lyric;
    return lyric;
  });
}
