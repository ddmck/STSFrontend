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
  gulp.src('src/scss/dev.scss')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sass())
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1'))
    .pipe(gulp.dest('./build/css'))
    .pipe(connect.reload());
});

gulp.task('prodSass', function() {
  gulp.src('src/scss/prod.scss')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sass())
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1'))
    .pipe(gulp.dest('./dist/css'))
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
    .pipe(gulp.dest('dist/js/'))
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
  gulp.src('src/index.html').pipe(gulp.dest('build/'));
  gulp.src('src/partials/*').pipe(gulp.dest('build/partials/'));
  gulp.src('src/templates/*').pipe(gulp.dest('build/templates/'));
  gulp.src('src/images/*').pipe(gulp.dest('build/images/'));
});

gulp.task('moveToDist', function(){
  gulp.src('src/partials/*').pipe(gulp.dest('dist/partials/'));
  gulp.src('src/templates/*').pipe(gulp.dest('dist/templates/'));
  gulp.src('src/images/*').pipe(gulp.dest('dist/images/'));
  gulp.src('build/js/lib.js').pipe(gulp.dest('dist/js/'));
});

gulp.task('watch', ['sass', 'scripts', 'lib', 'site', 'updateDist'], function() {
  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch('src/js/**/*.*', ['scripts']);
  gulp.watch(['src/index.html', 'src/partials/*', 'src/templates/*'], ['site']);
  gulp.watch('./stdlib.js', ['lib']);
  gulp.watch('build/css/dev.css', ['renameFile']);
  gulp.watch('*', ['updateDist']);
  gulp.watch('dist/css/prod.css', ['renameProd']);
  // gulp.watch()
});

gulp.task('renameFile', function(){
  gulp.src('./build/css/dev.css')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(rename('app.css'))
    .pipe(gulp.dest('./build/css'))
});

gulp.task('renameProd', function(){
  gulp.src('./dist/css/prod.css')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(rename('app.css'))
    .pipe(gulp.dest('./dist/css'))
});


gulp.task('connect', function() {
  connect.server({
    root: 'build',
    livereload: {
      enabled: true
    },
    port: 9999,
    middleware: function(connect, options) {
      return [
        function(req, res, next) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type,If-Modified-Since');

          // don't just call next() return it
          return next();
        }

        // add other middlewares here 
        // connect.static(require('path').resolve('.'))

      ];
    }
  });
});

gulp.task('pushToS3', function(){
  gulp.src('./dist/**')
    .pipe(s3(aws, {headers: {'Cache-Control': 'max-age=3600, no-transform, public'}}));
});

gulp.task('default', ['connect', 'watch']);

gulp.task('updateDist', ['prodScripts', 'moveToDist', 'prodSass']);

gulp.task('deploy', ['updateDist', 'pushToS3']);