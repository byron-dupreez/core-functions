'use strict';

/**
 * Unit tests for core-functions/promises.js
 * @author Byron du Preez
 */

const test = require('tape');

const Promises = require('../promises');


const Strings = require('../strings');
const stringify = Strings.stringify;

//const testing = require('./testing');
// const okNotOk = testing.okNotOk;
// const checkOkNotOk = testing.checkOkNotOk;
// const checkMethodOkNotOk = testing.checkMethodOkNotOk;
// const equal = testing.equal;
// const checkEqual = testing.checkEqual;
// const checkMethodEqual = testing.checkMethodEqual;

const error = new Error('Fail');

function fallible(fail) {
  if (fail) {
    throw error;
  }
  return 'ok';
}

function fallibleAsync(fail) {
  if (fail) {
    return Promise.reject(error);
  }
  return Promise.resolve('ok');
}

function nodeStyleFn(fail, callback) {
  function fn() {
    if (fail) {
      callback(error);
    } else {
      callback(null, 'ok');
    }
  }

  setTimeout(fn, 10); // Simulate an async function call
}

const objWithNodeStyleMethod = {
  nodeStyleMethod: (fail, callback) => {
    function fn() {
      if (fail) {
        callback(error);
      } else {
        callback(null, 'ok');
      }
    }

    setTimeout(fn, 10); // Simulate an async function call
  }
};

// ---------------------------------------------------------------------------------------------------------------------
// Promise.isPromise
// ---------------------------------------------------------------------------------------------------------------------

