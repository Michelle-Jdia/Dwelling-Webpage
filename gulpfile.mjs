import gulp from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import browserSync from 'browser-sync';
import { deleteSync } from 'del';

const sass = gulpSass(dartSass);
const server = browserSync.create();

export const clean = () => {
    return new Promise((resolve, reject) => {
        try {
            deleteSync(['dist']);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

function styles() {
    return gulp.src('src/sass/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(rename({
            basename: 'styles',
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'))
        .pipe(server.stream());
}

function scripts() {
    return gulp.src('src/script/script.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/script'))
        .pipe(server.stream());
}

function html() {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'));
}

function assets() {
    return gulp.src('src/assets/**/*')
        .pipe(gulp.dest('dist/assets'));
}

function watch() {
    server.init({
        server: {
            baseDir: './dist',
        },
        port: 3000,
        open: false,
    });
    gulp.watch('src/sass/**/*.scss', styles);
    gulp.watch('src/script/**/*.js', scripts);
    gulp.watch('src/*.html', html);
    gulp.watch('src/assets/**/*', assets);
}

const build = gulp.series(clean, gulp.parallel(styles, scripts, html, assets));

const dev = gulp.series(build, watch);

export { styles, scripts, html, assets, watch, build, dev };
gulp.task('default', build);
gulp.task('dev', dev);
