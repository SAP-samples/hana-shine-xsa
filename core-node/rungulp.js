/**
 * Run gulp via script.
 * This is to be used to debug the tests.
 **/
/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0, no-use-before-define:0, no-inner-declarations:0, no-undef:0 */
/*eslint-env node, es6 */

var gulp = require('gulp');
require('./gulpfile');

// run tests without coverage to allow debugging
gulp.start('test');
