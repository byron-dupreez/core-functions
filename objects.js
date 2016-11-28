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
  merge: merge,
  copy: copy
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
  const history = new WeakMap();

  function mergeWithHistory(src, dest) {
    if (history.has(src)) {
      return history.get(src);
    }
    // Remember this merge in case the same source appears again within its own graph
    history.set(src, dest);

    const srcNames = Object.getOwnPropertyNames(src);
    const destNames = Object.getOwnPropertyNames(dest);
    for (let i = 0; i < srcNames.length; ++i) {
      const name = srcNames[i];

      const srcPropertyValue = src[name];
      const srcPropertyIsObject = srcPropertyValue && typeof srcPropertyValue === 'object';

      const existsOnDest = destNames.indexOf(name) !== -1;

      if (existsOnDest) {
        const destPropertyValue = dest[name];
        if (deep && srcPropertyIsObject && destPropertyValue && typeof destPropertyValue === 'object') {
          mergeWithHistory(srcPropertyValue, destPropertyValue, replace, deep);
        } else if (replace) {
          dest[name] = srcPropertyIsObject ? copy(srcPropertyValue, true) : srcPropertyValue;
        }
      } else {
        dest[name] = srcPropertyIsObject ? copy(srcPropertyValue, true) : srcPropertyValue;
      }
    }
    return dest;
  }

  return mergeWithHistory(from, to);
}

/**
 * Copies the enumerable properties of the given object into a new object. Executes a deep copy if the given deep flag
 * is true, otherwise only does a shallow copy. Returns the new copy of the original object.
 * @param {Object} object - the object from which to copy enumerable properties into a new object
 * @param {boolean|undefined} [deep] - Executes a deep copy if the given deep flag is true, otherwise only does a shallow copy
 */
function copy(object, deep) {
  const history = new WeakMap();

  function copyWithHistory(src, dest) {
    if (history.has(src)) {
      return history.get(src);
    }
    // Remember this copy in case the same source appears again within its own graph
    history.set(src, dest);

    const names = Object.getOwnPropertyNames(src);
    for (let i = 0; i < names.length; ++i) {
      const name = names[i];
      const property = src[name];
      const propertyIsObject = property && typeof property === 'object';
      dest[name] = deep && propertyIsObject ? copyWithHistory(property, {}) : property;
    }
    return dest;
  }

  return copyWithHistory(object, {});
}
