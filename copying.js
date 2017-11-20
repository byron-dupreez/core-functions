'use strict';

const Objects = require('./objects');
const isTypedArray = Objects.isTypedArray;
const getPropertyKeys = Objects.getPropertyKeys;
const getPropertyValueByKeys = Objects.getPropertyValueByKeys;

const strings = require('./strings');
const trim = strings.trim;
const isNotBlank = strings.isNotBlank;

const hasOwnProperty = Object.prototype.hasOwnProperty;
const allocUnsafe = Buffer && Buffer.allocUnsafe ? Buffer.allocUnsafe : undefined;
const symbolValueOf = Symbol.prototype.valueOf;

/**
 * Module containing functions for copying/cloning objects.
 * @module core-functions/copying
 * @author Byron du Preez
 */
exports._$_ = '_$_'; //IDE workaround
// Public API
// noinspection JSDeprecatedSymbols
exports.copy = copy;
// noinspection JSDeprecatedSymbols
exports.copyNamedProperties = copyNamedProperties;
exports.copyDescriptor = copyDescriptor;

// Internal API
exports.configureCopyContext = configureCopyContext;
exports.isCopyableObject = isCopyableObject;
exports.copyObject = copyObject;
exports.createObject = createObject;
exports.copyPropertyDescriptors = copyPropertyDescriptors;
exports.copyPropertyDescriptor = copyPropertyDescriptor;

/**
 * Sample options to use to alter the behaviour of the `copy` function
 * @namespace {Object.<string, CopyOpts>}
 */
const defaultCopyOpts = {
  shallow: {deep: false}, //deep: false, deepMapKeys: false, deepMapValues: false, deepSets: false},
  deep: {deep: true},
  deepMapValues: {deep: true, deepMapValues: true},
  deepMapKeysAndValues: {deep: true, deepMapKeys: true, deepMapValues: true},
  onlyEnumerable: {onlyEnumerable: true},
  deepOnlyEnumerable: {deep: true, onlyEnumerable: true}
  // onlyValues: {onlyValues: true},
  // deepOnlyValues: {deep: true, onlyValues: true},
  // omitAccessors: {omitAccessors: true},
  // deepOmitAccessors: {deep: true, omitAccessors: true}
};
exports.defaultCopyOpts = defaultCopyOpts;

/**
 * Sample options to use to alter the behaviour of the `copyNamedProperties` function
 * @namespace {Object.<string, CopyNamedPropertiesOpts>}
 */
const defaultCopyNamedPropertiesOpts = {
  shallow: defaultCopyOpts.shallow, // {deep: false},
  deep: defaultCopyOpts.deep, // {deep: true},
  compact: {compact: true},
  deepCompact: {deep: true, compact: true}
  // omitIfUndefined: {omitIfUndefined: true},
  // deepOmitIfUndefined: {deep: true, omitIfUndefined: true},
  // compactOmitIfUndefined: {compact: true, omitIfUndefined: true},
  // deepCompactOmitIfUndefined: {deep: true, compact: true, omitIfUndefined: true},
};
exports.defaultCopyNamedPropertiesOpts = defaultCopyNamedPropertiesOpts;

/**
 * Creates & returns a copy of the given object by copying its properties into a new object of a similar type if the
 * given object is copyable (e.g. non-null, non-Promise object); otherwise simply returns the given object. Executes a
 * deep copy if `opts.deep` is true; otherwise only does a shallow copy.
 *
 * @param {T} object - the object to be copied
 * @param {CopyOpts|boolean|undefined} [opts] - optional opts to use (if opts is true/false, handles it as if opts.deep were true/false)
 * @returns {T} a copy of the given object
 */
function copy(object, opts) {
  // Configure & upgrade the given context (if necessary)
  const context = configureCopyContext({}, opts);

  return context.isCopyable(object) ? copyObject(object, context) : object;
}

/**
 * Configures the given context (if any) or a new context (if non) as a complete context ready to be used for copying.
 * @param {CopyContext|Object|undefined} [context] - an optional, initial context to use, which can contain `isCopyable`, `createCustomObject` & `copyCustomContent` functions and history cache to use
 * @param {CopyOpts} [opts] - optional options to use to configure the context
 * @returns {CopyContext} the configured context
 */
