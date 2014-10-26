var cssParser = require('raptor-css-parser');
var raptorModulesUtil = require('raptor-modules/util');
var resolver = require('raptor-modules/resolver');
var nodePath = require('path');
var REQUIRE_PREFIX = 'require:';

function defaultUrlResolver(url, optimizerContext, callback) {
    if (url.charAt(0) === '/' && url.charAt(1) !== '/') {
        url = nodePath.join(raptorModulesUtil.getProjectRootDir(url), url);
    } else if (url.startsWith(REQUIRE_PREFIX)) {
        url = url.substring(REQUIRE_PREFIX.length);

        var from;
        if (optimizerContext.dependency) {
            from = optimizerContext.dependency.getDir(optimizerContext);
        } else {
            from = raptorModulesUtil.getProjectRootDir(url);
        }

        var query;
        var pos = url.indexOf('?');
        if (pos !== -1) {
            query = url.substring(pos + 1);
            url = url = url.substring(0, pos);
        }

        url = resolver.serverResolveRequire(url, from);

        if (query) {
            url += '?' + query;
        }
    }

    callback(null, url);
}

module.exports = function (pageOptimizer, pluginConfig) {

    var urlResolver = pluginConfig.urlResolver || defaultUrlResolver;

    pageOptimizer.addTransform({
        contentType: 'css',

        name: module.id,

        // true: The transform function will RECEIVE and RETURN a stream that can be used to read the transformed out
        // false: The transform function will RECEIVE full code and RETURN a value or promise
        stream: false,

        transform: function(code, optimizerContext, callback) {
            var optimizer = optimizerContext.optimizer;
            cssParser.replaceUrls(
                code,

                // the replacer function
                function(url, start, end, callback) {
                    urlResolver(url, optimizerContext, function(err, url) {
                        if (err || !url) {
                            return callback(err);
                        }

                        optimizer.optimizeResource(url, {optimizerContext: optimizerContext}, function(err, optimizedResource) {
                            if (err) {
                                return callback(err);
                            }

                            callback(null, optimizedResource && optimizedResource.url);
                        });
                    });
                },

                // when everything is done
                function(err, code) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, code);
                });
        }
    });
};