## Changes

### 3.0.10
- Changes to `errors` module:
  - Removed `usePrefix` argument from `FatalError` constructor
  - Removed `blocking` property from `FatalError` prototype
  - Added new `TransientError` & `TimeoutError` Error subclasses
  - Added new `toJSON` function
  - Added new `toJSON` methods to all 3 Error subclasses that delegate to the new `toJSON` function
- Changes to `promises` module:
  - Added convenience `wrapNamedMethod` version of `wrapMethod` function

### 3.0.9
- Fixed `toJSON` method in `AppError` class to also include any enumerable own properties

### 3.0.8
- Added a new `errors` module with a new `FatalError` class
- Changed `AppError` & its subclasses in `app-errors` module to better conform to the `Error` class contract
  - Moved `name` property to the class's prototype
  - Changed all properties to be `enumerable` false & all, but `httpStatus`, to be mutable 
  - Added `toJSON` method to enable previous `JSON.stringify` behaviour

### 3.0.7
- Moved test devDependencies to package.json & removed test/package.json

### 3.0.6
- Changed `engines.node` to `>=6.10` in`test/package.json`

### 3.0.5
- Added new `any` module:
  - Added new `defined` & `notDefined` functions
  - Added `valueOf` function removed from `objects` module
- Changes to `objects`:
  - Moved `valueOf` function to `any` module
  - Deprecated exported `valueOf` function & delegated it to `valueOf` in `any` module
- Changes to `sorting`:
  - Removed `isUndefinedOrNull` function & replaced its usage with calls to `notDefined` function from `any` module
  - Deprecated exported `isUndefinedOrNull` function & delegated it to `notDefined` function from `any` module

### 3.0.4
- Changes to `promises` module:
  - Upgraded to Node 6.10.3
  - Added `avoidUnhandledPromiseRejectionWarning` function to avoid unneeded Node 6.10.3 warnings
  - Patched unit tests to pass under Node 6.10.3

### 3.0.3
- Minor changes & optimisations to `promises` module:
  - Changed `every` & `chain` functions to skip marking internal cancelled flags as true on cancellation if already completed
  - Changed `flatten` function to avoid the wasted effort of "flattening" non-Success values and/or arrays of non-Success values
- Changes to `arrays` module:  
  - Added a `flatten` function
- Changes to `tries` module:
  - Changed the default behaviour of the static `countSuccess` & `describeSuccessAndFailureCounts` methods to count any 
    non-Failure outcomes as successes (instead of ONLY counting Success outcomes as successes)
    - Added an optional `strict` argument to these static methods that can be set to true to restore the original 
      behaviour of ONLY strictly counting Success outcomes as successes 

### 3.0.2
- Changes to `promises` module:
  - Added `installCancel` utility function that installs a `cancel` method on a cancellable, which combines any existing
    `cancel` method behaviour with the given new cancel function logic
  - Changed `every` and `chain` functions to use new `installCancel` utility function, which enables them to "extend" 
    the behaviour of their cancellables' cancel methods instead of just overwriting them
  - Added `installCancelTimeout` utility function that installs a `cancelTimeout` method on a cancellable, which 
    combines any existing `cancelTimeout` method behaviour with the given new cancelTimeout function logic
  - Changed `delay` function to use new `installCancelTimeout` utility function, which enables it to "extend" the 
    behaviour of its cancellable's cancel method instead of just overwriting it
  - Changed `chain` function to also pass any and all previous outcomes as an optional 4th argument to the given input
    function `f`, which enables an input function to use and/or react to previous outcomes in the chain
  - Added new `DelayCancelledError` subclass of Error
  - Changed `delay` function to throw a new `DelayCancelledError` when timeout triggers and mustResolve is false. Note 
    that this change is not entirely backward compatible, since it fixes the prior behaviour that was incorrectly 
    throwing a boolean with the triggered value as the "error"
  - Added new `flatten` function to recursively reduce a given Promise or array of Promises (containing other promises 
    or arrays of promises) down to a single Promise (with any Success and/or Failure outcomes necessary)
- Changes to `numbers`, `objects` & `app-errors` modules:
  - Replaced all usages of `Number.parseInt(...)` with more reliable & consistent `Number(...)`
    e.g. parseInt('1e+22') returns 1, while Number('1e+22') returns 1e+22; 
    e.g. parseInt('12B3') returns 12, while Number('12B3') returns NaN
