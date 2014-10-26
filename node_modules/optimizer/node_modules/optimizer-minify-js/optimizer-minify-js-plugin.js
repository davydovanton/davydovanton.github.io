var parser = require("uglify-js").parser;
var uglify = require("uglify-js").uglify;

function minify(src, options) {
    if (!options) {
        options = {};
    }

    var ast = parser.parse(src, options.strict_semicolons === true);

    if (options.lift_variables === true) {
        ast = uglify.ast_lift_variables(ast);
    }

    ast = uglify.ast_mangle(ast, options);
    ast = uglify.ast_squeeze(ast, options);
    return uglify.gen_code(ast);
}

module.exports = function (pageOptimizer, pluginConfig) {
    pageOptimizer.addTransform({
        contentType: 'js',

        name: module.id,

        stream: false,

        transform: function(code, optimizerContext) {
            try {
                var minified = minify(code);
                if (minified.length && !minified.endsWith(";")) {
                    minified += ";";
                }
                return minified;
            } catch(e) {
                if (e.line) {
                    var dependency = optimizerContext.dependency;
                    console.error('Unable to minify the following code for ' + dependency + ' at line '  + e.line + ' column '+ e.col + ':\n' +
                                  '------------------------------------\n' +
                                  code + '\n' +
                                  '------------------------------------\n');
                    throw new Error('JavaScript minification error for ' + dependency + ': ' + e.message + ' (line ' + e.line + ', col ' + e.col + ')');
                } else {
                    throw e;
                }
            }

        }
    });
};
