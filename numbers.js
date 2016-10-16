'use strict';

/**
 * Module containing utilities for working with numbers.
 * @module core-functions/numbers
 * @author Byron du Preez
 */
module.exports = {
  /** Returns true if the given value is a number; false otherwise. */
  isNumber: isNumber,
  /** Returns true if the given value is a number and finite; false otherwise. */
  isFiniteNumber: isFiniteNumber,
  /** Returns true if the value is Infinity, -Infinity or NaN; false otherwise. */
  isSpecialNumber: isSpecialNumber,
  /** Returns true if the number is NaN or if it is an instance of Number and its value is NaN; false otherwise. */
  isNaN: isNaN
};

/**
 * Returns true if the given value is a number; false otherwise.
 * Note that this also returns true for the non-finite numbers (NaN, Infinity, -Infinity) - to exclude these instead use
 * {@link isFiniteNumber} or do an extra check against {@link Number.isFinite}, but beware that the latter returns false
 * for instances of Number, e.g. Number.isFinite(new Number(1)) === false.
 * @param {*} value the value to check
 * @return {boolean} true if its a number; false otherwise
 */
function isNumber(value) {
  return typeof value === 'number' || value instanceof Number;
}

/**
 * Returns true if the given value is a number and finite; false otherwise.
 * Note that this also returns true for the non-finite numbers (NaN, Infinity, -Infinity) - to exclude these add an
 * extra check against {@link Number.isFinite}.
 * @param {*} value the value to check
 * @return {boolean} true if its a number; false otherwise
 */
function isFiniteNumber(value) {
  return (typeof value === 'number' && Number.isFinite(value)) ||
    (value instanceof Number && Number.isFinite(value.valueOf()));
}

/**
 * Returns true if the value is Infinity, -Infinity or NaN; false otherwise.
 * @param {*} value the value to check
 * @returns {boolean} true if special number; false otherwise
 */
function isSpecialNumber(value) {
  return value === +Infinity || value === -Infinity || (typeof value === 'number' && Number.isNaN(value)) ||
    (value instanceof Number && isSpecialNumber(value.valueOf()));
}

/**
 * Returns true if the number is NaN or if it is an instance of Number and its value is NaN (unlike
 * {@linkcode Number#isNaN}); false otherwise.
 * @param {*} value the value to check
 * @returns {boolean} true if NaN; false otherwise
 */
function isNaN(value) {
  return (typeof value === 'number' && Number.isNaN(value)) || (value instanceof Number && isNaN(value.valueOf()));
}

