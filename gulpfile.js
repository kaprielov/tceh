'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    rigger = require('gulp-rigger'),
    htmlmin = require('gulp-html-minifier'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    production: {
        html: './',
        js: 'js/',
        css: 'css/',
        img: 'img/',
        fonts: 'fonts/'
    },
    app: { //Пути откуда брать исходники
        html: ['app/**/*.html','app/templates/**/*.html','app/views/**/*.html'], //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'app/js/app.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'app/scss/app.scss',
        img: 'app/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'app/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: ['app/**/*.html','app/templates/**/*.html','app/views/**/*.html'],
        js: 'app/js/**/*.js',
        style: 'app/scss/**/*.scss',
        img: 'app/img/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9001,
    logPrefix: "pmi2"
};

gulp.task('html:build', function () {
    gulp.src(path.app.html) //Выберем файлы по нужному пути
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('js:build', function () {
    gulp.src(path.app.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('style:build', function () {
    gulp.src(path.app.style) //Выберем наш main.scss
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer({ browsers: ['> 5%', 'ie > 8','Firefox > 10', 'chrome > 5', 'safari 6', 'Opera > 11'] })) //Добавим вендорные префиксы
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.app.img) //Выберем наши картинки
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.app.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

// production
gulp.task('html:production', function () {
    gulp.src(path.app.html)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(path.production.html));
});

gulp.task('js:production', function () {
    gulp.src(path.app.js)
        .pipe(rigger())
        .pipe(gulp.dest(path.production.js));
});

gulp.task('style:production', function () {
    gulp.src(path.app.style)
        .pipe(sass())
        .pipe(prefixer({ browsers: ['> 5%', 'ie > 8','Firefox > 10', 'chrome > 5', 'safari 6', 'Opera > 11'] }))
        .pipe(cssmin())
        .pipe(gulp.dest(path.production.css));
});

gulp.task('image:production', function () {
    gulp.src(path.app.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.production.img));
});

gulp.task('fonts:production', function() {
    gulp.src(path.app.fonts)
        .pipe(gulp.dest(path.production.fonts))
});
gulp.task('production', [
    'html:production',
    'js:production',
    'style:production',
    'fonts:production',
    'image:production'
]);


gulp.task('watch', function() {
    watch(path.watch.html, function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        setTimeout(function () {
            gulp.start('style:build');
        },300);
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'watch']);