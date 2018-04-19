// 海报合成
export default {
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
}