function configureCopyContext(context, opts) {
  // Create a new context if no usable context provided
  if (!context || typeof context !== 'object') {
    context = {};
  }

  // Resolve the copy settings to use from the given opts
  const hasOpts = !!opts;

  const deep = hasOpts && opts.deep === true;
  context.deep = deep;
  context.deepMapKeys = deep && hasOpts && opts.deepMapKeys === true;
  context.deepMapValues = deep && hasOpts && opts.deepMapValues === true;
  context.deepSets = deep && hasOpts && opts.deepSets === true;

  context.onlyEnumerable = hasOpts && opts.onlyEnumerable === true;

  context.onlyValues = hasOpts && opts.onlyValues === true;
  context.omitAccessors = hasOpts && opts.omitAccessors === true;

  // Resolve the copy functions to use
  if (typeof context.isCopyable !== 'function') {
    context.isCopyable = opts && typeof opts.isCopyable === 'function' ?
      opts.isCopyable : isCopyableObject;
  }
  if (typeof context.createCustomObject !== 'function') {
    context.createCustomObject = opts && typeof opts.createCustomObject === 'function' ?
      opts.createCustomObject : undefined;
  }
  if (typeof context.copyCustomContent !== 'function') {
    context.copyCustomContent = opts && typeof opts.copyCustomContent === 'function' ?
      opts.copyCustomContent : undefined;
  }

  // Resolve the history cache to use
  if (!(context.history instanceof WeakMap)) {
    context.history = new WeakMap();
  }
  return context;
}

/**
 * Returns true if the given object can be safely copied, i.e. if its a non-null, non-Promise Object instance.
 * Note: Doesn't consider `console` as worth copying either.
 * @param {*} o - the value to test
 * @returns {boolean} true if copyable; false if not
 */
function isCopyableObject(o) {
  // Special case for Promises - do NOT treat them as objects to be copied or merged!
  return !!o && typeof o === 'object' && !(o instanceof Promise) && o !== console;
}

/**
 * Creates & returns a copy of the given object by copying its properties into a new object of a similar type. Executes
 * a deep copy if `context.deep` is true; otherwise only does a shallow copy.
 * @param {T} src - the source object
 * @param {CopyContext} context - the context to use
 * @returns {T} a copy of the given source object
 */
function copyObject(src, context) {
  const history = context.history;
  if (history.has(src)) {
    return history.get(src);
  }

  // Create a new destination object of a similar type to that of the source object
  const dest = createObject(src, context);

  // Remember this copy in case the same source appears again within its own graph
  history.set(src, dest);

  // Copy any special case content or internal state from src to dest (e.g. Array elements, Buffer content, Map entries, ...)
  copyContent(src, dest, context);

  // Note: All Objects, including Arrays, Buffers, Dates, etc. can ALSO have other properties
  // Copy all of the string-named and symbol-named properties' values or descriptors from src to dest
  if (!context.onlyValues)
    copyPropertyDescriptors(src, dest, context);
  else
    copyPropertyValues(src, dest, context);

  return dest;
}

/**
 * Creates and returns a new object of as similar a "type" as possible to that of the given object.
 * Precondition: object && typeof object === 'object'
 * @param {T} like - the object to use to determine the type of the new object
 * @param {CopyContext} context - the context to use, which can contain an optional custom `createCustomObject` function to be used
 * @returns {T} a new object of a similar type to that of the given object
 */
