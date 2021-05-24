import { h, mergeProps, withCtx, renderSlot, ref, computed, watch, nextTick } from 'vue'
import Scroll from '@/components/base/scroll/scroll'
import { useStore } from 'vuex'

// 模板形式：
// <scroll
//        ref="scrollRef"
//        v-bind="$props"
//        @scroll="$emit('scroll', $event)"
//    >
//        <slot></slot>
// </scroll>


// render()函数实现：
export default {
    name: 'wrap-scroll',
    props: Scroll.props,
    emits: Scroll.emits,
    // vue3里的ctx意指上下文，可以理解为this
    // h可以理解为vue2中的createElement()，createComponent()函数，是一个渲染函数
    render(ctx) {
        return h(Scroll, mergeProps({
            ref: 'scrollRef'
        }, ctx.$props, {
            onScroll: (e) => {
                // e <-> $event 派发一个scroll事件
                ctx.$emit('scroll', e)
            }
        }), {
            // 插槽部分
            // withCtx保证上下文ctx正确
            default: withCtx(() => {
                // renderSlot渲染slot
                return [renderSlot(ctx.$slots, 'default')]
            })
        })
    },
    setup() {
        const scrollRef = ref(null)
        const scroll = computed(() => {
            return scrollRef.value.scroll
        })

        const store = useStore()
        const playlist = computed(() => store.state.playlist)
        
        // 注意playlist变化到dom渲染完成相隔nextTick
        // scroll实例的refresh方法要基于dom页面，故先等待nextTick
        watch(playlist, async (newPlaylist) => {
            await nextTick()
            scroll.value.refresh()
        })


        return {
            scrollRef,
            scroll

            // scroll: scrollRef.value.scroll  这样写不对
            // 因为在执行setup()的时候(beforecreated, created)
            // scroll实例还未渲染，但是当它以计算属性computed的方式return出去时，当要访问到scroll时，组件实例已经渲染，也就能正确获取到组件实例
        }
    }
}