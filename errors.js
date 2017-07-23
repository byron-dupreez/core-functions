'use strict';

const FATAL_PREFIX = 'FATAL - ';

/**
 * Module containing common `Error` sub-classes.
 * @module core-functions/errors
 * @author Byron du Preez
 */

/**
 * Represents a "fatal" blocking error that will block processing indefinitely, which is typically caused by a
 * misconfiguration or missing configuration or new, unplanned for scenario that prevents valid inputs from being
 * processed until manual intervention can resolve the underlying issue.
 */
class FatalError extends Error {
  /**
   * Constructs a new FatalError.
   * @param {string} message
   * @param {boolean|undefined} [usePrefix]
   */
  constructor(message, usePrefix) {
    super(usePrefix ? prefixMessage(FATAL_PREFIX, message) : message);
    setTypeName(this.constructor);
  }
}

Object.defineProperty(FatalError.prototype, 'blocking', {
  value: true, enumerable: false, writable: true, configurable: true
});

module.exports = {
  FatalError: FatalError,
  setTypeName: setTypeName,
  prefixMessage: prefixMessage
};

function prefixMessage(prefix, message) {
  const msg = message ? message.toString().trim() : '';
  return msg.toUpperCase().startsWith(prefix.toUpperCase()) ? msg : `${prefix}${msg}`;
}

function setTypeName(type) {
  const prototype = type.prototype;
  if (!prototype.hasOwnProperty('name')) {
    Object.defineProperty(prototype, 'name', {value: type.name, enumerable: false, writable: true, configurable: true});
  }
}