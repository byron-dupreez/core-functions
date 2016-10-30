'use strict';

/**
 * Unit tests for core-functions/promises.js
 * @author Byron du Preez
 */

const test = require('tape');

const Promises = require('../promises');


const Strings = require('../strings');

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
// Using standard Promise.resolve with a fallible function (reason for Promise.try)
// ---------------------------------------------------------------------------------------------------------------------

test('Promise.resolve with fallible function that throws exception', t => {
  try {
    Promise.reject(fallible(true))
      .then(result => {
        t.fail(`Promise.resolve(fallible(true)).then should NOT have got result (${result})`);
        t.end();
      })
      .catch(err => {
        t.fail(`Promise.resolve(...).catch should NOT have caught error (${err})`);
        t.end(err);
      });
  } catch (err) {
    t.pass(`Catch should have caught error (${err})`);
    t.end();
  }
});

test('Promise.resolve with fallible function that does not throw exception', t => {
  try {
    Promise.resolve(fallible(false))
      .then(result => {
        t.pass(`Promise.resolve(fallible(false)).then should have got result (${result})`);
        t.end();
      })
      .catch(err => {
        t.fail(`Promise.resolve(fallible(false)).catch should NOT have caught error (${err})`);
        t.end(err);
      });
  } catch (err) {
    t.fail(`Catch should NOT have caught error (${err})`);
    t.end(err);
  }
});

// ---------------------------------------------------------------------------------------------------------------------
// Promise.try
// ---------------------------------------------------------------------------------------------------------------------

test('Promise.try with fallible function that throws exception', t => {
  try {
    Promise.try(() => fallible(true))
      .then(result => {
        t.fail(`Promise.resolve(fallible(false)).then should NOT have got result (${result})`);
        t.end(err);
      })
      .catch(err => {
        t.pass(`Promise.try(fallible(true)).catch should have caught error (${err})`);
        t.end();
      });
  } catch (err) {
    t.fail(`Catch should NOT have caught error (${err})`);
    t.end(err);
  }
});

test('Promise.try with fallible function that does not throw exception', t => {
  try {
    Promise.try(() => fallible(false))
      .then(result => {
        t.pass(`Promise.try(fallible(false)).then should have got result (${result})`);
        t.end();
      })
      .catch(err => {
        t.fail(`Promise.try(fallible(false)).catch should NOT have caught error (${err})`);
        t.end();
      });
  } catch (err) {
    t.fail(`Catch should NOT have caught error (${err})`);
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
