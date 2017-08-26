'use strict';

// noinspection JSUnusedGlobalSymbols
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
 * Returns the given value as a string with special case handling for undefined, null, strings, numbers, booleans,
 * Strings, Numbers, Booleans, Errors, Functions, Arrays, Objects and special numbers (i.e. Infinity, -Infinity and NaN)
 * and also handles circular dependencies. Similar to {@linkcode JSON#stringify}, but shows more about the given value
 * than JSON.stringify does, for example:
 * - JSON.stringify(undefined) returns undefined, but this returns 'undefined'
 * - JSON.stringify({a:undefined}) returns {}, but this returns '{"a":undefined}'
 * - JSON.stringify(new Error("Boom")) returns '{}', but this returns either '{"message":"Boom","name":"Error"}' (if
 *   useToStringForErrors is false) or '[Error: Boom]' (if useToStringForErrors is true)
 * - JSON.stringify(func) with function func() {} returns undefined, but this returns '[Function: func]'
 * - JSON.stringify({fn: func}) with function func() {} returns '{}', but this returns '{"fn": [Function: func]}'
 * - JSON.stringify(NaN) returns 'null', but this returns 'NaN'
 * - JSON.stringify(Infinity) returns 'null', but this returns 'Infinity'
 * - JSON.stringify(-Infinity) returns 'null', but this returns '-Infinity'
 * - JSON.stringify applied to objects or arrays with circular dependencies throws an error (TypeError: Converting
 *   circular structure to JSON), but this returns a string with circular dependencies replaced with [Circular: {name}],
 *   where name refers to the original object that it references (using 'this' for the outermost object itself).
 *   For example, given the following code:
 *     const object = {a: 1, o: {b:2}};
 *     object.circular = object;
 *     object.o.oAgain = object.o;
 *   this function returns '{"a":1,"o":{"b":2,"oAgain":[Circular: this.o]},"circular":[Circular: this]}'
 *
 * @param {*} value the value to stringify
 * @param {boolean|undefined} [useToStringForErrors] - whether to stringify errors using toString or as normal objects (default)
 * @param {boolean|undefined} [avoidToJSONMethods] - whether to avoid using objects' toJSON methods or not (default)
 * @param {boolean|undefined} [quoteStrings] - whether to surround simple string values with double-quotes or not (default)
 * @returns {string} the value as a string
 */
function stringify(value, useToStringForErrors, avoidToJSONMethods, quoteStrings) {
  const history = new WeakMap();

  function stringifyWithHistory(value, name, quote) {
    // Special cases for undefined and null
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';

    const typeOfValue = typeof value;

    // Special cases for strings and Strings
    if (typeOfValue === 'string') return quote ? `"${value}"` : value;
    if (value instanceof String) return quote ? `"${value.valueOf()}"` : value.valueOf();

    // Special cases for numbers and Numbers (and special numbers)
    //if (typeOfValue === 'number' || value instanceof Number || Numbers.isSpecialNumber(value)) return `${value}`;
    if (typeOfValue === 'number' || value instanceof Number) return `${value}`;

    // Special cases for booleans and Booleans
    if (typeOfValue === 'boolean' || value instanceof Boolean) return `${value}`;

    // Special case for Errors - use toString() if directed, since stringify on most errors, just returns "{}"
    const valueIsError = value instanceof Error;
    if (valueIsError && useToStringForErrors) return `[${value}]`;

    // Special case for Functions - show them as [Function: {function name}]
    if (typeOfValue === 'function') return isNotBlank(value.name) ? `[Function: ${value.name}]` : '[Function: anonymous]';

    if (typeOfValue === 'object') {
      // Special case for objects that have toJSON methods
      if (!avoidToJSONMethods && typeof value.toJSON === 'function') {
        return JSON.stringify(value.toJSON());
      }
      // Check if already seen this same object before
      if (history.has(value)) {
        const historyName = history.get(value);
        if (isCircular(name, historyName)) {
          // Special case for circular values - show them as [Circular: {property name}]
          return `[Circular: ${historyName}]`;
        } else {
          // Special case for non-circular references to the same object - show them as [Reference: {property name}]
          return `[Reference: ${historyName}]`;
        }
      }
      history.set(value, name);

      // Special case for Array objects, stringify each of its elements
      if (Array.isArray(value)) {
        return `[${value.map((e, i) => stringifyWithHistory(e, `${name}[${i}]`, true)).join(", ")}]`;
      }

      // Stringify the object
      let names = Object.getOwnPropertyNames(value);

      if (valueIsError) {
        // Special case for Error objects - include message and name (if any), but exclude stack, which are all normally hidden with JSON.stringify
        // First exclude name, message and stack
        names = names.filter(n => n !== 'stack' && n !== 'name' && n !== 'message');
        // Second re-add name and message to the front of the list
        if (value.message) names.unshift('message');
        if (value.name) names.unshift('name');
      }

      let result = '{';
      for (let i = 0; i < names.length; ++i) {
        const propertyName = names[i];
        if (i > 0) {
          result += ',';
        }
        // Avoid failing if an error is thrown from a getter
        try {
          const propertyValue = value[propertyName];
          result += `"${propertyName}":${stringifyWithHistory(propertyValue, `${name}.${propertyName}`, true)}`;
        } catch (err) {
          result += `"${propertyName}":[Getter failed - ${err}]`;
        }
      }
      result += '}';
      return result;
    }

    // If anything else use JSON.stringify on it
    return JSON.stringify(value);
  }

  return stringifyWithHistory(value, 'this', quoteStrings);
}

function isCircular(name1, name2) {
  if (name1.startsWith(name2)) {
    const rest1 = name1.substring(name2.length);
    return rest1.length === 0 || rest1[0] === '.' || rest1[0] === '['
  }
  if (name2.startsWith(name1)) {
    const rest2 = name2.substring(name1.length);
    return rest2.length === 0 || rest2[0] === '.' || rest2[0] === '['
  }
  return false;
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