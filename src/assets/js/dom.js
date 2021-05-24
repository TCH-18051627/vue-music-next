// 这里包含一些基本的dom操作逻辑

export function addClass(el, className) {
    // 如果该dom节点没有包含className这个样式
    if (!el.classList.contains(className)) {
        el.classList.add(className)
    }
}

export function removeClass(el, className) {
    el.classList.remove(className)
}