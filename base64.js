'use strict';

// inter-dependencies
const strings = require('./strings');
const isString = strings.isString;

/**
 * General utilities for encoding/decoding between Base 64 and UTF-8.
 * @module core-functions/base64
 * @author Byron du Preez
 */
exports._$_ = '_$_'; //IDE workaround
exports.toBase64 = toBase64;
exports.fromBase64 = fromBase64;
exports.toBase64FromUtf8 = toBase64FromUtf8;
exports.toUtf8FromBase64 = toUtf8FromBase64;
exports.isEncodableDecodable = isEncodableDecodable;

/**
 * Attempts to convert the given data object or value into a JSON string and then encodes that to a base 64 string (if
 * data is decodable and encodable and NOT undefined); or throws a TypeError (if not decodable or not encodable);
 * otherwise returns undefined.
 * @param {*|undefined} data the data object or value to convert
 * @param {boolean|undefined} returnUndefinedInsteadOfThrow an optional switch that determines whether or not to return
 * undefined instead of throwing an error
 * @returns {string|undefined} the base 64 encoded string or undefined
 */
function toBase64(data, returnUndefinedInsteadOfThrow) {
  try {
    return data !== undefined ? toBase64FromUtf8(JSON.stringify(data)) : undefined;
  } catch (err) {
    handleError(data, err, returnUndefinedInsteadOfThrow);
  }
}

/**
 * Attempts to convert the given base 64 decodable/encodable (string, Buffer or Array) into a utf-8 encoded string and
 * then parses that into a JSON object or value (if base64 is decodable and encodable and NOT undefined); or throws a
 * TypeError (if not decodable or not encodable); otherwise returns undefined.
 * @param {string|Buffer|Array} base64 the base 64 decodable/encodable to convert
 * @param {boolean|undefined} returnUndefinedInsteadOfThrow an optional switch that determines whether or not to return
 * undefined instead of throwing an error
 * @returns {*|undefined} the JSON object or value or undefined.
 */
function fromBase64(base64, returnUndefinedInsteadOfThrow) {
  try {
    const utf8 = toUtf8FromBase64(base64);
    return utf8 !== undefined ? JSON.parse(utf8) : undefined;
  } catch (err) {
    handleError(base64, err, returnUndefinedInsteadOfThrow);
  }
}

/**
 * Attempts to convert the given utf-8 decodable/encodable (string, Buffer or Array) into a base 64 encoded string (if
 * utf8 is decodable and encodable and NOT undefined); or throws a TypeError (if not decodable and not encodable);
 * otherwise returns undefined.
 * @param {string|Buffer|Array} utf8 the utf-8 decodable/encodable to convert
 * @param {boolean|undefined} returnUndefinedInsteadOfThrow an optional switch that determines whether or not to return
 * undefined instead of throwing an error
 * @returns {string|undefined} the base 64 encoded string or undefined
 */
function toBase64FromUtf8(utf8, returnUndefinedInsteadOfThrow) {
  try {
    return utf8 !== undefined ? (utf8 instanceof Buffer ? utf8 : new Buffer(utf8, 'utf-8')).toString('base64') : undefined;
  } catch (err) {
    handleError(utf8, err, returnUndefinedInsteadOfThrow);
  }
}

/**
 * Attempts to convert the given base 64 decodable/encodable (string, Buffer or Array) into a utf-8 encoded string (if
 * base64 is decodable and encodable and NOT undefined); or throws a TypeError (if not decodable and not encodable);
 * otherwise returns undefined.
 * @param {string|Buffer|Array} base64 the base 64 decodable/encodable to convert
 * @param {boolean|undefined} returnUndefinedInsteadOfThrow an optional switch that determines whether or not to return
 * undefined instead of throwing an error
 * @returns {string|undefined} the utf-8 encoded string or undefined
 */
function toUtf8FromBase64(base64, returnUndefinedInsteadOfThrow) {
  try {
    return base64 !== undefined ?
      (base64 instanceof Buffer ? base64 : new Buffer(base64, 'base64')).toString('utf-8') : undefined;
  } catch (err) {
    handleError(base64, err, returnUndefinedInsteadOfThrow);
  }
}

/**
 * Returns true if the given value is a string, Buffer or Array and hence are PROBABLY encodable/decodable.
 * A valid encodable/decodable "must start with number, buffer, array or string"; otherwise new Buffer will throw a
 * TypeError. However, passing a number creates a Buffer of that size, which is useless for these functions.
 * @param {*} value the value to check
 * @returns {*|boolean} true if probably encodable/decodable; false otherwise
 */
function isEncodableDecodable(value) {
  return isString(value) || value instanceof Buffer || Array.isArray(value);
}

/**
 * Determines whether to return undefined instead of rethrowing the given error or not.
 * @param value the value for which encoding/decoding failed
 * @param err the error that was thrown
 * @param {boolean|undefined} returnUndefinedInsteadOfThrow an optional switch that determines whether or not to return
 * undefined instead of throwing an error
 * @returns {undefined} returns undefind (if returnUndefinedInsteadOfThrow); otherwise rethrows the error
 */
function handleError(value, err, returnUndefinedInsteadOfThrow) {
  if (isEncodableDecodable(value)) {
    console.error(`Unexpected error (${err}), since ${JSON.stringify(value)} was supposed to be encodable/decodable`, err);
    if (returnUndefinedInsteadOfThrow) {
      return undefined;
    } else {
      throw err;
    }
  }
  //console.error(`Expected error (${err}), since ${JSON.stringify(value)} is not encodable/decodable`, err);
  if (returnUndefinedInsteadOfThrow) {
    return undefined;
  } else {
    throw err;
  }
}
