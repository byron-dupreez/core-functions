'use strict';

const strings = require('./strings');
const trim = strings.trim;
const isNotBlank = strings.isNotBlank;

const any = require('./any');

const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

/**
 * Module containing utilities for working with objects.
 * @module core-functions/objects
 * @author Byron du Preez
 */
exports._ = '_'; //IDE workaround
exports.isTypedArray = isTypedArray;
exports.getPropertyNames = getPropertyNames;
exports.getPropertySymbols = getPropertySymbols;
exports.getPropertyKeys = getPropertyKeys;
exports.getPropertyDescriptors = getPropertyDescriptors;
exports.getPropertyValueByKeys = getPropertyValueByKeys;
exports.getPropertyDescriptorByKeys = getPropertyDescriptorByKeys;
exports.getPropertyValueByCompoundName = getPropertyValueByCompoundName;
exports.hasOwnPropertyWithKeys = hasOwnPropertyWithKeys;
exports.hasOwnPropertyWithCompoundName = hasOwnPropertyWithCompoundName;
exports.toKeyValuePairs = toKeyValuePairs;
exports.getOwnPropertyNamesRecursively = getOwnPropertyNamesRecursively;

/** @deprecated use {@linkcode core-functions/any#valueOf} instead */
exports.valueOf = any.valueOf;
/** @deprecated */
exports.copy = copy;
/** @deprecated */
exports.copyNamedProperties = copyNamedProperties;
/** @deprecated */
exports.merge = merge;

/**
 * Returns true if object is a subclass instance of TypedArray; false otherwise.
 * @param {TypedArray|*} object - the object to test
 * @returns {boolean} true if object is a subclass instance of TypedArray; false otherwise
 */
function isTypedArray(object) {
  return object instanceof Int8Array || object instanceof Uint8Array || object instanceof Uint8ClampedArray ||
    object instanceof Int16Array || object instanceof Uint16Array ||
    object instanceof Int32Array || object instanceof Uint32Array ||
    object instanceof Float32Array || object instanceof Float64Array;
}

/**
 * Gets the property names of either all of the own properties of the given object (if onlyEnumerable is false);
 * otherwise of only the enumerable own properties of the given object.
 * Special cases when skipArrayLike is true:
 * - for Arrays (& String objects), skip length and numeric index property names
 * - for Buffers & TypedArrays, skip numeric index property names (also have length, but it doesn't appear in getOwnProperties)
 * - for ArrayBuffers & DataViews, there is nothing extra to do, since no extra properties by default
 * @param {Object} o - the object from which to collect its own property names
 * @param {boolean|undefined} [onlyEnumerable] - whether to get the names of only enumerable own properties (if true) or of all own properties
 * @param {boolean|undefined} [skipArrayLike] - whether to skip Array-like numeric & length properties on Arrays, Strings, Buffers & TypedArrays or not
 * @returns {(string|number)[]} an array of property names (and/or indexes)
 */
function getPropertyNames(o, onlyEnumerable, skipArrayLike) {
  const names = !onlyEnumerable ? Object.getOwnPropertyNames(o) : Object.keys(o);
  if (!skipArrayLike) {
    return names;
  }
  // Special cases when skipArrayLike is true:
  // - for Arrays (& String objects), skip length and numeric property names
  // - for Buffers & TypedArrays, skip numeric property names (have length, but it doesn't appear in getOwnProperties)
  // - for ArrayBuffers & DataViews, nothing to do, since no extra properties by default
  return Array.isArray(o) || o instanceof String ? names.filter(n => n !== 'length' && Number.isNaN(Number(n))) :
    o instanceof Buffer || isTypedArray(o) ? names.filter(n => Number.isNaN(Number(n))) : names;
}

/**
 * Gets the property symbols of either all of the own properties of the given object (if opts.onlyEnumerable is false);
 * otherwise of only the enumerable own properties of the given object.
 * @param {Object} o - the object from which to collect its own property symbols
 * @param {boolean|undefined} [onlyEnumerable] - whether to get the symbols of only enumerable own properties (if true) or of all own properties
 * @returns {Symbol[]} an array of property symbols
 */
