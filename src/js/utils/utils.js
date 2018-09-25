/**
 * [图片加载]
 * @param  {[String]}  options.src         [图片地址]
 * @param  {Boolean} options.crossOrigin [是否跨域，图片合成用到]
 * @return {[promise]}
 */
export const loadImage = ({ src, crossOrigin = false }) => {
    return new Promise((resolve, reject) => {
        let img = new Image()
        img.onload = () => {
            resolve(img)
        }
        img.onerror = () => {
            reject(img.src)
        }
        if (crossOrigin) {
            img.crossOrigin = '*'
        }
        img.src = src
    })
}

/**
 * [图片预加载]
 * @param  {[Array(String | {id, src})]} )   images    [图片地址数组]
 * @param  {[Function]} onComplete  [回调]
 * @param  {[Boolean]} crossOrigin [图片是非跨域]
 * @return {[Array]}             [图片数组]
 */
export const loadImages = async({ images = [], onProgress = function() {}, onComplete = function() {}, crossOrigin = false }) => {
    let count = 0
    let resultArray = []
    let resultObjects = {}
    const total = images.length

    if (!total) {
        onProgress(100)
        return resultArray
    }

    let promiseArr = images.map(image => {
        const src = image.src ? image.src : image
        return loadImage({ src, crossOrigin }).then((img) => {
            count++
            let progress = Math.floor(count / total * 100)
            onProgress(progress)
            if (image.id) {
                resultObjects[image.id] = img
            } else {
                resultArray.push(img)
            }
        })
    })
    try {
        await Promise.all(promiseArr)
        let result = resultArray.length ? resultArray : resultObjects
        onComplete(result)
        return result
    } catch (e) {
        console.error(`onerror: ${e}`)
    }
}

// 获取随机整数
export const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// 获取url中的get参数
export const getQueryString = (name) => {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    const url = window.location.search.replace(/&amp;(amp;)?/g, '&')
    const r = url.substr(1).match(reg)

    if (r !== null) {
        return decodeURIComponent(r[2])
    }

    return null
}

// 是否在微信上打开
export const isWeixin = () => {
    const ua = navigator.userAgent.toLowerCase()

    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        return true
    } else {
        return false
    }
}
