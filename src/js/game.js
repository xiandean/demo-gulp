import Scroll from './plugin/scroll.js'
import Game from './plugin/game.js'

let config = {
    canvas: 'game',
    scrolling: false,
    manifest: [
        {
            id: 'demo',
            src: 'http://n.sinaimg.cn/gd/20190201/grcbank/spring/demo_v1.jpg',
        }, {
            id: 'person01_01',
            src: 'http://n.sinaimg.cn/gd/20190201/grcbank/spring/person_01_01.png',
        }, {
            id: 'person01_02',
            src: 'http://n.sinaimg.cn/gd/20190201/grcbank/spring/person_01_02.png',
        }
    ],
    model: [
        {
            id: 'demo',
            children: [
                {
                    id: 'bg',
                    image: 'demo'
                }, {
                    id: 'person',
                    children: [
                        {
                            id: 'person01',
                            spriteData: {
                                images: ['person01_01', 'person01_02'],
                                frames: {
                                    width: 271,
                                    height: 298
                                },
                                animations: {
                                    run: [0, 1, 'run', 0.05]
                                }
                            },
                            data: {
                                x: 0,
                                y: 1300,
                            }
                        }
                    ]
                }
            ]
        },
    ],
    controller() {
        this.setEvents();
    },

    setEvents() {

        this.person = this.getObject('person');
        for (let i = 0; i < this.person.children.length; i++) {
            let person = this.person.children[i];
            person.startAnimation = function () {
                if (!this.isAnimating) {
                    this.isAnimating = true;
                    this.gotoAndPlay('run');
                }
            };
            person.stopAnimation = function() {
                if (this.isAnimating) {
                    this.isAnimating = false;
                    this.gotoAndStop('run');
                }
            };
        }

        this.demo = this.getObject('demo');
        let bounds = this.demo.getBounds();

        this.demo.x = -bounds.width / 2 + this.width / 2;
        this.demo.y = this.height - bounds.height;
        let limit = {
            minX: this.width - this.demo.getBounds().width - this.demo.x,
            minY: this.height - this.demo.getBounds().height - this.demo.y,
            maxX: 0 - this.demo.x,
            maxY: 0 - this.demo.y,
        };
        this.scroll = new Scroll({container: this.stage.canvas, limit, momentum: true, onScroll: this.onScroll.bind(this), onScrollEnd: this.onScrollEnd.bind(this)})

        // this.render();
    },


    onScroll({speedX, speedY, x, y}) {
        this.scrolling = true;
        this.demo.x += speedX;
        this.demo.y += speedY;

        // this.demo.x = x;
        // this.demo.y = y;

    },

    onScrollEnd() {
        this.scrolling = false;
    },

    onLoadComplete() {
        this.init();
        this.showFPS();
        this.run();

        this.checkAnimation();
    },
    checkAnimation() {
        let target = {
            x: -this.demo.x,
            y: -this.demo.y,
            width: this.width,
            height: this.height
        }

        for (let i = 0; i < this.person.children.length; i++) {
            let person = this.person.children[i];

            if (this.hitTest(person, target, false)) {
                person.startAnimation();
            } else {
                person.stopAnimation();
            }
        }
    },
    onTick() {
        if (this.scrolling) {
            this.checkAnimation();
        }
    },
}

let game = new Game(config);

export default game;

// game.load();
// game.run();