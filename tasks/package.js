'use strict';
var through = require('through2'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path');

var appRoot = process.cwd();

module.exports = through.obj(function (chunk, enc, callback) {
    let bundlePath = chunk.path.substr(chunk.cwd.length + 1),
        bundleDir = bundlePath.replace('bundle.json', ''),
        bundle = require(`${appRoot}/${bundlePath}`),
        libs = Object.keys(bundle.libs);

    for (let i = 0; i < libs.length; i++) {
        let orig = libs[i],
            dest = bundle.libs[orig];

        let origDir;
        if (~orig.indexOf(':')) {
            let oo = orig.split(':');
            origDir = oo[0];
            orig = oo[1];
        } else {
            origDir = bundleDir;
        }

        let origBaseDir = path.join(appRoot, origDir, 'src'),
            origPath = path.join(origBaseDir, orig),
            files = glob.sync(origPath);

        if (dest.indexOf('/') !== 0) dest = `/${dest}`;

        let destBaseDir = distDir;
        path.dirname(dest).split('/').forEach((dir) => {
            destBaseDir = path.join(destBaseDir, dir);
            !fs.existsSync(destBaseDir) && fs.mkdirSync(destBaseDir);
        });

        for (let f = 0; f < files.length; f++) {
            let file = files[f],
                stat = fs.statSync(file);
            if (stat.isFile()) {
                //console.log('>>>> file', file);
                //console.log('>>>> base', origBaseDir);
                //console.log('>>>> dest', dest);
                let content = fs.readFileSync(file, 'utf8'),
                    fileName = path.basename(file),
                    othersDir = path.dirname(file).replace(origBaseDir, ''),
                    destFileDir = destBaseDir;

                othersDir.split('/').forEach((dir) => {
                    destFileDir = path.join(destFileDir, dir);
                    !fs.existsSync(destFileDir) && fs.mkdirSync(destFileDir);
                });

                let destPath = path.join(destFileDir, fileName);
                fs.writeFileSync(destPath, content, 'utf8');
            }
        }
    }
    callback();
});