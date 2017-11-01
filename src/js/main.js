
var app = (function(app) {
    app.utils = {
        // 获取url中的get参数
        getQueryString: function (name) { 
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var url = window.location.search.replace(/&amp;(amp;)?/g,"&");
            var r = url.substr(1).match(reg);
            if (r != null) { 
                return unescape(r[2]); 
            }
            return null;
        },

        //取随机整数 
        getRandom: function(a,b) {
            return Math.round(Math.random()*(b-a)+a);
        }
    };
    app.api = {
        weixin: {
            user: {
                openid: "",
                nick: "",
                headUrl: ""
            },
            
            shareData: {
                link: "", //分享链接
                title: "", //分享标题
                desc: "", //分享描述
                imgUrl: "" //分享图标
            },
            setSDK: function(callback) {
                $.ajax({
                    url:"http://news.gd.sina.com.cn/market/c/gd/wxjsapi/index.php",
                    data: {
                        url: location.href.split('#')[0]
                    },
                    dataType:"jsonp",
                    success:function(jsondata){
                        wx.config({
                            debug: false,
                            appId: jsondata.data.appId,
                            timestamp: jsondata.data.timestamp,
                            nonceStr: jsondata.data.nonceStr,
                            signature: jsondata.data.signature,
                            jsApiList: [
                                'onMenuShareTimeline', 'onMenuShareAppMessage','onMenuShareQQ'
                            ]
                        });
                        wx.ready(function () {
                            if(callback) {
                                callback();
                            }
                        });
                    }
                });
            },
            setShare: function(options) {
                wx.onMenuShareTimeline({
                    title: options.title, // 分享标题
                    link: options.link||location.href, // 分享链接
                    imgUrl: options.imgUrl, // 分享图标
                    success: function (res) {
                        if(options.callback) {
                            options.callback();
                        }
                    },
                    cancel: function (res) {

                    }
                });
                wx.onMenuShareAppMessage({
                    title: options.title, // 分享标题
                    desc: options.desc, // 分享描述
                    link: options.link||location.href, // 分享链接
                    imgUrl: options.imgUrl, // 分享图标
                    type: '', // 分享类型,music、video或link，不填默认为link
                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                    success: function () {
                        if(options.callback) {
                            options.callback();
                        }
                    },
                    cancel: function () {

                    }
                });
                wx.onMenuShareQQ({
                    title: options.title, // 分享标题
                    desc: options.desc, // 分享描述
                    link: options.link||location.href, // 分享链接
                    imgUrl: options.imgUrl, // 分享图标
                    success: function () { 
                        if(options.callback) {
                            options.callback();
                        }
                    },
                    cancel: function () { 
                       // 用户取消分享后执行的回调函数
                    }
                });
                wx.error(function(res){
                    //alert(JSON.stringify(res));
                });
            },
            getOpenid: function(callback) {
                if(app.utils.getQueryString("openid")){
                    this.user.openid = app.utils.getQueryString("openid");
                    localStorage.setItem("wx_openid", this.user.openid);
                } else if (localStorage.getItem("wx_openid") != null) {
                    this.user.openid = localStorage.getItem("wx_openid");
                } else {
                    if(app.utils.getQueryString("oid")){
                        window.location.href='http://interface.gd.sina.com.cn/gdif/gdwx/wxcode?oid='+app.utils.getQueryString("oid");
                    }else {
                        window.location.href='http://interface.gd.sina.com.cn/gdif/gdwx/wxcode';
                    }
                    return;
                }
                if(callback) {
                    callback();
                }
            },
            getUserInfo: function(callback){ //callback(data)
                var _this = this;
                $.ajax({
                    url:'http://interface.gd.sina.com.cn/gdif/gdwx/c_member/',
                    data : { openid : _this.user.openid},
                    type : 'get',
                    dataType : 'jsonp',
                    jsonp:'callback',
                    success: function(data) {
                        console.log(data);
                        if(data.error == 0) {
                            _this.user.nick = data.data.nickname;
                            _this.user.headUrl = data.data.headimgurl;
                            if(callback) {
                                callback();
                            }
                        }
                    },
                    error: function(error) {
                        console.log(error);
                    }
                });
            },
        }
    };
    app.musics = {
        bg: bgMusic,
        others: [], //[bgMusic, ...]
        handler: function() {
            var _this = this;
            var autoplay = true;
            // 控制音乐播放与暂停
            $(this.bg).parent.on('touchstart', function() {
                autoplay = false;
                var $this = $(this);
                event.stopPropagation();
                if ($this.hasClass("animating")) {
                    $this.removeClass("animating");
                    _this.bg.pause();
                } else {
                    $this.addClass("animating");
                    _this.bg.play();
                }
            });
            $(document).one("touchstart", function() {
                if (_this.bg.paused && autoplay) {
                    _this.bg.play();
                }
                for(var i = 0; i < _this.others.length; i++) {
                    _this.others[i].play();
                    _this.others[i].pause();
                }
            });
        }
    }
    return app;
}(app || {}));

app.musics.handler();