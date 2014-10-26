require('raptor-polyfill/string/endsWith');
var nodePath = require('path');
var Module = require('module').Module;
var cachingFs = require('../../util').cachingFs;

function find(path, from, callback, thisObj) {

    if (path.startsWith('/') || path.indexOf(':') !== -1) {
        return callback.call(thisObj, path);
    }

    if (path.startsWith('./') || path.startsWith('../')) {
        // Don't go through the search paths for relative paths
        var joined = callback.call(thisObj, nodePath.join(from, path));
        if (joined && joined.endsWith('/')) {
            joined = joined.slice(0, -1);
        }
        return joined;
    }
    else {
        var paths = Module._nodeModulePaths(from);

        for (var i=0, len=paths.length; i<len; i++) {
            var searchPath = paths[i];
            if (!cachingFs.isDirectorySync(searchPath)) {
                continue;
            }
            
            var result = callback.call(thisObj, nodePath.join(searchPath, path));
            if (result) {
                return result;
            }
        }
    }
}

exports.find = find;