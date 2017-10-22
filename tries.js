'use strict';

exports._ = '_'; //IDE workaround

const errorMessages = {
  NoValueOrError: 'No value or error'
};

/**
 * Optional options to use to alter the behaviour of the `flatten` function
 * @namespace {Object.<string, TryFlattenOpts>}
 */
const defaultFlattenOpts = {
  keepFailures: {keepFailures: true},
  raiseFailure: {keepFailures: false}
};
exports.defaultFlattenOpts = defaultFlattenOpts;

/**
 * Module containing Try, Success & Failure classes modelled after the same named classes from Scala developed by LAMP/EPFL.
 * @module core-functions/tries
 * @author Byron du Preez
 */

/**
 * A Try represents the outcome of a function that either threw an error or successfully returned a value. Instances of
 * Try should be either instances of {@link Success} of {@link Failure} - don't bother constructing instances of Try
 * unless you really need undecided outcomes.
 */
class Try {
  constructor() {
    // Automatically flatten if any given argument is already a Try
    if (arguments.length > 0 && (arguments[0] instanceof Try)) return arguments[0];
  }

  /**
   * Attempts the given function f and returns: its value if that's already a Try; or a Success of its successfully
   * completed value; or a Failure of the error that it threw. If f is not a function, simply returns a Success of the
   * given f value.
   * @param {function():*|*} f - the no-args function to attempt or the success value to use, if f is not a function
   * @returns {Success|Failure} a Success or Failure depending on the outcome of f
   */
  static attempt(f) {
    try {
      const value = typeof f === 'function' ? f() : f;
      return value instanceof Try ? value : new Success(value);
    } catch (err) {
      return new Failure(err);
    }
  }

  /**
   * Returns true if this is a Failure, false otherwise.
   * @returns {boolean} true if this is a Failure, false otherwise
   */
  isFailure() {
    return false;
  }

  /**
   * Returns true if this is a Success, false otherwise.
   * @returns {boolean} true if this is a Success, false otherwise
   */
  isSuccess() {
    return false;
  }

  /**
   * Returns its value if this is a Success or throws its error if this is a Failure; otherwise throw a 'No value or
   * error' Error (with message `errorMessages.NoValueOrError`) if this is neither a Success nor a Failure.
   * @returns its value if this is a Success
   * @throws its error if this is a Failure or a 'No value or error' Error if this is neither a Success nor a Failure
   */
  get() {
    throw new Error(errorMessages.NoValueOrError);
  }

  /**
   * Returns its value if this is a Success; otherwise the resolved defaultToUse. Any resolved defaultValue that results
   * in a Try will be unwrapped using its `get` method
   * @param {Function|*} defaultToUse - the default value to use or no-args function to apply to get the default value
   * @returns {*} its value if this is a Success; otherwise the resolved defaultToUse
   * @throws an error if this isn't a Success and defaultToUse throws an error
   */
  getOrElse(defaultToUse) {
    return Try.try(defaultToUse).get()
  }

  /**
   * Returns this if it's a Success; otherwise a Try of the resolved defaultToUse.
   * @param {Function|*} defaultToUse - the default value to use or no-args function to apply to get the default value
   * @returns {Success|Failure|Try} this if it's a Success; otherwise a Try of the resolved defaultToUse
   */
  orElse(defaultToUse) {
    return Try.try(defaultToUse);
  }

  /**
   * Maps this to a new Try by applying the function `s` to its value if this is a Success or by applying the function
   * `f` to its error if this is a Failure; otherwise just returns this (if 's' is not a function and this is a Success;
   * or if 'f' is not a function and this is a Failure; or if this is neither a Success nor a Failure).
   * Note: Automatically flattens any resulting Try of a Try (hence no need for flatMap or flatten)
   * @param {Function|*} [s] - the function to apply if this is a Success
   * @param {Function|*} [f] - the function to apply if this is a Failure
   * @returns {Success|Failure|Try} the resulting Success or Failure
   */
  map(s, f) {
    return this;
  }

  /**
   * Maps this to a new Try by applying the function `f` to its error if this is a Failure; otherwise just returns this
   * (if this is not a Failure or if 'f' is not a function).
   * Note: Automatically flattens any resulting Try of a Try (hence no need for recoverWith or flatten)
   * @param {Function|*} [f] - the function to apply if this is a Failure
   * @returns {Success|Failure|Try} the resulting Success or Failure
   */
  recover(f) {
    return this;
  }

  /**
   * Applies the given function `f` if this is a Success, otherwise does nothing if this is a Failure.
   * Note: If `f` throws, then this method may throw an error.
   * @param {Function} f - the function to apply if this is a Success
   * @throws {Error} if this is a Success and `f` throws an error, then this method will throw an error
   */
  forEach(f) {
  }

  toString() {
    return `Try`;
  }

