'use strict';

const Strings = require('./strings');
const trim = Strings.trim;
const isNotBlank = Strings.isNotBlank;

/**
 * Module containing utilities for working with objects.
 * @module core-functions/objects
 * @author Byron du Preez
 */
module.exports = {
  /** Returns the standard valueOf of the given value if defined; otherwise returns the value as is */
  valueOf: valueOf,
  merge: merge,
  copy: copy,
  getPropertyValue: getPropertyValue,
  copyNamedProperties: copyNamedProperties
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
  if (!from || typeof from !== 'object') throw new TypeError(`from must be a non-null object`);
  if (!to || typeof to !== 'object') throw new TypeError(`to must be a non-null object`);

  const history = new WeakMap();

  function mergeWithHistory(src, dest) {
    if (history.has(src)) {
      return history.get(src);
    }
    // Remember this merge in case the same source appears again within its own graph
    history.set(src, dest);

    // If both src and dest are arrays then special case for arrays
    const srcIsArray = Array.isArray(src);
    const destIsArray = Array.isArray(dest);
    if (srcIsArray && destIsArray) {
      // First merge all corresponding elements of src into dest
      const n = Math.min(src.length, dest.length);
      for (let i = 0; i < n; ++i) {
        const srcElement = src[i];
        const srcElementIsObject = srcElement && typeof srcElement === 'object';

        const destElement = dest[i];
        if (deep && srcElementIsObject && destElement && typeof destElement === 'object') {
          mergeWithHistory(srcElement, destElement, replace, deep);
        } else if (replace) {
          dest[i] = srcElementIsObject ? copy(srcElement, true) : srcElement;
        }
      }
      // If src was longer than dest, then append copies of any remaining elements of src (if any) to the end of dest
      for (let j = n; j < src.length; ++j) {
        const srcElement = src[j];
        const srcElementIsObject = srcElement && typeof srcElement === 'object';
        dest.push(srcElementIsObject ? copy(srcElement, true) : srcElement);
      }
    }

    // Arrays can also be given other properties, so special case when both arrays, skip src length and numeric property names
    const allSrcNames = Object.getOwnPropertyNames(src);
    const srcNames = srcIsArray && destIsArray ?
      allSrcNames.filter(n => n !== 'length' && Number.isNaN(Number.parseInt(n))) : allSrcNames;

    const destNames = Object.getOwnPropertyNames(dest);

    for (let i = 0; i < srcNames.length; ++i) {
      const name = srcNames[i];

      const srcProperty = src[name];
      const srcPropertyIsObject = srcProperty && typeof srcProperty === 'object';

      const existsOnDest = destNames.indexOf(name) !== -1;

      if (existsOnDest) {
        const destProperty = dest[name];
        if (deep && srcPropertyIsObject && destProperty && typeof destProperty === 'object') {
          mergeWithHistory(srcProperty, destProperty, replace, deep);
        } else if (replace) {
          dest[name] = srcPropertyIsObject ? copy(srcProperty, true) : srcProperty;
        }
      } else {
        dest[name] = srcPropertyIsObject ? copy(srcProperty, true) : srcProperty;
      }
    }
    return dest;
  }

  return mergeWithHistory(from, to);
}

/**
 * Copies the enumerable properties of the given object into a new object. Executes a deep copy if the given deep flag
 * is true, otherwise only does a shallow copy. Returns the new copy of the original object or the original object if it
 * was NOT a non-null instance of Object.
 * @param {Object} object - the object from which to copy enumerable properties into a new object
 * @param {boolean|undefined} [deep] - Executes a deep copy if the given deep flag is true, otherwise only does a shallow copy
 */
function copy(object, deep) {
  if (!object || typeof object !== 'object') {
    return object;
  }
  const history = new WeakMap();

  function newDest(object) {
    return Array.isArray(object) ? new Array(object.length) : Object.create(object.__proto__);
  }

  function copyWithHistory(src, dest) {
    if (history.has(src)) {
      return history.get(src);
    }
    // Remember this copy in case the same source appears again within its own graph
    history.set(src, dest);

    const srcIsArray = Array.isArray(src);
    if (srcIsArray) {
      for (let i = 0; i < src.length; ++i) {
        const element = src[i];
        const elementIsObject = element && typeof element === 'object';
        dest[i] = deep && elementIsObject ?
          copyWithHistory(element, newDest(element)) : element;
      }
    }
    // Arrays can also be given other properties, so special case for arrays, skip length and numeric property names
    const allNames = Object.getOwnPropertyNames(src);
    const names = srcIsArray ? allNames.filter(n => n !== 'length' && Number.isNaN(Number.parseInt(n))) : allNames;

    for (let i = 0; i < names.length; ++i) {
      const name = names[i];
      const property = src[name];
      const propertyIsObject = property && typeof property === 'object';
      dest[name] = deep && propertyIsObject ?
        copyWithHistory(property, newDest(property)) : property;
    }
    return dest;
  }

  return copyWithHistory(object, newDest(object));
}

/**
 * Gets the value of the simple or compound named property from the given object. A compound property name is one that
 * contains multiple property names separated by fullstops.
 * @param {Object} object - the object from which to get the named property's value
 * @param {string} propertyName - the simple or compound name of the property
 * @returns {*} the value of the named property on the given object
 */
function getPropertyValue(object, propertyName) {
  const propertyNames = propertyName.split(".").map(n => trim(n)).filter(name => isNotBlank(name));
  let value = undefined;
  for (let i = 0; i < propertyNames.length; ++i) {
    if (!object || typeof object !== 'object') {
      return undefined;
    }
    value = object[propertyNames[i]];
    object = value;
  }
  return value;
}

/**
 * Copies ONLY the (simple or compound) named properties, which are listed in the given propertyNames array, from the
 * given source object to a new destination object. Note that the value of any compound named property in the given
 * propertyNames array will be copied from the source and stored in the new destination object under the compound
 * property name if compact is true.
 * @param {Object} src - the source object from which to copy the named properties
 * @param {string[]} propertyNames - the list of named properties to be copied
 * @param {boolean|undefined} [compact] - whether to create a flatter, more-compact destination object, which will use
 * any compound property names as is and eliminate any unnecessary intermediate objects or rather create a more-
 * conventional, less-compact destination object, which will only have simple property names and all necessary intermediate objects
 * @param {boolean|undefined} [deep] - executes a deep copy of each property value if the given deep flag is true, otherwise only does a shallow copy
 * @param {boolean|undefined} [omitPropertyIfUndefined] - whether or not to omit any named property that has an undefined value from the destination object
 * @returns {Object} a new object containing copies of only the named properties from the source object
 */
function copyNamedProperties(src, propertyNames, compact, deep, omitPropertyIfUndefined) {
  if (!src || typeof src !== 'object') {
    return src === undefined ? undefined : src === null ? null : {};
  }
  const dest = {};
  for (let i = 0; i < propertyNames.length; ++i) {
    const propertyName = trim(propertyNames[i]);
    const propertyValue = getPropertyValue(src, propertyName);
    if (!omitPropertyIfUndefined || propertyValue !== undefined) {
      if (compact) {
        dest[propertyName] = copy(propertyValue, deep);
      } else {
        const names = propertyName.split(".").map(n => trim(n)).filter(name => isNotBlank(name));
        if (names.length > 0) {
          let d = dest;
          for (let j = 0; j < names.length - 1; ++j) {
            const name = names[j];
            if (!d[name]) {
              d[name] = {};
            }
            d = d[name];
          }
          d[names[names.length - 1]] = copy(propertyValue, deep);
        }
      }
    }
  }
  return dest;
}