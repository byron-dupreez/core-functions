'use strict';

const Numbers = require('./numbers');

/**
 * Module containing utilities for working with strings.
 * @module core-functions/strings
 * @author Byron du Preez
 */
module.exports = {
  /** Returns true if the given value is a string; false otherwise */
  isString: isString,
  /** Returns true if the given string is blank (i.e. undefined, null, empty or contains only whitespace); false otherwise */
  isBlank: isBlank,
  /** Returns true if the given string is NOT blank (i.e. NOT undefined, null, empty or contains only whitespace); false otherwise */
  isNotBlank: isNotBlank,
  /** Trims the given value if it is a string; otherwise returns a non-string value as is */
  trim: trim,
  /**
   * Alias for trim
   * @deprecated since 1.1.0
   */
  safeTrim: trim,
  /** Trims the given value (if it's a string) or returns an empty string (if it's undefined or null); otherwise returns the non-undefined, non-null, non-string value as is. */
  trimOrEmpty: trimOrEmpty,
  /** Returns the given value as a string with special case handling for various types */
  stringify: stringify,
  nthIndexOf: nthIndexOf
};

/**
 * Returns true if the given value is a string; false otherwise.
 * @param {*} value the value to check
 * @return {boolean} true if its a string; false otherwise
 */
function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

/**
 * Returns true if the given string is blank (i.e. undefined, null, empty or contains only whitespace); false otherwise.
 * @param {string|String} s the string to check
 * @return {boolean} true if blank; false otherwise
 */
function isBlank(s) {
  return !s || (s.trim && !s.trim());
}

/**
 * Returns true if the given string is NOT blank (i.e. NOT undefined, null, empty or contains only whitespace); false
 * otherwise.
 * @param {string|String} s the string to check
 * @return {boolean} true if NOT blank; false otherwise
 */
function isNotBlank(s) {
  return s && (!s.trim || s.trim());
}

/**
 * Trims the given value if it is a string; otherwise returns a non-string value as is.
 * @param {*} value the value to trim
 * @returns {string|*} the trimmed string or the original non-string value
 */
function trim(value) {
  return typeof value === 'string' || value instanceof String ? value.trim() : value;
}

/**
 * Trims the given value (if it's a string) or returns an empty string (if it's undefined or null); otherwise returns
 * the non-undefined, non-null, non-string value as is.
 * @param {*} value the value to trim
 * @returns {string|*} the trimmed string; an empty string; or the original non-undefined, non-null, non-string value
 */
function trimOrEmpty(value) {
  return typeof value === 'string' || value instanceof String ? value.trim() :
    value === undefined || value === null ? '' : value;
}

/**
 * Returns the given value as a string with special case handling for string, String, undefined and special numbers
 * (i.e. Infinity, -Infinity and NaN), because string & String are already strings and {@linkcode JSON#stringify}
 * converts: Infinity, -Infinity and NaN to 'null'; an Error to '{}'; and undefined to undefined (not 'undefined').
 * @param {*} value the value to stringify
 * @returns {string} the value as a string
 */
function stringify(value) {
  return value === undefined ? `${value}` :
    typeof value === 'string' ? value :
      value instanceof String ? value.valueOf() :
        Numbers.isSpecialNumber(value) || value instanceof Error ? `${value}` :
          typeof value === 'function' ? isNotBlank(value.name) ? `[Function: ${value.name}]` : '[Function: anonymous]' :
            Array.isArray(value) ? `[${value.map(stringify).join(", ")}]` :
              JSON.stringify(value);
}

/**
 * Returns the index of the nth occurrence of the given searchValue in the given string (if any); otherwise returns -1.
 * @param {string} s - the string to search
 * @param {string} searchValue - the value to search for in the string
 * @param {number} nth - the number of occurrences to traverse through to find the nth occurrence
 * @returns {number} the index of the nth occurrence of the given searchValue in the given string (if any); otherwise returns -1
 */
function nthIndexOf(s, searchValue, nth) {
  if (nth < 1) return -1;
  let index = 0;
  for (let i = 0; i < nth; ++i) {
    if (i > 0) {
      index += searchValue.length;
    }

    index = s.indexOf(searchValue, index);

    if (index === -1) {
      break;
    }
  }
  return index;
}