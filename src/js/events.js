
export default {
    preventDefault () {
        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
        }, {
        	passive: false
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
}
