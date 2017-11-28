const gulp = require('gulp');
const concat = require('gulp-concat');
const watch = require('gulp-watch');

let libJS = [];
let appJS = [];
let appCSS = [];

libJS.push('node_modules/angular/angular.min.js');
libJS.push('node_modules/@uirouter/angularjs/release/angular-ui-router.min.js');
libJS.push('node_modules/jquery/dist/jquery.slim.min.js');
libJS.push('node_modules/bootstrap/dist/js/bootstrap.min.js');

appCSS.push('node_modules/bootstrap/dist/css/bootstrap.min.css');
appCSS.push('assets/css/theme.css');

appJS.push('assets/js/app.js');
appJS.push('assets/js/directives/*.js');
appJS.push('assets/js/services/*.js');
appJS.push('assets/js/controllers/*.js');

gulp.task('watch', function () {
	gulp.watch(appJS, ['apps']);
	gulp.watch(appCSS, ['css']);
});

gulp.task('libs', function () {
	return gulp.src(libJS)
		.pipe(concat('lib.js'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('apps', function () {
	return gulp.src(appJS)
		.pipe(concat('app.js'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('css', function () {
	return gulp.src(appCSS)
		.pipe(concat('app.css'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['libs', 'apps', 'css', 'watch']);
gulp.task('build', ['libs', 'apps', 'css']);
