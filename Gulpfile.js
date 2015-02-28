var gulp = require('gulp'),
    given = require('gulp-if'),
    reactify = require('reactify'),
    buffer = require('vinyl-buffer'),
    minifyjs = require('gulp-uglify'),
    browserify = require('browserify'),
    sourcemaps = require('gulp-sourcemaps'),
    browserifyShim = require('browserify-shim'),
    sourcestream = require('vinyl-source-stream');

var args = require('yargs').alias('P', 'production')
                           .alias('D', 'development').argv,
    production = args.production,
    development = args.development,
    test = args.test;

gulp.task('build', function() {
  browserify('./src/react-infinite.jsx')
            .transform(reactify, {
              es6: true
            })
            .transform(browserifyShim)
            .ignore('react')
            .bundle()
            .pipe(sourcestream('react-infinite.js'))
            .pipe(buffer())
            .pipe(given(development, sourcemaps.init()))
            .pipe(given(production, minifyjs()))
            .pipe(given(development, sourcemaps.write('.')))
            .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build']);

