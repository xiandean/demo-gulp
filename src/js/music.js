// 音乐
export default {
    // 背景音乐id (将自动播放)
    bg: 'bgMusic',

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
}
