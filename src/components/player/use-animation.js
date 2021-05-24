// 处理大小CD切换过渡动画效果
import { ref } from 'vue'
import animations from 'create-keyframe-animation'

export default function useAnimation() {
    const cdWrapperRef = ref(null)
    // ❤ 设置两个锁，避免enter和leave动画异步加载时死锁
    // 必须等待其中一个完成时才能执行另外一个
    let entering = false
    let leaving = false

    // 通过js去做动画，而vue不知道动画什么时候结束，所以需要传入done函数
    // done()函数执行能告知动画结束
    function enter(el, done) {
        if (leaving) {
            // 如果执行enter操作时，如果leave操作还未完成
            // 则手动执行afterLeave()
            afterLeave()
        }
        entering = true
        const { x, y, scale } = getPosAndScale()
        const animation = {
            0: {
                // 起始小CD位置
                transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
            },
            100: {
                // 最终大CD位置
                transform: 'translate3d(0, 0, 0) scale(1)'
            }
        }

        // 调用animation库注册一个name为'move'的动画实例
        animations.registerAnimation({
            name: 'move',
            animation,
            // 预设
            presets: {
                duration: 600,
                easing: 'cubic-bezier(0.45, 0, 0.55, 1)',
            }
        })
        // 执行完done()之后会自动触发after-enter事件
        animations.runAnimation(cdWrapperRef.value, 'move', done)
    }

    function afterEnter() {
        // 注销动画
        entering = false
        animations.unregisterAnimation('move')
        cdWrapperRef.value.animation = ''
    }

    // 离开效果通过原生dom用transiton实现(第二种方法)
    function leave(el, done) {
        if (entering) {
            // 如果执行leave操作时，如果enter操作还未完成
            // 则手动执行afterEnter()
            afterEnter()
        }
        leaving = true
        const { x, y, scale } = getPosAndScale()
        const cdWrapperEl = cdWrapperRef.value

        // 给目标dom绑定动画transition样式
        cdWrapperEl.style.transition = 'all 0.6s cubic-bezier(0.45, 0, 0.55, 1)'

        // 大CD位置
        cdWrapperEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`

        // 给目标dom绑定一个监听动画完成的事件，和相应的回调函数
        cdWrapperEl.addEventListener('transitionend', next)

        function next() {
            // 动画完成后清除该监听器
            cdWrapperEl.removeEventListener('transitionend', next)
            done()
        }
    }

    function afterLeave() {
        // 清除样式
        leaving = false
        const cdWrapperEl = cdWrapperRef.value
        cdWrapperEl.style.transition = ''
        cdWrapperEl.style.transform = ''
    }

    function getPosAndScale() {
        // 小圆半径
        const targetWidth = 40
        // 小圆中心的left值
        const paddingLeft = 40
        // 小圆中心的bottom值
        const paddingBottom = 30
        // 大圆边界的top值
        const paddingTop = 80
        // 大圆半径
        const width = window.innerWidth * 0.8

        // 大CD向小CD变换
        // 横坐标偏移量
        const x = -(window.innerWidth / 2 - paddingLeft)
        // 纵坐标偏移量
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom

        // 缩放值
        const scale = targetWidth / width

        return {
            x,
            y,
            scale,
        }
    }

    return {
        cdWrapperRef,
        enter,
        afterEnter,
        leave,
        afterLeave,
    }
}