test('Promise.isPromise', t => {
  t.notOk(Promise.isPromise(undefined), 'undefined is not a promise');
  t.notOk(Promise.isPromise(null), 'null is not a promise');
  t.notOk(Promise.isPromise(new Error("Err")), 'An error is not a promise');
  t.notOk(Promise.isPromise({}), 'An empty object is not a promise');
  t.ok(Promise.isPromise(new Promise((resolve, reject) => resolve)), 'A Promise is a promise');
  t.ok(Promise.isPromise({then: () => console.log('Then-able')}), 'A then-able (i.e. an object with a then method) "is" a promise');

  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
// Promise.wrap
// ---------------------------------------------------------------------------------------------------------------------

test('Promise.wrap with node-style function that calls back with an error', t => {
  const promiseReturningFn = Promise.wrap(nodeStyleFn);
  promiseReturningFn(true)
    .then(result => {
      t.fail(`Promise.wrap(nodeStyleFn)(true).then should NOT have got result (${result})`);
      t.end(err);
    })
    .catch(err => {
      t.pass(`Promise.wrap(nodeStyleFn)(true).catch should have got error (${err})`);
      t.end();
    });
});

test('Promise.wrap with node-style function that calls back with a successful result', t => {
  const promiseReturningFn = Promise.wrap(nodeStyleFn);
  promiseReturningFn(false)
    .then(result => {
      t.pass(`Promise.wrap(nodeStyleFn)(false).then should have got result (${result})`);
      t.end();
    })
    .catch(err => {
      t.fail(`Promise.wrap(nodeStyleFn)(false).catch should NOT have got error (${err})`);
      t.end(err);
    });
});

// ---------------------------------------------------------------------------------------------------------------------
// Promise.wrapMethod
// ---------------------------------------------------------------------------------------------------------------------

test('Promise.wrapMethod with node-style method that calls back with an error', t => {
  const promiseReturningMethod = Promise.wrapMethod(objWithNodeStyleMethod, objWithNodeStyleMethod.nodeStyleMethod);
  promiseReturningMethod(true)
    .then(result => {
      t.fail(`Promise.wrapMethod(...)(true).then should NOT have got result (${result})`);
      t.end(err);
    })
    .catch(err => {
      t.pass(`Promise.wrapMethod(...)(true).catch should have got error (${err})`);
      t.end();
    });
});

test('Promise.wrapMethod with node-style method that calls back with a successful result', t => {
  const promiseReturningMethod = Promise.wrapMethod(objWithNodeStyleMethod, objWithNodeStyleMethod.nodeStyleMethod);
  promiseReturningMethod(false)
    .then(result => {
      t.pass(`Promise.wrapMethod(...)(false).then should have got result (${result})`);
      t.end();
    })
    .catch(err => {
      t.fail(`Promise.wrapMethod(...)(false).catch should NOT have got error (${err})`);
      t.end(err);
    });
});

// ---------------------------------------------------------------------------------------------------------------------
// Using standard Promise.resolve with a synchronous function that throws an error (reason for Promise.try)
// ---------------------------------------------------------------------------------------------------------------------

test('Standard Promise.resolve with a synchronous function that throws an error (reason for Promise.try)', t => {
  const mustFail = true;
  const prefix = `Promise.resolve(fallible(${mustFail}))`;
  try {
    Promise.resolve(fallible(mustFail))
      .then(result => {
        t.fail(`${prefix}.then should NOT have got result (${result})`);
        t.end();
      })
      .catch(err => {
        t.fail(`${prefix}.catch should NOT have caught error (${err})`);
        t.end(err);
      });
  } catch (err) {
    t.pass(`${prefix} try-catch should have caught error (${err})`);
    t.equal(err, error, `${prefix}.catch error (${err}) must be ${error}`);
    t.end();
  }
});

test('Standard Promise.resolve with a synchronous function that does not throw an error', t => {
  const mustFail = false;
  const prefix = `Promise.resolve(fallible(${mustFail}))`;
  try {
    Promise.resolve(fallible(mustFail))
      .then(result => {
        t.pass(`${prefix}.then should have got result (${result})`);
        t.equal(result, "ok", `${prefix}.then result (${result}) must be "ok"`);
        t.end();
      })
      .catch(err => {
        t.fail(`${prefix}.catch should NOT have caught error (${err})`);
        t.end(err);
      });
  } catch (err) {
    t.fail(`${prefix} try-catch should NOT have caught error (${err})`);
    t.end(err);
  }
});

// ---------------------------------------------------------------------------------------------------------------------
// Using standard Promise.reject with a synchronous function that throws an error (another reason for Promise.try)
// ---------------------------------------------------------------------------------------------------------------------

test('Standard Promise.reject with a synchronous function that throws an error (another reason for Promise.try)', t => {
  const mustFail = true;
  const prefix = `Promise.reject(fallible(${mustFail}))`;
  try {
    Promise.reject(fallible(mustFail))
      .then(result => {
        t.fail(`${prefix}.then should NOT have got result (${result})`);
        t.end();
      })
      .catch(err => {
        t.fail(`${prefix}.catch should NOT have caught error (${err})`);
        t.end(err);
      });
  } catch (err) {
    t.pass(`${prefix} try-catch should have caught error (${err})`);
    t.equal(err, error, `${prefix}.catch error (${err}) must be ${error}`);
    t.end();
  }
});

test('Standard Promise.reject with a synchronous function that does not throw an error', t => {
  const mustFail = false;
  const prefix = `Promise.reject(fallible(${mustFail}))`;
  try {
    Promise.reject(fallible(mustFail))
      .then(result => {
        t.fail(`${prefix}.then should NOT have got result (${result})`);
        t.end();
      })
      .catch(err => {
        t.pass(`${prefix}.catch should have caught "error" (${err})`);
        t.equal(err, "ok", `${prefix}.catch "error" (${err}) must be "ok"`);
        t.end();
      });
  } catch (err) {
    t.fail(`${prefix} try-catch should NOT have caught error (${err})`);
    t.end(err);
  }
});

// ---------------------------------------------------------------------------------------------------------------------
// Using standard Promise.resolve with an asynchronous function that returns a promise
// ---------------------------------------------------------------------------------------------------------------------

test('Standard Promise.resolve with an asynchronous function that returns a rejected promise', t => {
  const mustFail = true;
  const prefix = `Promise.resolve(fallibleAsync(${mustFail}))`;
  try {
    Promise.resolve(fallibleAsync(mustFail))
      .then(result => {
        t.fail(`${prefix}.then should NOT have got result (${result})`);
        t.end();
      })
      .catch(err => {
        t.pass(`${prefix}.catch should have caught error (${err})`);
        // Expected behaviour, Promise.resolve does unravel a promise value
        t.equal(err, error, `${prefix}.catch error (${err}) must be ${error}`);
        t.end();
      });
  } catch (err) {
    t.fail(`${prefix} try-catch should NOT have caught error (${err})`);
    t.end(err);
  }
});

test('Standard Promise.resolve with an asynchronous function that returns a resolved promise', t => {
  const mustFail = false;
  const prefix = `Promise.resolve(fallibleAsync(${mustFail}))`;
  try {
    Promise.resolve(fallibleAsync(mustFail))
      .then(result => {
        t.pass(`${prefix}.then should have got result (${result})`);
        // Expected behaviour, Promise.resolve does unravel a promise value
        t.equal(result, "ok", `${prefix}.then result (${result}) must be "ok"`);
        t.end();
      })
      .catch(err => {
        t.fail(`${prefix}.catch should NOT have caught error (${err})`);
        t.end(err);
      });
  } catch (err) {
    t.fail(`${prefix} try-catch should NOT have caught error (${err})`);
    t.end(err);
  }
});


// ---------------------------------------------------------------------------------------------------------------------
// Using standard Promise.reject with an asynchronous function that returns a promise
// ---------------------------------------------------------------------------------------------------------------------

test('Standard Promise.reject with an asynchronous function that returns a rejected promise', t => {
  const mustFail = true;
  const prefix = `Promise.reject(fallibleAsync(${mustFail}))`;
  try {
    Promise.reject(fallibleAsync(mustFail))
      .then(result => {
        t.fail(`${prefix}.then should NOT have got result (${result})`);
        t.end();
      })
      .catch(err => {
        t.pass(`${prefix}.catch should have caught an "error" (which is a rejected promise!)`);
        // Unexpected behaviour, Promise.reject does NOT unravel a promise value
        t.ok(Promise.isPromise(err), `${prefix}.catch error is a promise!`);
        err
          .then(result2 => {
            t.fail(`${prefix}.catch.then should NOT have got result2 (${result2})`);
            t.end();
          })
          .catch(err2 => {
            t.equal(err2, error, `${prefix}.catch.catch error (${stringify(err2)}) must be ${stringify(error)}`);
            t.end();
          });
      });
  } catch (err) {
    t.fail(`${prefix} try-catch should NOT have caught error (${err})`);
    t.end(err);
  }
});

test('Standard Promise.reject with an asynchronous function that returns a resolved promise', t => {
  const mustFail = false;
  const prefix = `Promise.reject(fallibleAsync(${mustFail}))`;
  try {
    Promise.reject(fallibleAsync(mustFail))
      .then(result => {
        t.fail(`${prefix}.then should NOT have got result (${result})`);
        t.end();
      })
      .catch(err => {
        t.pass(`${prefix}.catch should have caught "error" (which is a resolved promise!)`);
        // Unexpected behaviour, Promise.reject does NOT unravel a promise value
        t.ok(Promise.isPromise(err), `${prefix}.catch error is a promise!`);
        err
          .then(result2 => {
            t.equal(result2, "ok", `${prefix}.catch.then result (${stringify(result2)}) must be "ok"`);
            t.end();
          })
          .catch(err2 => {
            t.fail(`${prefix}.catch.catch should NOT have caught error (${stringify(err2)})`);
            t.end(err2);
          });
      });
  } catch (err) {
    t.fail(`${prefix} try-catch should NOT have caught error (${stringify(err)})`);
    t.end(err);
  }
});

// ---------------------------------------------------------------------------------------------------------------------
// Promise.try with a synchronous function
// ---------------------------------------------------------------------------------------------------------------------

test('Promise.try with a synchronous function that throws exception', t => {
  const mustFail = true;
  const prefix = `Promise.try(() => fallible(${mustFail}))`;
  try {
    Promise.try(() => fallible(mustFail))
      .then(result => {
        t.fail(`${prefix}.then should NOT have got result (${result})`);
        t.end();
      })
      .catch(err => {
        t.pass(`${prefix}.catch should have caught error (${err})`);
        t.equal(err, error, `${prefix}.catch error (${err}) must be ${error}`);
        t.end();
      });
  } catch (err) {
    t.fail(`${prefix} try-catch should NOT have caught error (${err})`);
    t.end(err);
  }
});

test('Promise.try with a synchronous function that does not throw exception', t => {
  const mustFail = false;
  const prefix = `Promise.try(() => fallible(${mustFail}))`;
  try {
    Promise.try(() => fallible(mustFail))
      .then(result => {
        t.pass(`${prefix}.then should have got result (${result})`);
        t.equal(result, "ok", `${prefix}.then result (${result}) must be "ok"`);
        t.end();
      })
      .catch(err => {
        t.fail(`${prefix}.catch should NOT have caught error (${err})`);
        t.end();
      });
  } catch (err) {
    t.fail(`${prefix} try-catch should NOT have caught error (${err})`);
    t.end(err);
  }
});

// ---------------------------------------------------------------------------------------------------------------------
// Promise.try with an asynchronous function that returns a promise
// ---------------------------------------------------------------------------------------------------------------------

test('Promise.try with an asynchronous function that returns a rejected promise', t => {
  const mustFail = true;
  const prefix = `Promise.try(() => fallibleAsync(${mustFail}))`;
  try {
    Promise.try(() => fallibleAsync(mustFail))
      .then(result => {
        t.fail(`${prefix}.then should NOT have got result (${result})`);
        t.end();
      })
      .catch(err => {
        t.pass(`${prefix}.catch should have caught error (${err})`);
        t.equal(err, error, `${prefix}.catch error (${err}) must be ${error}`);
        t.end();
      });
  } catch (err) {
    t.fail(`${prefix} try-catch should NOT have caught error (${err})`);
    t.end(err);
  }
});

test('Promise.try with an asynchronous function that returns a resolved promise', t => {
  const mustFail = false;
  const prefix = `Promise.try(() => fallibleAsync(${mustFail}))`;
  try {
    Promise.try(() => fallibleAsync(mustFail))
      .then(result => {
        t.pass(`${prefix}.then should have got result (${result})`);
        t.equal(result, "ok", `${prefix}.then result (${result}) must be "ok"`);
        t.end();
      })
      .catch(err => {
        t.fail(`${prefix}.catch should NOT have caught error (${err})`);
        t.end();
      });
  } catch (err) {
    t.fail(`${prefix} try-catch should NOT have caught error (${err})`);
    t.end(err);
  }
});

// ---------------------------------------------------------------------------------------------------------------------
// Promise.delay
// ---------------------------------------------------------------------------------------------------------------------

test('Promise.delay with no cancellable', t => {
  Promise.delay(10)
    .then(
      triggered => {
        t.pass('Promise.delay should have resolved and its timeout should have triggered');
        t.equal(triggered, true, 'Promise.delay should have triggered');
        t.end();
      },
      failed => {
        t.fail('Promise.delay should have resolved and its timeout should have triggered');
        t.end();
      }
    );
});

test('Promise.delay without cancellation of delay', t => {
  const cancellable = {};
  Promise.delay(10, cancellable)
    .then(
      triggered => {
        t.pass('Promise.delay should have resolved and its timeout should have triggered');
        t.equal(triggered, true, 'Promise.delay should have triggered');
        t.end();
      },
      failed => {
        t.fail('Promise.delay should have resolved and its timeout should have triggered');
        t.end();
      }
    );
});

test('Promise.delay with cancellation of delay (mustResolve undefined)', t => {
  const cancellable = {};
  Promise.delay(50, cancellable)
    .then(
      failed => {
        t.fail('Promise.delay should have rejected and its timeout should have cancelled');
        t.end();
      },
      triggered => {
        t.pass('Promise.delay should have rejected and its timeout should been cancelled');
        t.equal(triggered, false, 'Promise.delay should NOT have triggered yet');
        t.end();
      }
    );
  // Cancel the timeout
  cancellable.cancelTimeout();
});

test('Promise.delay with cancellation of delay (mustResolve explicit false)', t => {
  const cancellable = {};
  Promise.delay(50, cancellable)
    .then(
      failed => {
        t.fail('Promise.delay should have rejected and its timeout should have cancelled');
        t.end();
      },
      triggered => {
        t.pass('Promise.delay should have rejected and its timeout should have cancelled');
        t.equal(triggered, false, 'Promise.delay should NOT have triggered yet');
        t.end();
      }
    );
  // Cancel the timeout
  const mustResolve = false;
  cancellable.cancelTimeout(mustResolve);
});

test('Promise.delay with cancellation of delay (mustResolve true)', t => {
  const cancellable = {};
  Promise.delay(50, cancellable)
    .then(
      triggered => {
        t.pass('Promise.delay should have resolved, but its timeout should NOT have triggered');
        t.equal(triggered, false, 'Promise.delay should NOT have triggered yet');
        t.end();
      },
      failed => {
        t.fail('Promise.delay should NOT have rejected');
        t.end();
      }
    );
  // Cancel the timeout
  const mustResolve = true;
  cancellable.cancelTimeout(mustResolve);
});

// ---------------------------------------------------------------------------------------------------------------------
// Promise.isArrayOfPromises
// ---------------------------------------------------------------------------------------------------------------------

test('Promise.isArrayOfPromises', t => {
  t.notOk(Promise.isArrayOfPromises(undefined), 'undefined is not a Promise[]');
  t.notOk(Promise.isArrayOfPromises(null), 'null is not a Promise[]');
  t.notOk(Promise.isArrayOfPromises([null]), '[null] is not a Promise[]');
  t.notOk(Promise.isArrayOfPromises(new Error("Err")), 'An error is not a Promise[]');
  t.notOk(Promise.isArrayOfPromises({}), 'An empty object is not a Promise[]');
  t.notOk(Promise.isArrayOfPromises(new Promise((resolve, reject) => resolve)), 'A Promise is not a Promise[]');
  t.notOk(Promise.isArrayOfPromises({then: () => console.log('Then-able')}), 'A then-able is not a Promise[]');

  t.ok(Promise.isArrayOfPromises([]), 'An empty array is a Promise[]');
  t.ok(Promise.isArrayOfPromises([new Promise((resolve, reject) => resolve)]), 'A array with a Promise is a Promise[]');
  t.ok(Promise.isArrayOfPromises([new Promise((resolve, reject) => resolve), new Promise((resolve, reject) => resolve)]), 'A array with 2 Promises is a Promise[]');
  t.ok(Promise.isArrayOfPromises([{then: () => console.log('[Then-able]')}]), 'An array with a then-able "is" a Promise[]');
  t.ok(Promise.isArrayOfPromises([{then: () => console.log('[Then-able]')}, {then: () => console.log('[Then-able2]')}]), 'An array with 2 then-ables "is" a Promise[]');
  t.ok(Promise.isArrayOfPromises([{then: () => console.log('[Then-able]')}, new Promise((resolve, reject) => resolve)]), 'An array with a then-able & a promise "is" a Promise[]');

  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
// Promise.allOrOne
// ---------------------------------------------------------------------------------------------------------------------

test('Promise.allOrOne', t => {
  t.ok(Promise.isPromise(Promise.allOrOne(new Error("Err"))), 'allOrOne(error) gives a promise');
  t.ok(Promise.isPromise(Promise.allOrOne(undefined)), 'allOrOne(undefined) gives a promise');
  t.ok(Promise.isPromise(Promise.allOrOne(null)), 'allOrOne(null) gives a promise');

  const thenable = {then: () => 'Then-able'};
  t.ok(Promise.isPromise(Promise.allOrOne(thenable)), 'allOrOne(then-able) is a promise');
  t.equal(Promise.allOrOne(thenable), thenable, 'allOrOne(then-able) gives same then-able');
  t.ok(Promise.isPromise(Promise.allOrOne([thenable])), 'allOrOne([then-able]) is a promise');
  t.ok(Promise.isPromise(Promise.allOrOne([thenable,thenable])), 'allOrOne([then-able,then-able]) is a promise');

  const promise = new Promise((resolve, reject) => resolve('Bob'));
  t.ok(Promise.isPromise(Promise.allOrOne(promise)), 'allOrOne(promise) gives a promise');
  t.equal(Promise.allOrOne(promise), promise, 'allOrOne(promise) gives same promise');

  t.ok(Promise.isPromise(Promise.allOrOne([promise])), 'allOrOne([promise]) gives a promise');
  t.notEqual(Promise.allOrOne([promise]), promise, 'allOrOne([promise]) does not give same promise');

  t.ok(Promise.isPromise(Promise.allOrOne([promise, promise])), 'allOrOne([promise, promise]) gives a promise');

  const promiseArray = [promise];
  Promise.allOrOne(promiseArray)
    .then(ps => {
      promiseArray[0].then(p => {
        t.equal(ps[0], p, 'allOrOne([promise]) contains same promise as [promise]');
        t.end();
      });
  });

});

