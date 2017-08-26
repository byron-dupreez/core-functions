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
  nthIndexOf: nthIndexOf,
  toLowerCase: toLowerCase,
  stringifyKeyValuePairs: stringifyKeyValuePairs
};

const inspectOpts = {depth: null, breakLength: Infinity}; // unfortunately breakLength is only available in later Node versions than 4.3.2
const breakRegex = /\s*[\n\r]+\s*/g;
const promiseInspectRegex = /^(Promise \{)([\s\n\r]+)(.*)([\s\n\r]+)(})$/;

// Attempts to get Node's util.js inspect function (if available)
const inspect = (() => {
  try {
    return require('util').inspect;
  } catch (_) {
    return undefined;
  }
})();

/**
 * Returns true if the given value is a string; false otherwise.
 * @param {*} value - the value to check
 * @return {boolean} true if its a string; false otherwise
 */
function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

/**
 * Returns true if the given string is blank (i.e. undefined, null, empty or contains only whitespace); false otherwise.
 * @param {string|String} s - the string to check
 * @return {boolean} true if blank; false otherwise
 */
function isBlank(s) {
  return !s || (s.trim && !s.trim());
}

/**
 * Returns true if the given string is NOT blank (i.e. NOT undefined, null, empty or contains only whitespace); false
 * otherwise.
 * @param {string|String} s - the string to check
 * @return {boolean} true if NOT blank; false otherwise
 */
function isNotBlank(s) {
  return s && (!s.trim || s.trim());
}

/**
 * Trims the given value if it is a string; otherwise returns a non-string value as is.
 * @param {*} value - the value to trim
 * @returns {string|*} the trimmed string or the original non-string value
 */
function trim(value) {
  return typeof value === 'string' || value instanceof String ? value.trim() : value;
}

/**
 * Trims the given value (if it's a string) or returns an empty string (if it's undefined or null); otherwise returns
 * the non-undefined, non-null, non-string value as is.
 * @param {*} value - the value to trim
 * @returns {string|*} the trimmed string; an empty string; or the original non-undefined, non-null, non-string value
 */
function trimOrEmpty(value) {
  return typeof value === 'string' || value instanceof String ? value.trim() :
    value === undefined || value === null ? '' : value;
}

/**
 * Returns the given value as a string with special case handling for undefined, null, strings, numbers, booleans,
 * Strings, Numbers, Booleans, Dates, Promises, Errors, Functions, Arrays, Maps, WeakMaps, Objects and special numbers
 * (i.e. Infinity, -Infinity and NaN) and also handles circular dependencies. However, if opts.useJSONStringify is true,
 * then does NONE of this and instead just returns JSON.stringify(value, opts.replacer, opts.space) ignoring other opts.
 *
 * Similar to {@linkcode JSON#stringify}, but shows more about the given value than JSON.stringify does, for example:
 * - JSON.stringify(undefined) returns undefined literally, but this returns 'undefined'
 * - JSON.stringify({a:undefined}) returns {}, but this returns '{"a":undefined}'
 * - JSON.stringify(new Error("Boom")) returns '{}', but this returns EITHER:
 *   - '[Error: Boom]' (or '[Error: Boom {<extras>}]') WHEN opts.avoidErrorToString is false (default); OR
 *   - '{"name": "Error", "message": "Boom"}' (or '{"name": "Error", "message": "Boom", <extras>}') WHEN
 *      opts.avoidErrorToString is true,
 *   where <extras> above is any and all extra properties on the Error object OTHER than name, message and stack
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
 * @param {StringifyOpts|undefined} [opts] - optional options to control how the value gets stringified
 * @returns {string} the value as a string
 */
