/**
 * @typedef {Object} Try - A Try represents the outcome of a function that either threw an error or successfully returned a value
 */
/**
 * @typedef {Try} Success - A Success represents a successful execution of a function and contains the value returned by the function
 * @property {*} value - the successfully computed value
 */
/**
 * @typedef {Try} Failure - A Failure represents a failed execution of a function and contains the error thrown by the function
 * @property {Error|*} error - the error thrown
 */
/**
 * @typedef {Success|Failure} Outcome - represents a Success or Failure outcome
 */
/**
 * @typedef {Outcome[]} Outcomes - represents a list of Success and/or Failure outcomes
 */

/**
 * @typedef {Promise|Object} PromiseLike - a native Promise or a promise-like ("then-able") object
 * @property {Function} then - the "then" function to be used to map a promise's result or error to an alternative result or error
 */

/**
 * @typedef {ResolvedResolution|RejectedResolution} Resolution - An object representing the outcome of a promise, which
 * will contain either the resolved result or the rejected error.
 */
/**
 * @typedef {Object} ResolvedResolution - An object containing a resolved result
 * @property {*} res - the resolved result
 */
/**
 * @typedef {Object} RejectedResolution - An object containing a rejected error
 * @property {Error} err - the rejected error
 */

/**
 * @typedef {SuccessfulExecution|FailedExecution} Execution - An object representing the outcome of a function call,
 * which will contain either the result returned or the error thrown.
 */
/**
 * @typedef {Object} SuccessfulExecution - An object representing successful execution, which contains the result that was returned
 * @property {*} result - the result that was returned
 */
/**
 * @typedef {Object} FailedExecution - An object representing failed execution, which contains the error that was thrown
 * @property {Error} error - the error that was thrown
 */

/**
 * @typedef {[PropertyKey, *]} KeyValuePair - represents a key and value pair/tuple, which is implemented as an array
 * containing a property key (i.e. a string/number/symbol property name) followed by any type of value
 */

/**
 * @typedef {Object} StringifyOpts - options to use to control how a value gets stringified when using {@linkcode module:core-functions/strings#stringify}
 * @property {boolean|undefined} [avoidErrorToString] - whether to avoid using Errors' toString() methods or not (default not)
 * @property {boolean|undefined} [avoidToJSONMethods] - whether to avoid using objects' toJSON() methods or not (default not)
 * @property {boolean|undefined} [quoteStrings] - whether to surround simple string values with double-quotes or not (default not)
 * @property {boolean|undefined} [useJSONStringify] - whether to instead use JSON.stringify or not (default not) - if true ONLY uses JSON.stringify(value,replacer,space) & ignores other opts
 * @property {Function|(string|number)[]|undefined} [replacer] - a replacer argument for JSON.stringify - currently ONLY used if useJSONStringify is true
 * @property {number|string|undefined} [space] - a space argument for JSON.stringify - currently ONLY used if useJSONStringify is true
 */

/**
 * @typedef {StringifyOpts} StringifyKeyValuePairsOpts - optional options to control how an array of key value pairs gets stringified
 * @property {string|undefined} [keyValueSeparator] - the optional key value separator to use (defaults to ':' if undefined)
 * @property {string|undefined} [pairSeparator] - the optional pair separator to use (defaults to ',' if undefined)
 */

/**
 * @typedef {Object} CompareOpts - compare options to use when comparing two values (for sorting purposes)
 * @property {boolean|undefined} [ignoreCase] - whether to ignore case in the comparison or not (defaults to false,
 * i.e. by default it will use case-sensitive sorting, e.g. 'Z' comes before 'a')
 */

/**
 * @typedef {number[]|string[]|Date[]|boolean[]} SortableArray - a sortable array
 */

/**
 * @typedef {{sortType: SortType, compare: Function, sortableValues: SortableArray}} Sortable - an object
 * containing: the sort type; the compare function to use in sorting;  and an array of sortable values
 */

/**
 * @typedef {Object|console} BasicLogger - a basic logger, such as console, that must have at least a `log` method and
 * an `error` method to be considered a valid, usable logger
 * @property {function(data: ...*)} log - a logging function (also for info-level logging)
 * @property {function(data: ...*)} error - an error-level logging function
 * @property {function(data: ...*)} [info] - an optional info-level logging function
 * @property {function(data: ...*)} [warn] - a optional warn-level logging function
 */