- Changes & fixes to `objects` module:
  - Moved the majority of the functionality of the `copy`, `copyNamedProperties` & `merge` functions to the new `copying` 
    & `merging` modules 
  - Changed `copy`, `copyNamedProperties` & `merge` functions to simply delegate to their counterparts in the new `copying` 
    & `merging` modules and marked the original functions as deprecated 
  - Added new `isTypedArray`, `getPropertyNames`, `getPropertySymbols`, `getPropertyKeys`, `getPropertyDescriptors`,
    `getPropertyValueByKeys`, `getPropertyDescriptorByKeys`, `getPropertyValueByCompoundName` & `getOwnPropertyNamesRecursively` 
    functions
- Added new `weak-map-copy` module to enable "copying" of `WeakMap` instances
- Added new `weak-set-copy` module to enable "copying" of `WeakSet` instances
- Added new `copying` module:
  - Added new versions of `copy` & `copyNamedProperties` functions copied from `objects` module
  - Major refactoring & revision of `copy` function to also support copying of property descriptors and copying of 
    Symbols, Dates, Buffers, ArrayBuffers, TypedArrays, DataViews, Errors, RegExps, Maps, Sets, WeakMaps & WeakSets
  - Added new `deepMapKeys`, `deepMapValues`, `deepSets`, `onlyEnumerable`, `onlyValues`, `omitAccessors`, `isCopyable`, 
    `createCustomObject` & `copyCustomContent` options to enable more extensive customisation of the `copy` function
  - Added new `configureCopyContext`, `isCopyableObject`, `copyObject`, `createObject`, `createTypedArray`, 
    `createDataView`, `copyContent`, `copyPropertyDescriptors`, `copyPropertyValues`, `copyPropertyDescriptor`, 
    `copyPropertyValue` & `copyDescriptor` supporting functions
- Added new `merging` module:
  - Added new version of `merge` function copied from `objects` module
  - Major refactoring & revision of `merge` function
  - Added new `isMergeable` and `onlyEnumerable` options to enable more extensive customisation of the `merge` function
  - Added new `configureMergeContext`, `isMergeableObject`, `mergeObject`, `resolveMergedObject`, `mergeContent`, 
    `areSimilarArrayLikes`, `mergePropertyDescriptors` & `mergePropertyValues` supporting functions
- Changes to `tries` module:
  - Added `simplify`, `count`, `countSuccess`, `countFailure`  & `describeSuccessAndFailureCounts` static methods 
  - Added `flatten` & `findFailure` static methods

### 3.0.1
- Changes to `promises` module:
  - Renamed `CancelledError` constructor `unresolvedPromises` parameter to more generic `unresolvedInputs`
  - Added `unresolvedInputs` property to `CancelledError` class and kept `unresolvedPromises` as an alias for it
  - Fixed bug in `completed` property of `CancelledError` class, which was incorrectly reporting completed as true when 
    no unresolved inputs or promises were provided
  - Added new `chain` function
- Changes to `strings` module:
  - Fixed potential shared global regular expression issues in `cleanInspectedPromise` function
- Changes to `type-defs` module:
  - Added `Outcome` & `Outcomes` type definitions
- Deleted arbitrary `copy.sh` script

### 3.0.0
- Non-backward compatible changes & fixes to `promises.js` module:
  - Removed all poly-filling & injection of `promises` module functions onto native `Promise` class
  - Changed behaviour of the `try` function to NOT use `Promise.all` when the given function returns an array of promises,
    so that it instead preserves ALL of the executed function's returned promises, "wrapped" in a `Promise.resolve`
  - Changed behaviour of the `allOrOne` and `every` functions to both accept any mixture of promise and/or non-promise 
    values, in order to bring their behaviour in line with that of the standard `Promise.all` method
  - Changed the `every` function to ONLY accept an array of `promises` (i.e. it no longer supports var args containing 
    promises) and added a new `cancellable` parameter to enable the wait for every promise to complete to be short-
    circuited at the earliest possible opportunity and the `every` function will then instead return a rejected 
    `CancelledError` from which the `resolvedOutcomes` and `unresolvedPromises` can be retrieved
  - Changed the `every` function's returned resolutions from literal objects containing `result` or `error` properties 
    to use the new `tries` modules's `Success`, `Failure` and `Try` classes instead (NB: Success has a `value` property, 
    and not a `result` property, so this change is not backward-compatible)
  - Fixed defect that was causing the `every` function to return an empty array when the first argument was not a promise
  - Renamed existing `isPromise` function to `isPromiseLike` & added new `isPromise` function that ONLY returns true for native promises
  - Removed the `isArrayOfPromises` function, which was no longer useful & would have had to change after `isPromise` changed
  - Added a new `one` function to convert a single promise into a native Promise that resolves to a `Success` or `Failure` outcome
  - Added a new `toPromise` function to attempt to convert a promise-like into a native promise
    - Used it in the new `one` function
    - Changed the `every` function to use it to ensure that the first promise in the chain becomes a native Promise
