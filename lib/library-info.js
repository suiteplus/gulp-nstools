'use strict';
var fs = require('fs'),
    path = require('path'),
    nsify = require('nsify');

const appRoot = process.cwd();

var pack = require(`${appRoot}/package.json`),
    libraryCache = {};

/**
 *
 * @param lib {string}
 * @param opts {object}
 * @returns {{
 *    alias: string,
 *    finalName: string,
 *    dirDest: string,
 *    path: string,
 *    [custom]: {
 *       [noAlias]: boolean,
 *       [clientProof]: boolean,
 *       [concat]: string
 *    }
 * }}
 */
module.exports = (lib, opts) => {
    if (!opts) opts = {};
    let libExt = ~lib.indexOf('.js') ? '' : '.js',
        libPath = opts.dir && path.join(opts.dir, 'src', `${lib}${libExt}`) || `${lib}${libExt}`;
    if (!fs.existsSync(libPath)) {
        console.log('not found: ', libPath);
        return;
    } else if (libraryCache[libPath]) {
        return libraryCache[libPath];
    }
    let scriptLib = nsify.annotation(libPath);
    let libCustom = scriptLib.custom || {};
    libCustom.clientProof = libCustom.clientProof === 'true' || scriptLib.type === 'client';

    let isFinal = libCustom.finalName === 'true' || libCustom.clientProof;
    scriptLib.finalName = isFinal ? scriptLib.id : `${opts.id}-${scriptLib.id}`;

    let libdir = path.dirname(libPath);
    libdir = libdir.substring(0, libdir.indexOf('/src'));
    libdir = path.basename(libdir);
    scriptLib.dirDest = `.dist/${pack.name}/${libdir}/`;
    scriptLib.path = libPath;

    return (libraryCache[libPath] = scriptLib);
};
