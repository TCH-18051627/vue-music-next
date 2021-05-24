// 工具函数

// Knuth shuffle随机洗牌函数
export function shuffle(source) {
    // 将原始数组备份至arr
    const arr = source.slice()
    for (let i = 0; i < arr.length; i++) {
        const j = getRandomInt(i)
        swap(arr, i , j)
    }
    return arr
}

// 格式化时间如: 04:07
export function formatTime(interval) {
    interval = Math.floor(interval)
    // padStart(2, '0') 一共两位，往前补0
    const minute = (Math.floor(interval / 60) + '').padStart(2, '0')
    const second = (interval % 60 + '').padStart(2, '0')
    return `${minute}:${second}`
}

function getRandomInt(max) {
    // 随机获取从0至max之间的数
    return Math.floor(Math.random() * (max + 1))
}

function swap(arr, i, j) {
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
}