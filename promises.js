'use strict';

const tries = require('./tries');
//const Try = tries.Try;
const Success = tries.Success;
const Failure = tries.Failure;

/**
 * An Error subclass thrown to cancel/short-circuit a promise that is waiting for a list of promises to resolve.
 * @property (Success|Failure)[]} resolvedOutcomes - a list of resolved outcomes
 * @property {Promise[]} unresolvedPromises - a list of unresolved promises
 * @property {boolean} completed - whether all of the promises resolved prior to cancellation or not
 */
class CancelledError extends Error {
  /**
   * Constructs a new CancelledError.
   * @param {(Success|Failure)[]} resolvedOutcomes - the list of resolved outcomes
   * @param {Promise[]} unresolvedPromises - the list of unresolved promises
   */
  constructor(resolvedOutcomes, unresolvedPromises) {
    const doneCount = resolvedOutcomes ? resolvedOutcomes.length : 0;
    const totalCount = doneCount + (unresolvedPromises ? unresolvedPromises.length : 0);
    const message = 'Cancelled' + (totalCount > 0 ? ` after resolving ${doneCount} outcome${doneCount !== 1 ? 's' : ''} of ${totalCount} promise${totalCount !== 1 ? 's' : ''}` : '');
    super(message);
    Object.defineProperty(this, 'message', {writable: false, enumerable: true, configurable: false});
    Object.defineProperty(this, 'name', {value: this.constructor.name});
    Object.defineProperty(this, 'resolvedOutcomes', {value: resolvedOutcomes, enumerable: false});
    Object.defineProperty(this, 'unresolvedPromises', {value: unresolvedPromises, enumerable: false});
    Object.defineProperty(this, 'completed', {value: doneCount === totalCount, enumerable: false});
  }
}

/**
 * Module containing Promise utility functions.
 * @module core-functions/promises
 * @author Byron du Preez
 */
module.exports = {
  /** Returns true if the given value is a native Promise; otherwise false */
  isPromise: isPromise,
  /** Returns true if the given value is a native Promise or a promise-like ("then-able") object; otherwise false */
  isPromiseLike: isPromiseLike,
  /** Returns a function that will wrap and convert a node-style function into a Promise-returning function */
  wrap: wrap,
  /** Returns a function that will wrap and convert a node-style method into a Promise-returning function */
  wrapMethod: wrapMethod,
  /** Triggers execution of the given (typically synchronous) no-arg function, which may throw an error, within a new promise and returns the new promise */
  try: attempt,
  /** Starts a simple timeout Promise, which will resolve after the specified delay in milliseconds */
  delay: delay,
  /** Transforms the given result into a single Promise by applying Promise.all to the given result (if it's an Array); otherwise by applying Promise.resolve to the given non-Array result */
  allOrOne: allOrOne,
  /** Returns a promise that will return a list of Success or Failure outcomes, each of which contains either a resolved value or a rejected error, for the given promises */
  every: every,
  /** Maps the given promise to a native Promise of a Success or Failure outcome */
  one: one,
  /** Transforms the given promise-like object (or non-promise value) into a native Promise */
  toPromise: toPromise,
  /** An Error subclass thrown to cancel/short-circuit a promise that is waiting for a list of promises to resolve. */
  CancelledError: CancelledError
};

/**
 * Returns true if the given value is a native Promise; otherwise false.
 * @param {*} value - the value to check
 * @returns {boolean|*} true if its a native Promise; false otherwise
 */
function isPromise(value) {
  return value instanceof Promise;
}

/**
 * Returns true if the given value is a native Promise or a promise-like ("then-able") object; otherwise false.
 * @param {*} value - the value to check
 * @returns {boolean|*} true if its a promise or a promise-like ("then-able") object; false otherwise
 */
function isPromiseLike(value) {
  return value instanceof Promise || (!!value && !!value.then && typeof value.then === 'function');
}

