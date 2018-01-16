var app = (function (app) {
  app.utils = {

    // 获取url中的get参数
    getQueryString: function (name) {
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
      var url = window.location.search.replace(/&amp;(amp;)?/g, '&')
      var r = url.substr(1).match(reg)
      if (r !== null) {
        return unescape(r[2])
      }
      return null
    },

    // 取随机整数
    getRandom: function (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    },

    // 图片预加载
    loadImages: function (sources, config) {
      var loadData = {
        sources: sources,
        images: sources instanceof Array ? [] : {},
        config: config || {},
        loadedImages: 0,
        totalImages: 0,
        countTotalImages: function () {
          this.totalImages = 0
          for (var src in this.sources) {
            this.totalImages += 1
          }
          return this.totalImages
        },
        load: function (src) {
          this.images[src] = new Image()

          // 当一张图片加载完成时执行
          var _this = this
          this.images[src].onload = function () {
            _this.loadedImages += 1
            var progress = Math.floor(_this.loadedImages / _this.totalImages * 100)
            if (_this.config.onProgress) {
              _this.config.onProgress(progress)
            }
            if (_this.loadedImages >= _this.totalImages) {
              if (_this.config.onComplete) {
                _this.config.onComplete(_this.images)
              }
              if (_this.config instanceof Function) {
                _this.config(_this.images)
              }
            }
          }

          // 把sources中的图片信息导入images数组
          this.images[src].src = this.sources[src]
        }
      }

      loadData.countTotalImages()

      if (!loadData.totalImages) {
        if (loadData.config.onComplete) {
          loadData.config.onComplete(loadData.images)
        }
        if (loadData.config instanceof Function) {
          loadData.config(loadData.images)
        }
      } else {
        for (var src in loadData.sources) {
          loadData.load(src)
        }
      }
    }
  }

  app.api = {
    weixin: {
      user: {
        openid: '',
        nick: '',
        headUrl: ''
      },
      setConfig: function (callback) {
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
            })

            wx.ready(function () {
              if (callback) {
                callback()
              }
            })
          }
        })
      },
      setShare: function (options) {
        wx.onMenuShareTimeline({
          title: options.title,
          link: options.link || location.href,
          imgUrl: options.imgUrl,
          success: function (res) {
            if (options.callback) {
              options.callback()
            }
          },
          cancel: function (res) {}
        })
        wx.onMenuShareAppMessage({
          title: options.title,
          desc: options.desc,
          link: options.link || location.href,
          imgUrl: options.imgUrl,
          type: '', // 分享类型,music、video或link，不填默认为link
          dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
          success: function () {
            if (options.callback) {
              options.callback()
            }
          },
          cancel: function () {}
        })
        wx.onMenuShareQQ({
          title: options.title,
          desc: options.desc,
          link: options.link || location.href,
          imgUrl: options.imgUrl,
          success: function () {
            if (options.callback) {
              options.callback()
            }
          },
          cancel: function () {}
        })
        wx.error(function (res) {
          console.log(res)
        })
      },
      getOpenid: function (callback) {
        if (app.utils.getQueryString('openid')) {
          this.user.openid = app.utils.getQueryString('openid')
          localStorage.setItem('wx_openid', this.user.openid)
        } else if (localStorage.getItem('wx_openid') !== null) {
          this.user.openid = localStorage.getItem('wx_openid')
        } else {
          if (app.utils.getQueryString('oid')) {
            window.location.href = 'http://interface.gd.sina.com.cn/gdif/gdwx/wxcode?oid=' + app.utils.getQueryString('oid')
          } else {
            window.location.href = 'http://interface.gd.sina.com.cn/gdif/gdwx/wxcode'
          }
          return
        }
        if (callback) {
          callback()
        }
      },
      getUserInfo: function (callback) {
        var _this = this
        $.ajax({
          url: 'http://interface.gd.sina.com.cn/gdif/gdwx/c_member/',
          data: {openid: _this.user.openid},
          type: 'get',
          dataType: 'jsonp',
          jsonp: 'callback',
          success: function (data) {
            console.log(data)
            if (data.error === 0) {
              _this.user.nick = data.data.nickname
              _this.user.headUrl = data.data.headimgurl
              if (callback) {
                callback()
              }
            }
          },
          error: function (error) {
            console.log(error)
          }
        })
      }
    }
  }

  app.musics = {
    bg: 'bgMusic',
    others: [],
    handler: function () {
      var _this = this
      var bgMusic = document.getElementById(this.bg)
      var autoplay = true

      $(bgMusic).parent().on('touchstart', function () {
        autoplay = false
        var $this = $(this)
        event.stopPropagation()
        if ($this.hasClass('animating')) {
          $this.removeClass('animating')
          bgMusic.pause()
        } else {
          $this.addClass('animating')
          bgMusic.play()
        }
      })
      $(document).one('touchstart', function () {
        if (bgMusic && bgMusic.paused && autoplay) {
          bgMusic.play()
          if (bgMusic.paused) {
            $(document).one('touchend', function () {
              bgMusic.play()
            })
          }
        }
        for (var i = 0; i < _this.others.length; i++) {
          var other = document.getElementById(_this.others[i])
          other.play()
          other.pause()
        }
      })
    }
  }

  app.preload = {
    sources: [

    ],
    onProgress: function (progress) {
      console.log(progress)
    },
    onComplete: function () {
      console.log('complete')
    },
    handler: function () {
      app.utils.loadImages(this.sources, {
        onProgress: this.onProgress,
        onComplete: this.onComplete
      })
    }
  }

  return app
})(window.app || {})

// 微信分享
app.api.weixin.setConfig(function () {
  app.api.weixin.setShare({
    // callback: "", //分享成功回调
    link: '', // 分享链接
    title: '', // 分享标题
    desc: '', // 分享描述
    imgUrl: '' // 分享图标
  })
})

// 微信身份认证
// app.api.weixin.getOpenid(function () {
//   console.log(app.api.weixin.user.openid)
//   app.api.weixin.getUserInfo(function () {
//     console.log(app.api.weixin.user)
//   })
// })

// 图片预加载
// app.utils.loadImages(['images/1.png'], function () {
//   app.preload.handler()
// })
app.preload.handler()

// 音乐播放处理
// app.musics.handler()
