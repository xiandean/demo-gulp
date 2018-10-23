import { getRandomInt } from './utils/utils.js';
// import projectApi from './api/project.js';

export default {

    // 中奖结果
    result: 1,

    // 转盘停止角度集合
    stopData: {
        none: [{
            min: 40,
            max: 90
        }, {
            min: 160,
            max: 210
        }, {
            min: 280,
            max: 330
        }],
        first: [{
            min: 0,
            max: 30
        }, {
            min: 100,
            max: 150
        }, {
            min: 220,
            max: 270
        }, {
            min: 340,
            max: 360
        }]
    },

    locked: false,

    curRotate: 0,

    // 开始抽奖
    async play () {
        if (this.locked) {
            return;
        }
        this.locked = true;

        // 服务器读取中奖结果
        this.result = await this.getResult();

    	let stopData = this.stopData.none;
        if (this.result === 1) {
            stopData = this.stopData.first;
        }
        let area = stopData[getRandomInt(0, stopData.length - 1)];

        let rotate = getRandomInt(area.min, area.max);
        rotate += getRandomInt(4, 8) * 360;
        rotate = rotate - this.curRotate % 360;
        let duration = parseInt(rotate / 450 * 10) / 10;

        this.curRotate += rotate;
        this.$rotate.css({
            '-webkit-transform': `rotate(${this.curRotate}deg)`,
            '-webkit-transition': `-webkit-transform ${duration}s cubic-bezier(0.25,0.1,0.25,1) 0s`
        });
    },

    // 服务器读取中奖结果
    async getResult () {
        return this.result;
        // try {
        //     return await projectApi.getAward();
        // } catch (err) {
        //     console.log(err);
        //     return 0;
        // }
    },

    // 中奖结果处理逻辑
    handleResult (result) {
    	if (result === 0) {
    		$('.award-result-none').addClass('active').siblings().removeClass('active');
    	} else if (result === 1) {
    		$('.award-result-win').addClass('active').siblings().removeClass('active');
    	}

    	$('.pop-award-result').addClass('active');

        setTimeout(() => {
            this.reset();
        }, 500)
    },

    // 获取全部人中奖列表
    async getWinnerList () {
        let selector = '.award-winner-list';
        let $list = $(selector);
    	let data = await projectApi.getWinnerList();
		if(!data || !data.length) {
            $list.hide();
            return;
        }else {
        	$list.show();
        }
        let html = '';
        for(let i = 0; i < data.length; i++) {
            html += `<div class="swiper-slide">恭喜<span>${data[i].nickname}</span>抽中定制礼盒</div>`;
        }
        $list.find(".swiper-wrapper").html(html);
        let mySwiper = new Swiper (`${selector} > .swiper-container`, {
            direction: 'vertical',
            loop: true,
            autoplay : 2000
        });
    },

    // 提交中奖信息
    async submit () {
        let name = $('input[name="name"]').val();
        let mobile = $('input[name="mobile"]').val();
        let address = $('input[name="address"]').val();
        if (!name) {
            alert("请填写你的姓名");
            return;
        }
        if (!address) {
            alert("请填写你的收货地址");
            return;
        }
        if (!mobile) {
            alert("请填写你的手机号码");
            return;
        } else if (mobile.length !== 11) {
            alert("请填写正确的手机号码");
            return;
        }

        if (this.submitting) {
            return;
        }
        this.submitting = true;
        try {
            let result = await projectApi.submit({name, mobile, address});
            this.submitting = false;
            if (result === 1) {
                alert('提交成功！');
                // $('.pop-award-result').removeClass('active');
                $('.pop-award-result').find('.p-content').addClass('out');
            } else if (result === 999) {
                alert('手机号码格式有误！');
            } else if (result === -1) {
                alert('您之前已报过名！');
            } else {
                alert('提交失败，请重新填写！');
            }
        } catch (err) {
            console.log(err);
            alert('提交失败，请重新填写！');
            this.submitting = false;
        }
    },

    // 重设转盘
    reset () {
        // this.curRotate = 0;
        // this.$rotate.css({
        //     '-webkit-transform': 'rotate(0deg)',
        //     '-webkit-transition': 'none'
        // });
        this.locked = false;
    },
    main () {

        this.$rotate = $('.award-rotate');
        this.$point = $('.award-point');
        this.$submit = $('.award-submit');
        // 转盘旋转结束后处理中奖结果
        this.$rotate.on("webkitTransitionEnd", () => {
            setTimeout(() => {
                this.handleResult(this.result);
            }, 1000);
        });

        // 点击抽奖
        this.$point.on('touchstart', () => {
            this.play();
        });

        // 中奖后点击资料提交
        this.$submit.on('touchstart', () => {
            this.submit();
        });

    }
}
