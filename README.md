# core-functions v3.0.25

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

This module is exported as a [Node.js](https://nodejs.org) module.

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

// Arbitrary usage
assert(any.defined(undefined) === false);
assert(any.defined(null) === false);
assert(any.defined(0) === true);
assert(any.defined('') === true);

assert(any.notDefined(undefined) === true);
assert(any.notDefined(null) === true);
assert(any.notDefined(0) === false);
assert(any.notDefined('') === false);

assert(any.valueOf(null) === null);
assert(any.valueOf(Number(123)) === 123);
```

To use the string utilities
```js
const Strings = require('core-functions/strings');

// Arbitrary usage
assert(Strings.isBlank('  '));
assert(!Strings.isNotBlank('  '));

assert(Strings.trim(null) === null);
assert(Strings.trim('  abc  ') === 'abc');

assert(Strings.isString('Abc'));
assert(Strings.isString(String('Xyz')));
assert(!Strings.isString({}));

assert(Strings.nthIndexOf('123 123 123', '23', 3) === 9);

const obj = {};
obj.self = obj; // recursive object graph
console.log(Strings.stringify(obj)); // Logs: {"self":[Circular: this]}
```
To use the number utilities
```js
const Numbers = require('core-functions/numbers');

// Arbitrary usage
assert(Numbers.isInteger(Number(123)) === true);
assert(Numbers.isInteger(Number(123.001)) === false);
assert(Numbers.isInteger(undefined) === false);

assert(Numbers.isFiniteNumber(Number.MAX_VALUE) === true);
assert(Numbers.isFiniteNumber(Number.POSITIVE_INFINITY) === false);

assert(Numbers.isIntegerLike('1234567890123456789012345678901234567890') === true);
assert(Numbers.isIntegerLike('1234567890123456789012345678901234567890.00000000001') === false);

// ... plus more functions
```

To use the boolean utilities
```js
const Booleans = require('core-functions/booleans');

// Arbitrary usage
assert(Booleans.isBoolean(0) === false);
assert(Booleans.isBoolean('') === false);
assert(Booleans.isBoolean(true) === true);
assert(Booleans.isBoolean(false) === true);
```

To use the Base 64 encoding and decoding utilities
```js
const base64 = require('core-functions/base64');

// Arbitrary usage
console.log(base64.toBase64('ABC')); // Displays: IkFCQyI=
console.log(base64.fromBase64('IkFCQyI=')); // Displays: ABC
```

To use the Date utilities
```js
const Dates = require('core-functions/dates');

// Arbitrary usage
assert(Dates.isSimpleISODate(new Date('2017-07-21Z')) === true);
assert(Dates.isSimpleISODate(new Date('2017-07-2123:59Z')) === false);

// ... plus more functions
```

To use the sorting utilities
```js
const sorting = require('core-functions/sorting');

// Arbitrary usage
assert(sorting.compareIntegerLikes('1234567890123456789012345678901234567890', '1234567890123456789012345678901234567889') === 1);
assert(sorting.compareIntegerLikes('1234567890123456789012345678901234567890', '1234567890123456789012345678901234567890') === 0);
assert(sorting.compareIntegerLikes('1234567890123456789012345678901234567890', '1234567890123456789012345678901234567891') === -1);

// ... plus more functions
```

To use the Promise utilities
```js
const Promises = require('core-functions/promises');

// Arbitrary usage
Promises.delay(1000).then(() => console.log('Tock'));

// ... plus MANY more functions
```

To use the Object utilities
```js
const Objects = require('core-functions/objects');

console.log(Objects.getPropertyKeys({a:1, b:2})); // ['a', 'b']
console.log(Objects.toKeyValuePairs({a:1, b:2})); // [['a', 1], ['b', 2]]
```

To use the Array utilities
```js
const Arrays = require('core-functions/arrays');

// Arbitrary usage
assert(Arrays.isDistinct([1,2,3]) === true);
assert(Arrays.isDistinct([1,1,2,2,3]) === false);

assert(Arrays.distinct([1,1,2,2,3]).length === 3); // [1,2,3]

assert(Arrays.flatten([[1], [2,3], [4,5]]).length === 5); // [1,2,3,4,5]
```

To use the Timer utilities
```js
const timers = require('core-functions/timers');

// Arbitrary usage
const timer = setTimeout(1000, () => { console.log('Tick'); });
timers.cancelTimeout(timer);
```

To use the `Try`, `Success` and `Failure` classes
```js
const tries = require('./tries');
const Try = tries.Try;
// const Success = tries.Success;
// const Failure = tries.Failure;

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
const outcome3 = outcome2.recover(err => { console.error(err); return 123; });
assert(outcome3.isSuccess());
assert(outcome3.value === 123);

// ... or using map function to handle both successes & failures cases at the same time (similar to Promise.then)
const outcome4 = outcome.map(
  value => {
    return value + 42;
  },
  err => {
    console.log(err);
    return -1;
  }  
);

assert(outcome4.value === 'Abc42');
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

// Arbitrary usage
const code = Math.floor(Math.random() * 10) + 1;
let err = null;
let cause = new Error('Boom');
switch(code) {
  case 1:
    err = new BadRequest('Invalid request', '001', new Error('Xyz is not valid')); break;
  case 2:
    err = new Unauthorized('Not authorized', '002', cause); break;
  case 3:
    err = new Forbidden('Access forbidden', '003', cause); break;
  case 4:
    err = new NotFound('File not found', '004', cause); break;
  case 5:
    err = new RequestTimeout('Request timed out', '005', cause); break;
  case 6:
    err = new TooManyRequests('Too many requests', '006', cause); break;
  case 7:
    err = new InternalServerError('Internal server failure', '007', cause); break;
  case 8:
    err = new BadGateway('Bad, bad Gateway', '008', cause); break;
  case 9:
    err = new ServiceUnavailable('Service is currently unavailable', '009'); break;
  case 10:
    err = new GatewayTimeout('Gateway timed out', '010'); break;
  default:
    err = new AppError('Unexpected error', code, null, 418); break;
}

console.log(`Currently supported HTTP status codes: ${supportedHttpStatusCodes}`);
console.log('Corresponding AppError:', toAppError(cause));
console.log('Corresponding AppError for API Gateway:', toAppErrorForApiGateway(err));

if (err) {
  throw err;
}

```

## Unit tests
This module's unit tests were developed with and must be run with [tape](https://www.npmjs.com/package/tape). The unit tests have been tested on [Node.js v6.10.3](https://nodejs.org/en/blog/release/v6.10.3).  

See the [package source](https://github.com/byron-dupreez/core-functions) for more details.

## Changes
See [CHANGES.md](./CHANGES.md)