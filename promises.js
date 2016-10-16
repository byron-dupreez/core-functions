'use strict';

/**
 * Module containing native Promise utility functions, which are installed directly onto the native {@linkcode Promise}
 * class.
 * @module core-functions/promises
 * @author Byron du Preez
 */
module.exports = {
  /** Returns a function that will wrap and convert a node-style function into a Promise-returning function */
  wrap: wrap,
  /** Returns a function that will wrap and convert a node-style method into a Promise-returning function */
  wrapMethod: wrapMethod,
  try: tryFn,
  delay: delay
};

/**
 * Wraps and converts the given node-style function into a Promise-returning function, which when invoked must be passed
 * all of the wrapped function's arguments other than its last callback argument.
 *
 * NB: This function must be passed a node-style function that accepts as its last parameter a callback that in turn
 * accepts 2 parameters: error; and data.
 *
 * Borrowed and slightly tweaked from "You don't know JavaScript - Async & Performance" (thanks Kyle Simpson)
 * (https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/README.md)
 *
 * Example:
 *
 *   // crude example of a node-style function
 *   function nodeStyleFunction(arg1, arg2, ..., argN, callback) {
 *     // example synchronous invocation of callback with error
 *     if (!arg1) {
 *       callback(new Error('arg1 undefined'));
 *     }
 *     // example asynchronous invocation of callback with data
 *     setTimeout(function () {
 *       callback(null, 'Completed successfully');
 *     }, 5000);
 *   }
 *
 *   Promise.wrap(nodeStyleFunction)(arg1, arg2, ..., argN)
 *       .then(result => ...)
 *       .catch(err => ...);
 *
 * NB: If the function passed is actually a method call on an object then EITHER call wrap using a bind on the method:
 *    Example:
 *      Promise.wrap(obj.nodeStyleMethod.bind(obj))(arg1, arg2, ..., argN)
 *         .then(result => ...)
 *         .catch(err => ...);
 *
 *     OR instead use the Promise.wrapMethod function below.
 *
 * @param {Function} fn a Node-callback style function to promisify
 * @returns {Function} a function, which when invoked will return a new Promise that will resolve or reject based on the
 * outcome of the callback
 */
function wrap(fn) {
  return function () {
    //var args = [].slice.call( arguments );
    // potentially faster than slice
    const len = arguments.length;
    const args = new Array(len + 1);
    for (let i = 0; i < len; i++) {
      args[i] = arguments[i];
    }
    return new Promise((resolve, reject) => {
        args[len] = (err, v) => {
          if (err) reject(err);
          else resolve(v);
        };
        fn.apply(null, args);
      }
    );
  };
}
if (!Promise.wrap) { // polyfill-safe guard check
  Promise.wrap = wrap;
}

/**
 * Wraps and converts the given node-style method call into a promise-returning function, which will later apply the
 * method to the given object and which accepts all of the wrapped method's arguments other than its last callback
 * argument.
 * NB: This function must be passed an object and a node-style method, which is defined on the object and which accepts
 * as its last parameter a callback that in turn accepts 2 parameters: error; and data.
 * Example:
 *
 *   // crude example of a node-style method
 *   var object = {
 *     nodeStyleMethod: function nodeStyleMethod(arg1, arg2, ..., argN, callback) {
 *       // example synchronous invocation of callback with error
 *       if (!arg1) {
 *         callback(new Error('arg1 undefined'));
 *       }
 *       // example asynchronous invocation of callback with data
 *       setTimeout(function () {
 *         callback(null, 'Completed successfully);
 *       }, 5000);
 *     }
 *   };
 *
 *   Promise.wrapMethod(obj, obj.nodeStyleMethod)(arg1, arg2, ..., argN)
 *       .then(result => ...)
 *       .catch(err => ...);
 *
 * @param {Object} obj the object on which to execute the given method
 * @param {Function} method a Node-callback style method (of the given object) to promisify
 * @returns {Function} a function, which when invoked will return a new Promise that will resolve or reject based on the
 * outcome of the callback
 */
function wrapMethod(obj, method) {
  return function () {
    //const args = [].slice.call( arguments );
    // potentially faster than slice
    const len = arguments.length;
    const args = new Array(len + 1);
    for (let i = 0; i < len; i++) {
      args[i] = arguments[i];
    }
    return new Promise((resolve, reject) => {
        args[len] = (err, v) => {
          if (err) reject(err);
          else resolve(v);
        };
        method.apply(obj, args);
      }
    );
  }
}
if (!Promise.wrapMethod) { // polyfill-safe guard check
  Promise.wrapMethod = wrapMethod;
}

/**
 * Triggers execution of the given (typically synchronous) no-arg function, which may throw an error, within a new
 * promise and returns this new promise.
 * Use this function to safely start a new promise chain and ensure that any errors that may be thrown (when the given
 * function's body is executed) cause the promise to be properly rejected.
 * This function is only useful for starting a promise chain as subsequent 'then' steps are already error-safe.
 *
 * Example 1:
 *   Promise.try(() => functionThatMayThrow(arg1, arg2, ..., argN));
 *
 * Example 2:
 *   Promise.try(() => {
 *     // code that may throw an error
 *     let result = functionThatMayThrow(arg1, arg2, ..., argN)
 *     // ...
 *     return result;
 *   });
 *
 * Example 3: (verbose, not recommended)
 *   function functionToTry() {
 *     return functionThatMayThrow(arg1, arg2, ..., argN);
 *   }
 *
 *   Promise.try(functionToTry);
 */
function tryFn(fn) {
  return new Promise((resolve, reject) => resolve(fn()));
}
if (!Promise.try) { // polyfill-safe guard check
  Promise.try = tryFn;
}

/**
 * Starts a simple timeout Promise, which will resolve after the specified delay in milliseconds.
 * @param {number} ms the number of milliseconds to delay
 * @returns {Promise} the timeout Promise
 */
function delay(ms) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}
if (!Promise.delay) { // polyfill-safe guard check
  Promise.delay = delay;
}
