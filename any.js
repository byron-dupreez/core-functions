'use strict';

/**
 * Module containing generic utilities for working with any type of value.
 * @module core-functions/any
 * @author Byron du Preez
 */
module.exports = {
  defined: defined,
  notDefined: notDefined,
  valueOf: valueOf
};

/**
 * Determines whether the given value is defined (i.e. NOT undefined and NOT null) or not.
 * @param {*} value - the value to test
 * @return {boolean} return true if defined; false otherwise
 */
function defined(value) {
  return value !== undefined && value !== null;
}

/**
 * Determines whether the given value is NOT defined (i.e. undefined or null) or not.
 * @param {*} value - the value to test
 * @return {boolean} return true if NOT defined; false otherwise
 */
function notDefined(value) {
  return value === undefined || value === null;
}

/**
 * Safely applies the `valueOf` method to the given value (if it is defined & if it has a `valueOf` method, which should
 * be true of all values); otherwise returns the given value as is.
 * @param {*} value - the value to which to apply its `valueOf` method (if any)
 * @returns {*} the result of applying the `valueOf` method to the given value or the given value (if it has no `valueOf` method)
 */
function valueOf(value) {
  return value && typeof value.valueOf === 'function' ? value.valueOf() : value;
}

