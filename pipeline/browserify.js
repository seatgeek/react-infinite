var watchify = require('watchify');
var browserify = require('browserify');
var babelify = require('babelify');
var reactify = require('reactify');
var moment = require('moment');
var buffer = require('vinyl-buffer');
var sourcestream = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var given = require('gulp-if');
var uglify = require('gulp-uglify');
var gulp = require('gulp');

function transformBundle(root, envObject) {
  root = root.bundle();

  if (envObject.development) {
    root.pipe(sourcestream('react-infinite.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
  }
  if (envObject.production || envObject.release) {
    root.pipe(sourcestream('react-infinite.min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
  }
  if (envObject.release) {
    root.pipe(sourcestream('react-infinite.js'))
      .pipe(buffer())
      .pipe(gulp.dest('dist'));
  }
}

module.exports = function(shouldWatch, envObject, files) {
  var watchFunction = shouldWatch ? watchify : function(x) { return x; };
  var watchArgs = shouldWatch ? watchify.args : undefined;

  return function() {
    var root = watchFunction(browserify({
      entries: files,
      standalone: 'Infinite'
    }, watchArgs))
      .transform(babelify)
      .exclude('react');

    if (shouldWatch) {
      root.on('update', function() {
        transformBundle(root, envObject);
      });

      root.on('log', function() {
        console.log('[' + moment().format() + '] Browserify bundle refreshed');
      });
    }

    transformBundle(root, envObject);
  };
};
