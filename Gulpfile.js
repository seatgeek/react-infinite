var gulp = require('gulp'),
  given = require('gulp-if'),
  jsx = require('gulp-react'),
  reactify = require('reactify'),
  buffer = require('vinyl-buffer'),
  minifyjs = require('gulp-uglify'),
  browserify = require('browserify'),
  sourcemaps = require('gulp-sourcemaps'),
  sourcestream = require('vinyl-source-stream');

var args = require('yargs').alias('P', 'production')
               .alias('D', 'development')
               .alias('E', 'example').argv,
  production = args.production,
  development = args.development,
  example = args.example;

gulp.task('build', function() {
  browserify({
        entries: './src/react-infinite.jsx',
        standalone: 'Infinite'
      })
      .transform(reactify, {
        es6: true
      })
     .exclude('react')
     .bundle()
     .pipe(sourcestream('react-infinite.' + (production ? 'min.' : '') + 'js'))
     .pipe(buffer())
     .pipe(given(development, sourcemaps.init()))
     .pipe(given(production, minifyjs()))
     .pipe(given(development, sourcemaps.write('.')))
     .pipe(gulp.dest('dist'));

  if (example) {
    gulp.src('./examples/index.jsx')
      .pipe(jsx())
      .pipe(gulp.dest('examples'));
  }
});

gulp.task('default', ['build']);
