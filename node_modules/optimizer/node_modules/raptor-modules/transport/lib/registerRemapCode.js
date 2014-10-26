var through = require('through');

function registerRemapCode(from, to) {
    var out = through();
    out.pause();
    
    out.queue('$rmod.remap(' + JSON.stringify(from) + ', ' +
        JSON.stringify(to) + ');');
    out.end();
    return out;
}

module.exports = registerRemapCode;