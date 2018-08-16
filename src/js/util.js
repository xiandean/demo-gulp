// 图片预加载
export const loadImages = ({ images = [], onProgress = function() {}, onComplete = function() {}, crossOrigin = false }) => {
    let count = 0;
    let resultArray = [];
    let resultObjects = {};
    const total = images.length;

    if (!total) {
        onProgress(100);
        onComplete(resultArray);
        return;
    }

    images.map((image) => {
        const src = image.src ? image.src : image;
        let img = new Image();

        img.onload = () => {
            count++;

            if (image.id) {
                resultObjects[image.id] = img;
            } else {
                resultArray.push(img);
            }

            let progress = Math.floor(count / total * 100);
            onProgress(progress);

            if (count === total) {
                if (resultArray.length) {
                    onComplete(resultArray);
                } else {
                    onComplete(resultObjects);
                }
            }
        }

        img.onerror = () => {
            console.log('图片加载出错：' + src);
        }

        if (crossOrigin) {
            img.crossOrigin = '*';
        }

        img.src = src;
    })
}

// 获取随机整数
export const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// 获取url中的get参数
export const getQueryString = (name) => {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    const url = window.location.search.replace(/&amp;(amp;)?/g, '&');
    const r = url.substr(1).match(reg);

    if (r !== null) {
        return unescape(r[2]);
    }

    return null;
}

// 是否在微信上打开
export const isWeixin = () => {
    const ua = navigator.userAgent.toLowerCase();

    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        return true;
    } else {
        return false;
    }
}

// jsonp封装
export const jsonp = (options = {}) => {
    let {url, data, option} = options;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            data: data,
            dataType: 'jsonp',
            success (data) {
                resolve(data);
            },
            error (err) {
                reject(err);
            }
        });
    });
}