function getPropertySymbols(o, onlyEnumerable) {
  const symbols = Object.getOwnPropertySymbols(o);
  return !onlyEnumerable ? symbols : symbols.filter(symbol => propertyIsEnumerable.call(o, symbol));
}

/**
 * Gets all of the property keys (i.e. names and symbols) of either all of the own properties of the given object (if
 * opts.onlyEnumerable is false); otherwise of only the enumerable own properties of the given object.
 * @param {Object} o - the object from which to collect its own property symbols
 * @param {boolean|undefined} [onlyEnumerable] - whether to get the keys (i.e. names & symbols) of only enumerable own properties (if true) or of all own properties
 * @param {boolean|undefined} [skipArrayLike] - whether to skip Array-like numeric & length properties on Arrays, Strings, Buffers & TypedArrays or not
 * @returns {PropertyKey[]} an array of property keys (i.e. names & symbols)
 */
function getPropertyKeys(o, onlyEnumerable, skipArrayLike) {
  return getPropertyNames(o, onlyEnumerable, skipArrayLike).concat(getPropertySymbols(o, onlyEnumerable));
}

/**
 * Gets all of the own string-named & symbol-named property descriptors for the given object.
 * @param {Object} o - the object from which to collect its property descriptors
 * @param {boolean|undefined} [onlyEnumerable] - whether to collect ONLY enumerable own property descriptors or ALL own property descriptors (default is false, i.e. collect all)
 * @param {boolean|undefined} [skipArrayLike] - whether to skip Array-like numeric & length properties on Arrays, Strings, Buffers & TypedArrays or not
 * @returns {Object} a map of property descriptors by key (i.e. by name and/or symbol)
 */
function getPropertyDescriptors(o, onlyEnumerable, skipArrayLike) {
  return getPropertyKeys(o, onlyEnumerable, skipArrayLike).reduce((descriptors, key) => {
    descriptors[key] = Object.getOwnPropertyDescriptor(o, key);
    return descriptors;
  }, {});
}

/**
 * Traverses the given list of property keys starting from the given object and returns the value of the targeted
 * property (if found); otherwise returns undefined.
 * @param {Object} object - the object from which to start traversing
 * @param {PropertyKey[]} keys - the list of property keys to be traversed to get to the targeted property
 * @returns {*} the value of the targeted property (if found); otherwise undefined
 */
function getPropertyValueByKeys(object, keys) {
  let next = object;
  const last = keys.length - 1;
  for (let i = 0; i < last; ++i) {
    if (!next || typeof next !== 'object') {
      return undefined;
    }
    next = next[keys[i]];
  }
  return next && typeof next === 'object' && last >= 0 ? next[keys[last]] : undefined;
}

/**
 * Traverses the given list of property keys starting from the given object and returns the descriptor of the targeted
 * property (if found); otherwise returns undefined.
 * @param {Object} object - the object from which to start traversing
 * @param {PropertyKey[]} keys - the list of property keys to be traversed to get to the targeted property
 * @returns {PropertyDescriptor|undefined} the descriptor of the targeted property (if found); otherwise undefined
 */
function getPropertyDescriptorByKeys(object, keys) {
  if (keys.length <= 0) return undefined;
  let next = object;
  const last = keys.length - 1;
  for (let i = 0; i < last; ++i) {
    if (!next || typeof next !== 'object') {
      return undefined;
    }
    next = next[keys[i]];
  }
  return next && typeof next === 'object' && last >= 0 ? Object.getOwnPropertyDescriptor(next, keys[last]) : undefined;
}

/**
 * Traverses the components of the given compound or simple property name starting from the given object and returns the
 * value of the targeted property (if found); otherwise returns undefined. A compound property name is one that contains
 * multiple property names separated by fullstops.
 * @param {Object} object - the object from which to start traversing
 * @param {string} compoundOrSimpleName - the compound or simple name of the property
 * @returns {*} the value of the targeted property (if found); otherwise undefined
 */
function getPropertyValueByCompoundName(object, compoundOrSimpleName) {
  const names = compoundOrSimpleName.split(".").map(n => trim(n)).filter(name => isNotBlank(name));
  return getPropertyValueByKeys(object, names);
}

