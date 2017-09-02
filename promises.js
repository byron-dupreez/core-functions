'use strict';

const tries = require('./tries');
const Try = tries.Try;
const Success = tries.Success;
const Failure = tries.Failure;


/**
 * Module containing Promise utility functions.
 * @module core-functions/promises
 * @author Byron du Preez
 */
module.exports.isPromise = isPromise;
module.exports.isPromiseLike = isPromiseLike;
module.exports.toPromise = toPromise;
module.exports.wrap = wrap;
module.exports.try = attempt;
module.exports.delay = delay;
module.exports.allOrOne = allOrOne;
module.exports.every = every;
module.exports.one = one;
module.exports.flatten = flatten;
module.exports.chain = chain;
module.exports.installCancel = installCancel;
module.exports.installCancelTimeout = installCancelTimeout;
module.exports.avoidUnhandledPromiseRejectionWarning = avoidUnhandledPromiseRejectionWarning;

/** @deprecated */
module.exports.wrapMethod = wrapMethod;
/** @deprecated */
module.exports.wrapNamedMethod = wrapNamedMethod;

/**
 * An Error subclass thrown to cancel/short-circuit a promise that is waiting for a list of promises to resolve (see
 * {@link every}) or for a chained list of promise-returning function calls with inputs to resolve (see {@link chain}).
 * @property (Success|Failure)[]} resolvedOutcomes - a list of resolved outcomes
 * @property {Promise[]|*[]} unresolvedInputs - a list of unresolved inputs or promises
 * @property {Promise[]|*[]} unresolvedPromises - an alias for unresolvedInputs (for backward-compatibility)
 * @property {boolean} completed - whether all of the promises or chained function calls resolved prior to cancellation or not
 */
class CancelledError extends Error {
  /**
   * Constructs a new CancelledError.
   * @param {(Success|Failure)[]} resolvedOutcomes - the list of resolved outcomes
   * @param {*[]|Promise[]} unresolvedInputs - the list of unresolved inputs (or unresolved promises)
   */
  constructor(resolvedOutcomes, unresolvedInputs) {
    const doneCount = resolvedOutcomes ? resolvedOutcomes.length : 0;
    const incompleteCount = unresolvedInputs ? unresolvedInputs.length : 0;
    const totalCount = doneCount + incompleteCount;
    const message = 'Cancelled' + (resolvedOutcomes ? ` after resolving ${doneCount} outcome${doneCount !== 1 ? 's' : ''}${unresolvedInputs ? ` of ${totalCount} input${totalCount !== 1 ? 's' : ''}` : ''}` : '');
    super(message);
    // Object.defineProperty(this, 'message', {writable: false, enumerable: true, configurable: false});
    Object.defineProperty(this, 'name', {value: this.constructor.name, enumerable: false});
    Object.defineProperty(this, 'resolvedOutcomes', {value: resolvedOutcomes, enumerable: false});
    Object.defineProperty(this, 'unresolvedInputs', {value: unresolvedInputs, enumerable: false});
    Object.defineProperty(this, 'completed',
      {value: unresolvedInputs ? incompleteCount === 0 : undefined, enumerable: false}
    );
    // Alias for unresolvedInputs for backward-compatibility
    Object.defineProperty(this, 'unresolvedPromises', {value: unresolvedInputs, enumerable: false});
  }
}

module.exports.CancelledError = CancelledError;

class DelayCancelledError extends Error {
  /**
   * Constructs a new DelayCancelledError.
   * @param {number} delayMs - the original number of milliseconds of the delay
   * @param {number} atMs - the number of milliseconds at which the delay was cancelled
   */
  constructor(delayMs, atMs) {
    super(`Delay cancelled at ${atMs} ms of ${delayMs} ms`);
    Object.defineProperty(this, 'name', {value: this.constructor.name, enumerable: false});
    Object.defineProperty(this, 'delayMs', {value: delayMs, enumerable: false});
    Object.defineProperty(this, 'atMs', {value: atMs, enumerable: false});
  }
}