/**
 * @typedef {Object} Timeout - A timeout object created by {@linkcode setTimeout} or {@linkcode setInterval}, which can
 * be cancelled by using the {@linkcode clearTimeout} or {@linkcode clearInterval} functions respectively.
 * @property {boolean} _called - a "private" flag that indicates if the Timeout has been triggered already or not
 * @property {Function|null} _repeat - a "private" function that appears to be present on interval timeouts and null on normal timeouts
 */

/**
 * @typedef {Object} Cancellable - an arbitrary object onto which a `cancel` method can be installed
 * @property {Function|undefined} [cancel] - an optionally installed `cancel` method on the given cancellable
 * @see {@linkcode module:core-functions/promises.every}
 */

/**
 * @typedef {Object} DelayCancellable - an arbitrary object onto which a cancelTimeout method can be installed
 * @property {Function|undefined} [cancelTimeout] - an optionally installed `cancelTimeout` method on the given cancellable
 * @see {@linkcode module:core-functions/promises.delay}
 */

// objects module

/**
 * @typedef {Object} PropertyDescriptor - a property descriptor (e.g. return value of Object.getOwnPropertyDescriptor)
 * @property {boolean} [configurable = false] - whether the property is configurable or not
 * @property {boolean} [enumerable = false] - whether the property is enumerable or not
 * @property {*} [value] - the optional value assigned to the property
 * @property {boolean} [writable = false] - whether property is writable (true) or read-only (false)
 * @property {Function} [get] - an optional getter to use to get the property's value
 * @property {Function} [set] - an optional setter to use to set the property's value
 */

/**
 * @typedef {Object} CopyOpts - options to use with {@link module:core-functions/objects#copy}
 * @property {boolean|undefined} [deep] - Executes a deep copy if deep is true, otherwise only does a shallow copy (defaults to shallow)
 * @property {boolean|undefined} [deepMapKeys] - Executes a deep copy of any Map's keys if true (AND if `deep` is true), otherwise only does a shallow copy (defaults to shallow)
 * Rationale: Generally don't want to copy a Map's Object keys, since a Map uses reference equality to compare keys
 * @property {boolean|undefined} [deepMapValues] - Executes a deep copy of any Map's values if true (AND if `deep` is true), otherwise only does a shallow copy (defaults to shallow)
 * Rationale: Generally don't want to copy a Map's Object values, since Maps are typically used to cache values for look-up purposes
 * @property {boolean|undefined} [deepSets] - Executes a deep copy of any Set's elements if true (AND if `deep` is true), otherwise only does a shallow copy (defaults to shallow)
 * Rationale: Generally don't want to copy a Set's Object elements, since a Set uses reference equality to compare elements & identify duplicates
 * @property {boolean|undefined} [onlyEnumerable] - whether to copy ONLY enumerable properties or ALL own properties (default is false, i.e. copy all)
 * @property {boolean|undefined} [onlyValues] - whether to copy ONLY property values & ignore descriptors (if true) or copy property descriptors (if false - default)
 * @property {boolean|undefined} [omitAccessors] - whether to omit any descriptors' accessors & replace them with value properties with cloned values (if true) or to copy accessors & ignore cloned values when accessors are present (if false) (default is false, i.e. copy accessors)
 * @property {IsCopyable|undefined} [isCopyable] - an optional `isCopyable` function to further determine whether an object is copyable or not
 * @property {CreateObject|undefined} [createCustomObject] - an optional `createCustomObject` function that can be used to customize the creation of target objects during copying
 * @property {CopyContent|undefined} [copyCustomContent] - an optional `copyCustomContent` function that can be used to customize the copying of any special case content or internal state from one object to another object during copying
 */

/**
 * @typedef {CopyOpts} MergeOpts - options to use with {@link module:core-functions/objects#merge}
 * @property {boolean|undefined} [replace] - whether to replace properties in the `to` object with same named properties in the `from` object or not (defaults to not)
 * @property {IsMergeable|undefined} [isMergeable] - an optional `isMergeable` function to be used to determine whether an object can be the target of a `merge` or not
 * @property {boolean|undefined} [deep] - Executes a deep merge if true, otherwise only does a shallow merge (defaults to shallow)
 * @property {boolean|undefined} [onlyEnumerable] - whether to merge ONLY enumerable properties or ALL own properties (default is false, i.e. merge all)
 */

