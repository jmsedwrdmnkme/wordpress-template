// Imports

import gulp from 'gulp';

import { deleteAsync } from 'del';

import webpack from 'webpack-stream';
import uglify from 'gulp-uglify';

import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);

import imagemin, {gifsicle, mozjpeg, optipng, svgo} from 'gulp-imagemin';

import fs from 'file-system';
import path from 'path';


// Variables

const themeName = 'theme-name';
const themeDir = `dist/themes/${themeName}`;

const pluginDir = `dist/plugins`;


// Functions

const clean = () => deleteAsync('dist');

function templates() {
  return gulp.src('src/templates/*')
    .pipe(gulp.dest(themeDir));
}

function functions() {
  return gulp.src('src/functions/*')
    .pipe(gulp.dest(themeDir));
}

function fonts() {
  return gulp.src('src/assets/fonts/*')
    .pipe(gulp.dest(`${themeDir}/assets/fonts/`));
}

function img() {
  gulp.src(['src/assets/img/*', '!src/assets/img/screenshot.*'], {encoding: false})
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
    .pipe(gulp.dest(`${themeDir}/assets/img/`));
  return gulp.src('src/assets/img/screenshot.*', {encoding: false})
    .pipe(imagemin([
      optipng({optimizationLevel: 5})
    ]))
    .pipe(gulp.dest(themeDir));
}

function css() {
  return gulp.src('src/assets/css/*')
    .pipe(sass.sync({style: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest(themeDir));
}

function js() {
  return gulp.src('src/assets/js/*')
    .pipe(webpack({}))
    .pipe(uglify())
    .pipe(gulp.dest(themeDir));
}

function blocks() {
  const blocksDirs = fs.readdirSync('src/blocks/')
    .filter(function(dir) {
      return fs.statSync(path.join('src/blocks/', dir)).isDirectory();
  });

  return blocksDirs.map(function (blockDir) {
    return gulp.series(
      async function blockDirClean () {
        return deleteAsync(`${pluginDir}/${blockDir}`);
      },

      function blockDirExport () {
        return gulp.src(
          [
            `src/blocks/${blockDir}/**/*`,
            `!src/blocks/${blockDir}/src/**`,
            `!src/blocks/${blockDir}/node_modules/**`,
            `!src/blocks/${blockDir}/pnpm-*`,
            `!src/blocks/${blockDir}/package.json`
          ]
        )
          .pipe(gulp.dest(`${pluginDir}/${blockDir}`));
      },

      function blockDirDone (done) {
        done();
      }
    );
  });
}


// Watch files

function watchFiles() {
  gulp.watch('src/templates/*', templates);
  gulp.watch('src/functions/*', functions);
  gulp.watch('src/assets/fonts/*', fonts);
  gulp.watch('src/assets/img/*', img);
  gulp.watch('src/assets/css/**/*', css);
  gulp.watch('src/assets/js/**/*', js);
  gulp.watch('src/blocks/**/build/**/*', blocksBuild);
}


// Processes

const blocksBuild = gulp.parallel.apply(gulp.parallel, blocks());
export const build = gulp.series(clean, gulp.parallel(templates, functions, fonts, img, css, js, blocksBuild));
const watch = gulp.series(build, watchFiles);

export default watch;
