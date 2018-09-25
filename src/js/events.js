export default {
    preventDefault () {
        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
        }, {
        	passive: false
        });
    },

    main () {
        this.preventDefault();
    }
}
