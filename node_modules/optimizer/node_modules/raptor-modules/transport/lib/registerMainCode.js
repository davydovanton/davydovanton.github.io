var through = require('through');

function registerMainCode(path, main) {
    var out = through();
    out.pause();
    
    out.queue('$rmod.main(' + JSON.stringify(path) + ', ' +
        JSON.stringify(main) + ');');
    out.end();
    return out;
}

module.exports = registerMainCode;