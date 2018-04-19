import {weixin} from './api.js';
import preload from './preload.js';
import events from './events.js';
import music from './music.js';

const app = {
    preload,
    music,
    events,
    share () {
        weixin.getConfig().then(() => {
            if (this.musics.bg) {
                document.getElementById((this.musics.bg)).play();
            }

            weixin.setShare({
              title: '分享标题', // 分享标题
              desc: '分享描述', // 分享描述
              imgUrl: 'http://n.sinaimg.cn/gd/xiaopiqi/answer/weixin_share.jpg' // 分享图标
              // callback: '', // 分享成功回调
            });
        });

        // weixin.getOpenid().then(weixin.getUserInfo).then((user) => {
        //     console.log(user);
        // }).catch((err) => {
        //     console.log(err);
        // });
    },
    // app主入口
    main () {
        // 微信分享
        this.share();

        // 图片预加载入口
        this.preload.main();

        // 音乐处理入口
        this.music.main();

        // 用户交互事件入口
        this.events.main();
    }
};

app.main();
