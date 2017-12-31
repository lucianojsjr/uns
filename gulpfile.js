const gulp = require('gulp');
const concat = require('gulp-concat');
const watch = require('gulp-watch');

let libJS = [];
let appJS = [];

libJS.push('assets/libs/angular/angular.min.js');
libJS.push('assets/libs/angular-ui-router/release/angular-ui-router.min.js');
libJS.push('assets/libs/jquery/dist/jquery.min.js');
libJS.push('assets/libs/materialize/dist/js/materialize.min.js');
libJS.push('assets/libs/angular-bootstrap/ui-bootstrap-tpls.min.js');
libJS.push('assets/libs/print-js/dist/print.min.js');

appJS.push('assets/js/app.js');
appJS.push('assets/js/directives/*.js');
appJS.push('assets/js/services/*.js');
appJS.push('assets/js/controllers/*.js');

gulp.task('watch', function () {
	gulp.watch(appJS, ['apps']);
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

gulp.task('default', ['libs', 'apps', 'watch']);
gulp.task('build', ['libs', 'apps']);