module.exports.DelayCancelledError = DelayCancelledError;

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
 * Wraps and converts the given callback-last Node-style function into a Promise-returning function, which when invoked
 * must be passed all of the wrapped function's arguments other than its last callback argument.
 *
 * NB: This function must be passed a Node-style function that accepts as its last parameter a Node-style callback that
 * in turn accepts 2 parameters: error; and data.
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
 *     setTimeout(() => {
 *       callback(null, 'Completed successfully');
 *     }, 5000);
 *   }
 *
 *   const promiseStyleFunction = Promises.wrap(nodeStyleFunction);
 *   ...
 *   promiseStyleFunction(arg1, arg2, ..., argN)
 *     .then(result => ...)
 *     .catch(err => ...);
 *
 * NB: If the function passed is actually a method on an object:
 *
 *   // crude example of a node-style method
 *   class Abc {
 *     nodeStyleMethod(arg1, arg2, ..., argN, callback) {
 *       // example synchronous invocation of callback with error
 *       if (!arg1) {
 *         callback(new Error('arg1 undefined'));
 *       }
 *       // example asynchronous invocation of callback with data
 *       setTimeout(function () {
 *         callback(null, 'Completed successfully);
 *       }, 5000);
 *     }
 *   }
 *
 * ... then ensure that you invoke the wrapped method on the target object by using one of the following approaches:
 *
 *   OPTION 1 - Use `call` (or `apply`) and pass the target object as its `thisArg`:
 *     Example:
 *       const promiseStyleMethod = Promises.wrap(Abc.prototype.nodeStyleMethod);
 *       ...
 *       const abc = new Abc();
 *       // OR: const promiseStyleMethod = Promises.wrap(abc.nodeStyleMethod);
 *
 *       promiseStyleMethod.call(abc, arg1, arg2, ..., argN)
 *         .then(result => ...)
 *         .catch(err => ...);
 *
 *   OPTION 2 - Install the wrapped method on the target object or on its prototype (with a different name to the method
 *              being wrapped) and then invoke the installed method on the target object:
 *     Example:
 *       Abc.prototype.promiseStyleMethod = Promises.wrap(Abc.prototype.nodeStyleMethod);
 *       ...
 *       const abc = new Abc();
 *       // OR: abc.promiseStyleMethod = Promises.wrap(abc.nodeStyleMethod);
 *
 *       abc.promiseStyleMethod(arg1, arg2, ..., argN)
 *         .then(result => ...)
 *         .catch(err => ...);
 *
 *   OPTION 3 - Call `wrap` using a bind on the method, but note that this will permanently bind the wrapped method to
 *              the bound object:
 *     Example:
 *       const abc = new Abc();
 *       Promises.wrap(abc.nodeStyleMethod.bind(abc))(arg1, arg2, ..., argN)
 *         .then(result => ...)
 *         .catch(err => ...);
 *
 *   WORST OPTION 4 - Use the DEPRECATED `wrapMethod` function below, but note that this will ALSO permanently bind the
 *                    wrapped method to the passed object.
 *
 *   NOTE: Prefer the more flexible OPTION 1 or 2 over the less flexible OPTION 3 or 4
 *
 * @param {Function} fn - a Node-callback style function to "promisify"
 * @returns {function(...args: *): Promise.<R>} a function, which when invoked will return a new Promise that will
 * resolve or reject based on the outcome of the callback
 * @template R
 */
function wrap(fn) {
  return function () {
    const self = this;
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
        fn.apply(self, args);
      }
    );
  };
}

/**
 * @deprecated Use `wrap` instead - see OPTION 1 or 2 in its JDoc comments
 * Wraps and converts the given callback-last Node-style method into a promise-returning function, which will later
 * apply the method to the given object and which accepts all of the wrapped method's arguments other than its last
 * callback argument.
 * NB: This function must be passed an object and a Node-style method, which is defined on the object and which accepts
 * as its last parameter a Node-style callback that in turn accepts 2 parameters: error; and data.
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
 * @returns {function(...args: *): Promise.<R>} a function, which when invoked will return a new Promise that will
 * resolve or reject based on the outcome of the callback
 * @template R
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
 * @deprecated Use `wrap` instead - see OPTION 1 or 2 in its JDoc comments
 * Returns a function that will wrap and convert a named callback-last Node-style method into a Promise-returning
 * function.
 * @param {Object} obj - the object on which to execute the given method
 * @param {string} methodName - the name of a Node callback-last style method (of the given object) to promisify
 * @returns {function(...args: *): Promise.<R>}
 * @template R
 */
