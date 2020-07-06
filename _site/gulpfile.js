// var { src, dest, watch, series, parallel } = require('gulp');

const gulp = require("gulp");
const uglify = require('gulp-uglify');
// var concat = require('gulp-concat');
// const rename = require('gulp-rename');

const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');

const cp = require("child_process");
// cp.spawn = require('cross-spawn');

const browserSync = require('browser-sync').create();
var deploy      = require('gulp-gh-pages');

// var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

// File paths

const files = {
    scssPath: '_sass/**/*.scss',
    cssPath: 'assets/css/**/*.scss',
    jsPath: 'assets/js/main.js',
    imgPath: 'assets/img/**/*'
}

// Sass task: compiles the style.scss file into style.css
function scssTask(){
    return gulp
        .src(files.scssPath)
        .pipe(sourcemaps.init()) // initialize sourcemaps first
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([ autoprefixer(),cssnano() ]))
        .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
        .pipe(gulp.dest('_site/assets/css/')) // put final CSS in dist folder
        .pipe(browserSync.reload({stream:true}))
}

// JS task: concatenates and uglifies JS files to script.js
function jsTask(){
    return gulp
        .src([
        files.jsPath
        //,'!' + 'includes/js/jquery.min.js', // to exclude any specific files
    ])
        .pipe(uglify())
        .pipe(gulp.dest('_site/assets/js/'))
        .pipe(browserSync.reload({stream:true}))
}

//img task
function imgTask() {
    return gulp
        .src(files.imgPath)
        .pipe(newer("_site/assets/img/"))
        .pipe(imagemin())
        .pipe(gulp.dest("_site/assets/img/"))
        .pipe(browserSync.reload({stream:true}))
}

// Jekyll
function jekyll() {
// cp.spawn = require('cross-spawn');
//     cp.exec = require('gulp-exec');

    var jekyll = process.platform === "win32" ? "jekyll.bat" : "jekyll";
    return cp.spawn(jekyll, ['build']);


    // return cp.spawn("bundle", ["exec", "jekyll", "build"], { stdio: "inherit" });
}

// function jekyll (){
//     cp.exec('jekyll build', function(err, stdout, stderr) {
//         console.log(stdout);
//     });
// }


// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
// watch([files.scssPath, files.jsPath], parallel(scssTask, jsTask, browserSyncReload));

function watchTask(){
    gulp.watch(files.scssPath, scssTask);
    gulp.watch(files.jsPath, jsTask);
    gulp.watch(['_includes/**', '_layouts/**/*', 'pages/**', '_site/*.html'], gulp.series(browserSyncReload));
    // gulp.watch(['_site/**'], gulp.series(browserSyncReload));
    gulp.watch(files.imgPath, imgTask);
}

// Clean assets
function clean() {
    return del(["_site/assets/"]);
}

//browsersynce function
function browserSyncServe(done) {
    browserSync.init({
        server: {
            baseDir: "_site"
        }
    });
    done();
}

function browserSyncReload(done) {
    browserSync.reload();
    done();
}


/**
 * Push build to gh-pages
 */
function build () {
    return gulp.src("./_site/**/*")
        .pipe(deploy())
};

gulp.task('deploy', function () {
    return gulp.src("./_site/**/*")
        .pipe(deploy())
});

// define complex tasks
// const js = gulp.series(jsTask);
// const build = gulp.series(clean, gulp.parallel(scssTask, imgTask, jekyll, js));
// const watch = gulp.parallel(watchTask, browserSync);

// export tasks
// exports.images = imgTask;
// exports.css = scssTask;
// exports.js = js;
// exports.jekyll = jekyll;
// exports.clean = clean;
// exports.build = build;
// exports.watch = watch;
// exports.default = build;

// exports.build = build;
// exports.default = series(clean, build);

exports.default = gulp.series(
    gulp.parallel(scssTask, jsTask, imgTask),
    browserSyncServe,
    watchTask
);

// exports.default = series(parallel(scssTask, jsTask, browserSyncServe), watchTask);