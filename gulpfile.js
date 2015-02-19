var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var autoprefixer = require('gulp-autoprefixer');
var stdlib = require('./stdlib');
var appfiles = require('./appfiles');
var prodfiles = require('./prodfiles');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var s3 = require("gulp-s3");
var fs = require('fs');
var aws = JSON.parse(fs.readFileSync('./aws.json'));
var mocha = require('gulp-mocha');
var rename = require("gulp-rename");
var gzip = require('gulp-gzip');


var onError = function (err) {
  gutil.beep();
  console.log(err);
};

gulp.task('sass', function() {
  gulp.src('src/scss/app.scss')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sass())
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1'))
    .pipe(gulp.dest('./build/css'))
    .pipe(connect.reload());
});

gulp.task('scripts', function() {
    // Single entry point to browserify
    return gulp.src(appfiles.files)
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./build/js/'))
    .pipe(connect.reload());
});

gulp.task('prodScripts', function() {
    // Single entry point to browserify
    return gulp.src(prodfiles.files)
    .pipe(concat('app.js'))
    .pipe(gulp.dest('../fmfserver/public/js/'))
    .pipe(connect.reload());
});

gulp.task('lib', function(){
  return gulp.src(stdlib.files)
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('./build/js/'))
    .pipe(connect.reload());
});

gulp.task('rev', ['sass', 'scripts'], function() {
  return gulp.src(['build/**/*.css', 'build/min/**/*.js'])
    .pipe(rev())
    .pipe(gulp.dest('dist'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist'));
});

gulp.task('site', function(){
  gulp.src('src/index.html').pipe(gulp.dest('build/public/'));
  gulp.src('src/partials/*').pipe(gulp.dest('build/public/partials/'));
  gulp.src('src/templates/*').pipe(gulp.dest('build/public/templates/'));
  gulp.src('src/images/*').pipe(gulp.dest('build/public/images/'));
});

gulp.task('moveToDist', function(){
  gulp.src('src/index.html').pipe(gulp.dest('../fmfserver/public/'));
  gulp.src('src/partials/*').pipe(gulp.dest('../fmfserver/public/partials/'));
  gulp.src('src/templates/*').pipe(gulp.dest('../fmfserver/public/templates/'));
  gulp.src('src/images/*').pipe(gulp.dest('../fmfserver/public/images/'));
  gulp.src('build/css/*').pipe(gulp.dest('../fmfserver/public/css/'));
});

gulp.task('watch', ['sass', 'scripts', 'lib', 'site'], function() {
  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch('src/js/**/*.*', ['scripts']);
  gulp.watch(['src/index.html', 'src/partials/*', 'src/templates/*'], ['site']);
  gulp.watch('./stdlib.js', ['lib']);
  // gulp.watch()
});

gulp.task('connect', function() {
  connect.server({
    root: 'build',
    livereload: {
      enabled: true,
      port: 35727
    },
    port: 9000
  });
});

gulp.task('pushToS3', function(){
  gulp.src('./dist/**')
    .pipe(s3(aws, {headers: {'Cache-Control': 'max-age=315360000, no-transform, public'}}));
});

gulp.task('default', ['connect', 'watch']);

gulp.task('updateDist', ['prodScripts', 'moveToDist']);

gulp.task('deploy', ['updateDist', 'pushToS3']);