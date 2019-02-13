import jsonp from './jsonp.js'
import user from './user.js'
import { getQueryString } from '../utils/utils.js'

export default {
    async getConfig() {
        let res = await jsonp({
            url: 'http://o.gd.sina.com.cn/market/c/gd/weixinjsapi/index.php',
            data: {
                url: window.location.href.split('#')[0]
            }
        })
        console.log(res)
        wx.config({
            debug: false,
            appId: res.data.appId,
            timestamp: res.data.timestamp,
            nonceStr: res.data.nonceStr,
            signature: res.data.signature,
            jsApiList: [
                'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ'
            ]
        })

        return new Promise((resolve, reject) => {
            wx.ready(() => {
                resolve()
            })
        })
    },

    setShare({ title, desc, link, imgUrl, callback } = {}) {
        const config = {
            title: title,
            link: link || location.href,
            desc: desc,
            imgUrl: imgUrl,
            success(res) {
                if (callback) {
                    callback()
                }
            },
            cancel(res) {
                console.log(res)
            }
        }
        // 分享朋友圈
        wx.onMenuShareTimeline(config)

        // 分享盆友
        wx.onMenuShareAppMessage(config)

        wx.onMenuShareQQ(config)
    },

    getOpenid() {
        let isCopy = location.href.split('#')[1] ? true : false;
        if (getQueryString('openid') && !isCopy) {
            user.openid = getQueryString('openid')
            localStorage.setItem('wx_openid_2019_common', user.openid)
            window.location.href += '#copy';
        } else if (localStorage.getItem('wx_openid_2019_common')) {
            user.openid = localStorage.getItem('wx_openid_2019_common')
        } else {
            if (getQueryString('oid')) {
                window.location.href = 'http://interface.gd.sina.com.cn/gdif/gdwx/wxcode?oid=' + getQueryString('oid')
            } else {
                window.location.href = 'http://interface.gd.sina.com.cn/gdif/gdwx/wxcode'
            }
        }
        return Promise.resolve(user.openid)
    },

    async getUserInfo(uid = user.openid) {
        let openid = uid;
        if (!openid) {
            openid = await this.getOpenid()
        }
        let res = await jsonp({
            url: 'http://interface.gd.sina.com.cn/gdif/gdwx/c_member/',
            data: {
                openid
            }
        })
        if (res.error === 0) {
            user.name = res.data.nickname
            user.avatar = res.data.headimgurl
        }
        return user
    }
}