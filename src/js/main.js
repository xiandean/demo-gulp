var app = (function (app) {
    // 工具函数
    app.utils = {
        // 获取url中的get参数
        getQueryString: function (name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            var url = window.location.search.replace(/&amp;(amp;)?/g, '&');
            var r = url.substr(1).match(reg);
            if (r !== null) {
                return unescape(r[2]);
            }
            return null;
        },

        // 是否在微信上打开
        isWeixin: function () {
            var ua = navigator.userAgent.toLowerCase();
            if (ua.match(/MicroMessenger/i) == 'micromessenger') {
                return true;
            } else {
                return false;
            }
        },

        // 取随机整数
        getRandomInt: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        },

        // 图片预加载 config: {onProgress, onComplete, crossOrigin} 或者 config: callback
        loadImages: function (sources, config) {
            var loadData = {
                sources: sources,
                images: sources instanceof Array ? [] : {},
                config: config || {},
                loadedImages: 0,
                totalImages: 0,
                countTotalImages: function () {
                    this.totalImages = 0;
                    for (var src in this.sources) {
                        this.totalImages += 1;
                    }
                    return this.totalImages;
                },
                load: function (src, crossOrigin) {
                    this.images[src] = new Image();
                    // 当一张图片加载完成时执行
                    var _this = this;
                    this.images[src].onload = function () {
                        _this.loadedImages += 1;
                        var progress = Math.floor(_this.loadedImages / _this.totalImages * 100);
                        if (_this.config.onProgress) {
                            _this.config.onProgress(progress);
                        }
                        if (_this.loadedImages >= _this.totalImages) {
                            if (_this.config.onComplete) {
                                _this.config.onComplete(_this.images);
                            }
                            if (_this.config instanceof Function) {
                                _this.config(_this.images);
                            }
                        }
                    };
                    this.images[src].onerror = function (e) {
                        console.log(e);
                    };
                    // 把sources中的图片信息导入images数组
                    if (crossOrigin) {
                        this.images[src].crossOrigin = '*';
                    }
                    this.images[src].src = this.sources[src];
                }
            };

            loadData.countTotalImages();

            if (!loadData.totalImages) {
                if (loadData.config.onComplete) {
                    loadData.config.onComplete(loadData.images);
                }
                if (loadData.config instanceof Function) {
                    loadData.config(loadData.images);
                }
            } else {
                for (var src in loadData.sources) {
                    if (loadData.config.crossOrigin) {
                        loadData.load(src, true);
                    } else {
                        loadData.load(src);
                    }
                }
            }
        }
    };

    // 海报合成
    app.posture = {
        // 用户上传的图片
        uploadedPicture: '',

        // 海报宽度
        width: window.innerWidth,

        // 海报高度
        height: window.innerHeight,

        // 海报模板数据列表
        templateList: [],

        // 设置图片上传
        setUploadPicture: function () {
            var _this = this;
            var uploadBoxConfig = {
                gestureArea: 'gestureArea', // 手势的有效区域  参数为元素id
                uploadCanvas: 'uploadCanvas', // 显示图像的画布  参数为元素id
                chooseButton: 'chooseButton', // 选择图片按钮  参数为input元素id
                uploadButton: 'uploadButton', // 最终确认并上传的按钮 (可不传)  参数为元素id
                uploadServered: false, // 是否需要上传到服务器转换成jpg格式 (可不传，不传则生成的图片格式为base64)
                // onChange: onChange, // 回调函数，选择图片变化后执行
                callback: onComplete // 回调函数，图片上传成功后执行，函数中的参数为图片的地址
            };

            var Box = new uploadBox(uploadBoxConfig);

            function onComplete (src) { // 图片上传成功后的回调函数
                // console.log(src);
                if (src) {
                    _this.uploadedPicture = src;
                } else {
                    alert('请先上传图片');
                }
            }
        },

        // 选择海报模板
        selectTemplate: function (index) {
            var templateIndex = index;
            if (templateIndex === undefined) {
                templateIndex = app.utils.getRandomInt(0, this.templateList.length - 1);
            }
            this._selectedTemplate = this.templateList[templateIndex];
            return this._selectedTemplate;
        },

        // 获取已选模板
        getSelectedTemplate: function () {
            return this._selectedTemplate;
        },

        // 设置海报信息
        setConfig: function (options) {
            if (options.templateList) {
                this.templateList = options.templateList;
            }
            if (options.width) {
                this.width = options.width;
            }
            if (options.height) {
                this.height = options.height;
            }
        },

        // 合成海报
        create: function (callback) {
            // 图片预加载
            var templateData = this._selectedTemplate || this.selectTemplate();
            var canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            var context = canvas.getContext('2d');
            var _this = this;
            app.utils.loadImages({
                
            }, {
                crossOrigin: true,
                onComplete: function (images) {
                    app.utils.loadImages({
                        main: _this.uploadedPicture
                    }, function (dataUrls) {
                        images.main = dataUrls.main;
                        var drawList = [
                            {
                                image: images.main,
                                x: 100,
                                y: canvas.height - images.main.height - 200
                            }
                        ];
                        // console.log(drawList);
                        drawList.forEach(function (obj) {
                            context.drawImage(obj.image, obj.x || 0, obj.y || 0);
                        });

                        _this._src = canvas.toDataURL('image/png', 1);

                        if (callback) {
                            callback(_this._src);
                        }
                    });
                }
            });
        },

        // 获取海报dataUrl
        getDataUrl: function () {
            return this._src;
        }
    };

    // 音乐
    app.musics = {
        bg: '', // 背景音乐id (将自动播放)
        others: [], // 其他音效ids
        main: function () { // 音效播放处理入口
            if (!this.bg && !this.others.length) {
                return;
            }
            var _this = this;
            var bgMusic = document.getElementById(this.bg);
            var autoplay = true;

            $(bgMusic).parent().on('touchstart', function () {
                autoplay = false;
                var $this = $(this);
                event.stopPropagation();
                if ($this.hasClass('animating')) {
                    $this.removeClass('animating');
                    bgMusic.pause();
                } else {
                    $this.addClass('animating');
                    bgMusic.play();
                }
            });
            $(document).one('touchstart', function () {
                if (bgMusic && bgMusic.paused && autoplay) {
                    bgMusic.play();
                    if (bgMusic.paused) {
                        $(document).one('touchend', function () {
                            bgMusic.play();
                        });
                    }
                }
                for (var i = 0; i < _this.others.length; i++) {
                    var other = document.getElementById(_this.others[i]);
                    other.play();
                    other.pause();
                }
            });
        }
    };

    // 后台接口
    app.api = {
        user: {
            openid: '', // openid
            name: '', // 昵称
            avatar: '' // 头像
        },
        weixin: {
            ready: function (callback) {
                $.ajax({
                    url: 'http://news.gd.sina.com.cn/market/c/gd/wxjsapi/index.php',
                    data: {
                        url: location.href.split('#')[0]
                    },
                    dataType: 'jsonp',
                    success: function (jsondata) {
                        wx.config({
                            debug: false,
                            appId: jsondata.data.appId,
                            timestamp: jsondata.data.timestamp,
                            nonceStr: jsondata.data.nonceStr,
                            signature: jsondata.data.signature,
                            jsApiList: [
                                'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ'
                            ]
                        });
                        wx.ready(function () {
                            if (callback) {
                                callback();
                            }
                        });
                    }
                });
            },
            setShare: function (options) {
                var config = {
                    title: options.title, // 分享标题
                    desc: options.desc, // 分享描述
                    link: options.link || location.href, // 分享链接
                    imgUrl: options.imgUrl, // 分享图标
                    success: function (res) {
                        if (options.callback) {
                            options.callback();
                        }
                    },
                    cancel: function (res) {
                        console.log(res);
                    }
                }
                wx.onMenuShareTimeline(config);
                wx.onMenuShareAppMessage(config);
                wx.onMenuShareQQ(config);
                wx.error(function (res) {
                    console.log(res);
                    // alert(JSON.stringify(res));
                });
            },
            getOpenid: function (callback) {
                if (app.utils.getQueryString('openid')) {
                    app.api.user.openid = app.utils.getQueryString('openid');
                    localStorage.setItem('wx_openid_new', app.api.user.openid);
                } else if (localStorage.getItem('wx_openid_new')) {
                    app.api.user.openid = localStorage.getItem('wx_openid_new');
                } else {
                    if (app.utils.getQueryString('oid')) {
                        window.location.href = 'http://interface.gd.sina.com.cn/gdif/gdwx/wxcode?oid=' + app.utils.getQueryString('oid');
                    } else {
                        window.location.href = 'http://interface.gd.sina.com.cn/gdif/gdwx/wxcode';
                    }
                    return;
                }
                if (callback) {
                    callback(app.api.user.openid);
                }
            },
            getUserInfo: function (callback) {
                $.ajax({
                    url: 'http://interface.gd.sina.com.cn/gdif/gdwx/c_member/',
                    data: {openid: app.api.user.openid},
                    type: 'get',
                    dataType: 'jsonp',
                    jsonp: 'callback',
                    success: function (data) {
                        console.log(data);
                        if (data.error == 0) {
                            app.api.user.name = data.data.nickname;
                            app.api.user.avatar = data.data.headimgurl;
                            if (callback) {
                                callback(app.api.user);
                            }
                        }
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            }
        },
        weibo: {
            getUserInfo: function (callback) {
                var _this = this;
                $.ajax({
                    url: 'http://interface.gd.sina.com.cn/gdif/weibo/uid.html',
                    dataType: 'jsonp',
                    success: function (res) {
                        console.log(res);
                        if (res.error === 10000) {
                            app.api.user.openid = res.data.uid
                            app.api.user.name = res.data.name
                            app.api.user.avatar = res.data.image_url

                            callback && callback(app.api.user);
                        } else {
                            window.location.href = 'https://passport.weibo.cn/signin/login?entry=mweibo&r=' + window.location.href
                        }
                    },
                    error: function (d) {
                        console.log(d);
                    }
                });
            },

            // 发微博接口,需登陆微博
            send: function (data, callback) { // data: {content: '测试', pic: 'xxx.jpg'}
                var siteId = 901;
                var appId = 196;
                var getTokenUrl = 'http://mblogv2.city.sina.com.cn/interface/tcommonv2/cookie_auth/postaction/get_token.php';
                var addmblogPostUrl = 'http://mblogv2.city.sina.com.cn/interface/tcommonv2/cookie_auth/postaction/json_add_mblog_new.php';
                var content = data.content;
                var pic = data.pic || '';
                $.ajax({ // 第一次jsonp请求获取token
                    url: getTokenUrl,
                    data: {
                        site_id: siteId,
                        app_id: appId
                    },
                    dataType: 'jsonp',
                    success: function (data) {
                        if (data && data.error == '0') {
                            $.ajax({
                                url: addmblogPostUrl,
                                data: {
                                    content: content, // 发微博的内容
                                    pic_url: pic, // 发微博的图片
                                    site_id: siteId,
                                    app_id: appId,
                                    t: 'jsonp',
                                    token: data.token, // 第一次请求获取到的token
                                    x: Math.random()
                                },
                                dataType: 'jsonp',
                                success: function (data) {
                                    // sending = false;
                                    if (data && data.error == '0') {
                                        // alert('发送微博成功！'');
                                        callback && callback();
                                    } else {
                                        alert('发送微博失败！');
                                        console.log(data);
                                        // alert(data.errmsg);
                                    }
                                },
                                error: function (data) {
                                    console.log(data);
                                }
                            });
                        }
                    },
                    error: function (data) {
                        console.log(data);
                    }
                });
            }
        },
        // 微信\微博双向绑定
        doubleBind: function (callback) {
            if (app.utils.isWeixin()) {
                var _this = this;
                this.weixin.getOpenid(function () {
                    _this.weixin.getUserInfo(callback);
                });
            } else {
                this.weibo.getUserInfo(callback);
            }
        }
    };

    // 图片预加载
    app.preload = {
        sources: [],
        onProgress: function (progress) {
            // console.log(progress);
        },
        onComplete: function () {
            $('.loading').removeClass('active');
            $('.p1').addClass('active');
        },

        // 入口
        main: function () {
            app.utils.loadImages(this.sources, {
                onProgress: this.onProgress,
                onComplete: this.onComplete
            });
        }
    };

    // 交互事件
    app.events = {
        // 阻止touchmove默认事件
        preventDefault: function () {
            document.addEventListener('touchmove', function (event) {
                event.preventDefault();
            }, { passive: false });
        },

        // 入口
        main: function () {
            this.preventDefault();
        }
    };

    // app主入口
    app.main = function () {
        // 微信分享
        app.api.weixin.ready(function () {
            if (app.musics.bg) { // 背景音乐微信自动播放
                document.getElementById(app.musics.bg).play();
            }

            app.api.weixin.setShare({
                // callback: '', // 分享成功回调
                // link: '', // 分享链接
                title: '', // 分享标题
                desc: '', // 分享描述
                imgUrl: '' // 分享图标
            });
        });

        // 微信身份认证
        // app.api.weixin.getOpenid(function (openid) {
        //     console.log(app.api.user.openid);
        //     app.api.weixin.getUserInfo(function (user) {
        //         console.log(app.api.user);
        //     });
        // });
        // 微博身份认证
        // app.api.weibo.getUserInfo(function (user) {
        //     console.log(app.api.user);
        // });
        // 微信或微博身份认证
        // app.api.doubleBind(function (user) {
        //     console.log(user);
        // });

        // 图片预加载入口
        app.preload.main();
        // app.utils.loadImages(['images/bg.jpg'], function() {
        //     app.preload.sources = [

        //     ];
        //     app.preload.main();
        // });

        // 音乐处理入口
        app.musics.main();

        // 用户交互事件入口
        app.events.main();
    }

    return app;
}(app || {}));

app.main();
