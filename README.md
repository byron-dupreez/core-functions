# core-functions v2.0.18

Core functions, utilities and classes for working with Node/JavaScript primitives and built-in objects, including 
strings, booleans, Promises, base 64, Arrays, Objects, standard AppErrors, etc.

Currently includes:
- app-errors.js - a collection of standard application AppError subclasses for the more commonly used HTTP status codes
- arrays.js - Array utilities
- base64.js - utilities for encoding from UTF-8 to Base 64 and vice-versa
- booleans.js - boolean utilities
- errors.js - common Error subclasses
- numbers.js - number utilities
- objects.js - Object utilities
- promises.js - native Promise utilities
- strings.js - string utilities
- timers.js - Timer/timeout utilities

This module is exported as a [Node.js](https://nodejs.org/) module.

## Installation

Using npm:
```bash
$ {sudo -H} npm i -g npm
$ npm i --save core-functions
```

In Node.js:

To use the string utilities
```js
const Strings = require('core-functions/strings');
```
To use the number utilities
```js
const Numbers = require('core-functions/numbers');
```

To use the boolean utilities
```js
const Booleans = require('core-functions/booleans');
```

To use the Base 64 encoding and decoding utilities
```js
const base64 = require('core-functions/base64');
```

To use the Promise utilities (as static methods on the native `Promise` class)
```js
require('core-functions/promises');
```
To use the Promise utilities (as exported functions)
```js
const promises = require('core-functions/promises');
```

To use the Object utilities
```js
const Objects = require('core-functions/objects');
```

To use the Array utilities
```js
const Arrays = require('core-functions/arrays');
```

To use the Timer utilities
```js
const timers = require('core-functions/timers');
```

To use the standard application errors
```js
const appErrors = require('core-functions/app-errors');
const AppError = appErrors.AppError;

// 400-series
const BadRequest = appErrors.BadRequest;
const Unauthorized = appErrors.Unauthorized;
const Forbidden = appErrors.Forbidden;
const NotFound = appErrors.NotFound;
const RequestTimeout = appErrors.RequestTimeout;
const TooManyRequests = appErrors.TooManyRequests;

// 500-series
const InternalServerError = appErrors.InternalServerError;
const BadGateway = appErrors.BadGateway;
const ServiceUnavailable = appErrors.ServiceUnavailable;
const GatewayTimeout = appErrors.GatewayTimeout;

// HTTP status codes with explicit class support and allowed to pass through to API Gateway by default
const supportedHttpStatusCodes = appErrors.supportedHttpStatusCodes;

// Error conversion functions
const toAppError = appErrors.toAppError;
const toAppErrorForApiGateway = appErrors.toAppErrorForApiGateway;
```

## Unit tests
This module's unit tests were developed with and must be run with [tape](https://www.npmjs.com/package/tape). The unit tests have been tested on [Node.js v4.3.2](https://nodejs.org/en/blog/release/v4.3.2/).  

See the [package source](https://github.com/byron-dupreez/core-functions) for more details.

## Changes

### 2.0.18
- Backport of 3.0.11 changes to `strings` module:
  - Changed `stringify` to survive a getter that throws an error

### 2.0.17
- Backport of the `errors` module from version 3.0.10

### 2.0.16
- Moved test devDependencies to package.json & removed test/package.json

### 2.0.15
- Backport of `objects` module `copy` function fix for TypeError thrown when `Object.create(o.__proto__)` was invoked & `o.__proto__` was undefined
- Backport of fix for `strings.test.js` equality failure that surfaces when run under Node 6.10.x
 
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

