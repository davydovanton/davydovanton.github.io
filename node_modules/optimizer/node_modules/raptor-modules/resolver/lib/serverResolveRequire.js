var ok = require('assert').ok;
var nodePath = require('path');
var searchPath = require('./search-path');
var cachingFs = require('../../util').cachingFs;

function serverResolveRequire(target, from) {
    ok(target, '"target" is required');
    ok(typeof target === 'string', '"target" must be a string');
    ok(from, '"from" is required');
    ok(typeof from === 'string', '"from" must be a string');

    if (target.charAt(0) === '/' || target.indexOf(':\\') !== -1) {
        // Assume absolute paths have already been resolved...
        // Newer versions of Node.js will have a better test for isAbsolute()
        return target;
    }
    
    var result = searchPath.find(target, from, function(path) {

        var dirname = nodePath.dirname(path);
        if (nodePath.basename(dirname) !== 'node_modules' && cachingFs.isDirectorySync(dirname)) {
            // Try with the extensions
            var extensions = require.extensions;
            for (var ext in extensions) {
                if (extensions.hasOwnProperty(ext)) {
                    var pathWithExt = path + ext;
                    if (cachingFs.isDirectorySync(nodePath.dirname()) && cachingFs.existsSync(pathWithExt)) {
                        return pathWithExt;
                    }
                }
            }
        }

        if (cachingFs.existsSync(path)) {
            return path;
        }

        return null;
    });

    if (!result) {
        throw new Error('Module not found: ' + target + ' (from: ' + from + ')');
    }

    return result;
}

module.exports = serverResolveRequire;