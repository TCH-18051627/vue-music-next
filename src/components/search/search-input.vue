<template>
  <div class="search-input">
    <i class="icon-search"></i>
    <input class="input-inner" v-model="query" :placeholder="placeholder" />
    <i v-show="query" class="icon-dismiss" @click="clear"></i>
  </div>
</template>

<script>
import { debounce } from "throttle-debounce";

export default {
  name: "search-input",
  props: {
    // vue2中是value，vue3中是modelValue
    // v-model绑定的query数据
    modelValue: String,
    placeholder: {
      type: String,
      default: "搜索歌曲、歌手",
    },
  },
  data() {
    return {
      // 由于子组件不能直接修改props传进来的值(数据的单向流动性)
      // 将v-model传来的modelValue赋值给query
      query: this.modelValue,
    };
  },
  created() {
    // 直接使用watch来监听会使得debounce内部频繁调用this
    // 因此选择在created钩子函数内调用watch
    this.$watch(
      // 监听输入框的query变化，作300ms防抖处理
      "query",
      debounce(300, (newQuery) => {
        // 将新的值通过update:modelValue事件派发给父组件
        this.$emit("update:modelValue", newQuery.trim());
      })
    );

    // 实时观测外部传来的v-model绑定query的变化
    this.$watch("modelValue", (newVal) => {
      this.query = newVal;
    });
  },
  methods: {
    clear() {
      this.query = "";
    },
  },
};
</script>

<style lang="scss" scoped>
.search-input {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: 0 6px;
  height: 32px;
  background: $color-highlight-background;
  border-radius: 10px;
  .icon-search {
    font-size: 24px;
    color: $color-text-d;
  }
  .input-inner {
    flex: 1;
    margin: 0 5px;
    line-height: 18px;
    background: $color-highlight-background;
    color: $color-text;
    font-size: $font-size-medium;
    outline: 0;
    &::placeholder {
      color: $color-text-d;
    }
  }
  .icon-dismiss {
    font-size: 16px;
    color: $color-text-d;
  }
}
</style>