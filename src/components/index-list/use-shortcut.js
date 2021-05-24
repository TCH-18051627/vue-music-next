import {ref, computed} from 'vue'

export default function useShortcut(props, groupRef) {
    // shorcutList中每个字母的高度18px
    const ANCHOR_HEIGHT = 18
    const scrollRef = ref(null)

    const shortcutList = computed(() => {
        return props.data.map((group) => {
            return group.title
        })
    })

    // 保留touch开始y1、结束y2
    const touch = {}
    // 每个触摸事件e包含三个触摸列表
    // 1）touches：当前位于屏幕上的所有手指(Touch)的列表。
    // 2）targetTouches：位于当前DOM元素上手指的列表。
    // 3）changedTouches：涉及当前事件手指的列表。

    // 每个Touch对象包含的属性:
    // clientX：触摸目标在视口中的x坐标。
    // clientY：触摸目标在视口中的y坐标。
    // identifier：标识触摸的唯一ID。
    // pageX：触摸目标在页面中的x坐标。
    // pageY：触摸目标在页面中的y坐标。
    // screenX：触摸目标在屏幕中的x坐标。
    // screenY：触摸目标在屏幕中的y坐标。
    // target：触摸的DOM节点目标。

    function onShortcutTouchStart(e) {
        // 通过dom的dataset API获取index
        const anchorIndex = parseInt(e.target.dataset.index)
        touch.y1 = e.touches[0].pageY
        // 将anchorIndex保留到外部touch对象从而传入其他函数中(闭包应用)
        touch.anchorIndex = anchorIndex

        scrollTo(anchorIndex)
    }

    function onShortcutTouchMove(e) {
        touch.y2 = e.touches[0].pageY
        const delta = Math.floor((touch.y2 - touch.y1) / ANCHOR_HEIGHT)
        const anchorIndex = touch.anchorIndex + delta

        scrollTo(anchorIndex)
    }

    function scrollTo(index) {
        // 当touch到上下方的黑边，由于此时e.target是div父dom节点，而不是li子节点故无index值，返回NaN
        // console.log(index)
        // 如果传过来的index是NaN,则直接return无视
        if (isNaN(index)) {
            return
        }
        // 限制index在[0, shortcutList长度]之间
        index = Math.max(0, Math.min(shortcutList.value.length - 1, index))
        // 根据父dom节点下对应目标index的li(group)节点获取目标dom节点
        const targetEL = groupRef.value.children[index]
        // scrollRef.value对应scroll组件的实例
        const scroll = scrollRef.value.scroll
        // scrollToElement(el, time, offsetX, offsetY, easing)
        // el即滚动到的目标dom元素节点, 0为距离偏差值
        scroll.scrollToElement(targetEL, 0)
    }

    return {
        shortcutList,
        scrollRef,
        onShortcutTouchStart,
        onShortcutTouchMove,
    }
}