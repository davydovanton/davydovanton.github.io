var through = require('through');

var code = '$rmod.ready();';

function readyCode() {
    var stream = through();
    stream.pause();
    stream.queue(code);
    stream.end();
    return stream;
}

module.exports = exports = readyCode;

exports.sync = function(logicalPath, code) {
    return code;
};