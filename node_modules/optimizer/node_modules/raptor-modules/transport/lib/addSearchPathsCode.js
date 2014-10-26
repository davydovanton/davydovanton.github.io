var through = require('through');

function addSearchPathsCode(paths) {
    var out = through();
    out.pause();

    for (var i = 0; i < paths.length; i++) {
        var path = paths[i];

        if (path.charAt(path.length - 1) !== '/') {
            path = path + '/';
        }

        out.queue('$rmod.addSearchPath(' + JSON.stringify(path) + ');');
    }
    
    out.end();

    return out;
}

module.exports = addSearchPathsCode;