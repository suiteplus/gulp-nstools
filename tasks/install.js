'use strict';
var npm = require('npm'),
    through = require('through2'),
    loadConfig = require('../lib/load-config');

module.exports = () => {
    return through.obj(function (chunk, enc, callback) {
        let bundle = loadConfig(chunk).data,
            libs = bundle.libs,
            packs = libs ? Object.keys(libs) : [],
            installArgs = [];

        for (let i=0; i<packs.length; i++) {
            let pack = packs[i],
                version = libs[pack];

            installArgs.push(`${pack}@${version}`);
        }
        if (installArgs.length) {
            npm.commands.install(installArgs, function (er) {
                return callback(er);
            });
        } else {
            return callback();
        }
    });
};