function stringify(value, opts) {
  // Legacy parameters were (value, useToStringForErrors, avoidToJSONMethods, quoteStrings), so for backward compatibility,
  // convert any boolean opts or (no opts, but boolean 4th or 5th arg) into an appropriate object opts
  if (typeof opts === "boolean" || (!opts && (typeof arguments[3] === "boolean" || typeof arguments[4] === "boolean"))) {
    opts = {avoidErrorToString: !opts, avoidToJSONMethods: !!arguments[3], quoteStrings: !!arguments[4]};
  }
  // Resolve any options requested
  const useJSONStringify = !!opts && opts.useJSONStringify === true;
  if (useJSONStringify) {
    const replacer = opts && opts.replacer ? opts.replacer : undefined;
    const space = opts && opts.space ? opts.space : undefined;
    return JSON.stringify(value, replacer, space);
  }

  const avoidErrorToString = !!opts && opts.avoidErrorToString === true;
  const avoidToJSONMethods = !!opts && opts.avoidToJSONMethods === true;
  const quoteStrings = !!opts && opts.quoteStrings === true;

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

    // Special case for Functions - show them as [Function: {function name}]
    if (typeOfValue === 'function') return isNotBlank(value.name) ? `[Function: ${value.name}]` : '[Function: anonymous]';

    if (typeOfValue === 'object') {
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

      // Special case for console, which is otherwise very verbose
      if (value instanceof console.Console) {
        return value === console ? '[Console]' : '[Console {}]';
      }

      // Special case for Dates - show them as ISO strings rather than default toString()
      if (value instanceof Date) {
        const date = value.toJSON();
        return date ? date : '[Invalid Date]';
      }

      // Special case for Promises
      if (value instanceof Promise) {
        // Attempts to use Node's util.js inspect function (if available), which returns more-useful strings like:
        // 'Promise { <pending> }'; 'Promise { "Abc" }'
        return inspect ? `[${cleanInspectedPromise(inspect(value, inspectOpts))}]` : '[Promise]';
      }

      // Special case for WeakMaps, which cannot be enumerated
      if (value instanceof WeakMap) {
        return `[WeakMap]`
      }
      // Special case for Maps, which currently do not have a useful toString() and are also not handled well by JSON.stringify
      if (value instanceof Map) {
        let result = '[Map {';
        let first = true;
        let i = 0;
        for (let kv of value.entries()) {
          const k = kv[0], v = kv[1];
          result += `${!first ? ', ' : ''}${stringifyWithHistory(k, `${name}[${i}].KEY`, true)} => ${stringifyWithHistory(v, `${name}[${i}].VAL`, true)}`;
          first = false;
          ++i;
        }
        result += '}]';
        return result;
      }

      // Special case for Array objects, stringify each of its elements
      if (Array.isArray(value)) {
        return `[${value.map((e, i) => stringifyWithHistory(e, `${name}[${i}]`, true)).join(", ")}]`;
      }

      // Special case for objects that have toJSON methods
      if (!avoidToJSONMethods && typeof value.toJSON === 'function') {
        return JSON.stringify(value.toJSON());
      }

      // Stringify the object
      let names = Object.getOwnPropertyNames(value);
      let prefix = '{';
      let suffix = '}';

      // Special cases for Errors
      if (value instanceof Error) {
        // First exclude name, message and stack from the list of names
        names = names.filter(n => n !== 'stack' && n !== 'name' && n !== 'message');
        if (avoidErrorToString) {
          // Special case for Errors when opts.avoidErrorToString is true - treat Error as if it was just an object, but
          // include name and message (if any) at the front of the list of names (but still exclude stack)
          if (value.message) names.unshift('message');
          if (value.name) names.unshift('name');
        } else {
          // Special case for Errors when opts.avoidErrorToString is true- use the Error's toString(), but also include
          // any extra properties OTHER than message, name and stack in the output
          if (names.length <= 0) {
            return `[${value}]`; // If no extra properties then just use Error's toString()
          }
          // Change the prefix to include the Error's toString() info and continue as normal
          prefix = `[${value} {`;
          suffix = '}]';
        }
      }

      let result = prefix;
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
      result += suffix;
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

/**
 * Converts the given value to lower-case if it is a string; otherwise returns a non-string value as is.
 * @param {*} value - the value to convert to lower-case
 * @returns {string|*} the lower-case string or the original non-string value
 */
function toLowerCase(value) {
  return typeof value === 'string' || value instanceof String ? value.toLowerCase() : value;
}

/**
 * Creates a string version of the given key value pairs array, with its keys and values separated by the given
 * keyValueSeparator and its pairs separated by the given pairSeparator.
 * @param {KeyValuePair[]} keyValuePairs - an array of key value pairs
 * @param {StringifyKeyValuePairsOpts|undefined} [opts] - optional options to control how the array of key value pairs get stringified
 * @returns {string} a string version of the given key value pairs array
 */
function stringifyKeyValuePairs(keyValuePairs, opts) {
  const keyValueSeparator = opts && typeof opts.keyValueSeparator === 'string' ? opts.keyValueSeparator : ':';
  const pairSeparator = opts && typeof opts.pairSeparator === 'string' ? opts.pairSeparator : ',';
  return keyValuePairs && keyValuePairs.length > 0 ?
    keyValuePairs.map(kv => `${kv[0]}${keyValueSeparator}${stringify(kv[1], opts)}`).join(pairSeparator) : '';
}

/**
 * Workaround to avoid default behaviour that inserts new line(s) when length too long (>60?) by removing any carriage
 * returns and line feeds.
 * @param {string} inspectedPromise - util.inspect result for a Promise instance
 */
function cleanInspectedPromise(inspectedPromise) {
  breakRegex.lastIndex = 0; //NB: MUST RESET lastIndex to zero for global regular expressions (i.e. /.../g )!
  const promiseText = inspectedPromise.replace(breakRegex, ' ').replace(promiseInspectRegex, '$1 $3 $5');
  breakRegex.lastIndex = 0; //NB: MUST RESET lastIndex to zero for global regular expressions (i.e. /.../g )!
  return promiseText;
}