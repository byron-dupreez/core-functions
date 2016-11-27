'use strict';

const Numbers = require('./numbers');

/**
 * Module containing utilities for working with objects.
 * @module core-functions/objects
 * @author Byron du Preez
 */
module.exports = {
  /** Returns the standard valueOf of the given value if defined; otherwise returns the value as is */
  valueOf: valueOf,
  merge: merge
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

/**
 * Merges the enumerable properties of the given 'from' object into the given 'to' object, only replacing same named
 * properties in the 'to' object if the given replace flag is true. Executes a deep merge if the given deep flag is true,
 * otherwise only does a shallow merge. Returns the updated 'to' object.
 * @param {Object} from - the 'from' object from which to get enumerable properties to be merged into the 'to' object
 * @param {Object} to - the 'to' object to which to add or deep merge (or optionally replace) properties from the 'from' object
 * @param {boolean|undefined} [replace] - whether to replace properties in the 'to' object with same named properties in the from object or not
 * @param {boolean|undefined} [deep] - Executes a deep merge if the given deep flag is true, otherwise only does a shallow merge
 */
function merge(from, to, replace, deep) {
  const fromNames = Object.getOwnPropertyNames(from);
  const toNames = Object.getOwnPropertyNames(to);
  for (let i = 0; i < fromNames.length; ++i) {
    const name = fromNames[i];

    const fromProp = from[name];
    const fromPropIsObject = fromProp && typeof fromProp === 'object';

    const existsOnTo = toNames.indexOf(name) !== -1;

    if (existsOnTo) {
      const toProp = to[name];
      if (deep && fromPropIsObject && toProp && typeof toProp === 'object') {
        merge(fromProp, toProp, replace, deep);
      } else if (replace) {
        to[name] = fromPropIsObject ? merge(fromProp, {}) : fromProp;
      }
    } else {
      to[name] = fromPropIsObject ? merge(fromProp, {}) : fromProp;
    }
  }
  return to;
}