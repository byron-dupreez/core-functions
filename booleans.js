'use strict';

/**
 * Utilities for working with booleans.
 * @module core-functions/booleans
 * @author Byron du Preez
 */
module.exports.isBoolean = isBoolean;
module.exports.isTrueOrFalse = isTrueOrFalse;

/**
 * Returns true if the given value is actually a boolean or Boolean (i.e. is explicitly defined as boolean); false
 * otherwise. Useful for checking if a configurable "boolean" value is actually configured or not, in order to decide
 * whether to use it or instead use another source.
 * @param {*} value the value to check
 * @returns {boolean} true if really true or false; false otherwise
 */
function isBoolean(value) {
  return typeof value === 'boolean' || value instanceof Boolean;
}

/**
 * Returns true if the given value actually contains true or false (i.e. is explicitly defined as boolean) or is a
 * Boolean; false otherwise. Useful for checking if a configurable "boolean" value is actually configured or not in
 * order to decide whether to use it or instead use another source.
 * @param {*} value the value to check
 * @returns {boolean} true if really true or false; false otherwise
 */
function isTrueOrFalse(value) {
  //Redundant - effectively an alias for isBoolean, since end results are same, but maybe do a micro-benchmark on the two to decide which to keep
  return value === true || value === false || value instanceof Boolean;
}

