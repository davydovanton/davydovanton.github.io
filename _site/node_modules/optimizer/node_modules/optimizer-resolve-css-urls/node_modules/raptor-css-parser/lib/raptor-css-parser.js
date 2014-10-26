
var parallel = require('raptor-async/parallel');
module.exports = {
    findUrls: function(code, callback) {
        var urlRegExp = /url\(\s*"([^\)]*)"\s*\)|url\(\s*'([^\)]*)'\s*\)|url\(([^\)]*)\)/g,
            matches;
        
        while((matches = urlRegExp.exec(code)) != null) {
            var url = matches[1] || matches[2] || matches[3];
            if (url.indexOf('data:') !== 0) {
                callback(url.trim(), matches.index + matches[0].indexOf('(')+1, matches.index + matches[0].lastIndexOf(')'));
            }
        }
    },

    replaceUrls: function(code, replacerFn, callback) {
        var matches = [];
        this.findUrls(code, function(url, start, end) {
            matches.push({
                start: start,
                end: end,
                url: url,
                replacement: undefined
            });
        });

        if (matches.length === 0) {
            /// quick return if there are no URLs
            return callback(null, code);
        }

        var work = [];
        var foundReplacement = false;

        function createJob(match) {
            return function(callback) {
                replacerFn(match.url, match.start, match.end, function(err, url) {
                    if ((match.replacement = url)) {
                        foundReplacement = true;
                    }
                    callback(err, url || match.url);
                });

            };
        }

        // One pass to resolve the replacements
        for (var i = 0, len = matches.length; i < len; i++) {
            var match = matches[i];
            work.push(createJob(match));
        }

        

        parallel(work, function(err) {
            if (err) {
                return callback(err);
            }

            // Another pass to apply the replacements.
            // Start from the and and work backwards
            // so that start and end indexes remain valid
            for (var i = matches.length-1; i>=0; i--) {
                var match = matches[i];
                var start = match.start;
                var end = match.end;
                var replacement = match.replacement;
                
                if (replacement != null) {
                    code = code.substring(0, start) + replacement + code.substring(end);
                }
            }

            callback(null, code);
            
        });
    },

    toString: function () {
        return '[raptor-css-parser]';
    }
};