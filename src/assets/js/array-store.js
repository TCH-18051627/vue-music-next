// 使用local-storage存储历史播放相关数据
// vuex相当于内存级别的storage,页面刷新数据就会初始化为state中的数据
// 因此需要长期存储的业务数据需要使用本地local-storage
import storage from 'good-storage'


export function save(item, key, compare, maxLen) {
    // 读出现有元素,如果没有存储过key,默认空数组[]
    const items = storage.get(key, [])
    // 将item插入items数组中
    insertArray(items, item, compare, maxLen)
    // 修改后，再存储到storage对应的key中,使得本地数据和内存中的数据保持一致
    storage.set(key, items)
    return items
}

export function remove(key, compare) {
    const items = storage.get(key, [])
    deleteFromArray(items, compare)
    storage.set(key, items)
    return items
}

export function load(key) {
    return storage.get(key, [])
}

export function clear(key) {
    storage.remove(key)
    return []
}

export function saveAll(items, key) {
    // 每次重新打开页面经过初始化后将本地存储更新
    storage.set(key, items)
}

// 插入函数
function insertArray(arr, val, compare, maxLen) {
    const index = arr.findIndex(compare)
    if (index === 0) {
        return
    }
    if (index > 0) {
        // 如果列表中已有这首歌，则先把它删掉再调到队首
        arr.splice(index, 1)
    }
    arr.unshift(val)
    if (maxLen && arr.length > maxLen) {
        arr.pop()
    }
}

// 删除函数
function deleteFromArray(arr, compare) {
    const index = arr.findIndex(compare)
    if (index > -1) {
        arr.splice(index, 1)
    }
}