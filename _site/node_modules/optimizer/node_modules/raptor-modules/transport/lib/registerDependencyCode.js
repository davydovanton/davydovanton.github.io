var through = require('through');

function registerDependencyCode(logicalParentPath, childName, childVersion, overrideName) {
    var out = through();
    out.pause();
    
    out.queue('$rmod.dep(' + JSON.stringify(logicalParentPath) + ', ' +
        JSON.stringify(overrideName || childName) + ', ' +
        JSON.stringify(childVersion));

    if (overrideName) {
        out.queue(', ' + JSON.stringify(childName));
    }

    out.queue(');');

    out.end();

    return out;
}

module.exports = registerDependencyCode;