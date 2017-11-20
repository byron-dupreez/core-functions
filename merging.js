'use strict';

const Objects = require('./objects');
const isTypedArray = Objects.isTypedArray;
const getPropertyKeys = Objects.getPropertyKeys;

const copying = require('./copying');
const configureCopyContext = copying.configureCopyContext;
const copyObject = copying.copyObject;
const createObject = copying.createObject;
// const copyDescriptor = copying.copyDescriptor;
const copyPropertyDescriptors = copying.copyPropertyDescriptors;
const copyPropertyDescriptor = copying.copyPropertyDescriptor;

const hasOwnProperty = Object.prototype.hasOwnProperty;

// noinspection JSDeprecatedSymbols
/**
 * Module containing a `merge` function for merging state from one object into another object.
 * @module core-functions/objects
 * @author Byron du Preez
 */
exports._$_ = '_$_'; //IDE workaround
// Public API
// noinspection JSDeprecatedSymbols
exports.merge = merge;

// // Internal API
// exports.configureMergeContext = configureMergeContext;
// exports.mergeObject = mergeObject;

/**
 * Sample options to use to alter the behaviour of the `merge` function
 * @namespace {Object.<string, MergeOpts>}
 */
const defaultMergeOpts = {
  // Merge if deep & destination is mergeable; otherwise keep existing destination and do NOT replace/overwrite it
  shallowNoReplace: {deep: false, replace: false},
  deepNoReplace: {deep: true, replace: false},
  onlyEnumerableNoReplace: {deep: false, onlyEnumerable: true, replace: false},
  deepOnlyEnumerableNoReplace: {deep: true, onlyEnumerable: true, replace: false},

  // Merge when deep & destination is mergeable; otherwise replace/overwrite existing destination
  shallowReplace: {deep: false, replace: true},
  deepReplace: {deep: true, replace: true},
  onlyEnumerableReplace: {deep: false, onlyEnumerable: true, replace: true},
  deepOnlyEnumerableReplace: {deep: true, onlyEnumerable: true, replace: true}
};
exports.defaultMergeOpts = defaultMergeOpts;

/**
 * Merges the properties of the given 'from' object into the given 'to' object, only replacing same named properties in
 * the 'to' object if opts.replace is true. Executes a deep merge if opts.deep is true, otherwise only does a shallow
 * merge. Returns the updated 'to' object.
 *
 * @param {Object} from - the 'from' object from which to get enumerable properties to be merged into the 'to' object
 * @param {Object} to - the 'to' object to which to add or deep merge (or optionally replace) properties from the 'from' object
 * @param {MergeOpts|undefined} [opts] - optional opts to use
 */
function merge(from, to, opts) {
  // Configure & upgrade the given context (if any/necessary)
  const context = configureMergeContext({}, opts);

  const isCopyable = context.isCopyable;
  if (!isCopyable(from)) throw new TypeError('merge from must be a copyable object (e.g. non-null, non-Promise)');

  const isMergeable = context.isMergeable;
  if (!isMergeable(to)) throw new TypeError('merge to must be a mergeable object (e.g. null, undefined or non-Promise)');

  return mergeObject(from, to, context);
}

/**
 * Configures and updates the given context (if any) to a complete context ready to be used for copying.
 * @param {MergeContext|CopyContext|Object|undefined} [context] - an optional, initial (or complete) context to use, which can contain the settings, `isCopyable`, `createCustomObject` & `copyCustomContent` functions and history cache to use
 * @param {MergeOpts} [opts] - optional options to use to configure the context
 * @returns {MergeContext} the configured context
 */
