import { createStore, createLogger } from 'vuex'
import state from './state'
import mutations from './mutations'
// 不是exports default 故使用*
import * as getters from './getters'
import * as actions from './actions'

// 开发环境下定义dubug环境使用vuex提供的createlogger插件来查看状态改变情况
const debug = process.env.NODE_ENV !== 'production'

export default createStore({
  // state: {
  //   state
  // },
  // 名字相同时可以直接使用
  state,
  getters,
  mutations,
  actions,

  // 开启严格模式，深度watch检测state状态修改时是否是在提交mutations
  strict: debug,
  plugins: debug ? [createLogger()] : []
  // 项目不够大，不需要拆分modules
  // modules: {
  // }
})