/**
 * Traverses the given list of property keys starting from the given object to determine whether the targeted property
 * exists according to `hasOwnProperty` or not.
 * @param {Object} object - the object from which to start traversing
 * @param {PropertyKey[]} keys - the list of property keys to be traversed to check if the targeted property exists
 * @returns {boolean} true if the targeted property exists; otherwise false
 */
function hasOwnPropertyWithKeys(object, keys) {
  let next = object;
  const last = keys.length - 1;
  for (let i = 0; i < last; ++i) {
    if (!next || typeof next !== 'object') {
      return false;
    }
    next = next[keys[i]];
  }
  return next && typeof next === 'object' && last >= 0 ? next.hasOwnProperty(keys[last]) : false;
}

/**
 * Traverses the components of the given compound or simple property name starting from the given object to determine
 * whether the targeted property exists according to `hasOwnProperty` or not. A compound property name is one that
 * contains multiple property names separated by fullstops.
 * @param {Object} object - the object from which to start traversing
 * @param {string} compoundOrSimpleName - the compound or simple name of the property to check
 * @returns {boolean} true if the targeted property exists; otherwise false
 */
function hasOwnPropertyWithCompoundName(object, compoundOrSimpleName) {
  const names = compoundOrSimpleName.split(".").map(n => trim(n)).filter(name => isNotBlank(name));
  return hasOwnPropertyWithKeys(object, names);
}

/**
 * Creates & returns a copy of the given object by copying its properties into a new object of a similar type if the
 * given object is copyable (e.g. non-null, non-Promise object); otherwise simply returns the given object. Executes a
 * deep copy if `opts.deep` is true; otherwise only does a shallow copy.
 *
 * Legacy parameters were (object, deep), so for backward compatibility, use any true/false opts as if it was true/false opts.deep
 *
 * @deprecated Use {link module:core-functions/copying#copy} instead
 * @param {T} object - the object to be copied
 * @param {CopyOpts|boolean|undefined} [opts] - optional opts to use (if opts is true/false, handles it as if opts.deep were true/false)
 * @returns {T} a copy of the given object
 */
function copy(object, opts) {
  // Legacy parameters were (object, deep: boolean), so for backward compatibility, use any true/false opts as if it was true/false opts.deep
  if (opts === true || opts === false) {
    opts = {deep: opts};
  }
  const copying = require('./copying');
  return copying.copy(object, opts);
}

/**
 * Merges the properties of the given 'from' object into the given 'to' object, only replacing same named properties in
 * the 'to' object if opts.replace is true. Executes a deep merge if opts.deep is true, otherwise only does a shallow
 * merge. Returns the updated 'to' object.
 *
 * Legacy parameters were (from, to, replace, deep), so for backward compatibility, convert any boolean opts or
 * (undefined opts and boolean 4th argument) into an appropriate object opts.
 *
 * @deprecated Use {link module:core-functions/merging#merge} instead
 * @param {Object} from - the 'from' object from which to get enumerable properties to be merged into the 'to' object
 * @param {Object} to - the 'to' object to which to add or deep merge (or optionally replace) properties from the 'from' object
 * @param {MergeOpts|undefined} [opts] - optional opts to use
 */
function merge(from, to, opts) {
  // Legacy parameters were (from, to, replace, deep), so for backward compatibility, convert any boolean opts or
  // (undefined opts and boolean 4th argument) into an appropriate object opts
  if (typeof opts === "boolean" || (!opts && typeof arguments[3] === "boolean")) {
    opts = {replace: !!opts, deep: !!arguments[3]};
  }
  const merging = require('./merging');
  return merging.merge(from, to, opts);
}


/**
 * Copies ONLY the (simple or compound) named properties, which are listed in the given propertyNames array, from the
 * given source object to a new destination object. Note that the value of any compound named property in the given
 * propertyNames array will be copied from the source and stored in the new destination object under the compound
 * property name if compact is true.
 *
 * Legacy parameters were (src, propertyNames, compact, deep, omitPropertyIfUndefined), so for backward compatibility,
 * convert any boolean opts or (no opts, but boolean 4th or 5th arg) into an appropriate object opts.
 *
 * @deprecated Use {link module:core-functions/copying#copyNamedProperties} instead
 * @param {T} src - the source object from which to copy the named properties
 * @param {PropertyKey[]} keys - the list of named properties to be copied
 * @param {CopyNamedPropertiesOpts|undefined} [opts] - optional opts to use
 * @returns {T} a new object containing copies of only the named properties from the source object
 */
