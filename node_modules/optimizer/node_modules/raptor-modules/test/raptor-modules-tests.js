'use strict';
require('../'); // Load the module
var nodePath = require('path');
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;

require('../lib/index'); // Load this module just to make sure it works

describe('raptor-modules' , function() {

    beforeEach(function(done) {
        for (var k in require.cache) {
            if (require.cache.hasOwnProperty(k)) {
                delete require.cache[k];
            }
        }
        done();
    });

    // it('should allow a module to be conditionally required', function() {
    //     var raptorModules = require('../');
    //     var test = raptorModules.conditionalRequire('./test', require);
    //     expect(test.test).to.equal(true);
    //     var missing = raptorModules.conditionalRequire('./missing', require);
    //     expect(missing).to.equal(undefined);
    // });


});

