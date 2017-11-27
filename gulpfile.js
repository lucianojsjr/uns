const gulp = require('gulp');
const concat = require('gulp-concat');
const watch = require('gulp-watch');

let libJS = [];
let angularJS = [];
let appJS = [];

angularJS.push('node_modules/angular/angular.min.js');
angularJS.push('node_modules/@uirouter/angularjs/release/angular-ui-router.min.js');

libJS.push('node_modules/jquery/dist/jquery.slim.min.js');
libJS.push('node_modules/popper.js/dist/popper.js');
libJS.push('node_modules/bootstrap/dist/js/bootstrap.min.js');

appJS.push('assets/js/app.js');
appJS.push('assets/js/directivies/*.js');
appJS.push('assets/js/services/*.js');
appJS.push('assets/js/controllers/*.js');

gulp.task('watch', function() {
	gulp.watch(appJS, ['apps'])
});

gulp.task('angular', function() {
	return gulp.src(angularJS)
		.pipe(concat('angular.js'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('libs', function() {
	return gulp.src(libJS)
		.pipe(concat('lib.js'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('apps', function() {
	return gulp.src(appJS)
		.pipe(concat('app.js'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['angular', 'libs', 'apps', 'watch']);
gulp.task('build', ['angular', 'libs', 'apps']);