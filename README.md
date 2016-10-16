# core-functions
Core functions and utilities for working with Node/JavaScript primitives and built-in objects, e.g. strings, functions, booleans, Promises, base 64, etc.

# core-functions v1.0.0

Core functions and utilities for working with Node/JavaScript primitives and built-in objects, including strings, functions, booleans, Promises, base 64, etc.

Currently includes:
- strings.js - string utilities
- numbers.js - number utilities
- booleans.js - boolean utilities
- functions.js - function utilities
- promises.js - native Promise utilities
- base64.js - utilities for encoding from UTF-8 to Base 64 and vice-versa
- app-errors - a collection of standard application Error subclasses for common HTTP status codes

This module is exported as a [Node.js](https://nodejs.org/) module.

## Installation

Using npm:
```bash
$ {sudo -H} npm i -g npm
$ npm i --save core-functions
```

In Node.js:
```js
// To use the string utilties
const Strings = require('core-functions/strings');

// To use the number utilties
const Numbers = require('core-functions/numbers');

// To use the boolean utilties
const Booleans = require('core-functions/booleans');

// To use the function utilties
const Functions = require('core-functions/functions');

// To use the Base 64 encoding and decoding utilities
const base64 = require('core-functions/base64');

// To use the Promise utilties, which currently add static methods to the native `Promise` class
require('core-functions/promises');

// To use the standard application errors & utilties
const appErrors = require('core-functions/app-errors');
// const AppError = appErrors.AppError;
// const BadRequest = appErrors.BadRequest;

```

## Unit tests
This modules' unit tests were developed with and must be run with [tape](https://www.npmjs.com/package/tape). The unit tests have been tested on [Node.js v4.3.2](https://nodejs.org/en/blog/release/v4.3.2/).  

See the [package source](https://github.com/byron-dupreez/core-functions) for more details.
