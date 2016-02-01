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
    pack = require(`${appRoot}/package.json`),
    fileCache = [],
    concatDepends = {};

module.exports = () => {
    return through.obj(function (chunk, enc, callback) {
        let bundleCfgPath = chunk.path.substr(chunk.cwd.length + 1),
            bundleCfgDir = path.dirname(bundleCfgPath),
            bundleCfg = require(`${appRoot}/${bundleCfgPath}`),
            bundleCfgName = bundleCfg.name || path.basename(bundleCfgDir),
            bundleScripts = bundleCfg.scripts;

        let actual = 0,
            verifyNext = () => {
                if (++actual === bundleScripts.length) callback();
            };

        let that = this;
        for (let i = 0; i < bundleScripts.length; i++) {
            let relativePath = bundleScripts[i],
                ext = ~relativePath.indexOf('.js') ? '' : '.js',
                scriptPath = `${appRoot}/${bundleCfgDir}/src/${relativePath}${ext}`;
            console.log(scriptPath);
            if (!fs.existsSync(scriptPath)) {
                continue;
            }

            let script = nsify.annotation(scriptPath),
                custom = script.custom || {};
            custom.clientProof = custom.clientProof === 'true' || script.type === 'client';

            let finalName = `${script.id}.js`,
                dirDest = `.dist/${pack.name}/${bundleCfgName}/`,
                files = [
                    [scriptPath, {
                        alias: script.alias,
                        name: finalName,
                        dir: dirDest,
                        config: custom || {}
                    }]
                ];

            script.libs.forEach(lib => {
                let scriptLib = libraryInfo(lib, {dir: bundleCfgDir, id: script.id});
                if (!scriptLib) return;

                files.push([scriptLib.path, {
                    alias: scriptLib.alias,
                    name: scriptLib.finalName,
                    dir: scriptLib.dirDest,
                    config: scriptLib.custom || {}
                }]);
            });

            let actual = 0,
                verifyFiles = () => {
                    if (++actual === files.length) verifyNext();
                };

            for (let f = 0; f < files.length; f++) {
                let line = files[f],
                    fileJs = line[0],
                    sobj = line[1],
                    name = sobj.name,
                    config = sobj.config;

                if (name.indexOf('_') === 0) {
                    name = name.substr(1);
                }

                let cache = path.join(sobj.dir, name);
                if (config.concat) {
                    let dirPath = path.dirname(fileJs),
                        concat = config.concat.split(',').map(lib => {
                            let libPath = path.join(dirPath, lib),
                                scriptLib = libraryInfo(libPath, {id: script.id});
                            if (!scriptLib) return;
                            return path.join(scriptLib.dirDest, `${scriptLib.finalName}.js`);
                        }).filter(lib => !!lib);

                    concatDepends[cache] = concat;
                }
                if (~fileCache.indexOf(cache)) {
                    verifyFiles();
                    continue;
                } else {
                    fileCache.push(cache);
                }

                nsify(fileJs)
                    .pipe(through.obj(function (chunk, enc, callback) {
                        that.push(chunk);
                        verifyFiles();
                        callback();
                    }))
                    .on('error', plugins.util.log)
            }
        }
    });
};