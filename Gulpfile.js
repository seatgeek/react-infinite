var gulp = require('gulp'),
    yargs = require('yargs'),
    given = require('gulp-if'),
    jsx = require('gulp-react'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    minifyjs = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps');

var args = require('yargs').alias('P', 'production')
                           .alias('D', 'development').argv,
    production = args.production,
    development = args.development;

gulp.task('build', function() {
  gulp.src('./src/react-infinite.jsx')
      .pipe(given(development,sourcemaps.init()))
      .pipe(jsx())
      .pipe(given(development, sourcemaps.write('.')))
      .pipe(gulp.dest('dist'));
});

gulp.task('buildp', function() {
  gulp.src("./src/react-infinite.jsx")
      .pipe(rename("react-infinite.min.jsx"))
      .pipe(jsx())
      .pipe(minifyjs())
      .pipe(gulp.dest('dist'));
});

gulp.task('example', function() {
  gulp.src(["bower_components/react/react.js", "src/react-infinite.jsx", "examples/index.jsx"])
      .pipe(jsx())
      .pipe(concat("bundle_scripts.js"))
      .pipe(gulp.dest('examples'))
});

gulp.task('default', ['build', 'buildp']);

