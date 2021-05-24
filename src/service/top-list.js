import { get } from "./base";

export function getTopList() {
  // 获取排行榜数据
  return get("/api/getTopList");
}

export function getTopDetail(topItem) {
  return get("/api/getTopDetail", {
    id: topItem.id,
    period: topItem.period
  });
}