- Added new `tries.js` module:
  - Added `Try` superclass and `Success` and `Failure` subclasses modelled after their same-named Scala counterparts
- Added new `dates.js` module:
  - Added `simpleISODateTimeRegex` & `simpleISODateRegex` regular expressions
  - Added `extendedISODateTimeRegex` & `extendedISODateRegex` regular expressions
  - Added `isSimpleISODateTimeLike` & `isSimpleISODateLike` functions
  - Added `isSimpleISODateTime` & `isSimpleISODate` functions
  - Added `isExtendedISODateTimeLike` & `isExtendedISODateLike` functions
  - Added `isExtendedISODateTime` & `isExtendedISODate` functions
  - Added `toSimpleISODateTime` & `toSimpleISODate` functions
  - Added `toDateTime` & `toExtendedISODate` functions
  - Added `isValidDate` function
- Added new `sorting.js` module:
  - Added `SortType` "enum" object to defined the types of sorting supported
  - Added `compareNumbers`, `compareStrings`, `compareBooleans`, `compareDates`, `compareIntegerLikes` & 
    `compareUndefinedOrNull` compare functions to be used with Array `sort` method
  - Added `toSortable` function, which resolves the appropriate sort type and compare function to use for a given array 
    of values intended to be sorted and also maps the values into an array of consistent, sortable types of values
  - Added `sortSortable` function (primarily for testing), which simply sorts a "Sortable" object's `sortableValues` 
    using its `compare` function 
- Changes to `numbers.js` module:
  - Added `integerRegex`, `numberRegex`, `zeroRegex`, `leadingZeroesRegex` & `trailingZeroesRegex` regular expressions
  - Added `isInteger` & `isSafeInteger` functions
  - Added `isNumberLike`, `isIntegerLike` & `isZeroLike` functions
  - Added `toNumberLike`, `toDecimalLike`, `toDecimalLikeOrNaN`, `toIntegerLike`, `toIntegerLikeOrNaN` & 
    `toNumberOrIntegerLike` functions 
  - Added `removeLeadingZeroes`, `removeTrailingZeroes`, `zeroPadLeft` & `removeSignIfZero` functions
  - Added `nearlyEqual` function for testing numbers for approximate equality
- Changes to `strings.js` module:  
  - Added `stringifyKeyValuePairs` function
  - Added null-safe `toLowerCase` function
  - Changes to `stringify` function:
    - Added special cases to better support Dates, Promises, Maps & WeakMaps
    - Improved conversion of Errors - changed default behaviour to use a variation of Error toString() instead of always 
      treating Errors as Objects (the latter behaviour is now available by passing opts.avoidErrorToString as true)
    - Replaced `useToStringForErrors`, `avoidToJSONMethods` & `quoteStrings` parameters with a single, optional `opts` 
      parameter with optional `avoidErrorToString` (NB: renamed and changed default behaviour to use toString() for 
      Errors), `avoidToJSONMethods` and `quoteStrings` properties.
    - Added support for also handling any legacy arguments passed instead of a new `opts` object, which means this 
      API change is still backward-compatible
    - Added new `useJSONStringify`, `replacer` & `space` opts properties to enable `stringify`'s behaviour to be 
      switched to simply use `JSON.stringify` instead via its new `opts` argument
- Changes to `objects.js` module:
  - Added `toKeyValuePairs` function
  - Changes to `merge` function:
    - Replaced `replace` & `deep` parameters with a single, optional `opts` parameter with optional `replace` & `deep` 
      properties
    - Added support for also handling any legacy arguments passed instead of a new `opts` object, which means this 
      API change is still backward-compatible  
  - Changes to `copy` function:
    - Replaced `deep` parameter with a single, optional `opts` parameter with an optional `deep` property
    - Added support for also handling any legacy `deep` boolean argument passed instead of a new `opts` object, which 
      means this API change is still backward-compatible  
  - Changes to `copyNamedProperties` function:
    - Replaced `compact`, `deep` & `omitPropertyIfUndefined` parameters with a single, optional `opts` parameter with 
      optional `replace`, `deep` & `omitIfUndefined` properties
    - Added support for also handling any legacy arguments passed instead of a new `opts` object, which means this 
      API change is still backward-compatible