function configureMergeContext(context, opts) {
  const hasOpts = opts && typeof opts === 'object';

  // Configure all of the base copy context settings & functions
  context = configureCopyContext(context, opts);

  // Configure the merge-specific context settings
  context.replace = hasOpts && opts.replace;

  // Resolve the merge functions to use
  if (typeof context.isMergeable !== 'function') {
    context.isMergeable = opts && typeof opts.isMergeable === 'function' ?
      opts.isMergeable : isMergeableObject;
  }

  // If the given opts object is configured for shallow copying, then clone it & override the clone for deep copying
  const deepOpts = hasOpts ? !opts.deep ? Object.create(opts) : opts : {deep: true};
  if (!deepOpts.deep) deepOpts.deep = true;
  // If the context is configured for shallow copying, then clone it & override the clone for deep copying
  context.deepCopyContext = !context.deep ? configureCopyContext(Object.create(context), deepOpts) : context;

  // Clone the given opts (if any) & override the clone for shallow, full copying
  const shallowOpts = hasOpts ? Object.create(opts) : {};
  shallowOpts.deep = false;
  shallowOpts.onlyEnumerable = false;
  shallowOpts.onlyValues = false;
  shallowOpts.omitAccessors = false;
  // Clone the context & override the clone for shallow, full copying
  context.shallowCopyContext = configureCopyContext(Object.create(context), shallowOpts);

  return context;
}

/**
 * Returns true if the given object can be safely used as the target of a `merge` operation, i.e. if its undefined or
 * null or a non-null, non-Promise Object instance. Undefined and null are considered mergeable, since they will simply
 * be replaced with copies of the source object. Note: Doesn't consider `console` as worth merging into either.
 * @param {*} o - the value to test
 * @returns {boolean} true if mergeable; false if not
 */
function isMergeableObject(o) {
  // Special case for Promises - do NOT treat them as objects to be merged!
  return o === undefined || o === null || (!!o && typeof o === 'object' && !(o instanceof Promise) && o !== console);
}

/**
 * Merges the given source object into the given destination object by merging their properties & returns the merged
 * object. Executes a deep merge if `context.deep` is true; otherwise only does a shallow merge.
 * @param {Object} src - the source object from which to merge
 * @param {Object} dest - the destination object into which to merge
 * @param {MergeContext} context - the context to use
 * @returns {Object} the merged object
 */
function mergeObject(src, dest, context) {
  const history = context.history;
  if (history.has(src)) {
    return history.get(src);
  }

  // Resolve the target of the merge as either the given destination object or another object
  dest = resolveMergedObject(src, dest, context);

  // Remember this merge in case the same source appears again within its own graph
  history.set(src, dest);

  // Merge any special case content or internal state from src to dest (e.g. Array elements, Buffer content, Map entries, ...)
  mergeContent(src, dest, context);

  // Note: All Objects, including Arrays, Buffers, Dates, etc. can ALSO have other properties
  // Merge all of the string-named and symbol-named properties' values or descriptors from src to dest
  if (!context.onlyValues)
    mergePropertyDescriptors(src, dest, context);
  else
    mergePropertyValues(src, dest, context);

  return dest;
}

function resolveMergedObject(src, dest, context) {
  if (dest === undefined || dest === null) {
    return createObject(src, context);
  }
  if (src instanceof Date && dest instanceof Date) {
    // Special case for "merging" two Dates, rather replace the dest Date with a copy of the src Date, since "mutable"
    // Dates are a bad idea
    if (context.deep) {
      const newDest = new Date(src.getTime());
      // Copy any other arbitrary properties back from dest to new dest
      copyPropertyDescriptors(dest, newDest, context.shallowCopyContext);
      return newDest;
    }
    return src;

  } else if ((src instanceof String && dest instanceof String) ||
    (src instanceof Number && dest instanceof Number) ||
    (src instanceof Boolean && dest instanceof Boolean) ||
    (src instanceof Symbol && dest instanceof Symbol)) {
    // Special case for "immutable" String, Number, Boolean & Symbol objects
    if (context.deep) {
      const newDest = Object(src.valueOf());
      // Copy any other arbitrary properties back from dest to new dest
      copyPropertyDescriptors(dest, newDest, context.shallowCopyContext);
      return newDest;
    }
    return src;
  }
  return dest;
}

