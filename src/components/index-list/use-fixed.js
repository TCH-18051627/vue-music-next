// 实现对应字母列表在歌手页面上方动态变化
import { ref, watch, nextTick, computed } from 'vue'

// 定义composition API的钩子函数时:
// 采用options API的组织方式, 利于可读和维护性
// 1. 先定义响应式数据ref等放在前面
// 2. 中间定义生命周期和逻辑钩子computed, watch等放在中间
// 3. 最后定义一些methods辅助方法

export default function useFixed(props) {
    // 定义ref响应式数据 

    // 每个组的标题高度值
    const TITLE_HEIGHT = 30
    const groupRef = ref(null)
    // 存储每个字母组li节点的高度值
    const listHeights = ref([])
    // 当前页面顶部所处高度值
    const scrollY = ref(0)
    // 当前渲染组的索引
    const currentIndex = ref(0)
    // 为实现顶部标题栏向上推进效果设置一个distance响应式变量
    // 表示当前组的下一个组的顶部距离容器顶部的距离
    const distance = ref(0)

    // 5. 根据索引值计算获得当前所在组的fixedTitle
    const fixedTitle = computed(() => {
        // 当滚动到最上端以上时，不显示fixedTitle
        if (scrollY.value < 0) {
            return ''
        }
        // 通过索引值将当前组赋值给currentGroup
        const currentGroup = props.data[currentIndex.value]
        return currentGroup ? currentGroup.title : ''
    })

    // 6. 根据 distance 值是否在 0~30px 之间,计算distanceVal - 30px获得transform纵坐标动态偏移量,实现标题向上偏移的效果
    const fixedStyle = computed(() => {
        const distanceVal = distance.value
        const diff = (distanceVal > 0 && distanceVal < TITLE_HEIGHT) ? distanceVal - TITLE_HEIGHT : 0
        return {
            transform: `translate3d(0, ${diff}px, 0)`
        }
    })

    // 3. 监听当props传进来时，开始计算
    watch(() => props.data, async () => {
        // 由于监测数据发生变化时，dom会延时在下一步才发生变化
        // 故此处使用nextTick()
        await nextTick()
        calculate()
    })

    // 4. watch监听滚动位置并根据滚动位置来判断当前所处哪个组区间,并赋值索引值, 同时对distance做实时更新
    watch(scrollY, (newY) => {
        const listHeightsVal = listHeights.value
        // length - 1是因为最开始加进去了一个height = 0 的高度
        for (let i = 0; i < listHeightsVal.length - 1; i++) {
            // 取当前li节点的顶部高度值
            const heightTop = listHeightsVal[i]
            // 取当前li节点的底部值,即下一个节点顶部高度值
            const heightBottom = listHeightsVal[i + 1]
            if (newY >= heightTop && newY <= heightBottom) {
                // 实时求得当前展示组的索引
                currentIndex.value = i
                distance.value = heightBottom - newY
            }
        }
    })

    // 1. 首先获取listHeightsVal: 各个区间高度
    function calculate() {
        const list = groupRef.value.children
        const listHeightsVal = listHeights.value
        let height = 0

        listHeightsVal.length = 0
        listHeightsVal.push(height)

        // 此处list是属于一个dom树的结构
        for (let i = 0; i < list.length; i++) {
            height += list[i].clientHeight
            listHeightsVal.push(height)
        }
    }

    // 2. 实时监听滚动事件, 获取实时滚动位置scrollY
    function onScroll(pos) {
        // better-scroll派发的位置值从上到下为0 -> 负值,越向下负值越大,故负号取反
        scrollY.value = -pos.y
    }

    return {
        groupRef,
        onScroll,
        fixedTitle,
        fixedStyle,
        currentIndex
    }
}