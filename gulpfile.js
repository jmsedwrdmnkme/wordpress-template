// Imports

import gulp from 'gulp';

import { deleteAsync } from 'del';

import webpack from 'webpack-stream';
import uglify from 'gulp-uglify';

import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);

import imagemin, {gifsicle, mozjpeg, optipng, svgo} from 'gulp-imagemin';


// Functions

const clean = () => deleteAsync('dist');

function templates() {
  return gulp.src('src/templates/*')
    .pipe(gulp.dest('dist/'));
}

function functions() {
  return gulp.src('src/functions/*')
    .pipe(gulp.dest('dist/'));
}

function fonts() {
  return gulp.src('src/assets/fonts/*')
    .pipe(gulp.dest('dist/assets/fonts/'));
}

function img() {
  gulp.src(['src/assets/img/*', '!src/assets/img/screenshot.jpg'])
    .pipe(imagemin([
      gifsicle({interlaced: true}),
      mozjpeg({quality: 75, progressive: true}),
      optipng({optimizationLevel: 5}),
      svgo({
        plugins: [
          {
            name: 'removeViewBox',
            active: true
          },
          {
            name: 'cleanupIDs',
            active: false
          }
        ]
      })
    ]))
    .pipe(gulp.dest('dist/assets/img/'));
  return gulp.src('src/assets/img/screenshot.jpg')
    .pipe(imagemin([
      mozjpeg({quality: 75, progressive: true}),
    ]))
    .pipe(gulp.dest('dist/'));
}

function css() {
  return gulp.src('src/assets/css/*')
    .pipe(sass.sync({style: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('dist/'));
}

function js() {
  return gulp.src('src/assets/js/*')
    .pipe(webpack({}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/'));
}


// Watch files

function watchFiles() {
  gulp.watch('src/templates/*', templates);
  gulp.watch('src/functions/*', functions);
  gulp.watch('src/assets/fonts/*', fonts);
  gulp.watch('src/assets/img/*', img);
  gulp.watch('src/assets/css/**/*', css);
  gulp.watch('src/assets/js/**/*', js);
}


// Processes

export const build = gulp.series(clean, gulp.parallel(templates, functions, fonts, img, css, js));
const watch = gulp.series(build, watchFiles);
export default watch;
