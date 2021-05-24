import { useStore } from 'vuex'
import { computed, ref, watch } from 'vue'

export default function useCd() {
    const cdRef = ref(null)
    const cdImageRef = ref(null)
    const store = useStore()
    const playing = computed(() => store.state.playing)

    const cdCls = computed(() => {
        return playing.value ? 'playing' : ''
    })

    watch(playing, (newPlaying) => {
        // 如果playing变为false
        if (!newPlaying) {
            // 同步外层dom cd和内层dom image旋转角度样式
            syncTransform(cdRef.value, cdImageRef.value)
        }
    })

    function syncTransform(wrapper, inner) {
        // 利用浏览器的getComputedStyle去获取dom元素的样式
        // ❤由于每次旋转的角度是相对于外层结构而不是相对于初始0°的
        // 此时需要再获取一次外层的已旋转角度进行叠加
        // rotate叠加可以采用concate的方式进行字符串的拼接
        const wrapperTransform = getComputedStyle(wrapper).transform
        const innerTransform = getComputedStyle(inner).transform
        wrapper.style.transform = wrapperTransform === 'none' ?
            innerTransform : innerTransform.concat(' ', wrapperTransform)
    }

    return {
        cdCls,
        cdRef,
        cdImageRef
    }
}