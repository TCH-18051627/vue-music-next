import { createRouter, createWebHashHistory } from "vue-router";
// ❤ 通过定义工厂函数(函数返回一个对象实例)的方式来"异步"引入组件
// 可以通过注释的方式来改变页面加载页面时加载引入的js文件名称
const Recommend = () =>
  import("@/views/recommend" /* webpackChunkName: "recommend" */);
const Singer = () => import("@/views/singer" /* webpackChunkName: "singer" */);
const Search = () => import("@/views/search" /* webpackChunkName: "search" */);
const TopList = () =>
  import("@/views/top-list" /* webpackChunkName: "topList" */);
const SingerDetail = () =>
  import("@/views/singer-detail" /* webpackChunkName: "singerDetail" */);
const Album = () => import("@/views/album" /* webpackChunkName: "album" */);
const TopDetail = () =>
  import("@/views/top-detail" /* webpackChunkName: "topDetail" */);
const UserCenter = () =>
  import("@/views/user-center" /* webpackChunkName: "userCenter" */);

const routes = [
  {
    // 根路由重定向到推荐路由
    path: "/",
    redirect: "/recommend"
  },
  {
    path: "/recommend",
    component: Recommend,
    children: [
      {
        path: ":id",
        component: Album
      }
    ]
  },
  {
    path: "/singer",
    component: Singer,
    children: [
      {
        path: ":id",
        component: SingerDetail
      }
    ]
  },
  {
    path: "/search",
    component: Search,
    children: [
      {
        path: ":id",
        component: SingerDetail
      }
    ]
  },
  {
    path: "/top-list",
    component: TopList,
    children: [
      {
        path: ":id",
        component: TopDetail
      }
    ]
  },
  {
    path: "/user",
    components: {
      user: UserCenter
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
});

export default router;

// 路由懒加载
// 当打包构建应用时，JavaScript 包会变得非常大，影响页面加载。如果我们能把不
// 同路由对应的组件分割成不同的代码块，然后当路由被访问的时候才加载对应组件，
// 这样就更加高效了。
