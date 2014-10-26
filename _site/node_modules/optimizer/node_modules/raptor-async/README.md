raptor-async
============

**raptor-async** is a simple library for orchestrating asynchronous operations. It was inspired by the popular <a href="https://github.com/caolan/async">caolan/async</a> library. The main difference being that this library only includes **parallel** and **series** functions. This library also supports an optional **thisObj** argument that determines the scope that will be used when invoking job and completion functions.

# Overview

The **raptor-async** library handles invoking functions (a.k.a. jobs) in **parallel** or **series**. Each function is invoked with a single argument &mdash; a callback function that should be invoked when the job completes. The callback function is a Node-style callback so it expects the first parameter to be an error object and the second parameter to be the data.

## Parallel

The **parallel** method is used to handle invoking worker jobs in parallel and notifying the provided callback when all of the jobs complete.

The **parallel** function supports the following calling conventions:
```javascript
async.parallel(function[], function, thisObj)
```
or
```javascript
async.parallel(object, function, thisObj)
```

If **parallel** is invoked with an array of functions as first argument, then results will provided to the completion callback as an array with the value at each index corresponding to the data returned by the job at that index. The order of the results will not be arbitrary &mdash; it will always correspond to the order in which the jobs were provided to the **parallel** function.

If **parallel** is invoked with an object as first argument, then each property is expected to be a function. The results will provided to the completion callback as an object with the value of each property corresponding to the data returned by the job with the corresponding key.

The **thisObj** argument is optional, but if it is provided then each job function will be invoked in the scope of the given value. Also, the final completion callback will be invoked in the scope of the given value.

Example of calling **parallel** with an array of functions as first argument:
```javascript
var async = require('raptor-async');

var work = [];

work[0] = function(callback) {
    setTimeout(function() {
        callback(null, 0);
    }, 1000);
};

work[1] = function(callback) {
    setTimeout(function() {
        callback(null, 1);
    }, 500);
};

work[2] = function(callback) {
    setTimeout(function() {
        callback(null, 2);
    }, 0);
};

async.parallel(work, function(err, results) {
    // results will be [0, 1, 2]
});
```

Example of calling **parallel** with object as first argument:
```javascript
var async = require('raptor-async');

var work = {};

work.a = function(callback) {
    setTimeout(function() {
        callback(null, 0);
    }, 1000);
};

work.b = function(callback) {
    setTimeout(function() {
        callback(null, 1);
    }, 500);
};

work.c = function(callback) {
    setTimeout(function() {
        callback(null, 2);
    }, 0);
};

async.parallel(work, function(err, results) {
    // results will be {a: 0, b: 1, c: 2}
});
```

## Series

The **series** method is used to handle invoking worker jobs in series and notifying the provided callback when all of the jobs complete. Execution of jobs will stop if a job provides an error to the callback. The results will always be an array whose order will correspond to the order in which the jobs were placed in array.

The **series** function supports the following calling convention:
```javascript
async.series(function[], function, thisObj)
```

The **thisObj** argument is optional, but if it is provided then each job function will be invoked in the scope of the given value. Also, the final completion callback will be invoked in the scope of the given value.

Example of calling **series**:
```javascript
var async = require('raptor-async');

var work = [];

work[0] = function(callback) {
    setTimeout(function() {
        callback(null, 0);
    }, 1000);
};

work[1] = function(callback) {
    setTimeout(function() {
        callback(null, 1);
    }, 500);
};

work[2] = function(callback) {
    setTimeout(function() {
        callback(null, 2);
    }, 0);
};

async.series(work, function(err, results) {
    // results will be [0, 1, 2]
});
```

## Error handling

For both **parallel** and **series** methods, if errors occur during execution of jobs then completion callback will be invoked with an error object as first argument.

The error object will have a **toMap** function that can be used to inspect which jobs returned errors. Each property in this map will have a key that corresponds to index (if input work was provided as array of functions) or key (if input work was provided as object) of original input job. The **toString** function will also provide a human-readable description of the error by invoking **toString** on each error and concatenating the results together in a meaningful way.

For example:
```javascript
var async = require('raptor-async');

async.series(work, function(err, results) {
    if (err) {
        // toString can be used
        console.error(err.toString());
        
        // you can also examine the errors yourself and output a message
        var mappedErrors = err.toMap();
        for (var key in mappedErrors) {
            console.error('Job "' + key + '" failed with error "' + mappedErrors[key] + '"';
        }
    }
});
```

Thrown exceptions will not be caught by **parallel** and **series** during invocations of jobs. It is responsibility of each job to provide their own try catch blocks if this is necessary.
