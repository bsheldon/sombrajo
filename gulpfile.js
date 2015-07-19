'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jasmineBrowser = require('gulp-jasmine-browser');
var watch = require('gulp-watch');

var paths = {
  lint: ['./gulpfile.js', './sombrajo.js'],
  watch: ['./gulpfile.js', './sombrajo.js', './test/*.js', '!test/{temp,temp/**}'],
  tests: ['./test/*.js', '!test/{temp,temp/**}'],
  source: ['./sombrajo.js']
};

var plumberConf = {};

if (process.env.CI) {
  plumberConf.errorHandler = function(err) {
    throw err;
  };
}

gulp.task('minify', function () {
  gulp.src('sombrajo.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./'));
});

gulp.task('lint', function () {
  return gulp.src(paths.lint)
    .pipe(plugins.jshint('.jshintrc'))
    .pipe(plugins.plumber(plumberConf))
    .pipe(plugins.jscs())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('bump', ['test'], function () {
  var bumpType = plugins.util.env.type || 'patch'; // major.minor.patch

  return gulp.src(['./package.json'])
    .pipe(plugins.bump({ type: bumpType }))
    .pipe(gulp.dest('./'));
});

gulp.task('test', ['lint'], function () {
  return gulp.src(['lib/d3.min.js', 'sombrajo.js', './test/*.spec.js'])
    .pipe(watch(paths.watch))
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({port: 8888}));
});

gulp.task('release', ['bump']);

gulp.task('default', ['test']);
