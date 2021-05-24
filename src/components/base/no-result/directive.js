// 实现自定义指令 v-loading
import NoResult from './no-result.vue'
import createLoadingLikeDirective from '@/assets/js/create-loading-like-directive'

const noResultDirective = createLoadingLikeDirective(NoResult)

export default noResultDirective