  /**
   * Converts this Try into an appropriate Promise. If this is a Success then returns a resolved Promise with its value;
   * otherwise if its a Failure then returns a rejected Promise with its error; otherwise if its a Try then returns a
   * rejected Promise with a 'No value or error' Error (with message `errorMessages.NoValueOrError`).
   * @returns {Promise.<*>} a Promise resolved with its value if this is a Success; or rejected with its error if this
   * is a Failure; or rejected with a 'No value or error' Error if this is neither a Success nor a Failure.
   */
  toPromise() {
    return Promise.reject(new Error(errorMessages.NoValueOrError));
  }

  /**
   * Simplifies the given list of Success and/or Failure outcomes to a list of values if and ONLY if every outcome is a
   * Success; otherwise simply returns the given list.
   * @param {Array.<*>|Outcomes} outcomes - a list of Success and/or Failure outcomes to potentially simplify
   * @returns {Array.<*>|Outcomes} a simplified list of Success values (if all were Success outcomes) or the given list
   */
  static simplify(outcomes) {
    return outcomes.every(o => o instanceof Success) ? outcomes.map(o => o.value) : outcomes;
  }

  /**
   * Returns a count of the number of outcomes that match the given predicate in the given list of outcomes.
   * @param {Outcomes} outcomes - a list of outcomes
   * @param {function(outcome: Outcome): boolean} predicate - the predicate to use to determine whether an outcome should be counted or not
   * @returns {number} the number of outcomes that match the given predicate
   */
  static count(outcomes, predicate) {
    return outcomes.reduce((acc, o) => acc + (predicate(o) ? 1 : 0), 0);
  }

  /**
   * Returns a count of the number of Success outcomes (if strict) or non-Failure outcomes (if not strict) in the given
   * list of outcomes.
   * @param {Outcomes|*[]} outcomes - a list of outcomes
   * @param {boolean|undefined} [strict] - whether to strictly count ONLY Success outcomes as successes (if true) or count any non-Failure outcomes as successes (if not true - default)
   * @returns {number} the number of Success or non-Failure outcomes
   */
  static countSuccess(outcomes, strict) {
    const isSuccess = strict ? o => o instanceof Success : o => !(o instanceof Failure);
    return outcomes.reduce((acc, o) => acc + (isSuccess(o) ? 1 : 0), 0);
  }

  /**
   * Returns a count of the number of Failure outcomes in the given list of outcomes.
   * @param {Outcomes} outcomes - a list of outcomes
   * @returns {number} the number of Failure outcomes
   */
  static countFailure(outcomes) {
    return outcomes.reduce((acc, o) => acc + (o instanceof Failure ? 1 : 0), 0);
  }

  /**
   * Returns a description of the number of successes followed by the number of failures in the given list of outcomes.
   * @param {Outcomes|*[]} outcomes - a list of outcomes (or of any results)
   * @param {boolean|undefined} [strict] - whether to strictly count ONLY Success outcomes as successes (if true) or count any non-Failure outcomes as successes (if not true - default)
   * @returns {string} a description of the number of successes and the number of failures
   */
  static describeSuccessAndFailureCounts(outcomes, strict) {
    const successCount = Try.countSuccess(outcomes, strict);
    const failureCount = Try.countFailure(outcomes);

    const successes = successCount > 0 ? `${successCount} success${successCount !== 1 ? 'es' : ''}` : undefined;
    const failures = `${failureCount} failure${failureCount !== 1 ? 's' : ''}`;

    return successCount > 0 ?
      failureCount > 0 ? `${successes} & ${failures}` : successes :
      failures;
  }

  /**
   * Recursively flattens the given value, which is expected to be typically zero or more Try values containing zero or
   * more Try values (containing ...), by unpacking/flattening Array and Try values up to the specified depth. If depth
   * is deep enough to flatten all Array & Try values, then returns either a single successful value (if the given value
   * is effectively a single value) or a single flattened array of successful values or throws the error of the first
   * Failure found (if any and if opts.keepFailures is false).
   * @param {*|*[]|Outcome|Outcomes} value - the value to be flattened
   * @param {number|undefined} [depth] - the optional maximum depth to which to flatten recursively (defaults to MAX_SAFE_INTEGER if undefined)
   * @param {TryFlattenOpts|undefined} [opts] - optional options to use to alter the behaviour of this static `flatten` function
   * @returns {*|*[]} a single successful value or an array of zero or more successful values or throws an error
   * @throws {Error} the error of the first Failure found (if any and opts.keepFailures is false)
   */
  static flatten(value, depth, opts) {
    const maxDepth = depth === undefined ? Number.MAX_SAFE_INTEGER : depth;
    const TryType = opts && opts.keepFailures ? Success : Try;
    const history = new WeakMap();

    function unpack(value, depth) {
      const isObject = value && typeof value === 'object';

      // Avoid circular references
      if (isObject && history.has(value)) {
        return history.get(value);
      }

      const isTryType = value instanceof TryType;
      const isArray = Array.isArray(value);
      const v = isTryType ? value.get() : isArray ? new Array(value.length) : value;

      if (isObject) history.set(value, v);

      if (isTryType) {
        // Recurse deeper if maximum depth has not been reached yet
        if (depth > 0) {
          const u = unpack(v, depth - 1);
          if (isObject) history.set(value, u); // rewrite history with deeper result
          return u;
        }
        return v;
      }

      if (isArray) {
        // Recurse deeper if maximum depth has not been reached yet & if its still worthwhile to do so
        const mustTraverse = depth > 0 && value.some(e => e instanceof TryType || Array.isArray(e));
        for (let i = 0; i < value.length; ++i) {
          const e = value[i];
          const ev = e instanceof TryType ? e.get() : e;
          v[i] = mustTraverse ? unpack(ev, depth - 1) : ev;
        }
        return v;
      }

      return v;
    }

    return unpack(value, maxDepth);
  }

