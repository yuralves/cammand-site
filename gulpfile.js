var gulp = require('gulp');
var jshint = require('gulp-jshint');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var es = require('event-stream');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');
var cssimport = require("gulp-cssimport");

gulp.task('clean', function() {
	return gulp.src('www-dst/')
		.pipe(clean());
});

gulp.task('jshint', function() {
	return gulp.src([
			'www/js/app.js',
			'www/js/main.js',
			'www/js/controller/*.js',
			'www/js/service/*.js',
		])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('uglify', function() {
	return es.merge([
			gulp.src([
				"www/js/modernizr.js",
				"www/lib/angular/angular.js",
				"www/js/jquery-1.11.3.min.js",
				"www/js/jquery-migrate-1.2.1.min.js",
				"www/js/plugins.js",
				"www/js/main.js",
			]),
			gulp.src([
				"www/js/app.js",
				"www/js/services/Mail.js",
				"www/js/controller/homeCtrl.js",
			])
			.pipe(concat('scripts.js'))
			// .pipe(uglify())
		])
		.pipe(concat('all.min.js'))
		.pipe(gulp.dest('www-dst/js/'));
});

gulp.task('htmlmin', function() {
	return gulp.src('www/**/*.html')
		.pipe(htmlmin({
			collapseWhitespace: true,
			removeComments: true
		}))
		.pipe(gulp.dest('www-dst/'));
});

gulp.task('cssmin', function() {
	return es.merge(
			gulp.src([
				'www/css/base.css',
				'www/css/main.css',
				'www/css/vendor.css',
			])
			.pipe(concat('styles.css'))
			.pipe(cssimport())
			.pipe(cleanCSS()),
			gulp.src([
				'www/css/fonts.css',
				'www/css/ionicons/**/*.css'
			])
		)
		.pipe(concat('styles.min.css'))
		.pipe(gulp.dest('www-dst/css/'));
});


gulp.task('copy', function() {
    return gulp.src('www/index.prod.html')
        .pipe(rename('index.html'))
        
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        
        .pipe(gulp.dest('www-dst/'));
});

gulp.task('extras', function() {
    return gulp.src([
    	'www/**/*.txt',
    	'www/**/*.eot',
    	'www/**/*.svg',
    	'www/**/*.ttf',
    	'www/**/*.woff',
    	'www/**/*.jpg',
    	'www/**/*.png',
    	'www/**/*.ico',
    ])
    .pipe(gulp.dest('www-dst/'));
});

gulp.task('default', function(cb) {
	return runSequence('clean', ['jshint', 'uglify', 'htmlmin', 'cssmin', 'extras', 'copy'], cb);
});
