var sqwish = require('sqwish');

function minify(src, options) {
    if (!options) {
        options = {};
    }

    //var strict = options.mergeDuplicates !== false;
    return sqwish.minify(src, false);
}

module.exports = function (pageOptimizer, pluginConfig) {
    pageOptimizer.addTransform({
            contentType: 'css',

            name: module.id,

            stream: false,

            transform: function(code, optimizerContext) {
                var dependency = optimizerContext.dependency;
                var mergeDuplicates = dependency ? dependency.mergeDuplicates !== false : true;

                var minified = minify(code, {
                    mergeDuplicates: mergeDuplicates
                });

                return minified;
            }
        });
};