function mergeContent(src, dest, context) {
  const replace = context.replace;
  const deep = context.deep;
  const isCopyable = context.isCopyable;
  const isMergeable = context.isMergeable;

  // If both src and dest are arrays then special case for arrays
  if (Array.isArray(src) && Array.isArray(dest)) {
    // First merge all corresponding elements of src into dest
    const n = Math.min(src.length, dest.length);
    for (let i = 0; i < n; ++i) {
      const srcElement = src[i];
      const srcElementIsCopyable = isCopyable(srcElement);

      const destElement = dest[i];
      if (deep && srcElementIsCopyable && isMergeable(destElement)) {
        dest[i] = mergeObject(srcElement, destElement, context);
      } else if (replace) {
        dest[i] = srcElementIsCopyable ? copyObject(srcElement, context.deepCopyContext) : srcElement;
      }
    }
    // If src was longer than dest, then append copies of any remaining elements of src (if any) to the end of dest
    for (let j = n; j < src.length; ++j) {
      const srcElement = src[j];
      dest.push(isCopyable(srcElement) ? copyObject(srcElement, context.deepCopyContext) : srcElement);
    }
  }
  //TODO consider adding other cases for merging Buffers, ArrayBuffers, TypedArrays, Maps, Sets, ...
}

function areSimilarArrayLikes(src, dest) {
  return (Array.isArray(src) && Array.isArray(dest)) || (src instanceof String && dest instanceof String) ||
    (src instanceof Buffer && dest instanceof Buffer) || (isTypedArray(src) && isTypedArray(dest));
}

function mergePropertyDescriptors(src, dest, context) {
  const replace = context.replace;
  const deep = context.deep;
  const isCopyable = context.isCopyable;
  const isMergeable = context.isMergeable;
  const deepCopyContext = context.deepCopyContext;
  const omitAccessors = context.omitAccessors;

  // Special case when both are similar array-like objects, skip length and numeric property names
  getPropertyKeys(src, context.onlyEnumerable, areSimilarArrayLikes(src, dest)).forEach(key => {
    const srcProperty = src[key];
    const srcPropertyIsCopyable = isCopyable(srcProperty);

    if (hasOwnProperty.call(dest, key)) {
      const destProperty = dest[key];
      if (deep && srcPropertyIsCopyable && isMergeable(destProperty)) {
        const value = mergeObject(srcProperty, destProperty, context);
        copyPropertyDescriptor(replace ? src : dest, dest, key, value, omitAccessors);

      } else if (replace) {
        const value = srcPropertyIsCopyable ? copyObject(srcProperty, deepCopyContext) : srcProperty;
        copyPropertyDescriptor(src, dest, key, value, omitAccessors);
      }
    } else {
      const value = srcPropertyIsCopyable ? copyObject(srcProperty, deepCopyContext) : srcProperty;
      copyPropertyDescriptor(src, dest, key, value, omitAccessors);
    }
  });
}

function mergePropertyValues(src, dest, context) {
  const replace = context.replace;
  const deep = context.deep;
  const isCopyable = context.isCopyable;
  const isMergeable = context.isMergeable;
  const deepCopyContext = context.deepCopyContext;

  // Special case when both have same types of array-like properties, skip length and numeric property names
  getPropertyKeys(src, context.onlyEnumerable, areSimilarArrayLikes(src, dest)).forEach(key => {
    const srcProperty = src[key];
    const srcPropertyIsCopyable = isCopyable(srcProperty);

    if (hasOwnProperty.call(dest, key)) {
      const destProperty = dest[key];
      if (deep && srcPropertyIsCopyable && isMergeable(destProperty)) {
        // dest[key] = mergeObject(srcProperty, destProperty, context);
        const value = mergeObject(srcProperty, destProperty, context);
        copyPropertyDescriptor(dest, dest, key, value, true);

      } else if (replace) {
        dest[key] = srcPropertyIsCopyable ? copyObject(srcProperty, deepCopyContext) : srcProperty;
      }
    } else {
      dest[key] = srcPropertyIsCopyable ? copyObject(srcProperty, deepCopyContext) : srcProperty;
    }
  });
}