- Added new `type-defs` "module" to gather the various type definitions into one place
- Removed `test/testing.js`
  
### 2.0.14
- Added `copyNamedProperties` function to `objects.js` module

### 2.0.13
- Added `getPropertyValue` function to `objects.js` module

### 2.0.12
- Changed `app-errors.js` module to export `getHttpStatus` function

### 2.0.11
- Changed `app-errors.js` module's `AppError` constructor:
  - To preserve and use the more useful stack of its cause (if cause is an Error) instead of its own stack
- Changed `objects.js` module's `copy` and `merge` functions:
  - To support copying and merging of Arrays as well

### 2.0.10
- Changed `strings.js` module's `stringify` function:
  - To surround errors, which are converted to strings via their `toString` methods, with square brackets (to indicate
    that the property does not contain just a string error message)

### 2.0.9
- Patched and changed `strings.js` module's `stringify` function:
  - To use objects' `toJSON` methods (if any) by default (prior versions did NOT use them at all)
  - To add an optional `avoidToJSONMethods` argument to determine whether to avoid using objects' toJSON methods or not (default)
  - To double-quote any string elements within an array in order to synchronize with the behaviour of `JSON.stringify`
  - To re-sequence the order of errors' property names when they are stringified as normal objects - in order to have an 
    error's `name` as the first property, followed by its `message` as the second property, followed by the rest of its 
    enumerable properties (excluding its `stack` property) 
  - To differentiate simple references to identical objects within the object graph from true circular dependencies:
    - Simple references are now marked as `[Reference: {name}]`, whereas the prior version marked them incorrectly as `[Circular: {name}]`
    - True circular dependencies are still marked as `[Circular: {name}]`

### 2.0.8
- Changed `strings.js` module's `stringify` function:
  - To handle circular dependencies in objects and arrays
  - To recursively stringify objects & their properties itself, instead of relying on `JSON.stringify`
  - To add an optional `useToStringForErrors` argument to convert Errors using their `toString` methods (if true) or
    as objects (if false), but with their `message` and `name` (but not `stack`) properties visible in the result
  - To add an optional `quoteStrings` argument to return given string values surrounded with double-quotes (if true)

### 2.0.7
- Change to `objects.js`:
    - Removed console.log only added for debugging from `merge` function

### 2.0.6
- Change to `objects.js`:
    - Improved `merge` function to handle circular, non-Directed Acyclic Graphs of objects
    - Added a `copy` function also able to handle non-DAGs

### 2.0.5
- Change to `objects.js`:
    - Added a `merge` function

### 2.0.4
- Change to `strings.js`:
    - Added an `nthIndexOf` function that finds index of nth occurrence of a search value in a string

### 2.0.3
- Change to `promises.js`:
    - Added an `every` function that accepts multiple promises and returns a single promise that returns a list of either a result or an error for each and every one of the given promises

### 2.0.2
- Changes to `promises.js`:
    - Minor patch for `isPromise` to survive undefined and null
    - Added `isArrayOfPromises` function to check if a result is an array of promises
    - Added `allOrOne` function to transform a result into a single promise 
      using `Promise.all`, the promise-result or `Promise.resolve`
    - Changed implementation of `Promise.try` to use new `Promise.allOrOne`
    - Added unit tests for `allOrOne` & `isArrayOfPromises` and more tests for `try`

### 2.0.1
- Replaced all `x instanceof Array` checks with safer `Array.isArray(x)`
 
### 2.0.0
- Removed unnecessary functions.js module
- Patches to testing.js `checkMethodEqual` and `checkMethodOkNotOk` functions to show method prefixes properly

### 1.2.0
- strings: 
    - Improvements to `stringify` function to better handle functions and arrays
- promises: 
    - Added `isPromise` function 
    - Added optional `cancellable` argument to `delay` function to enable cancellation of delay's timeout
- Added new modules: 
    - app-errors 
    - arrays
    - objects
    - timers
- Added unit tests for existing and new functions and classes.

### 1.1.1
- Simple increment of version number to fix issue of 1.1.0 tag pointing to wrong version

### 1.1.0
- strings: Added `trimOrEmpty` function
- strings: Renamed `safeTrim` function to `trim` and changed `safeTrim` to an alias for `trim`