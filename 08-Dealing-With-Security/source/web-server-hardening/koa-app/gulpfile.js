var gulp = require('gulp')
var nodemon = require('gulp-nodemon')
var sourcemaps = require('gulp-sourcemaps')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var cssmin = require('gulp-cssmin')
var del = require('del')
var path = require('path')

var client = {
  js: {
    src: 'client/js',
    dest: 'public/js'
  },
  css: {
    src: 'client/css',
    dest: 'public/css'
  }
}

gulp.task('default', ['jsmin', 'cssmin', 'start'])

gulp.task('start', function () {
  nodemon({
    script: 'bin/www',
    ext: 'js css ejs',
    ignore: ['public', 'logs'],
    tasks: function (files) {
      var tasks = []
      files.forEach(function (file) {
        if (path.relative(client.js.src, file).substr(0, 2) !== '..'
          && !~tasks.indexOf('jsmin')) {
          tasks.push('jsmin')
        }
        if (path.relative(client.css.src, file).substr(0, 2) !== '..'
          && !~tasks.indexOf('cssmin')) {
          tasks.push('cssmin')
        }
      })
      return tasks
    }
  })
})

gulp.task('cleanjs', function () {
  return del([client.js.dest])
})

gulp.task('cleancss', function () {
  return del([client.css.dest])
})

gulp.task('jsmin', ['cleanjs'], function () {
  return gulp.src(client.js.src + '/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('graph.js'))
    .pipe(uglify())
    .pipe(gulp.dest(client.js.dest))
})

gulp.task('cssmin', ['cleancss'], function () {
  return gulp.src(client.css.src + '/**/*.css')
    .pipe(concat('style.css'))
    .pipe(cssmin())
    .pipe(gulp.dest(client.css.dest))
})
