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
 * @typedef {(Success|Failure)[]} Outcomes - represents a list of Success or Failure outcomes
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
 * @typedef {[string, *]} KeyValuePair - represents a key and value pair/tuple, which is implemented as an array
 * containing a string key followed by any type of value
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
