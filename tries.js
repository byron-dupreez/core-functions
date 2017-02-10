'use strict';

const errorMessages = {
  NoValueOrError: 'No value or error'
};

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
}

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

module.exports = {
  Try: Try,
  Success: Success,
  Failure: Failure
};