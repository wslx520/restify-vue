'use strict';
const gulp = require('gulp');
const sass = require('gulp-sass');
gulp.task('sass', function(){
    return gulp.src('./static/source/sass/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./static/css'));
    })

gulp.task('default', function(){
    gulp.watch('./static/source/sass/*.scss',['sass']);
    })