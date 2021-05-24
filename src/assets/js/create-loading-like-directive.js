// 实现自定义指令 v-Comp
import { createApp } from "vue";
import { addClass, removeClass } from "@/assets/js/dom";

const relativeCls = "g-relative";

// 根据传入的组件生成对应的指令
export default function createLoadingLikeDirective(Comp) {
  return {
    mounted(el, binding) {
      // 新创建一个app实例指向Comp组件
      const app = createApp(Comp);
      // 将app动态挂载到一个新dom节点，赋值给instance，即Comp组件的实例
      const instance = app.mount(document.createElement("div"));
      // 获取组件的name
      const name = Comp.name;
      if (!el[name]) {
        el[name] = {};
      }
      // 将不同的组件赋值到对应name的el上，避免指向混淆
      el[name].instance = instance;
      const title = binding.arg;
      if (typeof title !== "undefined") {
        instance.setTitle(title);
      }

      if (binding.value) {
        append(el);
      }
    },
    updated(el, binding) {
      const title = binding.arg;
      const name = Comp.name;
      if (typeof title !== "undefined") {
        el[name].instance.setTitle(title);
      }
      if (binding.value !== binding.oldValue) {
        binding.value ? append(el) : remove(el);
      }
    }
  };
  function append(el) {
    const name = Comp.name;
    const style = getComputedStyle(el);
    // 如果该dom节点的父元素的position不为absolute,fixed,relative其中任意一个
    if (["absolute", "fixed", "relative"].indexOf(style.position) === -1) {
      addClass(el, relativeCls);
    }
    // el.instance.$el即Comp组件对应的dom对象
    el.appendChild(el[name].instance.$el);
  }

  function remove(el) {
    const name = Comp.name;
    removeClass(el, relativeCls);
    el.removeChild(el[name].instance.$el);
  }
}
