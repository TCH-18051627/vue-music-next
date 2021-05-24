import { get } from "./base";

export function getHotKeys() {
  // 获取热门搜索数据
  return get("/api/getHotKeys");
}

export function search(query, page, showSinger) {
  return get("/api/search", {
    query,
    page,
    showSinger
  });
}
