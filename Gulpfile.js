var gulp = require('gulp');
var babel = require('gulp-babel');

var browserifyCreator = require('./pipeline/browserify');

var args = require('yargs').alias('P', 'production')
               .alias('D', 'development')
               .alias('E', 'example').argv;

var envObject = {
  production: args.production,
  development: args.development,
  release: !(args.production || args.development)
};
var INFINITE_SOURCE = './src/react-infinite.jsx';

gulp.task('build-bundle', browserifyCreator(false, envObject, INFINITE_SOURCE));
gulp.task('watch-develop-bundle', browserifyCreator(true, {development: true}, INFINITE_SOURCE));

// This task builds everything for release: the dist
// folder is populated with react-infinite.js and
// react-infinite.min.js, while the build folder is
// provided with a copy of the source transpiled to ES5.
gulp.task('release', ['build-bundle'], function() {
  // Transpile CommonJS files to ES5 with React's tools.
  gulp.src(['./src/**/*.js', './src/**/*.jsx'])
      .pipe(babel())
      .pipe(gulp.dest('build'));
});

// This task is used to build the examples. It is used
// in the development watch function as well.
gulp.task('examples', function() {
  gulp.src('./examples/*.jsx')
    .pipe(babel())
    .pipe(gulp.dest('examples'));
});

// This task is used for development. When run, it sets up
// a watch on the source files
gulp.task('develop', ['watch-develop-bundle'], function() {
  gulp.watch('Gulpfile.js', ['examples', 'build-bundle']);
  gulp.watch('./examples/*.jsx', ['examples', 'build-bundle']);
});

gulp.task('default', ['release']);
