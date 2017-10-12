/**
 * Gulp Packages
 */

// General
const gulp = require('gulp');
const fs = require('fs');
const del = require('del');
const lazypipe = require('lazypipe');
const plumber = require('gulp-plumber');
const flatten = require('gulp-flatten');
const tap = require('gulp-tap');
const rename = require('gulp-rename');
const header = require('gulp-header');
const footer = require('gulp-footer');
const watch = require('gulp-watch');
const livereload = require('gulp-livereload');
const cacheBuster = require('gulp-cachebust');
const http = require('http');
const st = require('st');
const gutil = require('gulp-util');
const ghPages = require('gulp-gh-pages');

// Scripts and tests
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

// Styles
const sass = require('gulp-sass');
const prefix = require('gulp-autoprefixer');
const minify = require('gulp-cssnano');
const sourcemaps = require('gulp-sourcemaps');

// SVGs
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');

//img
const imagemin = require('gulp-imagemin');

// Docs
const markdown = require('gulp-markdown');
const fileinclude = require('gulp-file-include');

const cachebust = new cacheBuster();
const inject = require('gulp-inject');
const runSequence = require('run-sequence');
/**
 * Paths to project folders
 */

const paths = {
    input: 'src/**/*',
    output: 'dist/',
    scripts: {
        input: 'src/js/*',
        output: 'dist/scripts/auracoins/',
    },
    styles: {
        //input: 'src/sass/**/*.{scss,sass}',
        input: 'src/sass/{styles,critical}.{scss,sass}',
        output: 'dist/assets/auracoins/',
    },
    svgs: {
        input: 'src/svg/*',
        output: 'dist/assets/auracoins/',
    },
    images: {
        input: 'src/img/**/**',
        output: 'dist/assets/auracoins/',
    },
    static: {
        input: 'src/static/*',
        output: 'dist/',
    },
    docs: {
        input: 'src/docs/*.{html,md,markdown}',
        output: 'dist/',
        templates: 'src/docs/_templates/',
    },
    assets: {
        input: 'src/assets/**.**',
        output: 'dist/assets/auracoins/',
    },
};

const isProduction = gutil.env.type === 'production';

/**
 * Gulp Taks
 */

// Lint, minify, and concatenate scripts
gulp.task('build:scripts', ['clean:dist'], function() {
    const jsTasks = lazypipe()
        .pipe(rename, {suffix: '.min'})
        //.pipe(isProduction ? uglify : gutil.noop)
        .pipe(sourcemaps.write, './')
        .pipe(cachebust.resources.bind(cachebust))
        .pipe(gulp.dest, paths.scripts.output)
        .pipe(livereload);

    return gulp.src(paths.scripts.input)
               .pipe(sourcemaps.init())
               .pipe(plumber())
               .pipe(tap(function(file, t) {
                   if(file.isDirectory()) {
                       let name = file.relative + '.js';
                       return gulp.src(file.path + '/*.js')
                                  .pipe(concat(name))
                                  .pipe(jsTasks());
                   }
               }))
               .pipe(jsTasks());
});

// Process, lint, and minify Sass files
gulp.task('build:styles', ['clean:dist'], function() {
    return gulp.src(paths.styles.input)
               .pipe(sourcemaps.init())
               .pipe(plumber())
               .pipe(sass({
                   outputStyle: 'expanded',
                   sourceComments: true,
               }))
               .pipe(flatten())
               .pipe(prefix({
                   browsers: ['last 2 version', '> 1%'],
                   cascade: true,
                   remove: true,
               }))
               //.pipe(gulp.dest(paths.styles.output))
               .pipe(rename({suffix: '.min'}))
               .pipe(isProduction
                   ? minify({
                       discardComments: {
                           removeAll: true,
                       },
                   })
                   : gutil.noop())
               .pipe(cachebust.resources())
               .pipe(sourcemaps.write('./'))
               .pipe(gulp.dest(paths.styles.output))
               .pipe(livereload());
});

