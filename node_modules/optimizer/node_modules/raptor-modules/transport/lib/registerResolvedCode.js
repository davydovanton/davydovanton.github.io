var through = require('through');

function registerResolvedCode(target, from, resolved) {
    var out = through();
    out.pause();

    out.queue('$rmod.resolved(' + JSON.stringify(target) + ', ' +
        JSON.stringify(from) + ', ' +
        JSON.stringify(resolved) + ');');

    out.end();

    return out;
}

module.exports = registerResolvedCode;