/**
 * Transforms the given promise-like object (or non-promise value) into a native Promise using the following process:
 * 1. If the given promiseLike is already a native Promise, then just returns it;
 * 2. If the given promiseLike is a "then-able", promise-like object (i.e. it has a "then" method)***, then wraps a call
 *    to its "then" method in a new native Promise (in order to transfer its resolved result or rejected error to the
 *    new Promise) and then returns the new Promise; otherwise
 * 3. If the given promiseLike is anything else, returns Promise.resolve(promiseLike).
 *
 * ***NB: Any given "then-able" promiseLike MUST accept the same arguments as Promise.then (i.e. a resolve function and
 *        a reject function) - if this is NOT the case, then do NOT use this function on it!
 *
 * @param {Promise|PromiseLike|*} promiseLike - the promise-like object to convert into a native promise
 * @returns {Promise} a native Promise of the given promise-like object's resolved result or rejected error
 */
function toPromise(promiseLike) {
  return promiseLike instanceof Promise ? promiseLike : isPromiseLike(promiseLike) ?
      new Promise((resolve, reject) => {
        try {
          // Assumption: "then-able" accepts the same arguments as Promise.then
          promiseLike.then(
            result => resolve(result),
            error => reject(error)
          );
        } catch (err) {
          reject(err)
        }
      }) : Promise.resolve(promiseLike);
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
 *   // Assuming an import as follows
 *   const Promises = require('core-functions/promises');
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
 *   Promises.wrap(nodeStyleFunction)(arg1, arg2, ..., argN)
 *       .then(result => ...)
 *       .catch(err => ...);
 *
 * NB: If the function passed is actually a method call on an object then EITHER call wrap using a bind on the method:
 *    Example:
 *      Promises.wrap(obj.nodeStyleMethod.bind(obj))(arg1, arg2, ..., argN)
 *         .then(result => ...)
 *         .catch(err => ...);
 *
 *     OR instead use the Promises.wrapMethod function below.
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
    for (let i = 0; i < len; ++i) {
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

/**
 * Wraps and converts the given node-style method call into a promise-returning function, which will later apply the
 * method to the given object and which accepts all of the wrapped method's arguments other than its last callback
 * argument.
 * NB: This function must be passed an object and a node-style method, which is defined on the object and which accepts
 * as its last parameter a callback that in turn accepts 2 parameters: error; and data.
 * Example:
 *   const Promises = require('core-functions/promises');
 *
 *   // crude example of a node-style method
 *   const object = {
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
 *   Promises.wrapMethod(obj, obj.nodeStyleMethod)(arg1, arg2, ..., argN)
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
    for (let i = 0; i < len; ++i) {
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

/**
 * Triggers execution of the given (typically synchronous) no-arg function, which may throw an error, and returns a
 * promise of its result or failure.
 *
 * Use this function to safely start a new promise chain and ensure that any errors that may be thrown (when the given
 * function's body is executed) cause the promise to be properly rejected.
 * This function is only useful for starting a promise chain as subsequent 'then' steps are already error-safe.
 *
 * Preamble to examples:
 *   const Promises = require('core-functions/promises');
 *
 * Example 1:
 *   Promises.try(() => functionThatMayThrow(arg1, arg2, ..., argN));
 *
 * Example 2:
 *   Promises.try(() => {
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
 *   Promises.try(functionToTry);
 *
 * @param {Function} fn - the function to execute within a promise
 * @returns {Promise} a promise of the executed function's result or failure
 */
function attempt(fn) {
  try {
    return Promise.resolve(fn());
  } catch (err) {
    return Promise.reject(err);
  }
}

/**
 * Starts a simple timeout Promise, which will resolve after the specified delay in milliseconds. If any non-null object
 * is passed into this function as the `cancellable` argument, then this function will also install a `cancelTimeout` method
 * on it, which accepts a single optional mustResolve argument and which if subsequently invoked will cancel the timeout
 * and either resolve the promise (if mustResolve) or reject the promise (default), but ONLY if the timeout has not
 * triggered yet.
 *
 * @param {number} ms - the number of milliseconds to delay
 * @param {Object|DelayCancellable|*} [cancellable] - an arbitrary object onto which a `cancelTimeout` method will be installed
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

/**
 * Transforms the given result into a single Promise by applying Promise.all to the given result (if it's an Array);
 * otherwise by applying Promise.resolve to the given non-Array result. Note: Promise.resolve only wraps non-promises,
 * so there is no need to do any extra isPromise check for a single promise.
 *
 * @param {Promise[]|*[]|Promise|*} result - an Array of promises (and/or non-promise values); OR a single promise (or
 * non-promise value)
 * @returns {Promise} a single promise of the given non-Array result's result or of all of the given Array result's results
 */
function allOrOne(result) {
  return Array.isArray(result) ? Promise.all(result) : Promise.resolve(result);
}

/**
 * Returns a promise that will return a list of Success or Failure outcomes, each of which contains either a resolved
 * value or a rejected error, for the given promises in the same sequence as the given promises, when every one of the
 * given promises has resolved. The given array of `promises` can contain zero or more promises and/or non-promise
 * values. If any non-null object is passed into this function as the `cancellable` argument, then this function will
 * also install a `cancel` method on it, which expects no arguments and returns true if all of the promises have already
 * resolved; or false otherwise. If this `cancel` method is subsequently invoked, it will attempt to short-circuit the
 * `every` promise that is waiting for any remaining promises to complete by instead throwing a `CancelledError`, which
 * will contain a list of any resolved outcomes and a list of any unresolved promises.
 *
 * Note: The returned promise should NEVER reject (UNLESS it is cancelled via the `cancellable`), since it only resolves
 * with Success or Failure outcomes, which indicate whether their corresponding given promises resolved or failed.
 *
 * @param {Promise[]|*[]} promises - a list of promises from which to collect their outcomes
 * @param {Object|Cancellable|*} [cancellable] - an arbitrary object onto which a `cancel` method will be installed
 * @returns {Promise.<(Success|Failure)[]|CancelledError>} a promise that will resolve with a list of Success or Failure
 * outcomes for the given promises (unless cancelled); otherwise reject with a `CancelledError` (if cancelled)
 * @throws {Error} an error if the given `promises` is not an array
 */
function every(promises, cancellable) {
  if (!Array.isArray(promises)) {
    throw new Error('The `every` function only accepts an array of promises and/or non-promises');
  }
  const n = promises.length;
  if (n <= 0) {
    return Promise.resolve([]);
  }
  const last = n - 1;
  const outcomes = new Array(n);
  let completed = false;
  let cancelled = false;

  // Set up a cancel method on the given cancellable object (if any)
  if (cancellable && typeof cancellable === 'object') {
    cancellable.cancel = () => {
      cancelled = true;
      return completed;
    }
  }

  function next(i) {
    let p = promises[i];
    if (i > 0) {
      // If we are at any element other than the first and it's NOT a promise then simply collect its value and recurse
      if (!isPromiseLike(p)) {
        outcomes[i] = new Success(p);
        if (i < last) {
          // Short-circuit if cancelled by throwing a cancelled error with the outcomes collected so far
          if (cancelled) throw new CancelledError(outcomes.slice(0, i + 1), promises.slice(i + 1));
          return next(i + 1);
        }
        completed = true;
        return outcomes;
      }
    } else {
      // Ensure that we have a native promise at the first element to start the chain
      p = toPromise(p);
    }
    // The current element is now definitely a promise, so continue by calling its then method
    return p.then(
      value => {
        outcomes[i] = new Success(value);
        // If still not at the last element, then continue with a recursive call; otherwise return outcomes, since done
        if (i < last) {
          // Short-circuit if cancelled by throwing a cancelled error with the outcomes collected so far
          if (cancelled) throw new CancelledError(outcomes.slice(0, i + 1), promises.slice(i + 1));
          return next(i + 1);
        }
        completed = true;
        return outcomes;
      },
      err => {
        outcomes[i] = new Failure(err);
        // If still not at the last element, then continue with a recursive call; otherwise return results, since done
        if (i < last) {
          // Short-circuit if cancelled by throwing a cancelled error with the outcomes collected so far
          if (cancelled) throw new CancelledError(outcomes.slice(0, i + 1), promises.slice(i + 1));
          return next(i + 1);
        }
        completed = true;
        return outcomes;
      }
    );
  }

  // Start the process at the first element
  return next(0);
}

/**
 * Maps the given single promise (or promise-like object or non-promise value) to a native Promise of a Success or
 * Failure resolution. This function is similar to the `every` function, except that it only handles one promise.
 * Note: The returned promise should NEVER reject, since it only resolves to either a Success with the resolved value or
 * a Failure with the rejected error.
 * @param {Promise.<*>|PromiseLike|*} promise - the promise to be mapped
 * @returns {Promise.<(Success|Failure)>} a native Promise of a Success or Failure
 */
function one(promise) {
  return toPromise(promise).then(
    value => new Success(value),
    err => new Failure(err)
  );
}
