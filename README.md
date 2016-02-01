# gulp-nstools
NetSuite Bundle automatization for Continuous Integration

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