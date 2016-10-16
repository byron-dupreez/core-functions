'use strict';

/**
 * Utilities for working with functions.
 * @module core-functions/functions
 * @author Byron du Preez
 */
module.exports = {
  /** Returns true if the given value is a function; false otherwise. */
  isFunction: isFunction,
  /** A simple no-operation function. */
  noop: noop
};

/**
 * Returns true if the given value is a function; false otherwise.
 * @param fn the "function" to test
 * @returns {boolean} true if function; false if not
 */
function isFunction(fn) {
  return typeof fn === 'function';
}

/**
 * A simple no-operation function.
 * @returns {undefined}
 */
function noop() {
  return undefined;
}