function createObject(like, context) {
  // Check if a custom `createCustomObject` was configured on the context (and if so attempt to use it)
  const createCustomObject = context.createCustomObject;
  if (createCustomObject && createCustomObject !== createObject) { // avoid infinite loop
    const customObject = createCustomObject(like, context);
    if (customObject && typeof customObject === 'object') {
      return customObject;
    }
  }
  // Workaround for "TypeError: Object prototype may only be an Object or null: undefined" defect
  // e.g. Object.create(null) creates an object with __proto__ of undefined, but cannot use Object.create(undefined)
  // (unlike `__proto__`, `Object.getPrototype(Object.create(null))` appears to return null instead of undefined)
  return Array.isArray(like) ? new like.constructor(like.length) : // must still be copied
    like instanceof String || like instanceof Number || like instanceof Boolean ? Object(like.valueOf()) :
      like instanceof Symbol ? Object(symbolValueOf.call(like)) : // Symbol object (not primitive symbol)
        like instanceof Date ? new like.constructor(like.getTime()) :
          like instanceof Map ? new like.constructor() : // must still be copied
            like instanceof Set ? new like.constructor() : // must still be copied
              like instanceof WeakMap ? new require('./weak-map-copy')(like) : // WeakMapCopy "copy" workaround ...
                like instanceof WeakSet ? new require('./weak-set-copy')(like) : // WeakSetCopy "copy" workaround ...
                  like instanceof Buffer ? allocUnsafe ? allocUnsafe(like.length) : new like.constructor(like.length) : // must still be copied
                    like instanceof ArrayBuffer ? new like.constructor(like.byteLength) : // must still be copied
                      isTypedArray(like) ? createTypedArray(like, context) :
                        like instanceof DataView ? createDataView(like, context) :
                          like instanceof Error ? Object.create(like) : // "cloned" workaround ... not a proper copy!
                            like instanceof RegExp ? createRegExp(like) :
                              Object.create(Object.getPrototypeOf(like)); // must still be copied
}

/**
 * Creates an appropriate new copy of the given TypedArray subclass instance. Creates a deep copy of both the given
 * typed array and its buffer (if context.deep is true) or creates a shallow copy of the given typed array that shares
 * the same underlying buffer (if context.deep is false).
 * @param {TypedArray} typedArray - a TypedArray subclass instance to copy
 * @param {CopyContext} context - the context to use, which contains the settings & `isCopyable` function to be used
 * @returns {TypedArray} a new copy of the given TypedArray subclass instance
 */