function copyNamedProperties(src, keys, opts) {
  // Legacy parameters were (src, propertyNames, compact, deep, omitPropertyIfUndefined), so for backward compatibility,
  // convert any boolean opts or (no opts, but boolean 4th or 5th arg) into an appropriate object opts
  if (typeof opts === "boolean" || (!opts && (typeof arguments[3] === "boolean" || typeof arguments[4] === "boolean"))) {
    opts = {compact: !!opts, deep: !!arguments[3], omitIfUndefined: !!arguments[4]};
  }

  const copying = require('./copying');
  return copying.copyNamedProperties(src, keys, opts);
}

/**
 * Extracts an array of key value pairs from the given object. Each key value pair is represented as an array containing
 * a property key (i.e. a string/number/symbol property name) followed by its associated value.
 * @param {Object} object - an object
 * @param {Object|undefined} [opts] - optional options to use
 * @param {boolean|undefined} [opts.onlyEnumerable] - whether to collect keys as ONLY enumerable properties or ALL own properties (default is false, i.e. collect all)
 * @param {boolean|undefined} [opts.skipArrayLike] - whether to skip Array-like numeric & length properties on Arrays, Strings, Buffers & TypedArrays or not
 * @param {boolean|undefined} [opts.omitSymbols] - whether to omit any & all of the object's own property symbols & their values from the results or not (default not)
 * @returns {KeyValuePair[]} an array of key value pairs
 */
function toKeyValuePairs(object, opts) {
  if (!object || typeof object !== 'object') return [];

  const hasOpts = !!opts;
  const onlyEnumerable = hasOpts && opts.onlyEnumerable === true;
  const skipArrayLike = hasOpts && opts.skipArrayLike === true;
  const omitSymbols = hasOpts && opts.omitSymbols === true;

  const keys = omitSymbols ? getPropertyNames(object, onlyEnumerable, skipArrayLike) :
    getPropertyKeys(object, onlyEnumerable, skipArrayLike);
  return keys.map(key => [key, object[key]]);
}

/**
 * Collects and returns all of the given object's own property names and also recursively collects and returns all of
 * its object properties' names (prefixed with their parent's property names).
 * @param {Object} object - the object from which to collect property names recursively
 * @param {Object} [opts] - optional options to use
 * @param {boolean|undefined} [opts.onlyEnumerable] - whether to collect ONLY enumerable properties or ALL own properties (default is false, i.e. collect all)
 * @returns {string[]} an array of property names
 */
function getOwnPropertyNamesRecursively(object, opts) {
  function isTraversable(o) {
    return !!o && typeof o === 'object' && !(o instanceof Promise) && o !== console;
  }

  if (!isTraversable(object)) return [];

  const onlyEnumerable = !!opts && opts.onlyEnumerable === true;

  const history = new WeakMap();

  function collect(o, oName) {
    // Handle circular references by skipping all of the reference's property names, which were already collected
    if (history.has(o)) return [];

    // Remember this object, in case it appears again within its own graph
    history.set(o, oName);

    const results = [];

    // If o is an array then add all of its elements' property names (if any)
    if (Array.isArray(o)) {
      for (let i = 0; i < o.length; ++i) {
        const pName = `${oName}[${i}]`;
        const value = o[i];
        const propNames = isTraversable(value) ? collect(value, pName) : undefined;
        if (propNames) Array.prototype.push.apply(results, propNames);
      }
    }

    // Add object's property names
    getPropertyNames(o, onlyEnumerable, true).forEach(name => {
      const pName = oName ? `${oName}.${name}` : name;
      results.push(pName);

      const value = o[name];
      const propNames = isTraversable(value) ? collect(value, pName) : undefined;
      if (propNames) Array.prototype.push.apply(results, propNames);
    });

    return results;
  }

  return collect(object, '');
}