// Generate SVG sprites
gulp.task('build:svgs', ['clean:dist'], function() {
    return gulp.src(paths.svgs.input)
               .pipe(plumber())
               .pipe(tap(function(file, t) {
                   if(file.isDirectory()) {
                       let name = file.relative + '.svg';
                       return gulp.src(file.path + '/*.svg')
                                  .pipe(svgmin())
                                  .pipe(svgstore({
                                      fileName: name,
                                      prefix: 'icon-',
                                      inlineSvg: true,
                                  }))
                                  .pipe(gulp.dest(paths.svgs.output));
                   }
               }))
               .pipe(svgmin())
               .pipe(gulp.dest(paths.svgs.output));
});

// Copy image files into output folder
gulp.task('build:images', ['clean:dist'], function() {
    return gulp.src(paths.images.input)
               .pipe(plumber())
               .pipe(isProduction ? imagemin() : gutil.noop())
               .pipe(gulp.dest(paths.images.output));
});

// Copy assets files into output folder
gulp.task('build:assets', ['clean:dist'], function() {
    return gulp.src(paths.assets.input)
               .pipe(plumber())
               .pipe(gulp.dest(paths.assets.output));
});

// Lint scripts
gulp.task('lint:scripts', function() {
    return gulp.src(paths.scripts.input)
               .pipe(plumber())
               .pipe(jshint())
               .pipe(jshint.reporter('jshint-stylish'));
});

// Remove pre-existing content from output and test folders
gulp.task('clean:dist', function() {
    del.sync([
        paths.output,
    ]);
});

// Generate documentation
gulp.task('build:docs', ['compile', 'clean:docs'], function() {
    return gulp.src(paths.docs.input)
               .pipe(plumber())
               .pipe(fileinclude({
                   prefix: '@@',
                   basepath: '@file',
               }))
               .pipe(tap(function(file, t) {
                   if(/\.md|\.markdown/.test(file.path)) {
                       return t.through(markdown);
                   }
               }))
               .pipe(header(fs.readFileSync(paths.docs.templates + '/_head.html', 'utf8')))
               .pipe(footer(fs.readFileSync(paths.docs.templates + '/_footer.html', 'utf8')))
               .pipe(cachebust.references())
               .pipe(gulp.dest(paths.docs.output))
               .pipe(livereload());
});

// Remove prexisting content from docs folder
gulp.task('clean:docs', function() {
    return del.sync(paths.docs.output);
});

// Spin up livereload server and listen for file changes
gulp.task('listen', function() {
    livereload.listen({
        host: 'localhost',
        port: 3000,
        basePath: 'dist',
    });
    gulp.watch(paths.input, ['default']);
});

gulp.task('inject-critical', function() {
    const sources = gulp.src(`${paths.styles.output}critical*.css`);

    return gulp.src(`${paths.docs.output}*.html`)
               .pipe(inject(sources, {
                   starttag: '<!-- inject:head:{{ext}} -->',
                   transform: function(filePath, file) {
                       // return file contents as string
                       return file.contents.toString('utf8');
                   },
               }))
               .pipe(gulp.dest(paths.docs.output));
});

/**
 * Task Runners
 */

// Compile files
gulp.task('compile', [
    'lint:scripts',
    'clean:dist',
    'build:scripts',
    'build:styles',
    'build:images',
    'build:svgs',
    'build:assets',
]);

// Generate documentation
gulp.task('docs', [
    'clean:docs',
    'build:docs',
]);

// Compile files and generate docs (default)
gulp.task('default', function() {
    runSequence([
        'compile',
        'docs']);
    //], 'inject-critical');
});

// Compile files and generate docs when something changes
gulp.task('watch', [
    'server',
    'listen',
    'default',
]);

gulp.task('server', function(done) {
    http.createServer(
        st({path: __dirname + '/dist', index: 'index.html', cache: false})
    ).listen(8080, done);
});

gulp.task('deploy-gp', function() {
    return gulp.src(paths.output + '**/*')
               .pipe(ghPages());
});
