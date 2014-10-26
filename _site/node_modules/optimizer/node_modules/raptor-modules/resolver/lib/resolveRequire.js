var ok = require('assert').ok;
var nodePath = require('path');
var searchPath = require('./search-path');
var moduleUtil = require('../../util');
var cachingFs = moduleUtil.cachingFs;

function resolveRequire(target, from, options) {
    ok(target, '"target" is required');
    ok(typeof target === 'string', '"target" must be a string');
    ok(from, '"from" is required');
    ok(typeof from === 'string', '"from" must be a string');

    var resolvedPath;

    if (target.charAt(0) === '/' || target.indexOf(':\\') !== -1) {
        var stat = cachingFs.statSync(target);
        if (stat.exists()) {
            resolvedPath = target;

            // We need "from" to be accurate for looking up browser overrides:
            from = stat.isDirectory() ? resolvedPath : nodePath.dirname(resolvedPath);
        }
    }

    var browserOverrides = moduleUtil.getBrowserOverrides(from);
    var browserOverride;

    if (!resolvedPath) {

        if (browserOverrides && (target.charAt(0) !== '.' && target.charAt(0) !== '/')) {
            // This top-level module might be mapped to a completely different module
            // based on the module metadata in package.json

            var remappedModule = browserOverrides.getRemappedModuleInfo(target, from);

            if (remappedModule) {
                browserOverride = resolveRequire(remappedModule.name, remappedModule.from, options);
                browserOverride.dep.childName = target;
                browserOverride.dep.remap = remappedModule.name;
                browserOverride.isBrowserOverride = true;
                return browserOverride;
            }
        }

        var hasExt = target.lastIndexOf('.') !== -1;

        resolvedPath = searchPath.find(target, from, function(path) {

            var dirname = nodePath.dirname(path);

            if (nodePath.basename(dirname) !== 'node_modules' && cachingFs.isDirectorySync(dirname)) {

                if (hasExt) {
                    if (cachingFs.existsSync(path)) {
                        return path;
                    }
                }

                // Try with the extensions
                var extensions = require.extensions;
                for (var ext in extensions) {
                    if (extensions.hasOwnProperty(ext) && ext !== '.node') {
                        var pathWithExt = path + ext;
                        if (cachingFs.existsSync(pathWithExt)) {
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
    }

    if (resolvedPath) {
        var pathInfo = moduleUtil.getPathInfo(resolvedPath, options);
        return pathInfo;
    } else {
        var e = new Error('Module not found: ' + target + ' (from: ' + from + ')');
        e.moduleNotFound = true;
        throw e;
    }
}

module.exports = resolveRequire;