function wrapNamedMethod(obj, methodName) {
  return wrapMethod(obj, obj[methodName]);
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
 * is passed into this function as the `cancellable` argument, then this function will also install a `cancelTimeout`
 * method on it (see {@link installCancelTimeout}), which accepts a single optional mustResolve argument and which if
 * subsequently invoked will cancel the timeout and either resolve the promise (if mustResolve is true) or reject the
 * promise with a new DelayCancelledError (default), but ONLY if the timeout has NOT triggered yet.
 *
 * @param {number} ms - the number of milliseconds to delay
 * @param {Object|DelayCancellable|*} [cancellable] - an arbitrary object onto which a `cancelTimeout` method will be installed
 * @returns {Promise} the timeout Promise
 */
function delay(ms, cancellable) {
  let triggered = false;
  const startMs = Date.now();
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      triggered = true;
      resolve(triggered);
    }, ms);

    // Install a new cancelTimeout method (or extend the existing one) on the given cancellable object (if any)
    installCancelTimeout(cancellable, (mustResolve) => {
      if (!triggered) {
        try {
          clearTimeout(timeout);
        } catch (err) {
          console.error('Failed to clear timeout', err.stack);
        } finally {
          if (mustResolve) {
            resolve(triggered);
          } else {
            reject(new DelayCancelledError(ms, Date.now() - startMs));
          }
        }
      }
      return triggered;
    });
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
 * also install a `cancel` method on it (see {@link installCancel}), which expects no arguments and returns true if all
 * of the promises have already resolved; or false otherwise. If this `cancel` method is subsequently invoked, it will
 * attempt to short-circuit the current `every` promise that is waiting for all of its remaining promises to complete by
 * instead throwing a `CancelledError`, which will contain a list of any resolved outcomes and a list of any unresolved
 * promises.
 *
 * Note: The returned promise should NEVER reject (UNLESS it is cancelled via the `cancellable`), since it only resolves
 * with Success or Failure outcomes, which indicate whether their corresponding given promises resolved or failed.
 *
 * @param {Promise[]|*[]} promises - a list of promises from which to collect their outcomes
 * @param {Object|Cancellable|*} [cancellable] - an arbitrary object onto which a `cancel` method will be installed
 * @returns {Promise.<Outcomes|CancelledError>} a promise that will resolve with a list of Success or Failure outcomes
 * for the given promises (if not cancelled); or reject with a `CancelledError` (if cancelled)
 * @throws {Error} an error if the given `promises` is not an array
 */
