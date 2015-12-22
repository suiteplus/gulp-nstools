'use strict';
var appRoot = process.cwd();

var path = require('path');

/**
 *
 * @param chunk
 * @returns {{dir: string, path: string, data: object}}
 */
exports = (chunk) => {
    let filePath = chunk.path.substr(chunk.cwd.length + 1),
        fileName = path.basename(filePath),
        fileDir = filePath.replace(fileName, ''),
        data = require(`${appRoot}/${filePath}`);

    return {
        dir: fileDir,
        path: filePath,
        data: data
    };
};
