var raptorLoggingImpl = './raptor-logging-impl';

try {
    raptorLoggingImpl = require.resolve(raptorLoggingImpl);
} catch(e) {
    raptorLoggingImpl = null;
}

var EMPTY_FUNC = function() {
        return false;
    },
    /**
     * @name raptor/logging/voidLogger
     */
    voidLogger = {
        
        /**
         *
         */
        isTraceEnabled: EMPTY_FUNC,

        /**
         *
         */
        isDebugEnabled: EMPTY_FUNC,
        
        /**
         *
         */
        isInfoEnabled: EMPTY_FUNC,
        
        /**
         *
         */
        isWarnEnabled: EMPTY_FUNC,
        
        /**
         *
         */
        isErrorEnabled: EMPTY_FUNC,
        
        /**
         *
         */
        isFatalEnabled: EMPTY_FUNC,
        
        /**
         *
         */
        dump: EMPTY_FUNC,
        
        /**
         *
         */
        trace: EMPTY_FUNC,

        /**
         *
         */
        debug: EMPTY_FUNC,
        
        /**
         *
         */
        info: EMPTY_FUNC,
        
        /**
         *
         */
        warn: EMPTY_FUNC,
        
        /**
         *
         */
        error: EMPTY_FUNC,
        
        /**
         *
         */
        fatal: EMPTY_FUNC
    };

var stubs = {
    /**
     *
     * @param className
     * @returns
     */
    logger: function() {
        return voidLogger;
    },
    
    configure: EMPTY_FUNC,
    
    voidLogger: voidLogger
};

module.exports = raptorLoggingImpl ? require(raptorLoggingImpl) : stubs;