  /**
   * Recursively searches for a Failure on the given value, which is expected to be typically one or more Try values
   * containing one or more Try values (containing ...).
   * @param {*|*[]|Outcome|Outcomes} value - the value to be recursively searched
   * @param {number|undefined} [depth] - the optional maximum depth to which to search recursively (defaults to MAX_SAFE_INTEGER if undefined)
   * @returns {Failure|undefined} the first Failure found (if any); otherwise undefined
   */
  static findFailure(value, depth) {
    const maxDepth = depth === undefined ? Number.MAX_SAFE_INTEGER : depth;
    const history = new WeakMap();

    function find(value, depth) {
      // Avoid circular references
      if (value && typeof value === 'object') {
        if (history.has(value))
          return undefined;
        history.set(value, value);
      }

      if (value instanceof Failure)
        return value;

      if (value instanceof Success) {
        // Search deeper if maximum depth has not been reached yet
        return depth > 0 ? find(value.value, depth - 1) : undefined;
      }

      if (Array.isArray(value)) {
        // Recurse deeper if maximum depth has not been reached yet & if its still worthwhile to do so (otherwise just
        // return undefined)
        const f = value.find(e => e instanceof Failure);
        // const f = depth > 0 ? value.find(e => e instanceof Failure) : undefined;
        if (f)
          return f;

        // Search deeper if maximum depth has not been reached yet & if its still worthwhile to do so
        if (depth > 0 && value.some(e => (e instanceof Success) || Array.isArray(e))) {
          for (let e of value) {
            const f = find(e instanceof Success ? e.value : e, depth - 1);
            if (f)
              return f;
          }
        }
      }
      return undefined;
    }

    return find(value, maxDepth);
  }

}

exports.Try = Try;

/**
 * Synonym for {@linkcode Try.attempt}
 * @type {function(f: function():*|*)}: (Success|Failure)
 */
Try.try = Try.attempt;
Try.errorMessages = errorMessages;

/**
 * A Success represents a successful execution of a function and contains the value returned by the function.
 */
class Success extends Try {
  constructor(value) {
    // Automatically flatten if value is already a Try
    if (value instanceof Try) return value;
    super();
    // Set an enumerable, non-configurable, read-only value property to the given value
    Object.defineProperty(this, 'value', {value: value, enumerable: true});
  }

  isFailure() {
    return false;
  }

  isSuccess() {
    return true;
  }

  get() {
    return this.value;
  }

  getOrElse(defaultToUse) {
    return this.value;
  }

  orElse(defaultFn) {
    return this;
  }

  map(s, f) {
    return typeof s === "function" ? Try.try(() => s(this.value)) : this;
  }

  recover(f) {
    return this;
  }

  forEach(f) {
    f(this.get());
  }

  toString() {
    return `Success(${this.value})`;
  }

  toPromise() {
    return Promise.resolve(this.value);
  }
}

exports.Success = Success;

/**
 * A Failure represents a failed execution of a function and contains the error thrown by the function
 */
class Failure extends Try {
  constructor(error) {
    // Automatically flatten if error is already a Try
    if (error instanceof Try) return error;
    super();
    // Set an enumerable, non-configurable, read-only error property to the given error
    Object.defineProperty(this, 'error', {value: error, enumerable: true});
  }

  isFailure() {
    return true;
  }

  isSuccess() {
    return false;
  }

  get() {
    throw this.error;
  }

  getOrElse(defaultToUse) {
    return Try.try(defaultToUse).get()
  }

  orElse(defaultToUse) {
    return Try.try(defaultToUse);
  }

  map(s, f) {
    return this.recover(f);
  }

  recover(f) {
    return typeof f === "function" ? Try.try(() => f(this.error)) : this;
  }

  forEach(f) {
  }

  toString() {
    return `Failure(${this.error})`;
  }

  toPromise() {
    return Promise.reject(this.error);
  }
}

exports.Failure = Failure;