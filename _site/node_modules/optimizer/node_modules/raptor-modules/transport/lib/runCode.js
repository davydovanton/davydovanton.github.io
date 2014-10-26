var through = require('through');

function runCode(path, options) {
    return '$rmod.run(' + JSON.stringify(path) + (options ? (',' + JSON.stringify(options)) : '') + ');';
}

module.exports = function(path, options) {

    var out = through();
    out.pause();

    out.queue(runCode(path, options));
    out.end();

    return out;
};

module.exports.sync = runCode;