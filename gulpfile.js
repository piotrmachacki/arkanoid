var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var wait = require('gulp-wait');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('gulp-typescript');

//============================================
// BrowserSync task
//============================================
gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: 'dist'
		},
		notify: false
	});
});

//============================================
// Sass task
//============================================
gulp.task('sass', () => {
	return gulp.src('app/scss/main.scss')
		.pipe(wait(500))
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'expanded' // nested | expanded | compact | compressed
		}))
		.pipe(autoprefixer({
			browsers: ["> 1%"]
		}))
		.pipe(rename('style.css'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

//============================================
// JS task
//============================================    
gulp.task('js', function() {
	return gulp.src('app/app.ts')
		.pipe(sourcemaps.init())
		.pipe(typescript({
			noImplicitAny: true,
			outFile: 'app.js'
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.stream({
			match: '**/*.js'
		}))

});

//============================================
// Watch task
//============================================
gulp.task('watch', function() {
	gulp.watch('app/app.ts', ['js']);
	gulp.watch('app/scss/**/*.scss', ['sass']);
	gulp.watch("**/*.html").on('change', browserSync.reload);
});


//============================================
// Default task
//============================================
gulp.task('default', ['browserSync', 'sass', 'js', 'watch']);