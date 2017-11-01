var app = {
    //微信分享文案
    shareData: {
        link: "http://news.gd.sina.com.cn/staff/whrgdsina/interface/2017/picc/birthday_68?oid=official", //分享链接
        title: "人保叠蛋糕大作战", //分享标题
        desc: "", //分享描述
        imgUrl: "http://news.gd.sina.com.cn/staff/whrgdsina/interface/picc/birthday_68/images/wx_share.jpg" //分享图标
    },
    // 外部接口
    api: {
        openid: "", //api.openid 接口唯一码
        token: "",
        user: {
            wxnick: "",
            wx_headurl: ""
        },
        getQueryString: function(name) { // 获取url中的get参数
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var url = window.location.search.replace(/&amp;(amp;)?/g, "&");
            var r = url.substr(1).match(reg);
            if (r != null) {
                return unescape(r[2]);
            }
            return null;
        },
        // 微信分享,shareData:{link: "http://gd.sina.com.cn/m/2016/hzlh/index.html", title: "分享标题", desc: "分享描述", imgUrl: "" }
        weixinShare: function(shareData, callback) {
            $.ajax({
                url: "http://news.gd.sina.com.cn/market/c/gd/wxjsapi/index.php",
                data: {
                    url: location.href.split('#')[0]
                },
                dataType: "jsonp",
                success: function(jsondata) {
                    wx.config({
                        debug: false,
                        appId: jsondata.data.appId,
                        timestamp: jsondata.data.timestamp,
                        nonceStr: jsondata.data.nonceStr,
                        signature: jsondata.data.signature,
                        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ']
                    });
                    wx.ready(function() {
                        bgMusic.play();
                        wx.onMenuShareTimeline({
                            title: shareData.title, // 分享标题
                            link: shareData.link || location.href, // 分享链接
                            imgUrl: shareData.imgUrl, // 分享图标
                            success: function(res) {
                                callback && callback();
                            },
                            cancel: function(res) {}
                        });
                        wx.onMenuShareAppMessage({
                            title: shareData.title, // 分享标题
                            desc: shareData.desc, // 分享描述
                            link: shareData.link || location.href, // 分享链接
                            imgUrl: shareData.imgUrl, // 分享图标
                            type: '', // 分享类型,music、video或link，不填默认为link
                            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                            success: function() {
                                callback && callback();
                            },
                            cancel: function() {}
                        });
                        wx.onMenuShareQQ({
                            title: shareData.title, // 分享标题
                            desc: shareData.desc, // 分享描述
                            link: shareData.link || location.href, // 分享链接
                            imgUrl: shareData.imgUrl, // 分享图标
                            success: function() {
                                callback && callback();
                            },
                            cancel: function() {
                                // 用户取消分享后执行的回调函数
                            }
                        });
                        wx.error(function(res) {
                            //alert(JSON.stringify(res));
                        });
                    });
                }
            });
        },
        // 微信分享动态更新,shareData:{link: "xxx", title: "分享标题", desc: "分享描述", imgUrl: "http://guangdong.sinaimg.cn/2016/1022/U12799P693DT20161022231007.jpg"  }
        refleshWeixinShare: function(shareData, callback) {
            wx.onMenuShareTimeline({
                title: shareData.title, // 分享标题
                link: shareData.link || location.href, // 分享链接
                imgUrl: shareData.imgUrl, // 分享图标
                success: function(res) {
                    callback && callback();
                },
                cancel: function(res) {}
            });
            wx.onMenuShareAppMessage({
                title: shareData.title, // 分享标题
                desc: shareData.desc, // 分享描述
                link: shareData.link || location.href, // 分享链接
                imgUrl: shareData.imgUrl, // 分享图标
                type: '',
                dataUrl: '',
                success: function() {
                    callback && callback();
                },
                cancel: function() {}
            });
            wx.onMenuShareQQ({
                title: shareData.title, // 分享标题
                desc: shareData.desc, // 分享描述
                link: shareData.link || location.href, // 分享链接
                imgUrl: shareData.imgUrl, // 分享图标
                success: function() {
                    callback && callback();
                },
                cancel: function() {
                    // 用户取消分享后执行的回调函数
                }
            });
        },
        // 微信绑定,只能在微信上打开,需用到getQueryString(name); demo: weixinBind(function(){alert(openid);});
        weixinBind: function(callback) {
            if (this.getQueryString("openid")) {
                this.openid = this.getQueryString("openid");
                localStorage.setItem("wx_openid", this.openid);
                callback && callback();
            } else if (localStorage.getItem("wx_openid") != null) {
                this.openid = localStorage.getItem("wx_openid");
                callback && callback();
            } else {
                if (this.getQueryString("oid")) {
                    window.location.href = 'http://interface.gd.sina.com.cn/gdif/gdwx/wxcode?oid=' + this.getQueryString("oid");
                } else {
                    window.location.href = 'http://interface.gd.sina.com.cn/gdif/gdwx/wxcode';
                }
            }
        },
        getWeixinInfo: function(callback) { //callback(data)
            if (this.getWeixinInfoing) {
                return false;
            }
            this.getWeixinInfoing = true;
            var _this = this;
            $.ajax({
                url: 'http://interface.gd.sina.com.cn/gdif/gdwx/c_member/',
                data: {
                    openid: _this.openid
                },
                type: 'get',
                dataType: 'jsonp',
                jsonp: 'callback',
                success: function(data) {
                    console.log(data);
                    if (data.error == 0) {
                        _this.user.wxnick = data.data.nickname;
                        _this.user.wx_headurl = data.data.headimgurl;
                        callback && callback();
                    }
                    _this.getWeixinInfoing = false;
                },
                error: function(error) {
                    console.log(error);
                    _this.getWeixinInfoing = false;
                }
            });
        },
        // 抽奖
        getAward: function(callback) { //callback(data),data: {isAwarded: false/true, award: 0/1/2/3} 
            // var result = {
            //     isAwarded: false,
            //     award: 1
            // };
            // callback(result);
            // return;
            if (this.getAwarding) {
                return false;
            }
            this.getAwarding = true;
            var _this = this;
            console.log(_this.token);
            $.ajax({
                url: 'http://news.gd.sina.com.cn/staff/whrgdsina/interface/2017/picc/birthday_68/get_prize',
                type: 'post',
                data: {
                    openid: _this.openid,
                    token: _this.token
                },
                dataType: 'json',
                success: function(data) {
                    console.log(data);
                    if (data.status) {
                        if (data.prize_id) {
                            // 已存在中奖记录
                            var result = {
                                isAwarded: true,
                                award: 1,
                                data: data.data
                            }
                        } else {
                            if (data.data.prize_id) {
                                // 中奖
                                var result = {
                                    isAwarded: false,
                                    award: 1
                                }
                            } else {
                                // 不中奖
                                var result = {
                                    isAwarded: false,
                                    award: 0
                                }
                            }
                        }
                    } else {
                        var result = {
                            isAwarded: false,
                            award: 0
                        }
                    }
                    callback(result); // prize_code
                    _this.getAwarding = false;
                },
                error: function(error) {
                    console.log(error);
                    var result = {
                        isAwarded: false,
                        award: 0
                    }
                    callback(result); // prize_code
                    _this.getAwarding = false;
                }
            });
        },
        // 中奖信息入库
        submitInfo: function(infoData, callback) { //infoData : {name: "",mobile: "",address:""}
            // callback && callback();
            // return;
            var _this = this;
            if (_this.submitInfoing) {
                return false;
            }
            _this.submitInfoing = true;
            $.ajax({
                url: 'http://news.gd.sina.com.cn/staff/whrgdsina/interface/2017/picc/birthday_68/insert_user',
                type: 'post',
                data: {
                    openid: _this.openid,
                    username: infoData.username,
                    mobile: infoData.mobile
                },
                dataType: 'json',
                success: function(data) {
                    // console.log(data);
                    if (data.status) {
                        // 提交成功
                        alert('提交成功');
                        callback && callback();
                    } else {
                        // 没有中奖记录
                        alert("提交失败，没有中奖记录！");
                        callback && callback();
                    }
                    _this.submitInfoing = false;
                },
                error: function(error) {
                    console.log(error);
                    alert("提交失败，网络出现错误！");
                    callback && callback();
                    _this.submitInfoing = false;
                }
            });
        },
        getRecord: function(callback) {
            // callback && callback("{username:'xxxxxxx', mobile:'13511111111'}");
            // return;
            if (this.getRecording) {
                return false;
            }
            this.getRecording = true;
            var _this = this;
            $.ajax({
                url: 'http://news.gd.sina.com.cn/staff/whrgdsina/interface/2017/picc/birthday_68/get_prize_record',
                data: {
                    openid: _this.openid
                },
                type: 'post',
                dataType: 'json',
                success: function(data) {
                    console.log(data);
                    if (data.status) {
                        if (data.prize_id) {
                            // 已存在中奖记录
                            callback && callback(data.data);
                        } else {
                            // 不存在中奖记录
                            callback && callback("");
                        }
                    }
                    _this.getRecording = false;
                },
                error: function(error) {
                    console.log(error);
                    callback && callback("");
                    _this.getRecording = false;
                }
            });
        },
        getWinnerList: function(callback) {
            // callback && callback([]);
            // return;
            if (this.getWinnerListing) {
                return false;
            }
            this.getWinnerListing = true;
            var _this = this;
            $.ajax({
                url: 'http://news.gd.sina.com.cn/staff/whrgdsina/interface/2017/picc/birthday_68/get_winners',
                type: 'get',
                dataType: 'json',
                success: function(data) {
                    console.log(data);
                    if (data.status) {
                        callback && callback(data.data);
                    } else {
                        callback && callback([]);
                    }
                    _this.getWinnerListing = false;
                },
                error: function(error) {
                    console.log(error);
                    callback && callback([]);
                    _this.getWinnerListing = false;
                }
            });
        },
        getRandom: function(a, b) {
            return Math.floor(Math.random() * (b - a) + a);
        }
    },
    // 交互事件处理
    controller: {
        musicHandler: function() {
            var autoplay = true;
            $(document).one("touchstart", function() {
                if (bgMusic.paused && autoplay) {
                    bgMusic.play();
                }
            });
            // 控制音乐播放与暂停
            $('#audio-music').on('touchstart', function() {
                autoplay = false;
                var $this = $(this);
                event.stopPropagation();
                if ($this.hasClass("animating")) {
                    $this.removeClass("animating");
                    bgMusic.pause();
                } else {
                    $this.addClass("animating");
                    bgMusic.play();
                }
            });
        }
    }
};

// app.api.weixinBind(function() {
//     // console.log(app.api.openid);
// });
// // 微信分享
// app.api.weixinShare(app.shareData);
// // 音乐处理
// app.controller.musicHandler();