function createTypedArray(typedArray, context) {
  const buffer = typedArray.buffer;
  const arrayBuffer = context.deep && context.isCopyable(buffer) ? copyObject(buffer, context) : buffer;
  return new typedArray.constructor(arrayBuffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Creates a new copy of the given DataView instance. Creates a deep copy of both the given data view and its buffer
 * (if context.deep is true) or creates a shallow copy of the given data view that shares the same underlying buffer
 * (if context.deep is false).
 * @param {DataView} dataView - a DataView instance to copy
 * @param {CopyContext} context - the context to use, which contains the settings & `isCopyable` function to be used
 * @returns {DataView} a new copy of the given DataView
 */
function createDataView(dataView, context) {
  const buffer = dataView.buffer;
  const arrayBuffer = context.deep && context.isCopyable(buffer) ? copyObject(buffer, context) : buffer;
  return new dataView.constructor(arrayBuffer, dataView.byteOffset, dataView.byteLength);
}

function createRegExp(regExp) {
  const reFlags = /\w*$/; // Used to match `RegExp` flags from their coerced string values
  const result = new regExp.constructor(regExp.source, reFlags.exec(regExp));
  result.lastIndex = regExp.lastIndex;
  return result;
}

/**
 * Copies any special case content or internal state from the given src object to the given dest object. Currently
 * handles copying of Array elements, Buffer contents, ArrayBuffer contents, Map entries and Set elements.
 * @param {T} src - the source object from which to copy the content
 * @param {T} dest - the destination object to which to copy the content
 * @param {CopyContext} context - the context to use
 */
function copyContent(src, dest, context) {
  // Check if a custom `copyCustomContent` was configured on the context (and if so attempt to use it)
  const copyCustomContent = context.copyCustomContent;
  if (copyCustomContent && copyCustomContent !== copyContent) { // avoid infinite loop
    const done = copyCustomContent(src, dest, context);
    if (done) return;
  }

  const isCopyable = context.isCopyable;

  // No special case for Dates - dest is already a copy of src after call to `createObject`
  // No special case for TypedArrays & DataView - dest is already a copy of src after call to `createObject`

  if (Array.isArray(src)) {
    // Special case for Array - copy its elements from src Array to dest Array
    for (let i = 0; i < src.length; ++i) {
      const element = src[i];
      dest[i] = context.deep && isCopyable(element) ? copyObject(element, context) : element;
    }

  } else if (src instanceof Buffer) {
    // Special case for Buffers - copy the contents of the src Buffer to the dest Buffer
    src.copy(dest);

  } else if (src instanceof ArrayBuffer) {
    // Special case for ArrayBuffers - Copy the contents of the src ArrayBuffer to the dest ArrayBuffer
    new Uint8Array(dest).set(new Uint8Array(src));

  } else if (src instanceof Map) {
    // Special case for Map
    for (let entry of src) {
      const k = entry[0];
      const key = context.deepMapKeys && isCopyable(k) ? copyObject(k, context) : k;
      const v = entry[1];
      const value = context.deepMapValues && isCopyable(v) ? copyObject(v, context) : v;
      dest.set(key, value);
    }

  } else if (src instanceof Set) {
    // Special case for Set
    for (let e of src) {
      const element = context.deepSets && isCopyable(e) ? copyObject(e, context) : e;
      dest.add(element);
    }
  }
}

/**
 * Copies the string-named & symbol-named property descriptors from src to dest.
 * @param {Object} src - the source object from which to copy
 * @param {Object} dest - the destination object to which to copy
 * @param {CopyContext} context - the context to use, which contains the settings & `isCopyable` function to use
 */
function copyPropertyDescriptors(src, dest, context) {
  const deep = context.deep;
  const isCopyable = context.isCopyable;
  const omitAccessors = context.omitAccessors;

  // Collect copies of all of the targeted property descriptors from src
  const descriptors = getPropertyKeys(src, context.onlyEnumerable, true).reduce((descriptors, key) => {
    const v = src[key];
    const value = deep && isCopyable(v) ? copyObject(v, context) : v;
    const descriptor = Object.getOwnPropertyDescriptor(src, key);
    descriptors[key] = copyDescriptor(descriptor, value, omitAccessors);
    return descriptors;
  }, {});

  // Define properties on dest using all of the collected property descriptors
  Object.defineProperties(dest, descriptors);
}

/**
 * Copies the string-named and symbol-named property values from `src` object to `dest` object.
 * @param {Object} src - the source object from which to copy
 * @param {Object} dest - the destination object to which to copy
 * @param {CopyContext} context - the context to use, which contains the settings & `isCopyable` function to use
 */
function copyPropertyValues(src, dest, context) {
  const deep = context.deep;
  const isCopyable = context.isCopyable;

  getPropertyKeys(src, context.onlyEnumerable, true).forEach(key => {
    const v = src[key];
    dest[key] = deep && isCopyable(v) ? copyObject(v, context) : v;
  });
}

/**
 * Copies ONLY the (simple or compound) named properties, which are listed in the given propertyNames array, from the
 * given source object to a new destination object. Note that the value of any compound named property in the given
 * propertyNames array will be copied from the source and stored in the new destination object under the compound
 * property name if compact is true.
 *
 * @param {T} src - the source object from which to copy the named properties
 * @param {PropertyKey[]} keys - the list of named properties to be copied
 * @param {CopyNamedPropertiesOpts|undefined} [opts] - optional opts to use
 * @returns {T} a new object containing copies of only the named properties from the source object
 */
function copyNamedProperties(src, keys, opts) {
  // Configure & upgrade the given context (if necessary)
  const context = configureCopyContext({}, opts);

  const isCopyable = context.isCopyable;

  if (!isCopyable(src)) {
    return src === undefined ? undefined : src === null ? null : {};
  }

  // Resolve the options from opts
  const compact = !!opts && opts.compact === true;
  const deep = context.deep;
  const omitIfUndefined = !!opts && opts.omitIfUndefined === true;
  const onlyValues = context.onlyValues;
  const copyProperty = !onlyValues ? copyPropertyDescriptor : copyPropertyValue;

  const dest = createObject(src, context);

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    const maybeCompound = typeof key === 'string' && !hasOwnProperty.call(src, key); // if src has key with compound name
    const names = maybeCompound ? key.split(".").map(n => trim(n)).filter(name => isNotBlank(name)) : undefined;
    const n = maybeCompound ? names.length : -1;
    const compound = maybeCompound && n > 0;
    const v = compound ? getPropertyValueByKeys(src, names) : src[key];

    if (!omitIfUndefined || v !== undefined) {
      const value = deep && isCopyable(v) ? copyObject(v, context) : v;

      if (compact || !compound) {
        // Using compact mode or have a non-compound key
        copyProperty(src, dest, key, value, true);

      } else {
        // Copy compound named property in non-compact mode
        let s = src;
        let d = dest;
        const last = n - 1;
        for (let j = 0; j < last; ++j) {
          const name = names[j];
          if (!d[name]) {
            copyProperty(s, d, name, {}, true);
          }
          d = d[name];
          s = s ? s[name] : undefined;
        }
        copyProperty(s, d, names[last], value, true);
        // if (!onlyValues)
        //   copyPropertyDescriptor(s, d, names[last], value, true);
        // else
        //   d[names[last]] = value;
      }
    }
  }
  return dest;
}

/**
 * Creates a modified copy of the source object property descriptor identified by the given property key and updates the
 * destination object with the copy.
 * @param {T} src - the source object
 * @param {T} dest - the destination object
 * @param {PropertyKey} key - the property key, which can be a string or symbol name (or a number index)
 * @param {*} value - the value to set if no accessors or `omitAccessors` is true
 * @param {boolean|undefined} [omitAccessors] - whether to omit any accessors & replace them with a value property with
 * the given value (if true) or to copy any accessors & ignore the given value when accessors are present (if false)
 */
function copyPropertyDescriptor(src, dest, key, value, omitAccessors) {
  const srcDescriptor = src ? Object.getOwnPropertyDescriptor(src, key) : undefined;
  const destDescriptor = srcDescriptor ? copyDescriptor(srcDescriptor, value, omitAccessors) : undefined;
  if (destDescriptor) {
    Object.defineProperty(dest, key, destDescriptor);
  } else {
    dest[key] = value;
  }
}

//noinspection JSUnusedLocalSymbols
/**
 * Sets the destination object property identified by the given property key to the given value. Note that the `src` &
 * `omitAccessors` arguments are ignored and simply present to match the arguments of `copyPropertyDescriptor` above.
 * @param {T} src - the source object - unused - only included to match arguments of `copyPropertyDescriptor`
 * @param {T} dest - the destination object
 * @param {PropertyKey} key - the property key, which can be a string or symbol name (or a number index)
 * @param {*} value - the value to set if no accessors or `omitAccessors` is true
 * @param {boolean|undefined} [omitAccessors] - unused - only included to match arguments of `copyPropertyDescriptor`
 */
function copyPropertyValue(src, dest, key, value, omitAccessors) {
  dest[key] = value;
}

/**
 * Creates a copy of the given property descriptor (without any accessors if `omitAccessors` is true) and then, if the
 * descriptor has no accessors or `omitAccessors` is true, sets the copy's value property to the given value.
 * @param {PropertyDescriptor|undefined} [descriptor] - a property descriptor
 * @param {*} newValue - the value to set if no accessors or `omitAccessors` is true
 * @param {boolean|undefined} [omitAccessors] - whether to omit any accessors & replace them with a value property with
 * the given value (if true) or to copy any accessors & ignore the given value when accessors are present (if false)
 * @returns {PropertyDescriptor|undefined} a potentially modified copy of the given descriptor
 */
function copyDescriptor(descriptor, newValue, omitAccessors) {
  if (descriptor && typeof descriptor === 'object') {
    const copy = {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable
    };
    const hasGet = hasOwnProperty.call(descriptor, 'get');
    const hasSet = hasOwnProperty.call(descriptor, 'set');
    // "A property cannot both have accessors and be writable or have a value"
    // i.e. if a property has a `get` or `set` (even if just set to undefined) then it CANNOT have:
    // - `writable` with true/false/undefined; or
    // - `value` with anything (not even undefined)
    if (!omitAccessors && (hasGet || hasSet)) {
      if (hasGet) {
        copy.get = descriptor.get;
      }
      if (hasSet) {
        copy.set = descriptor.set;
      }
    } else {
      // No accessors (or omitting accessors), so safe to define `value` and/or `writable` properties
      copy.value = newValue;

      if (hasOwnProperty.call(descriptor, 'writable')) {
        copy.writable = descriptor.writable;
      }
    }
    return copy;
  }
  return descriptor === null ? null : undefined;
}
