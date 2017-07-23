# core-functions v3.0.8

Core functions, utilities and classes for working with Node/JavaScript primitives and built-in objects, including 
strings, numbers, booleans, Dates, Promises, base 64, Arrays, Objects, standard AppErrors, sorting utilities, etc.

Currently includes:
- any.js - generic utilities for working with any type of value
- app-errors.js - a collection of standard API-related application AppError subclasses for the more commonly used HTTP status codes
- arrays.js - Array utilities
- base64.js - utilities for encoding from UTF-8 to Base 64 and vice-versa
- booleans.js - boolean utilities
- copying.js - Object copying utilities
- dates.js - Date utilities
- errors.js - common Error subclasses
- merging.js - Object merging utilities
- numbers.js - number utilities
- objects.js - Object utilities
- promises.js - native Promise utilities
- sorting.js - sorting utilities
- strings.js - string utilities
- timers.js - Timer/timeout utilities
- tries.js - Try, Success and Failure classes representing the outcome of a function execution
- weak-map-copy.js - a class that emulates a copy of a WeakMap 
- weak-set-copy.js - a class that emulates a copy of a WeakSet

This module is exported as a [Node.js](https://nodejs.org/) module.

## Installation

Using npm:
```bash
$ {sudo -H} npm i -g npm
$ npm i --save core-functions
```

In Node.js:

To use the `any` utilities
```js
const any = require('core-functions/any');
```

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

To use the Date utilities
```js
const Dates = require('core-functions/dates');
```

To use the sorting utilities
```js
const sorting = require('core-functions/sorting');
```

To use the Promise utilities
```js
const Promises = require('core-functions/promises');
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

To use the `Try`, `Success` and `Failure` classes
```js
const tries = require('./tries');
const Try = tries.Try;
const Success = tries.Success;
const Failure = tries.Failure;

// Simulate getting a Success outcome from successful execution of a function, which returns a value
const outcome = Try.try(() => 'Abc');
// outcome = new Success('Abc')
assert(outcome.isSuccess());
assert(outcome.value === 'Abc');

// using map function to convert a Success('Abc') outcome's value into a Success('AbcXyz')
const outcome1 = outcome.map(v => v + 'Xyz');
assert(outcome1.isSuccess());
assert(outcome1.value === 'AbcXyz');

// Simulate getting a Failure outcome from unsuccessful execution of a function, which throws an error
const testErr = new Error("Err"); // an arbitrary error for the example
const outcome2 = Try.try(() => {throw testErr});
// outcome2 is equivalent to new Failed(new Error("Err"))
assert(outcome2.isFailure());
assert(outcome2.error === testErr);

// using recover function to convert a Failed outcome's error into a Success(123)
const outcome3 = outcome2.recover(err => 123);
assert(outcome3.isSuccess());
assert(outcome3.value === 123);

// ... or using map function to handle both successes & failures cases at the same time (similar to Promise.then)
const outcome4 = outcome.map(
  value => {
    return value * 42;
  },
  err => {
    console.log(err.stack);
    return -1;
  }  
);
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
See [release_notes.md](./release_notes.md)