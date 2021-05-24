<template>
  <div class="tab">
    <!-- router-link自动编译为a标签 :to编译为href -->
    <router-link
      class="tab-item"
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
    >
      <span class="tab-link">
        {{ tab.name }}
      </span>
    </router-link>
  </div>
</template>

<script>
export default {
  name: "tab",
  data() {
    return {
      tabs: [
        {
          name: "推荐",
          path: "/recommend"
        },
        {
          name: "歌手",
          path: "/singer"
        },
        {
          name: "排行",
          path: "/top-list"
        },
        {
          name: "搜索",
          path: "search"
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.tab {
  display: flex;
  height: 44px;
  line-height: 44px;
  font-size: $font-size-medium;

  .tab-item {
    flex: 1;
    text-align: center;
    // 当该路由被激活的时候，自动添加router-link-active这样一个class, 去改变当前按钮的颜色,即实现高亮的效果
    // &表示该处选择器的上层选择器,在此处即指.tab-item
    &.router-link-active {
      .tab-link {
        color: $color-theme;
        border-bottom: 2px solid $color-theme;
      }
    }
  }
}
</style>
