<template>
  <div
    ref="rootRef"
    class="suggest"
    v-loading:[loadingText]="loading"
    v-no-result:[noResultText]="noResult"
  >
    <ul class="suggest-list">
      <li class="suggest-item" v-if="singer" @click="selectSinger(singer)">
        <div class="icon">
          <i class="icon-mine"></i>
        </div>
        <div class="name">
          <p class="text">{{ singer.name }}</p>
        </div>
      </li>
      <li
        class="suggest-item"
        v-for="song in songs"
        :key="song.id"
        @click="selectSong(song)"
      >
        <div class="icon">
          <i class="icon-music"></i>
        </div>
        <div class="name">
          <p class="text">{{ song.singer }} - {{ song.name }}</p>
        </div>
      </li>
      <div class="suggest-item" v-loading:[loadingText]="pullUpLoading"></div>
    </ul>
  </div>
</template>

<script>
import { ref, watch, computed, nextTick } from "vue";
import { search } from "@/service/search";
import { processSongs } from "@/service/song";
import usePullUpLoad from "./use-pull-up-load";

export default {
  name: "suggest",
  props: {
    query: String,
    showSinger: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["select-song", "select-singer"],
  setup(props, { emit }) {
    const singer = ref(null);
    const songs = ref([]);
    const hasMore = ref(true);
    const page = ref(1);
    const loadingText = ref("");
    const noResultText = ref("抱歉，暂无搜索结果");
    // 设置标记锁使得页面在补满填充过程中禁止pullingUp事件触发
    const manualLoading = ref(false);

    // 计算属性有一个缓冲的特性，依赖不变化不会重新渲染
    const loading = computed(() => {
      return !singer.value && !songs.value.length;
    });

    const noResult = computed(() => {
      // 若无查询结果，返回true
      return !singer.value && !songs.value.length && !hasMore.value;
    });

    const pullUpLoading = computed(() => {
      // 若拉取事件正在执行且还有数据能够获取，返回true
      return isPullUpLoad.value && hasMore.value;
    });

    const preventPullUpLoad = computed(() => {
      // 当满足页面还在加载数据或者还在填充页面时,禁止pullingUp事件触发
      return loading.value || manualLoading.value;
    });

    const { rootRef, isPullUpLoad, scroll } = usePullUpLoad(
      searchMore,
      preventPullUpLoad
    );

    // 通过getter函数返回props.query来watch监听query的变化() => ...
    // ❤ 注意searchFirst是异步执行的，所以检测query变化并处理也要异步执行
    watch(
      () => props.query,
      async (newQuery) => {
        if (!newQuery) {
          return;
        }
        await searchFirst();
      }
    );

    async function searchFirst() {
      if (!props.query) {
        return;
      }
      // 首次搜索一个关键词时需要对query数据进行初始化
      page.value = 1;
      songs.value = [];
      singer.value = null;
      hasMore.value = true;

      const result = await search(props.query, page.value, props.showSinger);
      songs.value = await processSongs(result.songs);
      singer.value = result.singer;
      hasMore.value = result.hasMore;
      // ❤ 注意数据更改后(hasMore songs等)需要等待next-tick, dom渲染完成后scroll完成计算更新
      await nextTick();
      await makeItScroll();
    }

    async function searchMore() {
      // ❤ search请求数据是异步的，在这个过程中如果清空了query，会导致返回的songs为空，列表长度也就不会变也就会一直执行makeItScroll，从而无限执行search，因此要判断query是否为空
      if (!hasMore.value && !props.query) {
        // 如果没有数据能获取到了,直接return
        return;
      }
      page.value++;

      const result = await search(props.query, page.value, props.showSinger);
      // 将获取到的新的分页歌曲拼接到已查询到的歌曲数据后面
      songs.value = songs.value.concat(await processSongs(result.songs));
      hasMore.value = result.hasMore;
      await nextTick();
      await makeItScroll();
    }

    async function makeItScroll() {
      // 如果由于筛选付费歌曲导致加载的歌曲不足一页(scroll滚动页面未到底部)
      // 则继续执行searchMore()
      if (scroll.value.maxScrollY >= -1) {
        manualLoading.value = true;
        await searchMore();
        manualLoading.value = false;
      }
    }

    function selectSong(song) {
      emit("select-song", song);
    }

    function selectSinger(singer) {
      emit("select-singer", singer);
    }

    return {
      loadingText,
      loading,
      noResultText,
      noResult,
      singer,
      songs,
      selectSong,
      selectSinger,
      // pullUpLoad
      isPullUpLoad,
      rootRef,
      pullUpLoading,
      scroll,
    };
  },
};
</script>

<style lang="scss" scoped>
.suggest {
  height: 100%;
  overflow: hidden;
  .suggest-list {
    padding: 0 30px;
    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
      .icon {
        flex: 0 0 30px;
        width: 30px;
        [class^="icon-"] {
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }
      .name {
        flex: 1;
        font-size: $font-size-medium;
        color: $color-text-d;
        overflow: hidden;
        .text {
          @include no-wrap();
        }
      }
    }
  }
}
</style>
