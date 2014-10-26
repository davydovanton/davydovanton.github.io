
/*

Examples:
deresolve('/my-project/node_modules/foo/index.js', '/my-project/src') -->
	'foo'

deresolve('/my-project/node_modules/foo/hello.js', '/my-project/src') -->
	'foo/hello'

deresolve('/my-project/src/bar.js', '/my-project/src/index.js') -->
	'./bar'
*/


var nodePath = require('path');
var Module = require('module').Module;
var raptorModulesUtil = require('../../util');

function removeRegisteredExt(path) {
    var basename = nodePath.basename(path);
    var ext = nodePath.extname(basename);

    if (require.extensions[ext]) {
        return path.slice(0, 0-ext.length);
    } else {
        return path;
    }
}

function getModuleDirnameFromSearchPath(path, searchPath) {
	var dirname = nodePath.dirname(path);
	var parentDirname = nodePath.dirname(dirname);

	do {

		if (parentDirname === searchPath) {
			return dirname;
		}

		parentDirname = nodePath.dirname(parentDirname);
		dirname = nodePath.dirname(dirname);

	} while (dirname !== searchPath);

	throw new Error('Illegal state for getModuleDirnameFromSearchPath. path=' + path + ', searchPath=' + searchPath);
}

function relPath(path, from) {
	var dirname = nodePath.dirname(path);
	var main = raptorModulesUtil.findMain(dirname);
	if (main === path) {
		path = nodePath.dirname(path); // We only need to walk to the parent directory if the target is the main file for the directory
	}

	// Didn't find the target path on the search path so construct a relative path
	var relativePath = removeRegisteredExt(nodePath.relative(from, path));
	if (relativePath.charAt(0) !== '.') {
		relativePath = './' + relativePath;
	}
	return relativePath;
	// var relPathParts = relPath.split(/[\\\/]/);
	// if (relPathParts.indexOf('node_modules') === -1) {
	//	// Only use the relative path if we *not* are crossing into a
	// }
}

function deresolve(path, from) {
	var targetRootDir = raptorModulesUtil.getModuleRootDir(path);
	var fromRootDir = raptorModulesUtil.getModuleRootDir(from);

	if (targetRootDir && fromRootDir && targetRootDir === fromRootDir) {
		return relPath(path, from);
	}

	var paths = Module._nodeModulePaths(from);

	var fromSearchPath = null;

	for (var i=0, len=paths.length; i<len; i++) {
		var searchPath = paths[i];
		
		if (path.startsWith(searchPath)) {
			// Example:
			// searchPath: '/my-project/node_modules
			// path:       '/my-project/node_modules/foo/lib/index.js'
			
			var moduleDirname = getModuleDirnameFromSearchPath(path, searchPath);
			var main = raptorModulesUtil.findMain(moduleDirname);
			if (main === path) {
				// The target path is the main file for the module in the search path
				return nodePath.basename(moduleDirname);
			}
			
			fromSearchPath = path.substring(searchPath.length+1); // Example: foo/index.js
			fromSearchPath = removeRegisteredExt(fromSearchPath); // Remove the file extension if well-known
			return fromSearchPath;
		}
	}

	return relPath(path, from);
	
}

module.exports = deresolve;