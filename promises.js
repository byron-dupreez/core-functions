'use strict';

/**
 * Module containing native Promise utility functions, which are installed directly onto the native {@linkcode Promise}
 * class.
 * @module core-functions/promises
 * @author Byron du Preez
 */
module.exports = {
  /** Returns true if the given value is a Promise or at least a "then-able"; otherwise false. */
  isPromise: isPromise,
  /** Returns a function that will wrap and convert a node-style function into a Promise-returning function */
  wrap: wrap,
  /** Returns a function that will wrap and convert a node-style method into a Promise-returning function */
  wrapMethod: wrapMethod,
  /** Triggers execution of the given (typically synchronous) no-arg function, which may throw an error, within a new promise and returns the new promise */
  try: tryFn,
  /** Starts a simple timeout Promise, which will resolve after the specified delay in milliseconds */
  delay: delay,
  /** Transforms a result into a single Promise by using Promise.all (if result is an array of promises), the promise-result or Promise.resolve */
  allOrOne: allOrOne,
  /** Utility function to check if a result is an array of promises */
  isArrayOfPromises: isArrayOfPromises
};

const timers = require('./timers');

/**
 * Returns true if the given value is a Promise or at least a "then-able"; otherwise false.
 * @param {*} value - the value to check
 * @returns {boolean|*} true if its a promise (or a "then-able"); false otherwise
 */
function isPromise(value) {
  return value instanceof Promise || (value && value.then && typeof value.then === 'function');
}
if (!Promise.isPromise) { // polyfill-safe guard check
  Promise.isPromise = isPromise;
}

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
 * @param {Function} fn - a Node-callback style function to promisify
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
 * @param {Object} obj - the object on which to execute the given method
 * @param {Function} method - a Node-callback style method (of the given object) to promisify
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
 *
 * @param {Function} fn - the function to execute within a promise
 * @returns {Promise} the promise to execute the given function
 */
function tryFn(fn) {
  //return new Promise((resolve, reject) => resolve(fn()));
  try {
    const promiseOrResult = fn();
    // If the executed fn returned a promise, just return that; otherwise wrap its non-promise result in a promise
    //return isPromise(promiseOrResult) ? promiseOrResult : Promise.resolve(promiseOrResult);
    return allOrOne(promiseOrResult);
  } catch (err) {
    return Promise.reject(err);
  }
}
if (!Promise.try) { // polyfill-safe guard check
  Promise.try = tryFn;
}

/**
 * Starts a simple timeout Promise, which will resolve after the specified delay in milliseconds. If any object is
 * passed into this function as the cancellable argument, then this function will install a cancelTimeout method on it,
 * which accepts a single optional mustResolve argument and which if subsequently invoked will cancel the timeout and
 * either resolve the promise (if mustResolve) or reject the promise (default), but ONLY if the timeout
 * has not triggered yet.
 *
 * @param {number} ms - the number of milliseconds to delay
 * @param {Object|undefined|null} [cancellable] - an arbitrary object onto which a cancelTimeout method will be installed
 * @returns {Function|undefined} [cancellable.cancelTimeout] - installs a cancelTimeout method on the given cancellable
 * @returns {Promise} the timeout Promise
 */
function delay(ms, cancellable) {
  let triggered = false;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      triggered = true;
      resolve(triggered);
    }, ms);

    // Set up a cancel method on the given cancellable object
    if (cancellable && typeof cancellable === 'object') {
      cancellable.cancelTimeout = (mustResolve) => {
        if (!triggered) {
          try {
            clearTimeout(timeout);
          } catch (err) {
            console.error('Failed to clear timeout', err);
          } finally {
            if (mustResolve) {
              resolve(triggered);
            } else {
              reject(triggered);
            }
          }
        }
        return triggered;
      }
    }
  });
}
if (!Promise.delay) { // polyfill-safe guard check
  Promise.delay = delay;
}

/**
 * Transforms the given result into a single Promise by doing the following: applies Promise.all to the given result and
 * returns its Promise (if result is an array of promises); or returns the given promise result (if it's already a
 * Promise); otherwise wraps the given non-promise result in a Promise.resolve.
 *
 * @param {Promise|Promise[]|*} result - a promise or an array of promises or a non-promise result
 * @returns {Promise} a single promise containing the given result or containing the result's results if the result was
 * an array of promises
 */
function allOrOne(result) {
  return Array.isArray(result) && result.every(r => isPromise(r)) ? Promise.all(result) :
    isPromise(result) ? result : Promise.resolve(result);
}
if (!Promise.allOrOne) { // polyfill-safe guard check
  Promise.allOrOne = allOrOne;
}

/**
 * Returns true if the given result is an array of promises; false otherwise.
 * @param {*} result - the result to check
 * @returns {boolean} true if array of promises; false otherwise
 */
function isArrayOfPromises(result) {
  return Array.isArray(result) && result.every(r => isPromise(r))
}
if (!Promise.isArrayOfPromises) { // polyfill-safe guard check
  Promise.isArrayOfPromises = isArrayOfPromises;
}

/**
 * @typedef {{result:*}|{error:Error}} ResultOrError - An object containing either a result or an error.
 */

/**
 * Returns a promise that returns a list of either a result or an error for each of the given promises in the same
 * sequence as the given promises when every one of the given promises has resolved.
 * @param {Promise[]|Promise...} promises - a list of promises from which to collect their resolved results or their rejected errors
 * @returns {Promise.<ResultOrError[]>} promises - a promise of a list of either a result or an error for each of the
 * given promises in the same sequence as the given promises
 */
function every(promises) {
  const ps = Array.isArray(promises) ? promises : isPromise(promises) ? arguments : [];
  const n = ps.length;
  if (n <= 0) {
    return Promise.resolve([]);
  }
  const results = new Array(n);

  function next(i) {
    return ps[i].then(
      result =>
        results[i] = {result: result},
      err =>
        results[i] = {error: err})
      .then(() =>
        // If remaining list (after i) contains at least one more promise, then continue; otherwise done
        i < n - 1 ? next(i + 1) : results
      );
  }

  return next(0);
}
if (!Promise.every) { // polyfill-safe guard check
  Promise.every = every;
}