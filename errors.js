'use strict';

/**
 * Module containing common `Error` sub-classes.
 * @module core-functions/errors
 * @author Byron du Preez
 */
exports._ = '_'; //IDE workaround
exports.setTypeName = setTypeName;
exports.prefixMessage = prefixMessage;
exports.toJSON = toJSON;

/**
 * An Error subclass that indicates a "fatal" failure, which will block processing indefinitely and which is typically
 * caused by a misconfiguration or missing configuration or new, unplanned for scenario that prevents a valid request
 * from being processed until manual intervention can resolve the underlying issue.
 */
class FatalError extends Error {
  /**
   * Constructs a new FatalError.
   * @param {string} message - a message for this error.
   */
  constructor(message) {
    super(message);
    setTypeName(this.constructor);
  }

  toJSON() {
    return toJSON(this);
  }
}
exports.FatalError = FatalError;

/**
 * An Error subclass that indicates a transient failure. The failed operation should be re-attempted again later.
 */
class TransientError extends Error {
  /**
   * Constructs a new TransientError.
   * @param {string} message - a message for this error.
   */
  constructor(message) {
    super(message);
    setTypeName(this.constructor);
  }

  toJSON() {
    return toJSON(this);
  }
}
exports.TransientError = TransientError;

/**
 * An Error subclass that indicates that an operation timed out.
 */
class TimeoutError extends Error {
  /**
   * Constructs a new TimeoutError.
   * @param {string} message - a message for this error.
   */
  constructor(message) {
    super(message);
    setTypeName(this.constructor);
  }

  toJSON() {
    return toJSON(this);
  }
}
exports.TimeoutError = TimeoutError;

function prefixMessage(prefix, message) {
  const pfx = prefix ? prefix.toString() : '';
  const msg = message ? message.toString() : '';
  return msg.toUpperCase().startsWith(pfx.toUpperCase()) ? msg.trim() : `${pfx}${msg.trim()}`.trim();
}

/**
 * Sets the `name` property of the prototype of the given type constructor to the given type constructor's name.
 * @param {Function|Object} type - the type constructor
 */
function setTypeName(type) {
  const prototype = type.prototype;
  if (!prototype.hasOwnProperty('name')) {
    Object.defineProperty(prototype, 'name', {value: type.name, enumerable: false, writable: true, configurable: true});
  }
}

/**
 * Converts the given error into a JSON object with `name` & `message` properties plus any and all own enumerable properties.
 * @param {Error} error
 * @returns {{name, message}}
 */
function toJSON(error) {
  const json = {
    name: error.name,
    message: error.message
  };
  // Copy any and all enumerable own properties across too
  const names = Object.keys(error); //.filter(n => !json.hasOwnProperty(n));
  for (let i = 0; i < names.length; ++i) {
    const name = names[i];
    const value = error[name];
    if (value !== undefined && typeof value !== 'function') {
      json[name] = value;
    }
  }
  return json;
}