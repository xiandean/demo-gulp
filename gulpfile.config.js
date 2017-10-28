module.exports = {
    src: 'src',
    dest: 'dist',
    html: {
        src: 'src/*.html',
        dest: 'dist'
    },
    css: {
        src: 'src/css/**/*.css',
        dest: 'dist/css'
    },
    sass: {
        src: 'src/sass/**/*.scss',
        dest: 'dist/css'
    },
    image: {
        src: 'src/images/**/*',
        dest: 'dist/images'
    },
    js: {
        src: 'src/js/**/*.js',
        dest: 'dist/js',
        name: 'main.js' // 合并后的js的文件名  
    },
    lib: {
        src: 'src/lib/**/*',
        dest: 'dist/lib'
    },
    json: {
        src: 'src/json/**/*',
        dest: 'dist/json'
    }
};