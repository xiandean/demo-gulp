import {loadImages} from './util.js';

export default {
    images: [],
    onProgress (progress) {
        console.log(progress);
    },
    onComplete (result) {
        $('.loading').removeClass('active');
        $('.p1').addClass('active');
    },

    main () {
        // loadImages({images: ['images/bg.jpg'], onComplete: () => {
        //     loadImages({images: this.images, onProgress: this.onProgress, onComplete: this.onComplete});
        // }});
        loadImages({images: this.images, onProgress: this.onProgress, onComplete: this.onComplete});
    }
}
