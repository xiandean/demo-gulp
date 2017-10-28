'use strict';

const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const jshint = require('gulp-jshint');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');
const del = require('del');

const config = require('./gulpfile.config.js');

gulp.task('html', function() {
	return gulp.src(config.html.src)
		.pipe(gulp.dest(config.html.dest))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('css', function() {
	return gulp.src(config.css.src)
		.pipe(sourcemaps.init())
		.pipe(autoprefixer())
		.pipe(cleanCSS())
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(config.css.dest))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('sass', function() {
	return gulp.src(config.sass.src)
		.pipe(sourcemaps.init())
		.pipe(autoprefixer())
		.pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
		.pipe(cleanCSS())
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(config.sass.dest))
		.pipe(browserSync.reload({ stream: true }));
});


gulp.task('image', function() {
	return gulp.src(config.image.src)
		.pipe(gulp.dest(config.image.dest))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('js', function() {
	return gulp.src(config.js.src)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(config.js.dest))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('lib', function() {
	return gulp.src(config.lib.src)
		.pipe(gulp.dest(config.lib.dest))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('clean', function() {
	return del([config.dest]);
});


// gulp.task('build', ['html', 'css', 'sass', 'image', 'js', 'lib']);
gulp.task('build', function(callback) {
	runSequence('clean', ['html', 'css', 'sass', 'image', 'js', 'lib'], callback);
});

gulp.task('watch', function() {
	gulp.watch(config.html.src, ['html']);
	gulp.watch(config.css.src, ['css']);
	gulp.watch(config.sass.src, ['sass']);
	gulp.watch(config.image.src, ['image']);
	gulp.watch(config.js.src, ['js']);
	gulp.watch(config.lib.src, ['lib']);
});

gulp.task('server', ['build', 'watch'], function() {
	browserSync.init({
		server: {
			baseDir: config.dest
		},
		host: 'xiandean.gd.sina.com.cn',
		browser: "chrome" 
		//browser: ["chrome", "firefox"]
	});
});

gulp.task('default', ['server']);