/**
 * @typedef {CopyOpts} CopyNamedPropertiesOpts - options to use with {@link module:core-functions/objects#copyNamedProperties}
 * @property {boolean|undefined} [compact] - whether to create a flatter, more-compact destination object, which will use
 * any compound property names as is and eliminate any unnecessary intermediate objects or rather create a more-
 * conventional, less-compact destination object, which will only have simple property names and any & all intermediate objects needed
 * @property {boolean|undefined} [deep] - executes a deep copy of each property value if the given deep flag is true, otherwise only does a shallow copy
 * @property {boolean|undefined} [omitIfUndefined] - whether or not to omit any named property that has an undefined value from the destination object
 */

/**
 * @typedef {function(o: Object): boolean} IsCopyable - an `isCopyable` function to further determine whether an object
 * is copyable or not (default implementation: {@link module:core-functions/copying#isCopyableObject})
 */

/**
 * @typedef {function(o: Object): boolean} IsMergeable - an `isMergeable` function to further determine whether an object
 * can be the target of a `merge` or not (default implementation: {@link module:core-functions/merging#isMergeableObject})
 */

/**
 * @typedef {Object} T - a type of object
 */

/**
 * @typedef {function(like: T, context: CopyContext): (T|*)} CreateObject - a `createCustomObject` function that can be
 * used to customize the creation of an object similar to a `like` object during copying (called by
 * {@link module:core-functions/objects#createObject})
 */

/**
 * @typedef {function(src: T, dest: T, context: CopyContext): boolean} CopyContent - a `copyCustomContent` function that
 * can be used to customize the copying of any special case content or internal state from the `src` object to the `dest`
 * object during copying (called by {@link module:core-functions/objects#copyContent}). Your custom `copyCustomContent`
 * function should return true if it completely handled the copying of the content and the rest of the `copyContent`
 * function's logic MUST be skipped; or false if not.
 */

/**
 * @typedef {Object} CopyContext - a completely configured context to use during copying, which contains the settings, the `isCopyable`, `createCustomObject` & `copyCustomContent` functions and the `history` cache to use
 * @property {boolean} deep - Executes a deep copy if deep is true, otherwise only does a shallow copy (defaults to shallow)
 * @property {boolean} deepMapKeys - Executes a deep copy of any Map's keys if true (AND if `deep` is true), otherwise only does a shallow copy (defaults to shallow)
 * Rationale: Generally don't want to copy a Map's Object keys, since a Map uses reference equality to compare keys
 * @property {boolean} deepMapValues - Executes a deep copy of any Map's values if true (AND if `deep` is true), otherwise only does a shallow copy (defaults to shallow)
 * Rationale: Generally don't want to copy a Map's Object values, since Maps are typically used to cache values for look-up purposes
 * @property {boolean} deepSets - Executes a deep copy of any Set's elements if true (AND if `deep` is true), otherwise only does a shallow copy (defaults to shallow)
 * Rationale: Generally don't want to copy a Set's Object elements, since a Set uses reference equality to compare elements & identify duplicates
 * @property {boolean} onlyEnumerable - whether to copy ONLY enumerable properties or ALL own properties (default is false, i.e. copy all)
 * @property {boolean} onlyValues - whether to copy ONLY property values & ignore descriptors (if true) or copy property descriptors (if false - default)
 * @property {boolean} omitAccessors - whether to omit any descriptors' accessors & replace them with value properties with cloned values (if true) or to copy accessors & ignore cloned values when accessors are present (if false) (default is false, i.e. copy accessors)
 * @property {IsCopyable} isCopyable - an `isCopyable` function to be used to determine whether an object is copyable or not (defaults to `isCopyableObject`)
 * @property {CreateObject|undefined} [createCustomObject] - an optional `createCustomObject` function that can be used to customize the creation of target objects during copying
 * @property {CopyContent|undefined} [copyCustomContent] - an optional `copyCustomContent` function that can be used to customize the copying of any special case content or internal state from one object to another object during copying
 * @property {WeakMap} history - a history cache of objects copied so far
 */

/**
 * @typedef {CopyContext} MergeContext - a completely configured context to use during merging, which contains the settings, the `isCopyable`, `isMergeable`, `createCustomObject` & `copyCustomContent` functions and the `history` cache to use
 * @property {boolean} replace - whether to replace properties in the `to` object with same named properties in the `from` object or not
 * @property {IsMergeable} isMergeable - an `isMergeable` function to be used to determine whether an object can be the target of a `merge` or not (defaults to `isMergeableObject`)
 * @property {CopyContext} deepCopyContext - a clone of this context to use for any deep copying needed during merge
 * @property {CopyContext} shallowCopyContext - a clone of this context to use for any shallow copying needed during merge
 */

/**
 *@typedef {Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array} TypedArray - A TypedArray subclass instance
 */