function every(promises, cancellable) {
  if (!Array.isArray(promises)) {
    throw new Error('The `every` function only accepts `promises` as an array of promises and/or non-promises');
  }
  const n = promises.length;
  if (n <= 0) {
    return Promise.resolve([]);
  }
  const last = n - 1;
  const outcomes = new Array(n);
  let completed = false;
  let cancelled = false;

  // Install or extend the cancel method on the given cancellable object (if any)
  installCancel(cancellable, () => {
    if (!completed) cancelled = true;
    return completed;
  });

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
        // If still not at the last element, then continue with a recursive call; otherwise return outcomes, since done
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

/**
 * Recursively flattens the given value, which is expected to be typically either a single promise or an array of
 * promises, into either the given value (if its neither a promise nor an array of at least one promise) or into a
 * single promise containing either a non-promise value or an array of Success or Failure non-promise outcomes.
 *
 * If any non-null object is passed into this function as the `cancellable` argument, then this function will also
 * install a `cancel` method on it (see {@link installCancel}), which expects no arguments and returns true if all of
 * the promises have already resolved; or false otherwise. If this `cancel` method is subsequently invoked, it will
 * attempt to short-circuit any current `every` promise that is waiting for all of its remaining promises to complete by
 * instead throwing a `CancelledError`.
 *
 * @param {Promise|Promise[]|*} value - the value to be flattened
 * @param {Object|Cancellable|*} [cancellable] - an arbitrary object onto which a `cancel` method will be installed
 * @param {Object|undefined} [opts] - optional options to use to alter the behaviour of this flatten function
 * @param {Object|undefined} [opts.skipSimplifyOutcomes] - whether to skip applying `Try.simplify` to any list of outcomes or not (defaults to simplifying with `Try.simplify`)
 * @returns {*|Promise.<*>|Promise.<Outcomes|CancelledError>} the given non-promise value or a single promise of one or
 * more non-promise values/outcomes (if not cancelled); or a rejected promise with a `CancelledError` (if cancelled)
 */
function flatten(value, cancellable, opts) {
  if (isPromiseLike(value)) {
    // If value is a promise or promise-like then flatten its resolved value or rejected error
    const p = value.then(v => flatten(v, cancellable, opts));
    avoidUnhandledPromiseRejectionWarning(p);
    return p;
  }
  const isArray = Array.isArray(value);
  if (isArray && value.some(v => isPromiseLike(v))) {
    // If value is an array containing at least one Promise or promise-like, then first flatten each of its promises and
    // then use the `every` function to "flatten" all of its resulting promises into a single promise of "simplified" outcomes
    const promise = every(value.map(v => flatten(v, cancellable, opts)), cancellable);
    return !opts || !opts.skipSimplifyOutcomes ? promise.then(outcomes => Try.simplify(outcomes)) : promise;

  } else if (value instanceof Success) {
    // If value is a Success outcome, then flatten its Success value too
    return value.map(v => flatten(v, cancellable, opts));

  } else if (isArray && value.some(v => v instanceof Success)) {
    // If value is an array containing at least one Success outcome, then flatten any Success values too
    const outcomes = value.map(v => v instanceof Success ? v.map(vv => flatten(vv, cancellable, opts)) : v);
    return !opts || !opts.skipSimplifyOutcomes ? Try.simplify(outcomes) : outcomes;
  }
  return value;
}

/**
 * Returns a promise that will return a list of Success or Failure outcomes generated by sequentially chaining calls to
 * the given promise-returning function `f` with each successive input from the given array of `inputs`, such that the
 * nth call will only be applied to the nth input after the promise of the nth - 1 call has resolved. The list of
 * outcomes returned will be in the same sequence and have the same size as the given list of `inputs`. If any
 * non-null object is passed as the `cancellable` argument, then this function will also install a `cancel` method on
 * it (see {@link installCancel}), which expects no arguments and returns true if the chain has already completed; or
 * false otherwise. If this `cancel` method is subsequently invoked, it will attempt to prematurely cancel the `chain`
 * of calls by instead throwing a `CancelledError`, which will contain a list of any resolved outcomes and any
 * unresolved inputs and which will result in a rejected promise being returned.
 *
 * Note: The returned promise should NEVER reject (UNLESS it is cancelled via the `cancellable`), since it only resolves
 * with Success or Failure outcomes, which indicate whether the function `f` succeeded or failed for their corresponding
 * input from the given list of `inputs`.
 *
 * @param {function(input: *, index: number, inputs: *[], prevOutcomes: Outcomes): (Promise.<*>|*)} f - a function that
 * must, at least, accept a single input to be processed, but can optionally also accept: the index at which the input
 * appears in the given list of `inputs`; the entire list of `inputs`; and a list of any and all of the Success and/or
 * Failure outcomes collected so far from the first index inputs, and ideally returns a promise that will resolve with
 * the result returned or reject with the error thrown
 * @param {*[]} inputs - the list of inputs to be passed one at a time to the given function
 * @param {Object|Cancellable|*} [cancellable] - an arbitrary object onto which a `cancel` method will be installed
 * @returns {Promise.<(Success|Failure)[]|CancelledError>} a promise that will resolve with a list of Success or Failure
 * outcomes (unless cancelled); otherwise reject with a `CancelledError` (if cancelled)
 * @throws {Error} an error if the given `f` is not a function or the given `inputs` is not an array
 */
function chain(f, inputs, cancellable) {
  if (typeof f !== "function") {
    throw new Error('The `chain` function only accepts `f` as a function');
  }
  if (!Array.isArray(inputs)) {
    throw new Error('The `chain` function only accepts `inputs` as an array');
  }
  const n = inputs.length;
  if (n <= 0) {
    return Promise.resolve([]);
  }
  const last = n - 1;
  const outcomes = new Array(n);
  let completed = false;
  let cancelled = false;

  // Install or extend the cancel method on the given cancellable object (if any)
  installCancel(cancellable, () => {
    if (!completed) cancelled = true;
    return completed;
  });

  function next(i) {
    return attempt(() => f(inputs[i], i, inputs, outcomes.slice(0, i))).then(
      value => {
        outcomes[i] = new Success(value);
        // If still not at the last input, then continue with a recursive call; otherwise return outcomes, since done
        if (i < last) {
          // Short-circuit if cancelled by throwing a cancelled error with the outcomes collected so far
          if (cancelled) throw new CancelledError(outcomes.slice(0, i + 1), inputs.slice(i + 1));
          return next(i + 1);
        }
        completed = true;
        return outcomes;
      },
      err => {
        outcomes[i] = new Failure(err);
        // If still not at the last input, then continue with a recursive call; otherwise return outcomes, since done
        if (i < last) {
          // Short-circuit if cancelled by throwing a cancelled error with the outcomes collected so far
          if (cancelled) throw new CancelledError(outcomes.slice(0, i + 1), inputs.slice(i + 1));
          return next(i + 1);
        }
        completed = true;
        return outcomes;
      }
    );
  }

  // Start the process at the first input
  return next(0);
}

/**
 * Installs the given cancel function onto the given cancellable object if the cancellable does NOT already have a
 * `cancel` method; otherwise installs a new `cancel` method that will invoke both the cancellable's original `cancel`
 * method and the given cancel function.
 * @param {Cancellable} cancellable - the cancellable object onto which to install or replace its `cancel` method
 * @param {function(): boolean} cancel - the new cancel function to be installed
 */
function installCancel(cancellable, cancel) {
  if (cancellable && typeof cancellable === 'object' && typeof cancel === 'function') {
    const origCancel = cancellable.cancel;
    if (origCancel) {
      // Cancellable already has an installed cancel method, so instead replace/extend it
      cancellable.cancel = () => {
        const origCompleted = origCancel.call(cancellable);
        const newCompleted = cancel.call(cancellable);
        return newCompleted && origCompleted;
      }
    } else {
      // Cancellable does not yet have a cancel method installed on it, so just bind the new cancel function to it
      cancellable.cancel = cancel;
    }
  }
}

/**
 * Installs the given cancelTimeout function onto the given cancellable object if the cancellable does NOT already have
 * a `cancelTimeout` method; otherwise installs a new `cancelTimeout` method that will invoke both the cancellable's
 * original `cancelTimeout` method and the given cancelTimeout function.
 * @param {DelayCancellable} cancellable - the cancellable object onto which to install or replace its `cancelTimeout` method
 * @param {function(mustResolve: boolean): boolean} cancelTimeout - the new cancelTimeout function to be installed
 */
function installCancelTimeout(cancellable, cancelTimeout) {
  if (cancellable && typeof cancellable === 'object' && typeof cancelTimeout === 'function') {
    const origCancelTimeout = cancellable.cancelTimeout;
    if (origCancelTimeout) {
      // Cancellable already has an installed cancelTimeout method, so instead replace/extend it
      cancellable.cancelTimeout = (mustResolve) => {
        const origTriggered = origCancelTimeout.call(cancellable, mustResolve);
        const newTriggered = cancelTimeout.call(cancellable, mustResolve);
        return newTriggered && origTriggered;
      }
    } else {
      // Cancellable does not yet have a cancelTimeout method installed on it, so just bind the new cancelTimeout function to it
      cancellable.cancelTimeout = cancelTimeout;
    }
  }
}

/**
 * Attaches an arbitrary `catch` clause to the given promise to avoid an unneeded UnhandledPromiseRejectionWarning.
 * @param {Promise|PromiseLike|*} p - a promise to which to attach an arbitrary `catch`
 */
function avoidUnhandledPromiseRejectionWarning(p) {
  if (p && p.catch) {
    p.catch(err => {
      // Avoid unneeded warnings: (node:18304) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: ...): ...
      console.log(`Avoided UnhandledPromiseRejectionWarning - ${err}`);
    });
  }
}