<template>
  <div class="search">
    <div class="search-input-wrapper">
      <search-input v-model="query"></search-input>
    </div>
    <!-- 当搜索栏为空时，显示热搜关键字栏目 -->
    <scroll class="search-content" v-show="!query" ref="scrollRef">
      <!-- scroll是作用于第一个子元素的，因此要把两个模块套在一个div中 -->
      <div>
        <div class="hot-keys">
          <h1 class="title">热门搜索</h1>
          <ul>
            <li
              class="item"
              v-for="item in hotKeys"
              :key="item.id"
              @click="addQuery(item.key)"
            >
              <span>{{ item.key }}</span>
            </li>
          </ul>
        </div>
        <!-- 搜索历史模块 -->
        <div class="search-history" v-show="searchHistory.length">
          <h1 class="title">
            <span class="text">搜索历史</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
          <confirm
            ref="confirmRef"
            text="是否删除所有历史记录"
            confirm-btn-text="清空"
            @confirm="clearSearch"
          ></confirm>
          <search-list
            :searches="searchHistory"
            @select="addQuery"
            @delete="deleteSearch"
          ></search-list>
        </div>
      </div>
    </scroll>
    <div class="search-result" v-show="query">
      <suggest
        :query="query"
        @select-song="selectSong"
        @select-singer="selectSinger"
      ></suggest>
    </div>
    <router-view v-slot="{ Component }">
      <transition appear name="slide">
        <component :is="Component" :data="SelectedSinger"></component>
      </transition>
    </router-view>
  </div>
</template>

<script>
import SearchInput from "@/components/search/search-input";
import Suggest from "@/components/search/suggest";
import Scroll from "@/components/wrap-scroll";
import Confirm from "@/components/base/confirm/confirm";
import { ref, watch, computed, nextTick } from "vue";
import { getHotKeys } from "@/service/search";
import { SINGER_KEY, SEARCH_KEY } from "@/assets/js/constant";
import storage from "good-storage";
import { useStore } from "vuex";
// Composition API中通过导入useRouter
import { useRouter } from "vue-router";
import SearchList from "@/components/search/search-list";
import useSearchHistory from "@/components/search/use-search-history";

export default {
  name: "search",
  components: {
    SearchInput,
    Suggest,
    SearchList,
    Scroll,
    Confirm,
  },
  setup() {
    const query = ref("");
    const hotKeys = ref([]);
    const SelectedSinger = ref(null);
    const scrollRef = ref(null);
    const confirmRef = ref(null);

    const searchHistory = computed(() => store.state.searchHistory);
    const { saveSearch, deleteSearch, clearSearch } = useSearchHistory();

    const store = useStore();
    const router = useRouter();

    getHotKeys().then((result) => {
      hotKeys.value = result.hotKeys;
    });

    // 监听query，若为空，则重新显示热搜和搜索历史模块，重新计算scroll
    watch(query, async (newQuery) => {
      if (!newQuery) {
        await nextTick();
        refreshScroll();
      }
    });

    function refreshScroll() {
      scrollRef.value.scroll.refresh();
    }

    function addQuery(keyword) {
      // 在子组件search-input的外部父组件中给query赋值
      // 子组件监听到query的变化(modelValue变化)改变输入框的显示数据
      query.value = keyword;
    }

    function selectSong(song) {
      saveSearch(query.value);
      store.dispatch("addSong", song);
    }

    function selectSinger(singer) {
      saveSearch(query.value);
      SelectedSinger.value = singer;
      cacheSinger(singer);
      router.push({
        path: `/search/${singer.mid}`,
      });
    }

    function cacheSinger(singer) {
      storage.session.set(SINGER_KEY, singer);
    }

    function showConfirm() {
      confirmRef.value.show();
    }

    return {
      scrollRef,
      query,
      hotKeys,
      addQuery,
      selectSong,
      selectSinger,
      SelectedSinger,
      searchHistory,
      deleteSearch,
      confirmRef,
      showConfirm,
      clearSearch,
    };
  },
};
</script>

<style lang="scss" scoped>
.search {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  display: flex;
  flex-direction: column;
  .search-input-wrapper {
    margin: 20px;
  }
  .search-content {
    flex: 1;
    overflow: hidden;
    .hot-keys {
      margin: 0 20px 20px 20px;
      .title {
        margin-bottom: 20px;
        font-size: $font-size-medium;
        color: $color-text-l;
      }
      .item {
        display: inline-block;
        padding: 5px 10px;
        margin: 0 20px 10px 0;
        border-radius: 6px;
        background: $color-highlight-background;
        font-size: $font-size-medium;
        color: $color-text-d;
      }
    }
    .search-history {
      position: relative;
      margin: 0 20px;
      .title {
        display: flex;
        align-items: center;
        height: 40px;
        font-size: $font-size-medium;
        color: $color-text-l;
        .text {
          flex: 1;
        }
        .clear {
          @include extend-click();
          .icon-clear {
            font-size: $font-size-small;
            color: $color-text-d;
          }
        }
      }
    }
  }
  .search-result {
    flex: 1;
    overflow: hidden;
  }
}
</style>
