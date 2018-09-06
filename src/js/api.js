import {getQueryString, isWeixin, jsonp} from './util.js';

export const user = {
    openid: '',
    name: '',
    avatar: ''
}

export const weixin = {
    getConfig() {
        return jsonp({
            url: 'http://news.gd.sina.com.cn/market/c/gd/wxjsapi/index.php',
            data: {
                url: window.location.href.split('#')[0]
            }
        }).then((res) => {
            wx.config({
                debug: false,
                appId: res.data.appId,
                timestamp: res.data.timestamp,
                nonceStr: res.data.nonceStr,
                signature: res.data.signature,
                jsApiList: [
                    'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ'
                ]
            });

            return new Promise((resolve, reject) => {
                wx.ready(() => {
                    resolve();
                });
            });
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
                    callback();
                }
            },
            cancel(res) {
                console.log(res);
            }
        };
        // 分享朋友圈
        wx.onMenuShareTimeline(config);

        // 分享盆友
        wx.onMenuShareAppMessage(config);

        wx.onMenuShareQQ(config);
    },

    getOpenid() {
        if (getQueryString('openid')) {
            user.openid = getQueryString('openid');
            localStorage.setItem('wx_openid_new', user.openid);
        } else if (localStorage.getItem('wx_openid_new')) {
            user.openid = localStorage.getItem('wx_openid_new');
        } else {
            if (getQueryString('oid')) {
                window.location.href = 'http://interface.gd.sina.com.cn/gdif/gdwx/wxcode?oid=' + getQueryString('oid');
            } else {
                window.location.href = 'http://interface.gd.sina.com.cn/gdif/gdwx/wxcode';
            }
        }
        return Promise.resolve(user.openid);
    },

    getUserInfo(openid = user.openid) {
        return jsonp({
            url: 'http://interface.gd.sina.com.cn/gdif/gdwx/c_member/',
            data: {
                openid
            }
        }).then((res) => {
            if (res.error === 0) {
                user.name = res.data.nickname;
                user.avatar = res.data.headimgurl;

                return Promise.resolve(user);
            } else {
                return Promise.reject(res);
            }
        });
    }
}

export const weibo = {
    getUserInfo() {
        return jsonp({
            url: 'http://interface.gd.sina.com.cn/gdif/weibo/uid.html'
        }).then((res) => {
            if (res.error === 10000) {
                user.openid = res.data.uid
                user.name = res.data.name
                user.avatar = res.data.image_url

                return Promise.resolve(user);
            } else {
                window.location.href = 'https://passport.weibo.cn/signin/login?entry=mweibo&r=' + window.location.href
            }
        });
    }
}

export const doubleBind = () => {
    if (isWeixin()) {
        return weixin.getOpenid().then(weixin.getUserInfo);
    } else {
        return weibo.getUserInfo();
    }
}
