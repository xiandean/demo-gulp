import jsonp from './jsonp'
import user from './user'
import { getQueryString } from '../js/util'

export default {
    async getConfig() {
        let res = await jsonp({
            url: 'http://news.gd.sina.com.cn/market/c/gd/weixinjsapi/index.php',
            data: {
                url: window.location.href.split('#')[0]
            }
        })
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
        if (getQueryString('openid')) {
            user.openid = getQueryString('openid')
            localStorage.setItem('wx_openid', user.openid)
        } else if (localStorage.getItem('wx_openid')) {
            user.openid = localStorage.getItem('wx_openid')
        } else {
            if (getQueryString('oid')) {
                window.location.href = 'http://interface.gd.sina.com.cn/gdif/gdwx/wxcode?oid=' + getQueryString('oid')
            } else {
                window.location.href = 'http://interface.gd.sina.com.cn/gdif/gdwx/wxcode'
            }
        }
        return Promise.resolve(user.openid)
    },

    async getUserInfo(openid = user.openid) {
        if (!openid) {
            await this.getOpenid()
            return this.getUserInfo()
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