'use strict';
var through = require('through2'),
    nsify = require('nsify'),
    fs = require('fs'),
    path = require('path'),
    gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();

const appRoot = process.cwd();

var libraryInfo = require('../lib/library-info'),
    pack = require(`${appRoot}/package.json`);

module.exports = () => {
    let fileCache = [];
    return through.obj(function (chunk, enc, callback) {
        let bundleCfgPath = chunk.path.substr(chunk.cwd.length + 1),
            bundleCfgDir = path.dirname(bundleCfgPath),
            bundleCfg = require(`${appRoot}/${bundleCfgPath}`),
            bundleCfgName = bundleCfg.name || path.basename(bundleCfgDir),
            bundleScripts = bundleCfg.scripts;

        let actual = 0,
            verifyNext = () => {
                if (++actual === bundleScripts.length) {
                    callback();
                }
            };

        let that = this;
        for (let i = 0; i < bundleScripts.length; i++) {
            let relativePath = bundleScripts[i],
                ext = ~relativePath.indexOf('.js') ? '' : '.js',
                scriptPath = `${appRoot}/${bundleCfgDir}/src/${relativePath}${ext}`;

            if (!fs.existsSync(scriptPath)) {
                continue;
            }

            let script = nsify.annotation(scriptPath);

            let dirDest = `.dist/${pack.name}/${bundleCfgName}/`,
                files = [
                    [scriptPath, {
                        alias: script.alias,
                        dir: dirDest
                    }]
                ];

            script.libs.forEach(lib => {
                let scriptLib = libraryInfo(lib, {dir: bundleCfgDir, id: script.id});
                if (!scriptLib) return;

                files.push([scriptLib.path, {
                    alias: scriptLib.alias,
                    dir: scriptLib.dirDest
                }]);
            });

            let actual = 0,
                verifyFiles = () => {
                    if (++actual === files.length + 1) verifyNext();
                };

            for (let f = 0; f < files.length; f++) {
                let line = files[f],
                    fileJs = line[0],
                    sobj = line[1],
                    dir = sobj.dir;

                if (~fileCache.indexOf(fileJs)) {
                    verifyFiles();
                    continue;
                } else {
                    fileCache.push(fileJs);
                }

                nsify(fileJs)
                    .pipe(through.obj(function (chunk) {
                        let fileName = path.basename(chunk.path),
                            cwd = chunk.cwd;
                        let file = new plugins.util.File({
                            base: path.join(cwd, dir),
                            cwd: cwd,
                            path: path.join(cwd, dir, fileName)
                        });
                        file.contents = chunk.contents;
                        that.push(file);
                        verifyFiles();
                    }))
                    .on('error', plugins.util.log)
            }
            verifyFiles();
        }
    });
};