import { getRandomInt } from './utils/utils.js';
// import projectApi from './api/project.js';

export default {

    // 中奖结果
    result: 2,

    // 高亮显示类名
    active: 'active',

    // 不按顺序播放时，修复顺序队列所按的属性(如：data-index)
    fixIndex: 'data-index',

    // 转盘停止位置索引集合
    stopData: {
        none: [0, 4, 6, 8],
        first: [1, 7],
        second: [3, 5],
        third: [2],
    },

    locked: false,

    curIndex: 0,
    accelerateIndex: 0,
    stopIndex: 0,

    curTime: 0,
    initSpeed: 10, // 初始速度：单位：帧
    accelerate: 5, // 加速度：单位：帧

    render () {
		this.$items.eq(this.indexArray[this.curIndex % this.len]).addClass(this.active).siblings().removeClass(this.active);
	},
	update () {
		this.timer = window.requestAnimationFrame(() => {
			this.curTime++;
			if (this.curTime >= this.speed) {
				this.curTime = 0;
				this.curIndex++;

				if (this.curIndex >= this.accelerateIndex) {
					this.speed += this.accelerate;
				}

				this.render();

				if (this.curIndex === this.stopIndex) {
					setTimeout(() => {
						this.handleResult();
					}, 1000);
					return;
				}
			}
			this.update();
		});
	},

    // 开始抽奖
    async play () {
        if (this.locked) {
            return;
        }
        this.locked = true;

        // 服务器读取中奖结果
        this.result = await this.getResult();

    	let stopData = this.stopData.none;
        if (this.result == 1) {
            stopData = this.stopData.first;
        } else if (this.result == 2) {
			stopData = this.stopData.second;
        } else if (this.result == 3) {
			stopData = this.stopData.third;
        }
        this.stopIndex = stopData[getRandomInt(0, stopData.length - 1)] + this.curIndex - this.curIndex % this.len;

        this.accelerateIndex = getRandomInt(1, 3) * this.len + this.stopIndex;
        this.stopIndex = this.accelerateIndex + this.len;
        this.speed = this.initSpeed;

        this.render();
        this.update();
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
        // this.curIndex = 0;
        // this.render();
        this.locked = false;
    },
    main () {

        this.$items = $('.award-item');
        this.$point = $('.award-point');
        this.$submit = $('.award-submit');

        this.len = this.$items.length;

        this.indexArray = [];
       	for (let i = 0; i < this.len; i++) {
       		let index = i;
       		if (this.fixIndex) {
				index = parseInt(this.$items.eq(i).attr(this.fixIndex));
       		}
       		this.indexArray[index] = i;
       	}
       	console.log(this.indexArray);

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
