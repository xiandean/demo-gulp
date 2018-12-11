const app = {
    // 工具函数
    utils: {
        // 获取url中的get参数
        getQueryString (name) {
            const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            const url = window.location.search.replace(/&amp;(amp;)?/g, '&');
            const r = url.substr(1).match(reg);
            if (r !== null) {
                return decodeURIComponent(r[2]);
            }
            return null;
        },

        // 是否在微信上打开
        isWeixin () {
            const ua = navigator.userAgent.toLowerCase();
            if (ua.match(/MicroMessenger/i) == 'micromessenger') {
                return true;
            } else {
                return false;
            }
        },

        // 获取随机整数
        getRandomInt (min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        },

        // 图片预加载 config: {onProgress, onComplete, crossOrigin} 或者 config: callback
        loadImages (sources, config = {}) {
            const loadData = {
                sources: sources,
                images: sources instanceof Array ? [] : {},
                config: config,
                loadedImages: 0,
                totalImages: 0,
                countTotalImages () {
                    this.totalImages = 0;
                    for (let src in this.sources) {
                        this.totalImages += 1;
                    }
                    return this.totalImages;
                },
                load (src, crossOrigin) {
                    this.images[src] = new Image();
                    this.images[src].onload = () => {
                        this.loadedImages += 1;
                        let progress = Math.floor(this.loadedImages / this.totalImages * 100);

                        if (this.config.onProgress) {
                            this.config.onProgress(progress);
                        }
                        if (this.loadedImages >= this.totalImages) {
                            if (this.config.onComplete) {
                                this.config.onComplete(this.images);
                            }
                            if (this.config instanceof Function) {
                                this.config(this.images);
                            }
                        }
                    };

                    this.images[src].onerror = (e) => {
                        console.log('图片加载出错：' + src);
                    };

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

                if(loadData.config instanceof Function) {
                    loadData.config(loadData.images);
                }
            } else {
                for (let src in loadData.sources) {
                    if (loadData.config.crossOrigin) {
                        loadData.load(src, true);
                    } else {
                        loadData.load(src);
                    }
                }
            }
        }
    },

    // 海报合成
    posture: {
        // 用户上传的图片
        uploadedPicture: '',

        // 海报宽度
        width: window.innerWidth,

        // 海报高度
        height: window.innerHeight,

        // 海报模板数据列表
        templateList: [],

        // 设置图片上传
        setUploadPicture () {
            const uploadBoxConfig = {
                // 手势的有效区域  参数为元素id
                gestureArea: 'gestureArea',

                // 显示图像的画布  参数为元素id
                uploadCanvas: 'uploadCanvas',

                // 选择图片按钮  参数为input元素id
                chooseButton: 'chooseButton',

                // 最终确认并上传的按钮 (可不传)  参数为元素id
                uploadButton: 'uploadButton',

                // 是否需要上传到服务器转换成jpg格式 (可不传，不传则生成的图片格式为base64)
                uploadServered: false,

                // 回调函数，选择图片变化后执行
                // onChange: onChange,
                
                // 回调函数，图片上传成功后执行，函数中的参数为图片的地址
                callback (src) {
                    if (src) {
                        this.uploadedPicture = src;
                    } else {
                        alert('请先上传图片！');
                    }
                }
            };

            const Box = new uploadBox(uploadBoxConfig);
        },

        // 选择海报模板
        selectTemplate (index) {
            let templateIndex = index;
            if (!templateIndex && templateIndex !== 0) {
                templateIndex = app.utils.getRandomInt(0, this.templateList.length - 1);
            }
            this._selectedTemplate = this.templateList[templateIndex];
            return this._selectedTemplate;
        },

        // 获取已选模板
        getSelectedTemplate () {
            return this._selectedTemplate;
        },

        // 设置海报信息
        setConfig ({templateList, width, height} = {}) {
            if (templateList) {
                this.templateList = templateList;
            }
            if (width) {
                this.width = width;
            }
            if (height) {
                this.height = height;
            }
        },

        // 合成海报
        create (callback) {
            const templateData = this._selectedTemplate || this.selectTemplate();
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            const context = canvas.getContext('2d');

            app.utils.loadImages({

            }, {
                crossOrigin: true,
                onComplete (images) {
                    app.utils.loadImages({
                        main: this.uploadedPicture
                    }, (dataUrls) => {
                        images.main = dataUrls.main;
                        const drawList = [
                            {
                                images: images.main,
                                x: 0,
                                y: canvas.height - images.main.height
                            }
                        ];

                        drawList.forEach((obj) => {
                            context.drawImage(obj.image, obj.x || 0, obj.y || 0);
                        });

                        this._src = canvas.toDataURL('image/png', 1);

                        if (callback) {
                            callback(this.src);
                        }
                    });
                }
            });
        },

        // 获取海报dataUrl
        getDataUrl () {
            return this._src;
        }
    },

    // 音乐
    musics: {
        // 背景音乐id (将自动播放)
        bg: '',

        // 其他音效ids
        others: [],

        // 音乐播放处理入口
        main () {
            if (!this.bg && !this.others.length) {
                return;
            }

            const bgMusic = document.getElementById(this.bg);
            let autoplay = true;

            $(bgMusic).parent().on('touchstart', function (event) {
                event.stopPropagation();
                autoplay = false;

                if ($(this).hasClass('animating')) {
                    $(this).removeClass('animating');
                    bgMusic.pause();
                } else {
                    $(this).addClass('animating');
                    bgMusic.play();
                }
            });

            $(document).one('touchstart', () => {
                if (bgMusic && bgMusic.paused && autoplay) {
                    bgMusic.play();
                    if (bgMusic.paused) {
                        $(document).one('touchend', () => {
                            bgMusic.play();
                        });
                    }
                }
                for (let i = 0; i < this.others.length; i++) {
                    let other = document.getElementById(this.others[i]);
                    other.play();
                    other.pause();
                }
            });
        }
    },

    // 后台接口
    api: {
        user: {
            openid: '',
            name: '',
            avatar: ''
        },
        weixin: {

            ready (callback) {
                $.ajax({
                    url: 'http://news.gd.sina.com.cn/market/c/gd/wxjsapi/index.php',
                    data: {
                        url: location.href.split('#')[0]
                    },
                    dataType: 'jsonp',
                    success (jsondata) {
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

            setShare ({title, desc, link, imgUrl, callback} = {}) {
                const config = {
                    title: title,
                    link: link || location.href,
                    desc: desc,
                    imgUrl: imgUrl,
                    success (res) {
                        if (callback) {
                            callback();
                        }
                    },
                    cancel (res) {
                        console.log(res);
                    }
                };
                // 分享朋友圈
                wx.onMenuShareTimeline(config);

                // 分享盆友
                wx.onMenuShareAppMessage(config);

                wx.onMenuShareQQ(config)
            },

            getOpenid (callback) {
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

            getUserInfo (callback) {
                $.ajax({
                    url: 'http://interface.gd.sina.com.cn/gdif/gdwx/c_member/',
                    data: {openid: app.api.user.openid},
                    type: 'get',
                    dataType: 'jsonp',
                    jsonp: 'callback',
                    success (data) {
                        console.log(data);
                        if (data.error == 0) {
                            app.api.user.name = data.data.nickname;
                            app.api.user.avatar = data.data.headimgurl;
                            if (callback) {
                                callback(app.api.user);
                            }
                        }
                    },
                    error (error) {
                        console.log(error);
                    }
                });
            }
        },

        weibo: {
            getUserInfo (callback) {
                $.ajax({
                    url: 'http://interface.gd.sina.com.cn/gdif/weibo/uid.html',
                    dataType: 'jsonp',
                    success (res) {
                        console.log(res);
                        if (d.error == 10000) {
                            app.api.user.openid = res.data.uid
                            app.api.user.name = res.data.name
                            app.api.user.avatar = res.data.image_url
                            callback && callback(app.api.user);
                        } else {
                            window.location.href = 'http://login.weibo.cn/login/setssocookie/?loginpage=h5&backUrl=' + location.href;
                        }
                    },
                    error (d) {
                        console.log(d);
                    }
                });
            },

            // 发微博接口,需登陆微博 data: {content: '测试', pic: 'xxx.jpg'}
            send ({content, pic = ''} = {}, callback) {
                const siteId = 901;
                const appId = 196;
                const getTokenUrl = 'http://mblogv2.city.sina.com.cn/interface/tcommonv2/cookie_auth/postaction/get_token.php';
                const addmblogPostUrl = 'http://mblogv2.city.sina.com.cn/interface/tcommonv2/cookie_auth/postaction/json_add_mblog_new.php';
                $.ajax({ // 第一次jsonp请求获取token
                    url: getTokenUrl,
                    data: {
                        site_id: siteId,
                        app_id: appId
                    },
                    dataType: 'jsonp',
                    success (data) {
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
                                success (data) {
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
                                error (data) {
                                    console.log(data);
                                }
                            });
                        }
                    },
                    error (data) {
                        console.log(data);
                    }
                });
            }
        },

        // 微信\微博双向绑定
        doubleBind (callback) {
            if (app.utils.isWeixin()) {
                this.weixin.getOpenid(() => {
                    _this.weixin.getUserInfo(callback);
                });
            } else {
                this.weibo.getUserInfo(callback);
            }
        }
    },

    // 图片预加载
    preload: {
        sources: [],
        onProgress (progress) {
            console.log(progress);
        },
        onComplete () {
            $('.loading').removeClass('active');
            $('.p1').addClass('active');
        },

        main () {
            app.utils.loadImages(this.sources, {
                onProgress: this.onProgress,
                onComplete: this.onComplete
            });
        }
    },

    // 交互事件
    events: {
        preventDefault () {
            document.addEventListener('touchmove', (event) => {
                event.preventDefault();
            });
        },

        fixedInputBug () {
            $('input, textarea, select').on('blur', () => {
                this.isFocus = false;
                setTimeout(() => {
                    if (!this.isFocus) {
                        document.body.scrollTop -= 0;
                    }
                }, 0);
            });

            $('input, textarea, select').on('focus', () => {
                this.isFocus = true;
            });
        },

        main () {
            this.preventDefault();
        }
    },

    // app主入口
    main () {
        // 微信分享
        app.api.weixin.ready(() => {
            if (app.musics.bg) {
                document.getElementById((app.musics.bg)).play();
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
        // app.api.weixin.getOpenid((openid) => {
        //     console.log(app.api.user.openid);
        //     app.api.weixin.getUserInfo((user) => {
        //         console.log(app.api.user);
        //     });
        // });
        // 微博身份认证
        // app.api.weibo.getUserInfo((user) => {
        //     console.log(app.api.user);
        // });
        // 微信或微博身份认证
        // app.api.doubleBind((user) => {
        //     console.log(user);
        // });

        // 图片预加载入口
        app.preload.main();
        // app.utils.loadImages(['images/bg.jpg'], () => {
        //     app.preload.sources = [

        //     ];
        //     app.preload.main();
        // });

        // 音乐处理入口
        app.musics.main();

        // 用户交互事件入口
        app.events.main();
    }
};

app.main();
