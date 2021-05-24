<template>
  <div class="recommend" v-loading="loading">
    <scroll class="recommend-content">
      <!-- 由于scroll组件是对其第一个子dom节点生效，故再用一个div包裹所有子组件 -->
      <div>
        <div class="slider-wrapper">
          <div class="slider-content">
            <!-- 由于数据传入是异步的，在初始化的时候要求至少有一条以上的数据 -->
            <!-- 此处使用v-if控制slider是否渲染 -->
            <slider v-if="sliders.length" :sliders="sliders"></slider>
          </div>
        </div>
        <div class="recommend-list">
          <h1 class="list-title" v-show="!loading">热门歌单推荐</h1>
          <ul>
            <!-- 给歌单列表每一项绑定click事件 -->
            <li
              v-for="item in albums"
              class="item"
              :key="item.id"
              @click="selectItem(item)"
            >
              <div class="icon">
                <!-- v-lazy实现图片懒加载 -->
                <img v-lazy="item.pic" width="60" height="60" />
              </div>
              <div class="text">
                <h2 class="name">
                  {{ item.username }}
                </h2>
                <p class="title">
                  {{ item.title }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </scroll>
    <router-view v-slot="{ Component }">
      <transition appear name="slide">
        <component :is="Component" :data="selectedItem" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import { getRecommend } from "@/service/recommend";
import Slider from "@/components/base/slider/slider";
import Scroll from "@/components/wrap-scroll";
import storage from "good-storage";
import { ALBUM_KEY } from "@/assets/js/constant";

export default {
  name: "recommend",
  components: {
    Slider,
    Scroll,
  },
  data() {
    return {
      // 先定义空的sliders数组
      sliders: [],
      albums: [],
      selectedItem: null,
    };
  },
  computed: {
    loading() {
      return !this.sliders.length && !this.albums.length;
    },
  },
  async created() {
    // 在推荐页面的创建生命周期中,发送请求
    // 发送请求到拿到结果的过程是异步的,此处使用async,await处理
    const result = await getRecommend();
    // console.log(result);
    // 将后端返回的result中的sliders赋值给sliders数组
    this.sliders = result.sliders;
    // 将后端返回的result中的albums赋值给albums数组
    this.albums = result.albums;
  },
  methods: {
    selectItem(album) {
      this.selectedItem = album;
      this.cacheAlbum(album);
      this.$router.push({
        path: `/recommend/${album.id}`,
      });
    },
    cacheAlbum(album) {
      storage.session.set(ALBUM_KEY, album);
    },
  },
};
</script>

<style lang="scss" scoped>
.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  overflow: scroll;

  .recommend-content {
    height: 100%;
    overflow: hidden;

    .slider-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 40%;
      overflow: hidden;
      .slider-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
      }
    }
    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-theme;
      }
      .item {
        display: flex;
        box-sizing: flex;
        align-items: center;
        padding: 0 20px 20px 20px;

        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;
        }
        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;
        }
        .name {
          margin-bottom: 10px;
          color: $color-text;
        }
        .title {
          color: $color-text-d;
        }
      }
    }
  }
}
</style>
