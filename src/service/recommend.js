import { get } from "./base";

// 对外暴露一个getRecommend函数
export function getRecommend() {
  // return获取轮播图与推荐歌单的数据
  // 此处URL与router.js中代理的后端接口是一致的
  // 此处前端通过get向该路由发送请求,再由后端路由router.js向对应的第三方服务器发送请求
  return get("/api/getRecommend");
}

export function getAlbum(album) {
  // return获取推荐歌单歌曲列表的数据
  return get("/api/getAlbum", {
    id: album.id
  });
}
