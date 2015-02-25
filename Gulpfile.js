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
    development = args.development;

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
            .pipe(gulp.dest('dist'))
});











// var gulp = require('gulp'),
//     yargs = require('yargs'),
//     given = require('gulp-if'),
//     jsx = require('gulp-react'),
//     rename = require('gulp-rename'),
//     concat = require('gulp-concat'),
//     minifyjs = require('gulp-uglify'),
//     sourcemaps = require('gulp-sourcemaps');



// gulp.task('build', function() {
//   gulp.src('./src/react-infinite.jsx')
//       .pipe(given(development,sourcemaps.init()))
//       .pipe(jsx({
//         harmony: true,
//         stripTypes: true
//       }))
//       .pipe(given(development, sourcemaps.write('.')))
//       .pipe(gulp.dest('dist'));
// });

// gulp.task('buildp', function() {
//   gulp.src("./src/react-infinite.jsx")
//       .pipe(rename("react-infinite.min.jsx"))
//       .pipe(jsx({
//         harmony: true,
//         stripTypes: true
//       }))
//       .pipe(minifyjs())
//       .pipe(gulp.dest('dist'));
// });

// gulp.task('example', function() {
//   gulp.src(["bower_components/react/react.js", "src/react-infinite.jsx", "examples/index.jsx"])
//       .pipe(jsx())
//       .pipe(concat("bundle_scripts.js"))
//       .pipe(gulp.dest('examples'))
// });

gulp.task('default', ['build']);

