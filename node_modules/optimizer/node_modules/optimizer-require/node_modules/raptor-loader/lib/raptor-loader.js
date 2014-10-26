var resourceLoader = require('./resource-loader');
var EventEmitter = require('events').EventEmitter;

var timeout = 3000;
var pending = {};
var completed = {};
var failed = {};
var emitter = new EventEmitter();

function start(resourceType, url) {

    if (!pending[url]) {
        pending[url] = true;

        var callback;

        var timeoutId = setTimeout(function() {
            callback('Timeout after ' + timeout + 'ms');
        }, timeout);

        callback = function(err) {
            if (!pending[url]) {
                // Callback was already invoked... most likely due
                // to a timeout
                return;
            }

            clearTimeout(timeoutId);

            delete pending[url];

            if (err) {
                failed[url] = err;
            } else {
                completed[url] = true;
            }

            emitter.emit(url, err, url);
        };

        resourceLoader[resourceType](url, callback);
    }
}

function load(resources, callback) {
    var errorMessages = [];
    var pendingCount = 0;

    function done() {
        if (errorMessages.length) {
            callback('Failed: ' + errorMessages.join(', '));
        } else {
            callback();
        }
    }

    function listener(err, url) {
        if (err) {
            errorMessages.push(url + ' (' + err + ')');
        }

        if (--pendingCount === 0) {
            done();
        }
    }

    function process(resourceType) {
        var resourcesForType = resources[resourceType];
        if (resourcesForType) {
            for (var i=0, len=resourcesForType.length; i<len; i++) {
                var url = resourcesForType[i];
                if (failed[url]) {
                    errorMessages.push(url + ' (' + failed[url] + ')');
                } else if (!completed[url]) {
                    pendingCount++;
                    emitter.once(url, listener);
                    start(resourceType, url);
                }
            }
        }
    }

    process('css');
    process('js');

    if (pendingCount === 0) {
        done();
    }
}

function async(asyncId, callback) {
    var loaderMeta = window.$rloaderMeta;
    var resources = loaderMeta ? loaderMeta[asyncId] : null;
    if (!resources) {
        throw new Error('Loader metadata missing for "' + asyncId + '"');
    }

    load(resources, function(err, result) {
        // Trigger "ready" event in raptor modules client to trigger running of
        // require-run modules that were loaded asynchronously
        // TODO: Async package loader shouldn't know anything about raptor modules
        /*global $rmod */
        $rmod.ready();
        callback(err, result);
    });
}

exports.setTimeout = function(_timeout) {
    timeout = _timeout;
};

exports.load = load;
exports.async = async;