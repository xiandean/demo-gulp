export default {
    preventDefault () {
        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
        });
    },

    main () {
        this.preventDefault();
    }
}
