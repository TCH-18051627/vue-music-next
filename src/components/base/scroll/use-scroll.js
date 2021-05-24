import BScroll from '@better-scroll/core'
import ObserveDOM from '@better-scroll/observe-dom'

// 开启对 content 以及 content 子元素 DOM 改变的探测。当插件被使用后，当这些 DOM 元素发生变化时，将会触发 scroll 的 refresh 方法。 observe-dom 插件具有以下几个特性：
// 针对改变频繁的 CSS 属性，增加 debounce
// 如果改变发生在 scroll 动画过程中，则不会触发 refresh

import { onMounted, onUnmounted, onActivated, onDeactivated, ref } from 'vue'

BScroll.use(ObserveDOM)

export default function useScroll(wrapperRef, options, emit) {
    const scroll = ref(null)

    // 渲染挂载页面时(mounted时)
    onMounted(() => {
        // 初始化BScroll的时候，会立即对页面做计算，这样对页面动态滚动变化不能及时性响应，故添加observeDOM监听DOM变化
        const scrollVal = scroll.value = new BScroll(wrapperRef.value, {
            observeDOM: true,
            ...options
        })

        if (options.probeType > 0) {
            // on(type, fn, context) (事件,回调函数,函数执行上下文(this))
            // 监听scroll实例的实时滚动scroll事件
            scrollVal.on('scroll', (pos) => {
                // 只要正在滚动，就将位置信息通过自定义的'scroll'事件实时派发出去
                emit('scroll', pos)
            })
        }
    })

    onUnmounted(() => {
        scroll.value.destroy()
    })

    // ❤ 引入keep-alive组件后，页面会缓存所以只会渲染一次，因此需要每次进入页面(activate)都重新启动并执行scroll组件的刷新
    onActivated(() => {
        scroll.value.enable()
        scroll.value.refresh()
    })

    // 离开页面(deactivate)时禁用页面scroll组件
    onDeactivated(() => {
        scroll.value.disable()
    })

    return scroll
}