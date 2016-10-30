'use strict';

const Numbers = require('./numbers');

/**
 * Module containing utilities for working with objects.
 * @module core-functions/objects
 * @author Byron du Preez
 */
module.exports = {
  /** Returns the standard valueOf of the given value if defined; otherwise returns the value as is */
  valueOf: valueOf
};

/**
 * Returns the standard valueOf of the given value (if defined and if it has a valueOf function, which should be true of
 * all values); otherwise returns the given value as is.
 * @param {*} value - the value to which to apply its valueOf function (if any)
 * @returns {*} the valueOf the value or the original value
 */
function valueOf(value) {
  return value && typeof value.valueOf === 'function' ? value.valueOf() : value;
}
