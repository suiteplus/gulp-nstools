# gulp-nstools [![NPM version][npm-image]][npm-url]
NetSuite Bundle automatization for Continuous Integration

## Required
 * node.js 4+

## Install [![Dependency Status][david-image]][david-url] [![devDependency Status][david-image-dev]][david-url-dev]
```bash
    npm install gulp-nstools --save-dev
```

## Default Project

```
+-- gulpfile.js
+-- module1
|   +-- bundle.json
|   +-- src
|   |   +-- SC-module1-main.js
```

##### bundle.json
```json
{
  "name": "module1",
  "scripts": [
    "SC-module1-main"
 ]
}
```

## Package

```javascript
var Q = require('q'),
    gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();
    
gulp.task('pacakge:generate', function() {
    let deferred = Q.defer();

    let nstools = plugins.nstools;
    
    // generate Netsuite package
    gulp.src(__dirname+ '/*/bundle.json')
        .pipe(nstools.package())
        .pipe(plugins.uglify({
            compress: {
                drop_console: true
            }
        }))
        .pipe(gulp.dest(__dirname + '/.dist'))
        .on('end', () => {
            deferred.resolve();
        });

    return deferred.promise;
});
```

[npm-url]: https://npmjs.org/package/gulp-nstools
[npm-image]: http://img.shields.io/npm/v/gulp-nstools.svg


[david-url]: https://david-dm.org/suiteplus/gulp-nstools
[david-image]: https://david-dm.org/suiteplus/gulp-nstools.svg

[david-url-dev]: https://david-dm.org/suiteplus/gulp-nstools#info=devDependencies
[david-image-dev]: https://david-dm.org/suiteplus/gulp-nstools/dev-status.svg