// 对歌曲列表页面做一层封装(歌手歌曲页面，歌单专辑歌曲页面等)
import { processSongs } from "@/service/song";
import MusicList from "@/components/music-list/music-list";
import storage from "good-storage";

// name为欲创建的组件名称
// key为storage中对应歌手或歌单存储的key
// fetch为对前端向后端获取对应数据的函数
export default function createDetailComponent(name, key, fetch) {
  return {
    name,
    components: { MusicList },
    props: {
      // 此处props传入的data即歌手或歌单专辑数据
      data: Object
    },
    data() {
      return {
        songs: [],
        loading: true
      };
    },
    computed: {
      computedData() {
        let ret = null;
        const data = this.data;
        // debugger;
        if (data) {
          ret = data;
        } else {
          // 如果props没有传入data(在当前页面刷新时)，就从storage.session中取
          const cached = storage.session.get(key);
          // 当缓存的data.mid 或data.id (album中没有mid这一项)与当前页面的id参数相同时，就将ret赋值为缓存data
          // 且cached.id是数字类型，需要做一次字符串转化
          if (
            cached &&
            (cached.mid || cached.id + "") === this.$route.params.id
          ) {
            ret = cached;
          }
        }
        return ret;
      },
      pic() {
        const data = this.computedData;
        return data && data.pic;
      },
      title() {
        const data = this.computedData;
        // debugger;
        return data && (data.name || data.title);
      }
    },
    async created() {
      // 提前将this.computedData备份赋值，避免多次调用getter函数依赖收集
      const computedData = this.computedData;
      if (!computedData) {
        // 如果computedData不存在的话，退回到一级路由，matched[0]即匹配到的第一个路由
        const path = this.$route.matched[0].path;
        this.$router.push({
          path
        });
        return;
      }
      const result = await fetch(computedData);
      // console.log(result);
      this.songs = await processSongs(result.songs);
      this.loading = false;
      // console.log(this.songs);
    }
  };
}
