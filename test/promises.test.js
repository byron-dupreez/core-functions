'use strict';

/**
 * Unit tests for core-functions/promises.js
 * @author Byron du Preez
 */

const test = require('tape');

const tries = require('../tries');
// const Try = tries.Try;
const Success = tries.Success;
const Failure = tries.Failure;

const Promises = require('../promises');
const CancelledError = Promises.CancelledError;
const DelayCancelledError = Promises.DelayCancelledError;

const Strings = require('../strings');
const stringify = Strings.stringify;

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

// Arbitrary Promises
const p1 = Promise.resolve('p1');

const p2Error = new Error('p2 error');
const p2 = Promise.reject(p2Error);

const p3 = Promise.resolve('p3');

const p4Error = new Error('p4 error');
const p4 = Promise.reject(p4Error);

const t1 = genThenable(null, 't1', false, 1);

const t2Error = new Error('t2 error');
const t2 = genThenable(t2Error, null, false, 1);

const t3Error = new Error('t3 error');
const t3 = genThenable(t3Error, null, true, 1);

const d2Error = new Error('d2 error');
const d4Error = new Error('d4 error');

const e2Error = new Error('e2 error');
const e4Error = new Error('e4 error');

function genDelayedPromise(err, name, ms, delayCancellable, cancellable) {
  const startTime = Date.now();
  return Promises.delay(ms, delayCancellable).then(() => {
    if (cancellable) {
      if (cancellable.cancel) {
        const completed = cancellable.cancel();
        console.log(`Delayed promise ${name} ${completed ? '"cancelled" completed' : 'cancelled incomplete'} cancellable`);
      } else {
        console.log(`Delayed promise ${name} could NOT cancel given cancellable, since no cancel was installed yet!`);
      }
    }
    const msElapsed = Date.now() - startTime;
    if (msElapsed >= ms) {
      console.log(`Delayed promise ${name} completed at ${msElapsed} ms (original delay was ${ms} ms)`);
    } else {
      console.log(`Delayed promise ${name} ended prematurely at ${msElapsed} ms out of ${ms} ms delay`);
    }
    if (err) throw err;
    return name;
  });
}

function genThenable(err, data, failSync, ms) {
  return {
    then: (res, rej) => {
      setTimeout(() => {
        if (err) {
          if (!failSync) {
            console.log(`"then-able".then rejecting with error ${stringify(err)}`);
            rej(err);
          }
        } else {
          console.log(`"then-able".then resolving with result ${stringify(data)}`);
          res(data);
        }
      }, ms);
      if (err && failSync) {
        console.log(`"then-able".then throwing error ${stringify(err)}`);
        throw err;
      }
    }
  };
}

// Variations of `flatten` opts
const simplifyOutcomesOpts = {skipSimplifyOutcomes: false};
const skipSimplifyOutcomesOpts = {skipSimplifyOutcomes: true};

// ---------------------------------------------------------------------------------------------------------------------
// Promises.isPromise
// ---------------------------------------------------------------------------------------------------------------------

test('Promises.isPromise', t => {
  t.notOk(Promises.isPromise(undefined), 'undefined is not a promise');
  t.notOk(Promises.isPromise(null), 'null is not a promise');
  t.notOk(Promises.isPromise(new Error("Err")), 'An error is not a promise');
  t.notOk(Promises.isPromise({}), 'An empty object is not a promise');
  t.ok(Promises.isPromise(new Promise((resolve, reject) => resolve)), 'A Promise is a promise');
  t.notOk(Promises.isPromise({then: () => console.log('Then-able')}), 'A then-able (i.e. an object with a then method) is NOT a promise');

  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
// Promises.isPromiseLike
// ---------------------------------------------------------------------------------------------------------------------

test('Promises.isPromiseLike', t => {
  t.notOk(Promises.isPromiseLike(undefined), 'undefined is not a promise-like');
  t.notOk(Promises.isPromiseLike(null), 'null is not a promise-like');
  t.notOk(Promises.isPromiseLike(new Error("Err")), 'An error is not a promise-like');
  t.notOk(Promises.isPromiseLike({}), 'An empty object is not a promise-like');
  t.ok(Promises.isPromiseLike(new Promise((resolve, reject) => resolve)), 'A Promise is a promise-like');
  t.ok(Promises.isPromiseLike({then: () => console.log('Then-able')}), 'A then-able (i.e. an object with a then method) "is" a promise-like');

  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
// Promises.wrap
// ---------------------------------------------------------------------------------------------------------------------

test('Promises.wrap with node-style function that calls back with an error', t => {
  const promiseReturningFn = Promises.wrap(nodeStyleFn);
  promiseReturningFn(true)
    .then(result => {
      t.fail(`Promises.wrap(nodeStyleFn)(true).then should NOT have got result (${result})`);
      t.end(err);
    })
    .catch(err => {
      t.pass(`Promises.wrap(nodeStyleFn)(true).catch should have got error (${err})`);
      t.end();
    });
});

test('Promises.wrap with node-style function that calls back with a successful result', t => {
  const promiseReturningFn = Promises.wrap(nodeStyleFn);
  promiseReturningFn(false)
    .then(result => {
      t.pass(`Promises.wrap(nodeStyleFn)(false).then should have got result (${result})`);
      t.end();
    })
    .catch(err => {
      t.fail(`Promises.wrap(nodeStyleFn)(false).catch should NOT have got error (${err})`);
      t.end(err);
    });
});

// ---------------------------------------------------------------------------------------------------------------------
// Promises.wrapMethod
// ---------------------------------------------------------------------------------------------------------------------

test('Promises.wrapMethod with node-style method that calls back with an error', t => {
  const promiseReturningMethod = Promises.wrapMethod(objWithNodeStyleMethod, objWithNodeStyleMethod.nodeStyleMethod);
  promiseReturningMethod(true)
    .then(result => {
      t.fail(`Promises.wrapMethod(...)(true).then should NOT have got result (${result})`);
      t.end(err);
    })
    .catch(err => {
      t.pass(`Promises.wrapMethod(...)(true).catch should have got error (${err})`);
      t.end();
    });
});

test('Promises.wrapMethod with node-style method that calls back with a successful result', t => {
  const promiseReturningMethod = Promises.wrapMethod(objWithNodeStyleMethod, objWithNodeStyleMethod.nodeStyleMethod);
  promiseReturningMethod(false)
    .then(result => {
      t.pass(`Promises.wrapMethod(...)(false).then should have got result (${result})`);
      t.end();
    })
    .catch(err => {
      t.fail(`Promises.wrapMethod(...)(false).catch should NOT have got error (${err})`);
      t.end(err);
    });
});

// ---------------------------------------------------------------------------------------------------------------------
// Using standard Promise.resolve with a synchronous function that throws an error (reason for Promises.try)
// ---------------------------------------------------------------------------------------------------------------------

test('Standard Promise.resolve with a synchronous function that throws an error (reason for Promises.try)', t => {
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
// Using standard Promise.reject with a synchronous function that throws an error (another reason for Promises.try)
// ---------------------------------------------------------------------------------------------------------------------

test('Standard Promise.reject with a synchronous function that throws an error (another reason for Promises.try)', t => {
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
        t.ok(Promises.isPromise(err), `${prefix}.catch error is a promise!`);
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
        t.ok(Promises.isPromise(err), `${prefix}.catch error is a promise!`);
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
// Promises.try with a synchronous function
// ---------------------------------------------------------------------------------------------------------------------

test('Promises.try with a synchronous function that throws exception', t => {
  const mustFail = true;
  const prefix = `Promises.try(() => fallible(${mustFail}))`;
  try {
    Promises.try(() => fallible(mustFail))
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

test('Promises.try with a synchronous function that does not throw exception', t => {
  const mustFail = false;
  const prefix = `Promises.try(() => fallible(${mustFail}))`;
  try {
    Promises.try(() => fallible(mustFail))
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
// Promises.try with an asynchronous function that returns a promise
// ---------------------------------------------------------------------------------------------------------------------

test('Promises.try with an asynchronous function that returns a rejected promise', t => {
  const mustFail = true;
  const prefix = `Promises.try(() => fallibleAsync(${mustFail}))`;
  try {
    Promises.try(() => fallibleAsync(mustFail))
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

test('Promises.try with an asynchronous function that returns a resolved promise', t => {
  const mustFail = false;
  const prefix = `Promises.try(() => fallibleAsync(${mustFail}))`;
  try {
    Promises.try(() => fallibleAsync(mustFail))
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
// Promises.delay
// ---------------------------------------------------------------------------------------------------------------------

test('Promises.delay with no cancellable', t => {
  Promises.delay(10)
    .then(
      triggered => {
        t.pass('Promises.delay should have resolved and its timeout should have triggered');
        t.equal(triggered, true, 'Promises.delay should have triggered');
        t.end();
      },
      () => {
        t.fail('Promises.delay should have resolved and its timeout should have triggered');
        t.end();
      }
    );
});

test('Promises.delay without cancellation of delay', t => {
  const cancellable = {};
  Promises.delay(10, cancellable)
    .then(
      triggered => {
        t.pass('Promises.delay should have resolved and its timeout should have triggered');
        t.equal(triggered, true, 'Promises.delay should have triggered');
        t.end();
      },
      () => {
        t.fail('Promises.delay should have resolved and its timeout should have triggered');
        t.end();
      }
    );
});

test('Promises.delay with cancellation of delay (mustResolve undefined)', t => {
  const cancellable = {};
  Promises.delay(50, cancellable)
    .then(
      () => {
        t.fail('Promises.delay should have rejected and its timeout should have cancelled');
        t.end();
      },
      err => {
        t.pass('Promises.delay should have rejected and its timeout should been cancelled');
        t.ok(err instanceof DelayCancelledError, 'Promises.delay must reject with a DelayCancelledError');
        t.end();
      }
    );
  // Cancel the timeout
  cancellable.cancelTimeout();
});

test('Promises.delay with cancellation of delay (mustResolve explicit false)', t => {
  const cancellable = {};
  Promises.delay(50, cancellable)
    .then(
      () => {
        t.fail('Promises.delay should have rejected and its timeout should have cancelled');
        t.end();
      },
      err => {
        t.pass('Promises.delay should have rejected and its timeout should have cancelled');
        t.ok(err instanceof DelayCancelledError, 'Promises.delay must reject with a DelayCancelledError');
        t.end();
      }
    );
  // Cancel the timeout
  const mustResolve = false;
  cancellable.cancelTimeout(mustResolve);
});

test('Promises.delay with cancellation of delay (mustResolve true)', t => {
  const cancellable = {};
  Promises.delay(50, cancellable)
    .then(
      triggered => {
        t.pass('Promises.delay should have resolved, but its timeout should NOT have triggered');
        t.equal(triggered, false, 'Promises.delay should NOT have triggered yet');
        t.end();
      },
      () => {
        t.fail('Promises.delay should NOT have rejected');
        t.end();
      }
    );
  // Cancel the timeout
  const mustResolve = true;
  cancellable.cancelTimeout(mustResolve);
});

// ---------------------------------------------------------------------------------------------------------------------
// Promises.allOrOne
// ---------------------------------------------------------------------------------------------------------------------

test('Promises.allOrOne', t => {
  t.ok(Promises.isPromise(Promises.allOrOne(new Error("Err"))), 'allOrOne(error) gives a promise');
  t.ok(Promises.isPromise(Promises.allOrOne(undefined)), 'allOrOne(undefined) gives a promise');
  t.ok(Promises.isPromise(Promises.allOrOne(null)), 'allOrOne(null) gives a promise');

  const thenable = {then: () => 'Then-able'};
  t.ok(Promises.isPromise(Promises.allOrOne(thenable)), 'allOrOne(then-able) gives a promise');
  //t.equal(Promises.allOrOne(thenable), thenable, 'allOrOne(then-able) gives same then-able');
  t.notEqual(Promises.allOrOne(thenable), thenable, 'allOrOne(then-able) is NOT same then-able');
  t.ok(Promises.isPromise(Promises.allOrOne([thenable])), 'allOrOne([then-able]) is a promise');
  t.ok(Promises.isPromise(Promises.allOrOne([thenable, thenable])), 'allOrOne([then-able,then-able]) is a promise');

  const promise = new Promise((resolve, reject) => resolve('Bob'));
  t.ok(Promises.isPromise(Promises.allOrOne(promise)), 'allOrOne(promise) gives a promise');
  t.equal(Promises.allOrOne(promise), promise, 'allOrOne(promise) gives same promise');

  t.ok(Promises.isPromise(Promises.allOrOne([promise])), 'allOrOne([promise]) gives a promise');
  t.notEqual(Promises.allOrOne([promise]), promise, 'allOrOne([promise]) does not give same promise');

  t.ok(Promises.isPromise(Promises.allOrOne([promise, promise])), 'allOrOne([promise, promise]) gives a promise');

  const promiseArray = [promise];
  Promises.allOrOne(promiseArray)
    .then(ps => {
      promiseArray[0].then(p => {
        t.equal(ps[0], p, 'allOrOne([promise]) contains same promise as [promise]');
        t.end();
      });
    });

});

// ---------------------------------------------------------------------------------------------------------------------
// Promises.every
// ---------------------------------------------------------------------------------------------------------------------

test("Promises.every()", t => {
  t.throws(() => Promises.every(), Error, `Promises.every() must throw a 'not an array' Error`);
  t.throws(() => Promises.every(undefined), Error, `Promises.every(undefined) must throw a 'not an array' Error`);
  t.throws(() => Promises.every(null), Error, `Promises.every(null) must throw a 'not an array' Error`);
  t.throws(() => Promises.every(123), Error, `Promises.every(123) must throw a 'not an array' Error`);
  t.throws(() => Promises.every(Promise.resolve(1)), Error, `Promises.every(Promise.resolve(1)) must throw a 'not an array' Error`);
  t.end();
});

test('Promises.every([])', t => {
  Promises.every([]).then(results => {
    const expected = [];
    t.deepEqual(results, expected, `Promises.every([]) must be ${stringify(expected)}`);
    t.end();
  });
});

test('Promises.every([undefined])', t => {
  Promises.every([undefined]).then(results => {
    const expected = [new Success(undefined)];
    t.deepEqual(results, expected, `Promises.every([undefined]) must be ${stringify(expected)}`);
    t.end();
  });
});

test('Promises.every([null])', t => {
  Promises.every([null]).then(results => {
    const expected = [new Success(null)];
    t.deepEqual(results, expected, `Promises.every([null]) must be ${stringify(expected)}`);
    t.end();
  });
});

test('Promises.every([Promise.resolve(null), undefined])', t => {
  Promises.every([Promise.resolve(null), undefined]).then(results => {
    const expected = [new Success(null), new Success(undefined)];
    t.deepEqual(results, expected, `Promises.every([Promise.resolve(null), undefined]) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.every([undefined, Promise.resolve(null)])", t => {
  Promises.every([undefined, Promise.resolve(null)]).then(results => {
    const expected = [new Success(undefined), new Success(null)];
    t.deepEqual(results, expected, `Promises.every([undefined, Promise.resolve(null)]) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.every([Promise.resolve(null), null])", t => {
  Promises.every([Promise.resolve(null), null]).then(results => {
    const expected = [new Success(null), new Success(null)];
    t.deepEqual(results, expected, `Promises.every([Promise.resolve(null), null]) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.every([undefined, null, Promise.resolve(null), 123, 'ABCDEF'])", t => {
  Promises.every([undefined, null, Promise.resolve(null), 123, 'ABCDEF']).then(results => {
    const expected = [new Success(undefined), new Success(null), new Success(null), new Success(123), new Success('ABCDEF')];
    t.deepEqual(results, expected, `Promises.every([undefined, null, Promise.resolve(null), 123]) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.every([p1])", t => {
  Promises.every([p1]).then(results => {
    const expected = [new Success('p1')];
    t.deepEqual(results, expected, `Promises.every([p1]) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.every([p1, p2])", t => {
  Promises.every([p1, p2])
    .then(results => {
      const expected = [new Success('p1'), new Failure(p2Error)];
      t.deepEqual(results, expected, `Promises.every([p1,p2]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.every([p1, p2, p3])", t => {
  Promises.every([p1, p2, p3])
    .then(results => {
      const expected = [new Success('p1'), new Failure(p2Error), new Success('p3')];
      t.deepEqual(results, expected, `Promises.every([p1,p2,p3]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.every([p1, p2, p3, p4])", t => {
  Promises.every([p1, p2, p3, p4])
    .then(results => {
      const expected = [new Success('p1'), new Failure(p2Error), new Success('p3'), new Failure(p4Error),];
      t.deepEqual(results, expected, `Promises.every([p1,p2,p3,p4]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.every with [Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a:1}]", t => {
  // Reversed with duplicate and with simple values
  Promises.every([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a: 1}])
    .then(results => {
      const expected = [new Success(Infinity), new Failure(p4Error), new Success(4.5), new Success('p3'), new Success('3.5'), new Failure(p2Error),
        new Success(null), new Success('p1'), new Success(undefined), new Failure(p2Error), new Success({a: 1})];
      t.deepEqual(results, expected, `Promises.every([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a:1}]) must be ${stringify(expected)}`);
      t.end();
    });
});

test('Promises.every([1, 2, 3])', t => {
  Promises.every([1, 2, 3]).then(results => {
    const expected = [new Success(1), new Success(2), new Success(3)];
    t.deepEqual(results, expected, `Promises.every([1, 2, 3]) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.every([1, '2', 3])", t => {
  Promises.every([1, '2', 3]).then(results => {
    const expected = [new Success(1), new Success("2"), new Success(3)];
    t.deepEqual(results, expected, `Promises.every([1, '2', 3]) must be ${stringify(expected)}`);
    t.end();
  });
});


// =====================================================================================================================
// Promises.every with cancellations
// =====================================================================================================================

test("Promises.every([d1,d2,d3,d4]) cancelled immediately (i.e. before d1, d2, d3 & d4 resolve) will resolve only d1", t => {
  const cancellable = {};

  const d1Cancellable = {};
  const d1 = genDelayedPromise(null, 'd1', 10, d1Cancellable);
  t.ok(typeof d1Cancellable.cancelTimeout === "function", `d1Cancellable.cancelTimeout must be installed`);

  const d2Cancellable = {};
  const d2 = genDelayedPromise(d2Error, 'd2', 2000, d2Cancellable);
  t.ok(typeof d2Cancellable.cancelTimeout === "function", `d2Cancellable.cancelTimeout must be installed`);

  const d3Cancellable = {};
  const d3 = genDelayedPromise(null, 'd3', 3000, d3Cancellable);
  t.ok(typeof d3Cancellable.cancelTimeout === "function", `d3Cancellable.cancelTimeout must be installed`);

  const d4Cancellable = {};
  const d4 = genDelayedPromise(d4Error, 'd4', 4000, d4Cancellable);
  t.ok(typeof d4Cancellable.cancelTimeout === "function", `d4Cancellable.cancelTimeout must be installed`);

  Promises.every([d1, d2, d3, d4], cancellable).then(
    results => {
      t.end(`Promises.every([d1,d2,d3,d4]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.every([d1,d2,d3,d4]) when cancelled must reject with an error`);
      // Cancel the d2, d3 & d4 delays too (just for clean-up)
      t.ok(d1Cancellable.cancelTimeout(true), `d1Cancellable.cancelTimeout() should have timed-out`);
      t.notOk(d2Cancellable.cancelTimeout(true), `d2Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.notOk(d3Cancellable.cancelTimeout(true), `d3Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.notOk(d4Cancellable.cancelTimeout(true), `d4Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.ok(err instanceof CancelledError, `Promises.every([d1,d2,d3,d4]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success('d1')];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.every([d1,d2,d3,d4]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedPromises = [d2, d3, d4];
      t.deepEqual(err.unresolvedPromises, expectedUnresolvedPromises, `Promises.every([d1,d2,d3,d4]) unresolvedPromises must be ${stringify(expectedUnresolvedPromises)}`);
      t.end();
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
  const completed = cancellable.cancel();
  t.notOk(completed, `Promises.every([d1,d2,d3,d4]) must not be completed yet`);
});

test("Promises.every([d1,d2,d3,d4]) cancelled during d1 (i.e. before d2, d3 & d4 resolve) will resolve only d1", t => {
  const cancellable = {};

  const d1Cancellable = {};
  const d1 = genDelayedPromise(null, 'd1', 10, d1Cancellable, cancellable);
  t.ok(typeof d1Cancellable.cancelTimeout === "function", `d1Cancellable.cancelTimeout must be installed`);

  const d2Cancellable = {};
  const d2 = genDelayedPromise(d2Error, 'd2', 2000, d2Cancellable);
  t.ok(typeof d2Cancellable.cancelTimeout === "function", `d2Cancellable.cancelTimeout must be installed`);

  const d3Cancellable = {};
  const d3 = genDelayedPromise(null, 'd3', 3000, d3Cancellable);
  t.ok(typeof d3Cancellable.cancelTimeout === "function", `d3Cancellable.cancelTimeout must be installed`);

  const d4Cancellable = {};
  const d4 = genDelayedPromise(d4Error, 'd4', 4000, d4Cancellable);
  t.ok(typeof d4Cancellable.cancelTimeout === "function", `d4Cancellable.cancelTimeout must be installed`);

  Promises.every([d1, d2, d3, d4], cancellable).then(
    results => {
      t.end(`Promises.every([d1,d2,d3,d4]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.every([d1,d2,d3,d4]) when cancelled must reject with an error`);
      // Cancel the d2, d3 & d4 delays too (just for clean-up)
      t.ok(d1Cancellable.cancelTimeout(true), `d1Cancellable.cancelTimeout() should have timed-out`);
      t.notOk(d2Cancellable.cancelTimeout(true), `d2Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.notOk(d3Cancellable.cancelTimeout(true), `d3Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.notOk(d4Cancellable.cancelTimeout(true), `d4Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.ok(err instanceof CancelledError, `Promises.every([d1,d2,d3,d4]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success('d1')];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.every([d1,d2,d3,d4]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedPromises = [d2, d3, d4];
      t.deepEqual(err.unresolvedPromises, expectedUnresolvedPromises, `Promises.every([d1,d2,d3,d4]) unresolvedPromises must be ${stringify(expectedUnresolvedPromises)}`);
      t.end();
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
});

test("Promises.every([d1,d2,d3,d4]) cancelled during d2 (i.e. before d3 & d4 resolve) will resolve only d1 & d2", t => {
  const cancellable = {};

  const d1Cancellable = {};
  const d1 = genDelayedPromise(null, 'd1', 10, d1Cancellable);
  t.ok(typeof d1Cancellable.cancelTimeout === "function", `d1Cancellable.cancelTimeout must be installed`);

  const d2Cancellable = {};
  const d2 = genDelayedPromise(d2Error, 'd2', 20, d2Cancellable, cancellable);
  t.ok(typeof d2Cancellable.cancelTimeout === "function", `d2Cancellable.cancelTimeout must be installed`);

  const d3Cancellable = {};
  const d3 = genDelayedPromise(null, 'd3', 3000, d3Cancellable);
  t.ok(typeof d3Cancellable.cancelTimeout === "function", `d3Cancellable.cancelTimeout must be installed`);

  const d4Cancellable = {};
  const d4 = genDelayedPromise(d4Error, 'd4', 4000, d4Cancellable);
  t.ok(typeof d4Cancellable.cancelTimeout === "function", `d4Cancellable.cancelTimeout must be installed`);

  Promises.every([d1, d2, d3, d4], cancellable).then(
    results => {
      t.end(`Promises.every([d1,d2,d3,d4]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.every([d1,d2,d3,d4]) when cancelled must reject with an error`);
      // Cancel the d2, d3 & d4 delays too (just for clean-up)
      t.ok(d1Cancellable.cancelTimeout(true), `d1Cancellable.cancelTimeout() should have timed-out`);
      t.ok(d2Cancellable.cancelTimeout(true), `d2Cancellable.cancelTimeout() should have timed-out`);
      t.notOk(d3Cancellable.cancelTimeout(true), `d3Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.notOk(d4Cancellable.cancelTimeout(true), `d4Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.ok(err instanceof CancelledError, `Promises.every([d1,d2,d3,d4]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success('d1'), new Failure(d2Error)];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.every([d1,d2,d3,d4]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedPromises = [d3, d4];
      t.deepEqual(err.unresolvedPromises, expectedUnresolvedPromises, `Promises.every([d1,d2,d3,d4]) unresolvedPromises must be ${stringify(expectedUnresolvedPromises)}`);
      t.end();
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
});

test("Promises.every([d1,d2,d3,d4]) cancelled during d3 (i.e. before d4 completes) will resolve d1, d2 & d3", t => {
  const cancellable = {};

  const d1Cancellable = {};
  const d1 = genDelayedPromise(null, 'd1', 10, d1Cancellable);
  t.ok(typeof d1Cancellable.cancelTimeout === "function", `d1Cancellable.cancelTimeout must be installed`);

  const d2Cancellable = {};
  const d2 = genDelayedPromise(d2Error, 'd2', 20, d2Cancellable);
  t.ok(typeof d2Cancellable.cancelTimeout === "function", `d2Cancellable.cancelTimeout must be installed`);

  const d3Cancellable = {};
  const d3 = genDelayedPromise(null, 'd3', 30, d3Cancellable, cancellable);
  t.ok(typeof d3Cancellable.cancelTimeout === "function", `d3Cancellable.cancelTimeout must be installed`);

  const d4Cancellable = {};
  const d4 = genDelayedPromise(d4Error, 'd4', 4000, d4Cancellable);
  t.ok(typeof d4Cancellable.cancelTimeout === "function", `d4Cancellable.cancelTimeout must be installed`);

  Promises.every([d1, d2, d3, d4], cancellable).then(
    results => {
      t.end(`Promises.every([d1,d2,d3,d4]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.every([d1,d2,d3,d4]) when cancelled must reject with an error`);
      // Cancel the d2, d3 & d4 delays too (just for clean-up)
      t.ok(d1Cancellable.cancelTimeout(true), `d1Cancellable.cancelTimeout() should have timed-out`);
      t.ok(d2Cancellable.cancelTimeout(true), `d2Cancellable.cancelTimeout() should have timed-out`);
      t.ok(d3Cancellable.cancelTimeout(true), `d3Cancellable.cancelTimeout() should have timed-out`);
      t.notOk(d4Cancellable.cancelTimeout(true), `d4Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.ok(err instanceof CancelledError, `Promises.every([d1,d2,d3,d4]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success('d1'), new Failure(d2Error), new Success('d3')];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.every([d1,d2,d3,d4]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedPromises = [d4];
      t.deepEqual(err.unresolvedPromises, expectedUnresolvedPromises, `Promises.every([d1,d2,d3,d4]) unresolvedPromises must be ${stringify(expectedUnresolvedPromises)}`);
      t.end();
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
});

test("Promises.every([d1,d2,d3,d4]) cancelled during d4 will resolve d1, d2, d3 & d4", t => {
  const cancellable = {};

  const d1Cancellable = {};
  const d1 = genDelayedPromise(null, 'd1', 10, d1Cancellable);
  t.ok(typeof d1Cancellable.cancelTimeout === "function", `d1Cancellable.cancelTimeout must be installed`);

  const d2Cancellable = {};
  const d2 = genDelayedPromise(d2Error, 'd2', 20, d2Cancellable);
  t.ok(typeof d2Cancellable.cancelTimeout === "function", `d2Cancellable.cancelTimeout must be installed`);

  const d3Cancellable = {};
  const d3 = genDelayedPromise(null, 'd3', 30, d3Cancellable);
  t.ok(typeof d3Cancellable.cancelTimeout === "function", `d3Cancellable.cancelTimeout must be installed`);

  const d4Cancellable = {};
  const d4 = genDelayedPromise(d4Error, 'd4', 40, d4Cancellable, cancellable);
  t.ok(typeof d4Cancellable.cancelTimeout === "function", `d4Cancellable.cancelTimeout must be installed`);

  Promises.every([d1, d2, d3, d4], cancellable).then(
    outcomes => {
      t.pass(`Promises.every([d1,d2,d3,d4]) when cancelled too late must resolve with outcomes`);
      // Cancel the d2, d3 & d4 delays too (just for clean-up)
      t.ok(d1Cancellable.cancelTimeout(true), `d1Cancellable.cancelTimeout() should have timed-out`);
      t.ok(d2Cancellable.cancelTimeout(true), `d2Cancellable.cancelTimeout() should have timed-out`);
      t.ok(d3Cancellable.cancelTimeout(true), `d3Cancellable.cancelTimeout() should have timed-out`);
      t.ok(d4Cancellable.cancelTimeout(true), `d4Cancellable.cancelTimeout() should have timed-out`);
      const expectedOutcomes = [new Success('d1'), new Failure(d2Error), new Success('d3'), new Failure(d4Error)];
      t.deepEqual(outcomes, expectedOutcomes, `Promises.every([d1,d2,d3,d4]) outcomes must be ${stringify(expectedOutcomes)}`);
      t.end();
    },
    err => {
      t.end(`Promises.every([d1,d2,d3,d4]) when cancelled too late, must NOT reject with error`, err.stack);
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
});

// ---------------------------------------------------------------------------------------------------------------------
// Promises.one
// ---------------------------------------------------------------------------------------------------------------------

test("Promises.one(undefined)", t => {
  const p = Promises.one(undefined);
  t.ok(p instanceof Promise, `Promises.one(undefined) must be a Promise`);
  p.then(
    results => {
      const expected = new Success(undefined);
      t.deepEqual(results, expected, `Promises.one(undefined) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.one(undefined) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.one(null)", t => {
  const p = Promises.one(null);
  t.ok(p instanceof Promise, `Promises.one(null) must be a Promise`);
  p.then(
    results => {
      const expected = new Success(null);
      t.deepEqual(results, expected, `Promises.one(null) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.one(null) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.one(1)", t => {
  const p = Promises.one(1);
  t.ok(p instanceof Promise, `Promises.one(1) must be a Promise`);
  p.then(
    results => {
      const expected = new Success(1);
      t.deepEqual(results, expected, `Promises.one(1) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.one(1) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.one({})", t => {
  const p = Promises.one({});
  t.ok(p instanceof Promise, `Promises.one({}) must be a Promise`);
  p.then(
    results => {
      const expected = new Success({});
      t.deepEqual(results, expected, `Promises.one({}) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.one({}) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.one([])", t => {
  const p = Promises.one([]);
  t.ok(p instanceof Promise, `Promises.one([]) must be a Promise`);
  p.then(
    results => {
      const expected = new Success([]);
      t.deepEqual(results, expected, `Promises.one([]) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.one([]) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.one({a:1})", t => {
  const p = Promises.one({a: 1});
  t.ok(p instanceof Promise, `Promises.one({a:1}) must be a Promise`);
  p.then(
    results => {
      const expected = new Success({a: 1});
      t.deepEqual(results, expected, `Promises.one({a:1}) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.one({a:1}) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.one([1,'2',3])", t => {
  const p = Promises.one([1, '2', 3]);
  t.ok(p instanceof Promise, `Promises.one([1,'2',3]) must be a Promise`);
  p.then(
    results => {
      const expected = new Success([1, '2', 3]);
      t.deepEqual(results, expected, `Promises.one([1,'2',3]) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.one([1,'2',3]) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.one([p1])", t => {
  const p = Promises.one([p1]);
  t.ok(p instanceof Promise, `Promises.one([p1]) must be a Promise`);
  p.then(
    results => {
      const expected = new Success([p1]);
      t.deepEqual(results, expected, `Promises.one([p1]) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.one(p1) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.one(p1)", t => {
  const p = Promises.one(p1);
  t.ok(p instanceof Promise, `Promises.one(p1) must be a Promise`);
  p.then(
    results => {
      const expected = new Success('p1');
      t.deepEqual(results, expected, `Promises.one(p1) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.one(p1) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.one(p2)", t => {
  const p = Promises.one(p2);
  t.ok(p instanceof Promise, `Promises.one(p2) must be a Promise`);
  p.then(
    resolution => {
      const expected = new Failure(p2Error);
      t.deepEqual(resolution, expected, `Promises.one(p2) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.one(p2) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.one(t1) with 'then-able' t1 that returns a result", t => {
  const p = Promises.one(t1);
  t.ok(p instanceof Promise, `Promises.one(t1) must be a Promise`);
  t.notEqual(p, t1, `Promises.one(t1) must NOT be t1`);
  p.then(
    resolution => {
      const expected = new Success('t1');
      t.deepEqual(resolution, expected, `Promises.one(t1) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.one(t1) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.one(t2) with 'then-able' t2 that rejects with an error", t => {
  const p = Promises.one(t2);
  t.notEqual(p, t2, `Promises.one(t2) must NOT be t2`);
  t.ok(p instanceof Promise, `Promises.one(t2) must be a Promise`);
  p.then(
    resolution => {
      const expected = new Failure(t2Error);
      t.deepEqual(resolution, expected, `Promises.one(t2) must reject with ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.one(t2) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.one(t3) with 'then-able' t3 that throws an error synchronously", t => {
  const p = Promises.one(t3);
  t.ok(p instanceof Promise, `Promises.one(t3) must be a Promise`);
  t.notEqual(p, t3, `Promises.one(t3) must NOT be t3`);
  p.then(
    resolution => {
      const expected = new Failure(t3Error);
      t.deepEqual(resolution, expected, `Promises.one(t3) must reject with ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.one(t3) must NOT fail`, err.stack);
      t.end();
    });
});

// ---------------------------------------------------------------------------------------------------------------------
// Promises.toPromise
// ---------------------------------------------------------------------------------------------------------------------

test("Promises.toPromise(undefined)", t => {
  const p = Promises.toPromise(undefined);
  t.ok(p instanceof Promise, `Promises.toPromise(undefined) must be a Promise`);
  p.then(
    results => {
      const expected = undefined;
      t.deepEqual(results, expected, `Promises.toPromise(undefined) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.toPromise(undefined) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.toPromise(null)", t => {
  const p = Promises.toPromise(null);
  t.ok(p instanceof Promise, `Promises.toPromise(null) must be a Promise`);
  p.then(
    results => {
      const expected = null;
      t.deepEqual(results, expected, `Promises.toPromise(null) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.toPromise(null) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.toPromise(1)", t => {
  const p = Promises.toPromise(1);
  t.ok(p instanceof Promise, `Promises.toPromise(1) must be a Promise`);
  p.then(
    results => {
      const expected = 1;
      t.deepEqual(results, expected, `Promises.toPromise(1) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.toPromise(1) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.toPromise({})", t => {
  const p = Promises.toPromise({});
  t.ok(p instanceof Promise, `Promises.toPromise({}) must be a Promise`);
  p.then(
    results => {
      const expected = {};
      t.deepEqual(results, expected, `Promises.toPromise({}) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.toPromise({}) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.toPromise([])", t => {
  const p = Promises.toPromise([]);
  t.ok(p instanceof Promise, `Promises.toPromise([]) must be a Promise`);
  p.then(
    results => {
      const expected = [];
      t.deepEqual(results, expected, `Promises.toPromise([]) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.toPromise([]) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.toPromise({a:1})", t => {
  const p = Promises.toPromise({a: 1});
  t.ok(p instanceof Promise, `Promises.toPromise({a: 1}) must be a Promise`);
  p.then(
    results => {
      const expected = {a: 1};
      t.deepEqual(results, expected, `Promises.toPromise({a:1}) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.toPromise({a:1}) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.toPromise([1,'2',3])", t => {
  const p = Promises.toPromise([1, '2', 3]);
  t.ok(p instanceof Promise, `Promises.toPromise([1,'2',3]) must be a Promise`);
  p.then(
    results => {
      const expected = [1, '2', 3];
      t.deepEqual(results, expected, `Promises.toPromise([1,'2',3]) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.toPromise([1,'2',3]) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.toPromise([p1])", t => {
  const p = Promises.toPromise([p1]);
  t.ok(p instanceof Promise, `Promises.toPromise([p1]) must be a Promise`);
  t.notEqual(p, p1, `Promises.toPromise([p1]) must NOT be p1`);
  p.then(
    results => {
      const expected = [p1];
      t.deepEqual(results, expected, `Promises.toPromise([p1]) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.toPromise([p1]) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.toPromise(p1)", t => {
  const p = Promises.toPromise(p1);
  t.ok(p instanceof Promise, `Promises.toPromise(p1) must be a Promise`);
  t.equal(p, p1, `Promises.toPromise(p1) must be p1`);
  p.then(
    results => {
      const expected = 'p1';
      t.deepEqual(results, expected, `Promises.toPromise(p1) must be ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.toPromise(p1) must NOT fail`, err.stack);
      t.end();
    });
});

test("Promises.toPromise(p2)", t => {
  const p = Promises.toPromise(p2);
  t.ok(p instanceof Promise, `Promises.toPromise(p2) must be a Promise`);
  t.equal(p, p2, `Promises.toPromise(p2) must be p2`);
  p.then(
    result => {
      t.fail(`Promises.toPromise(p2) must NOT pass with result (${stringify(result)})`);
      t.end();
    },
    err => {
      const expected = p2Error;
      t.deepEqual(err, expected, `Promises.toPromise(p2) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.toPromise(t1) with 'then-able' t1 that resolves with a result", t => {
  const p = Promises.toPromise(t1);
  t.ok(p instanceof Promise, `Promises.toPromise(t1) must be a Promise`);
  t.notEqual(p, t1, `Promises.toPromise(t1) must NOT be t1`);
  p.then(
    results => {
      const expected = 't1';
      t.deepEqual(results, expected, `Promises.toPromise(t1) must resolve with ${stringify(expected)}`);
      t.end();
    },
    err => {
      t.fail(`Promises.toPromise(t1) must NOT reject with ${stringify(err)}`, err.stack);
      t.end();
    });
});

test("Promises.toPromise(t2) with 'then-able' t2 that rejects with an error", t => {
  const p = Promises.toPromise(t2);
  t.ok(p instanceof Promise, `Promises.toPromise(t2) must be a Promise`);
  t.notEqual(p, t2, `Promises.toPromise(t2) must NOT be t2`);
  p.then(
    result => {
      t.fail(`Promises.toPromise(t2) must NOT resolve with result (${stringify(result)})`);
      t.end();
    },
    err => {
      const expected = t2Error;
      t.equal(err, expected, `Promises.toPromise(t2) must reject with ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.toPromise(t3) with 'then-able' t3 that throws an error synchronously", t => {
  const p = Promises.toPromise(t3);
  t.ok(p instanceof Promise, `Promises.toPromise(t3) must be a Promise`);
  t.notEqual(p, t3, `Promises.toPromise(t3) must NOT be t3`);
  p.then(
    result => {
      t.fail(`Promises.toPromise(t3) must NOT resolve with result (${stringify(result)})`);
      t.end();
    },
    err => {
      const expected = t3Error;
      t.equal(err, expected, `Promises.toPromise(t3) must reject with ${stringify(expected)}`);
      t.end();
    });
});

// ---------------------------------------------------------------------------------------------------------------------
// Promises.chain
// ---------------------------------------------------------------------------------------------------------------------

test("Promises.chain() with invalid arguments", t => {
  const notFunctionRegex = /The `chain` function only accepts `f` as a function/;
  const notArrayRegex = /The `chain` function only accepts `inputs` as an array/;
  t.throws(() => Promises.chain(), notFunctionRegex, `Promises.chain() must throw a 'not a function' Error`);
  t.throws(() => Promises.chain(undefined, undefined), notFunctionRegex, `Promises.chain(undefined, undefined) must throw a 'not a function' Error`);
  t.throws(() => Promises.chain(undefined, []), notFunctionRegex, `Promises.chain(undefined, []) must throw a 'not a function' Error`);
  t.throws(() => Promises.chain(e => e, undefined), notArrayRegex, `Promises.chain(e => e, undefined) must throw a 'not an array' Error`);
  t.throws(() => Promises.chain(e => e, 123), notArrayRegex, `Promises.chain(e => e, 123) must throw a 'not an array' Error`);
  t.end();
});

test('Promises.chain(e => e, [])', t => {
  const chain = Promises.chain(e => e, []);

  t.ok(chain, `Promises.chain(e => e, []) must return a value`);
  t.ok(chain instanceof Promise, `Promises.chain(e => e, []) must return an instance of Promise`);

  chain.then(
    value => {
      t.deepEqual(value, [], `Promises.chain(e => e, []) must return a promise of an empty array`);
      t.end();
    },
    err => {
      t.end(`Promises.chain(e => e, [1, 2, 3]) must not fail with an error` + err.stack);
    }
  );
});

test('Promises.chain(e => e, [1])', t => {
  const chain = Promises.chain(e => e, [1]);

  t.ok(chain, `Promises.chain(e => e, [1]) must return a value`);
  t.ok(chain instanceof Promise, `Promises.chain(e => e, [1]) must return an instance of Promise`);

  chain.then(
    value => {
      t.deepEqual(value, [new Success(1)], `Promises.chain(e => e, [1]) must return a promise of [new Success(1)]`);
      t.end();
    },
    err => {
      t.end(`Promises.chain(e => e, [1]) must not fail with an error` + err.stack);
    }
  );
});

test('Promises.chain(e => e, [1, 2, 3])', t => {
  const chain = Promises.chain(e => e, [1, 2, 3]);

  t.ok(chain, `Promises.chain(e => e, [1, 2, 3]) must return a value`);
  t.ok(chain instanceof Promise, `Promises.chain(e => e, [1, 2, 3]) must return an instance of Promise`);

  chain.then(
    value => {
      t.deepEqual(value, [new Success(1), new Success(2), new Success(3)], `Promises.chain(e => e, [1, 2, 3]) must return a promise of [new Success(1), new Success(2), new Success(3)]`);
      t.end();
    },
    err => {
      t.end(`Promises.chain(e => e, [1, '2', 3]) must not fail with an error` + err.stack);
    }
  );
});

test('Promises.chain(e => e * 20, [5])', t => {
  const chain = Promises.chain(e => e * 20, [5]);

  t.ok(chain, `Promises.chain(e => e * 20, [5]) must return a value`);
  t.ok(chain instanceof Promise, `Promises.chain(e => e * 20, [5]) must return an instance of Promise`);

  chain.then(
    value => {
      t.deepEqual(value, [new Success(100)], `Promises.chain(e => e * 20, [5]) must return a promise of [new Success(100)]`);
      t.end();
    },
    err => {
      t.end(`Promises.chain(e => e * 20, [5]) must not fail with an error` + err.stack);
    }
  );
});

test('Promises.chain(e => e * 20, [1, 2, 3])', t => {
  const chain = Promises.chain(e => e * 20, [1, 2, 3]);

  t.ok(chain, `Promises.chain(e => e * 20, [1, 2, 3]) must return a value`);
  t.ok(chain instanceof Promise, `Promises.chain(e => e * 20, [1, 2, 3]) must return an instance of Promise`);

  chain.then(
    value => {
      t.deepEqual(value, [new Success(20), new Success(40), new Success(60)], `Promises.chain(e => e * 20, [1, 2, 3]) must return a promise of [new Success(20), new Success(40), new Success(60)]`);
      t.end();
    },
    err => {
      t.end(`Promises.chain(e => e * 20, [1, '2', 3]) must not fail with an error` + err.stack);
    }
  );
});

test("Promises.chain(f, [1,2,3,4]) with 4 inputs & 4 calls returning 4 successful promises will resolve 4 Success outcomes", t => {
  const delayCancellables = [{}, {}, {}, {}];
  const f = (e, i, es) => genDelayedPromise(null, e, 1, delayCancellables[i]);

  const chain = Promises.chain(f, [1, '2', {c: 3}, [4]]);

  t.ok(chain, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return a value`);
  t.ok(chain instanceof Promise, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return an instance of Promise`);

  chain.then(
    outcomes => {
      t.pass(`Promises.chain(f, [1, '2', {c:3}, [4]]) must resolve with outcomes`);
      // Cancel the delays too (just for clean-up)
      t.ok(delayCancellables[0].cancelTimeout(true), `delayCancellables[0].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[1].cancelTimeout(true), `delayCancellables[1].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[2].cancelTimeout(true), `delayCancellables[2].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[3].cancelTimeout(true), `delayCancellables[3].cancelTimeout() should have timed-out`);
      t.ok(Array.isArray(outcomes), `Promises.chain(f, [1, '2', {c:3}, [4]]) returned outcomes must be an Array`);
      t.equal(outcomes.length, 4, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return 4 outcomes`);
      const expectedOutcomes = [new Success(1), new Success('2'), new Success({c: 3}), new Success([4])];
      t.deepEqual(outcomes, expectedOutcomes, `Promises.chain(f, [1, '2', {c:3}, [4]]) outcomes must be ${stringify(expectedOutcomes)}`);
      t.end();
    },
    err => {
      t.end(`Promises.chain(f, [1, '2', {c:3}, [4]]) must NOT reject with an error: ${stringify(err)}`);
    }
  );
});

test("Promises.chain(f, [1,2,3,4]) with 4 inputs & 4 calls returning 3 rejecting promises will resolve 1 Success & 3 Failure outcomes", t => {
  const delayCancellables = [{}, {}, {}, {}];
  const errs = [new Error('Crash 0'), new Error('Crash 1'), new Error('Crash 2'), new Error('Crash 3')];
  const f = (e, i, es) => genDelayedPromise(i === 3 ? null : errs[i], e, 1, delayCancellables[i]);

  const chain = Promises.chain(f, [1, '2', {c: 3}, [4]]);

  t.ok(chain, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return a value`);
  t.ok(chain instanceof Promise, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return an instance of Promise`);

  chain.then(
    outcomes => {
      t.pass(`Promises.chain(f, [1, '2', {c:3}, [4]]) must resolve with outcomes`);
      // Cancel the delays too (just for clean-up)
      t.ok(delayCancellables[0].cancelTimeout(true), `delayCancellables[0].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[1].cancelTimeout(true), `delayCancellables[1].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[2].cancelTimeout(true), `delayCancellables[2].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[3].cancelTimeout(true), `delayCancellables[3].cancelTimeout() should have timed-out`);
      t.ok(Array.isArray(outcomes), `Promises.chain(f, [1, '2', {c:3}, [4]]) returned outcomes must be an Array`);
      t.equal(outcomes.length, 4, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return 4 outcomes`);
      const expectedOutcomes = [new Failure(errs[0]), new Failure(errs[1]), new Failure(errs[2]), new Success([4])];
      t.deepEqual(outcomes, expectedOutcomes, `Promises.chain(f, [1, '2', {c:3}, [4]]) outcomes must be ${stringify(expectedOutcomes)}`);
      t.end();
    },
    err => {
      t.end(`Promises.chain(f, [1, '2', {c:3}, [4]]) must NOT reject with an error: ${stringify(err)}`);
    }
  );
});

test("Promises.chain(f, [1,2,3,4]) with 4 inputs & 4 calls returning 4 rejecting promises will resolve 4 Failure outcomes", t => {
  const delayCancellables = [{}, {}, {}, {}];
  const errs = [new Error('Crash 0'), new Error('Crash 1'), new Error('Crash 2'), new Error('Crash 3')];
  const f = (e, i, es) => genDelayedPromise(errs[i], e, 1, delayCancellables[i]);

  const chain = Promises.chain(f, [1, '2', {c: 3}, [4]]);

  t.ok(chain, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return a value`);
  t.ok(chain instanceof Promise, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return an instance of Promise`);

  chain.then(
    outcomes => {
      t.pass(`Promises.chain(f, [1, '2', {c:3}, [4]]) must resolve with outcomes`);
      // Cancel the delays too (just for clean-up)
      t.ok(delayCancellables[0].cancelTimeout(true), `delayCancellables[0].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[1].cancelTimeout(true), `delayCancellables[1].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[2].cancelTimeout(true), `delayCancellables[2].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[3].cancelTimeout(true), `delayCancellables[3].cancelTimeout() should have timed-out`);
      t.ok(Array.isArray(outcomes), `Promises.chain(f, [1, '2', {c:3}, [4]]) returned outcomes must be an Array`);
      t.equal(outcomes.length, 4, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return 4 outcomes`);
      const expectedOutcomes = [new Failure(errs[0]), new Failure(errs[1]), new Failure(errs[2]), new Failure(errs[3])];
      t.deepEqual(outcomes, expectedOutcomes, `Promises.chain(f, [1, '2', {c:3}, [4]]) outcomes must be ${stringify(expectedOutcomes)}`);
      t.end();
    },
    err => {
      t.end(`Promises.chain(f, [1, '2', {c:3}, [4]]) must NOT reject with an error: ${stringify(err)}`);
    }
  );
});

// =====================================================================================================================
// Promises.chain with cancellations
// =====================================================================================================================

test("Promises.chain(f, [1,2,3,4]) cancelled immediately will resolve only with the first outcome", t => {
  const cancellable = {};

  const delayCancellables = [{}, {}, {}, {}];
  const f = (e, i, es) => genDelayedPromise(null, e, 1, delayCancellables[i]);

  const chain = Promises.chain(f, [1, '2', {c: 3}, [4]], cancellable);

  t.ok(chain, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return a value`);
  t.ok(chain instanceof Promise, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return an instance of Promise`);

  chain.then(
    results => {
      t.end(`Promises.chain(f, [1, '2', {c:3}, [4]]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.chain(f, [1, '2', {c:3}, [4]]) when cancelled must reject with an error`);
      // Cancel the delays too (just for clean-up)
      t.ok(delayCancellables[0].cancelTimeout(true), `delayCancellables[0].cancelTimeout() should have timed-out`);
      t.notOk(delayCancellables[1].cancelTimeout, `delayCancellables[1].cancelTimeout should NOT be defined yet`);
      t.notOk(delayCancellables[2].cancelTimeout, `delayCancellables[2].cancelTimeout should NOT be defined yet`);
      t.notOk(delayCancellables[3].cancelTimeout, `delayCancellables[3].cancelTimeout should NOT be defined yet`);
      t.ok(err instanceof CancelledError, `Promises.chain(f, [1, '2', {c:3}, [4]]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success(1)];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.chain(f, [1, '2', {c:3}, [4]]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedInputs = ['2', {c: 3}, [4]];
      t.deepEqual(err.unresolvedInputs, expectedUnresolvedInputs, `Promises.chain([1, '2', {c:3}, [4]]) unresolvedInputs must be ${stringify(expectedUnresolvedInputs)}`);
      t.end();
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
  const completed = cancellable.cancel();
  t.notOk(completed, `Promises.chain(f, [1, '2', {c:3}, [4]]) must not be completed yet`);
});

test("Promises.chain(f, [1,2,3,4]) cancelled during call 1 will resolve only with the first outcome", t => {
  const cancellable = {};

  const delayCancellables = [{}, {}, {}, {}];
  const f = (e, i, es) => genDelayedPromise(null, e, 1, delayCancellables[i], i === 0 ? cancellable : undefined);

  const chain = Promises.chain(f, [1, '2', {c: 3}, [4]], cancellable);

  t.ok(chain, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return a value`);
  t.ok(chain instanceof Promise, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return an instance of Promise`);

  chain.then(
    results => {
      t.end(`Promises.chain(f, [1, '2', {c:3}, [4]]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.chain(f, [1, '2', {c:3}, [4]]) when cancelled must reject with an error`);
      // Cancel the delays too (just for clean-up)
      t.ok(delayCancellables[0].cancelTimeout(true), `delayCancellables[0].cancelTimeout() should have timed-out`);
      t.notOk(delayCancellables[1].cancelTimeout, `delayCancellables[1].cancelTimeout should NOT be defined yet`);
      t.notOk(delayCancellables[2].cancelTimeout, `delayCancellables[2].cancelTimeout should NOT be defined yet`);
      t.notOk(delayCancellables[3].cancelTimeout, `delayCancellables[3].cancelTimeout should NOT be defined yet`);
      t.ok(err instanceof CancelledError, `Promises.chain(f, [1, '2', {c:3}, [4]]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success(1)];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.chain(f, [1, '2', {c:3}, [4]]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedInputs = ['2', {c: 3}, [4]];
      t.deepEqual(err.unresolvedInputs, expectedUnresolvedInputs, `Promises.chain([1, '2', {c:3}, [4]]) unresolvedInputs must be ${stringify(expectedUnresolvedInputs)}`);
      t.end();
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
});

test("Promises.chain(f, [1,2,3,4]) cancelled during call 2 will resolve only the first & second outcomes", t => {
  const cancellable = {};

  const delayCancellables = [{}, {}, {}, {}];
  const f = (e, i, es) => genDelayedPromise(null, e, 1, delayCancellables[i], i === 1 ? cancellable : undefined);

  const chain = Promises.chain(f, [1, '2', {c: 3}, [4]], cancellable);

  t.ok(chain, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return a value`);
  t.ok(chain instanceof Promise, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return an instance of Promise`);

  chain.then(
    results => {
      t.end(`Promises.chain(f, [1, '2', {c:3}, [4]]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.chain(f, [1, '2', {c:3}, [4]]) when cancelled must reject with an error`);
      // Cancel the delays too (just for clean-up)
      t.ok(delayCancellables[0].cancelTimeout(true), `delayCancellables[0].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[1].cancelTimeout(true), `delayCancellables[1].cancelTimeout() should have timed-out`);
      t.notOk(delayCancellables[2].cancelTimeout, `delayCancellables[2].cancelTimeout should NOT be defined yet`);
      t.notOk(delayCancellables[3].cancelTimeout, `delayCancellables[3].cancelTimeout should NOT be defined yet`);
      t.ok(err instanceof CancelledError, `Promises.chain(f, [1, '2', {c:3}, [4]]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success(1), new Success('2')];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.chain(f, [1, '2', {c:3}, [4]]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedInputs = [{c: 3}, [4]];
      t.deepEqual(err.unresolvedInputs, expectedUnresolvedInputs, `Promises.chain([1, '2', {c:3}, [4]]) unresolvedInputs must be ${stringify(expectedUnresolvedInputs)}`);
      t.end();
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
});

test("Promises.chain(f, [1,2,3,4]) cancelled during call 3 will resolve the first, second & third outcomes", t => {
  const cancellable = {};

  const delayCancellables = [{}, {}, {}, {}];
  const f = (e, i, es) => genDelayedPromise(null, e, 1, delayCancellables[i], i === 2 ? cancellable : undefined);

  const chain = Promises.chain(f, [1, '2', {c: 3}, [4]], cancellable);

  t.ok(chain, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return a value`);
  t.ok(chain instanceof Promise, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return an instance of Promise`);

  chain.then(
    results => {
      t.end(`Promises.chain(f, [1, '2', {c:3}, [4]]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.chain(f, [1, '2', {c:3}, [4]]) when cancelled must reject with an error`);
      // Cancel the delays too (just for clean-up)
      t.ok(delayCancellables[0].cancelTimeout(true), `delayCancellables[0].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[1].cancelTimeout(true), `delayCancellables[1].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[2].cancelTimeout(true), `delayCancellables[2].cancelTimeout() should have timed-out`);
      t.notOk(delayCancellables[3].cancelTimeout, `delayCancellables[3].cancelTimeout should NOT be defined yet`);
      t.ok(err instanceof CancelledError, `Promises.chain(f, [1, '2', {c:3}, [4]]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success(1), new Success('2'), new Success({c: 3})];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.chain(f, [1, '2', {c:3}, [4]]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedInputs = [[4]];
      t.deepEqual(err.unresolvedInputs, expectedUnresolvedInputs, `Promises.chain([1, '2', {c:3}, [4]]) unresolvedInputs must be ${stringify(expectedUnresolvedInputs)}`);
      t.end();
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
});

test("Promises.chain(f, [1,2,3,4]) cancelled too late during call 4 will resolve all 4 outcomes", t => {
  const cancellable = {};

  const delayCancellables = [{}, {}, {}, {}];
  const f = (e, i, es) => genDelayedPromise(null, e, 1, delayCancellables[i], i === 3 ? cancellable : undefined);

  const chain = Promises.chain(f, [1, '2', {c: 3}, [4]], cancellable);

  t.ok(chain, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return a value`);
  t.ok(chain instanceof Promise, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return an instance of Promise`);

  chain.then(
    outcomes => {
      t.pass(`Promises.chain(f, [1, '2', {c:3}, [4]]) when cancelled too late must still resolve with all outcomes`);
      // Cancel the delays too (just for clean-up)
      t.ok(delayCancellables[0].cancelTimeout(true), `delayCancellables[0].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[1].cancelTimeout(true), `delayCancellables[1].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[2].cancelTimeout(true), `delayCancellables[2].cancelTimeout() should have timed-out`);
      t.ok(delayCancellables[3].cancelTimeout(true), `delayCancellables[3].cancelTimeout() should have timed-out`);
      t.ok(Array.isArray(outcomes), `Promises.chain(f, [1, '2', {c:3}, [4]]) returned outcomes must be an Array`);
      t.equal(outcomes.length, 4, `Promises.chain(f, [1, '2', {c:3}, [4]]) must return 4 outcomes`);
      const expectedOutcomes = [new Success(1), new Success('2'), new Success({c: 3}), new Success([4])];
      t.deepEqual(outcomes, expectedOutcomes, `Promises.chain(f, [1, '2', {c:3}, [4]]) outcomes must be ${stringify(expectedOutcomes)}`);
      t.end();
    },
    err => {
      t.end(`Promises.chain(f, [1, '2', {c:3}, [4]]) when cancelled too late, must NOT reject with an error: ${stringify(err)}`);
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
});

// =====================================================================================================================
// installCancelTimeout
// =====================================================================================================================

test('installCancelTimeout', t => {
  const mustResolve = true;

  let cancel1Called = false;
  let cancel2Called = false;
  let triggered1 = false;
  let triggered2 = false;

  const cancellable = {};

  t.notOk(cancellable.cancelTimeout, `cancellable.cancelTimeout must not exist`);

  Promises.installCancelTimeout(cancellable, (mustResolve) => {
    console.log(`cancellable.cancelTimeout(${mustResolve}) #1 called`);
    cancel1Called = true;
    return triggered1;
  });
  const origCancelTimeout = cancellable.cancelTimeout;

  t.ok(cancellable.cancelTimeout, `cancellable.cancelTimeout must exist`);

  Promises.installCancelTimeout(cancellable, (mustResolve) => {
    console.log(`cancellable.cancelTimeout(${mustResolve}) #2 called`);
    cancel2Called = true;
    return triggered2;
  });

  t.ok(cancellable.cancelTimeout, `cancellable.cancelTimeout must still exist`);
  t.notEquals(cancellable.cancelTimeout, origCancelTimeout, `cancellable.cancelTimeout must NOT be original cancellable.cancelTimeout`);

  t.notOk(cancel1Called, `cancel1Called must be false before 1st cancelTimeout`);
  t.notOk(cancel2Called, `cancel2Called must be false before 1st cancelTimeout`);

  // Cancel the original cancellable
  let triggered = cancellable.cancelTimeout(mustResolve);

  t.ok(cancel1Called, `cancel1Called must be true after 1st cancelTimeout`);
  t.ok(cancel2Called, `cancel2Called must be true after 1st cancelTimeout`);
  t.notOk(triggered, `triggered must be false after 1st cancelTimeout, since BOTH triggered1 & triggered2 were false`);

  // Reset the flags (set only triggered1)
  cancel1Called = false;
  cancel2Called = false;
  triggered1 = true;
  triggered2 = false;

  t.notOk(cancel1Called, `cancel1Called must be false after reset before 2nd cancelTimeout`);
  t.notOk(cancel2Called, `cancel2Called must be false after reset before 2nd cancelTimeout`);

  // Cancel the original cancellable AGAIN
  triggered = cancellable.cancelTimeout(mustResolve);

  t.ok(cancel1Called, `cancel1Called must be true after 2nd cancelTimeout`);
  t.ok(cancel2Called, `cancel2Called must be true after 2nd cancelTimeout`);
  // t.ok(triggered, `triggered must be true after 2nd cancelTimeout, since triggered1 was set to true`);
  t.notOk(triggered, `triggered must be false after 2nd cancelTimeout, since ONLY triggered1 was set to true`);

  // Reset the flags (set only triggered2)
  cancel1Called = false;
  cancel2Called = false;
  triggered1 = false;
  triggered2 = true;

  t.notOk(cancel1Called, `cancel1Called must be false after reset before 3rd cancelTimeout`);
  t.notOk(cancel2Called, `cancel2Called must be false after reset before 3rd cancelTimeout`);

  // Cancel the original cancellable AGAIN
  triggered = cancellable.cancelTimeout(mustResolve);

  t.ok(cancel1Called, `cancel1Called must be true after 3rd cancelTimeout`);
  t.ok(cancel2Called, `cancel2Called must be true after 3rd cancelTimeout`);
  t.notOk(triggered, `triggered must be false after 3rd cancelTimeout, since ONLY triggered2 was set to true`);

  // Reset the flags (set only triggered2)
  cancel1Called = false;
  cancel2Called = false;
  triggered1 = true;
  triggered2 = true;

  t.notOk(cancel1Called, `cancel1Called must be false after reset before 4th cancelTimeout`);
  t.notOk(cancel2Called, `cancel2Called must be false after reset before 4th cancelTimeout`);

  // Cancel the original cancellable AGAIN
  triggered = cancellable.cancelTimeout(mustResolve);

  t.ok(cancel1Called, `cancel1Called must be true after 4th cancelTimeout`);
  t.ok(cancel2Called, `cancel2Called must be true after 4th cancelTimeout`);
  t.ok(triggered, `triggered must be true after 4th cancelTimeout, since BOTH triggered1 & triggered2 were set to true`);

  t.end();
});

// =====================================================================================================================
// installCancelTimeout - cancel multiple delays with single cancellable using cancelTimeout(false)
// =====================================================================================================================

test('installCancelTimeout - cancel multiple delays with single cancellable using cancelTimeout(false)', t => {
  const cancellable = {};

  const p1 = Promises.delay(100, cancellable).then(
    () => {
      console.log(`########### p1 triggered`);
      return 1;
    },
    err => {
      console.log(`########### p1 cancelled`, err);
      // return -1;
      throw err;
    }
  );

  const p2 = Promises.delay(500, cancellable).then(
    () => {
      console.log(`########### p2 triggered`);
      return 2;
    },
    err => {
      console.log(`########### p2 cancelled`, err);
      // return -2;
      throw err;
    }
  );

  t.ok(cancellable.cancelTimeout, `cancellable.cancelTimeout must be installed`);

  const triggered = cancellable.cancelTimeout(false);

  t.notOk(triggered, `Neither delay should have triggered yet`);

  Promises.every([p1, p2]).then(
    outcomes => {
      t.ok(outcomes[0].isFailure(), `outcomes[0].isFailure must be true`);
      t.ok(outcomes[1].isFailure(), `outcomes[1].isFailure must be true`);
      t.ok(outcomes[0].error instanceof DelayCancelledError, `outcomes[0].error must be a DelayCancelledError`);
      t.ok(outcomes[1].error instanceof DelayCancelledError, `outcomes[1].error must be a DelayCancelledError`);
      t.equal(outcomes[0].error.delayMs, 100, `outcomes[0].error.delayMs must be 100`);
      t.equal(outcomes[1].error.delayMs, 500, `outcomes[1].error.delayMs must be 500`);
      t.end();
    },
    err => {
      t.end(`Unexpected error`, err.stack);
    }
  );
});

// =====================================================================================================================
// installCancelTimeout - cancel multiple delays with single cancellable using cancelTimeout(true)
// =====================================================================================================================

test('installCancelTimeout - cancel multiple delays with single cancellable using cancelTimeout(true)', t => {
  const cancellable = {};

  const p1 = Promises.delay(100, cancellable).then(
    () => {
      console.log(`########### p1 triggered`);
      return 1;
    },
    err => {
      console.log(`########### p1 cancelled`, err.stack);
      // return -1;
      throw err;
    }
  );

  const p2 = Promises.delay(500, cancellable).then(
    () => {
      console.log(`########### p2 triggered`);
      return 2;
    },
    err => {
      console.log(`########### p2 cancelled`, err.stack);
      // return -2;
      throw err;
    }
  );

  t.ok(cancellable.cancelTimeout, `cancellable.cancelTimeout must be installed`);

  const triggered = cancellable.cancelTimeout(true);

  t.notOk(triggered, `Neither delay should have triggered yet`);

  Promises.every([p1, p2]).then(
    outcomes => {
      t.ok(outcomes[0].isSuccess(), `outcomes[0].isSuccess must be true`);
      t.ok(outcomes[1].isSuccess(), `outcomes[1].isSuccess must be true`);
      t.equal(outcomes[0].value, 1, `outcomes[0].value must be 1`);
      t.equal(outcomes[1].value, 2, `outcomes[1].value must be 2`);
      t.end();
    },
    err => {
      t.end(`Unexpected error`, err.stack);
    }
  );
});

// =====================================================================================================================
// installCancel
// =====================================================================================================================

test('installCancel', t => {
  let cancel1Called = false;
  let cancel2Called = false;
  let completed1 = false;
  let completed2 = false;

  const cancellable = {};

  t.notOk(cancellable.cancel, `cancellable.cancel must not exist`);

  Promises.installCancel(cancellable, () => {
    console.log(`cancellable.cancel #1 called`);
    cancel1Called = true;
    return completed1;
  });
  const originalCancel = cancellable.cancel;

  t.ok(cancellable.cancel, `cancellable.cancel must exist`);

  Promises.installCancel(cancellable, () => {
    console.log(`cancellable.cancel #2 called`);
    cancel2Called = true;
    return completed2;
  });

  t.ok(cancellable.cancel, `cancellable.cancel must still exist`);
  t.notEquals(cancellable.cancel, originalCancel, `cancellable.cancel must NOT be original cancellable.cancel`);

  t.notOk(cancel1Called, `cancel1Called must be false before 1st cancel`);
  t.notOk(cancel2Called, `cancel2Called must be false before 1st cancel`);

  // Cancel the original cancellable
  let completed = cancellable.cancel();

  t.ok(cancel1Called, `cancel1Called must be true after 1st cancel`);
  t.ok(cancel2Called, `cancel2Called must be true after 1st cancel`);
  t.notOk(completed, `completed must be false after 1st cancel, since BOTH completed1 & completed2 were false`);

  // Reset the flags (set only completed1)
  cancel1Called = false;
  cancel2Called = false;
  completed1 = true;
  completed2 = false;

  t.notOk(cancel1Called, `cancel1Called must be false after reset before 2nd cancel`);
  t.notOk(cancel2Called, `cancel2Called must be false after reset before 2nd cancel`);

  // Cancel the original cancellable AGAIN
  completed = cancellable.cancel();

  t.ok(cancel1Called, `cancel1Called must be true after 2nd cancel`);
  t.ok(cancel2Called, `cancel2Called must be true after 2nd cancel`);
  // t.ok(completed, `completed must be true after 2nd cancel, since completed1 was set to true`);
  t.notOk(completed, `completed must be false after 2nd cancel, since ONLY completed1 was set to true`);

  // Reset the flags (set only completed2)
  cancel1Called = false;
  cancel2Called = false;
  completed1 = false;
  completed2 = true;

  t.notOk(cancel1Called, `cancel1Called must be false after reset before 3rd cancel`);
  t.notOk(cancel2Called, `cancel2Called must be false after reset before 3rd cancel`);

  // Cancel the original cancellable AGAIN
  completed = cancellable.cancel();

  t.ok(cancel1Called, `cancel1Called must be true after 3rd cancel`);
  t.ok(cancel2Called, `cancel2Called must be true after 3rd cancel`);
  t.notOk(completed, `completed must be false after 3rd cancel, since ONLY completed2 was set to true`);

  // Reset the flags (set only completed2)
  cancel1Called = false;
  cancel2Called = false;
  completed1 = true;
  completed2 = true;

  t.notOk(cancel1Called, `cancel1Called must be false after reset before 4th cancel`);
  t.notOk(cancel2Called, `cancel2Called must be false after reset before 4th cancel`);

  // Cancel the original cancellable AGAIN
  completed = cancellable.cancel();

  t.ok(cancel1Called, `cancel1Called must be true after 4th cancel`);
  t.ok(cancel2Called, `cancel2Called must be true after 4th cancel`);
  t.ok(completed, `completed must be true after 4th cancel, since BOTH completed1 & completed2 were set to true`);

  t.end();
});

// =====================================================================================================================
// installCancel - cancel multiple Promises.every with single cancellable
// =====================================================================================================================

test("installCancel - cancel multiple Promises.every with single cancellable", t => {
  const cancellable = {};

  // 1st set of promises for 1st every
  const delayCancellable1 = {};

  const d1 = genDelayedPromise(null, 'd1', 10, delayCancellable1);
  t.ok(typeof delayCancellable1.cancelTimeout === "function", `delayCancellable1.cancelTimeout must be installed`);
  let prevCancelTimeout1 = delayCancellable1.cancelTimeout;

  const d2 = genDelayedPromise(d2Error, 'd2', 2000, delayCancellable1);
  t.ok(typeof delayCancellable1.cancelTimeout === "function", `delayCancellable1.cancelTimeout must still be installed`);
  t.notEquals(delayCancellable1.cancelTimeout, prevCancelTimeout1, `delayCancellable1.cancelTimeout must NOT be previous cancelTimeout`);
  prevCancelTimeout1 = delayCancellable1.cancelTimeout;

  const d3 = genDelayedPromise(null, 'd3', 3000, delayCancellable1);
  t.ok(typeof delayCancellable1.cancelTimeout === "function", `delayCancellable1.cancelTimeout must still be installed`);
  t.notEquals(delayCancellable1.cancelTimeout, prevCancelTimeout1, `delayCancellable1.cancelTimeout must NOT be previous cancelTimeout`);
  prevCancelTimeout1 = delayCancellable1.cancelTimeout;

  const d4 = genDelayedPromise(d4Error, 'd4', 4000, delayCancellable1);
  t.ok(typeof delayCancellable1.cancelTimeout === "function", `delayCancellable1.cancelTimeout must still be installed`);
  t.notEquals(delayCancellable1.cancelTimeout, prevCancelTimeout1, `delayCancellable1.cancelTimeout must NOT be previous cancelTimeout`);

  // 2nd set of promises for 2nd every
  const delayCancellable2 = {};

  const e1 = genDelayedPromise(null, 'e1', 10, delayCancellable2);
  t.ok(typeof delayCancellable2.cancelTimeout === "function", `delayCancellable2.cancelTimeout must be installed`);
  let prevCancelTimeout2 = delayCancellable2.cancelTimeout;

  const e2 = genDelayedPromise(e2Error, 'e2', 2000, delayCancellable2);
  t.ok(typeof delayCancellable2.cancelTimeout === "function", `delayCancellable2.cancelTimeout must still be installed`);
  t.notEquals(delayCancellable2.cancelTimeout, prevCancelTimeout2, `delayCancellable2.cancelTimeout must NOT be previous cancelTimeout`);
  prevCancelTimeout2 = delayCancellable2.cancelTimeout;

  const e3 = genDelayedPromise(null, 'e3', 3000, delayCancellable2);
  t.ok(typeof delayCancellable2.cancelTimeout === "function", `delayCancellable2.cancelTimeout must still be installed`);
  t.notEquals(delayCancellable2.cancelTimeout, prevCancelTimeout2, `delayCancellable2.cancelTimeout must NOT be previous cancelTimeout`);
  prevCancelTimeout2 = delayCancellable2.cancelTimeout;

  const e4 = genDelayedPromise(e4Error, 'e4', 4000, delayCancellable2);
  t.ok(typeof delayCancellable2.cancelTimeout === "function", `delayCancellable2.cancelTimeout must still be installed`);
  t.notEquals(delayCancellable2.cancelTimeout, prevCancelTimeout2, `delayCancellable2.cancelTimeout must NOT be previous cancelTimeout`);

  const p1 = Promises.every([d1, d2, d3, d4], cancellable).then(
    results => {
      t.fail(`Promises.every([d1,d2,d3,d4]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.every([d1,d2,d3,d4]) when cancelled must reject with an error`);
      // Cancel the delayCancellable delays too (just for clean-up)
      // t.ok(delayCancellable1.cancelTimeout(true), `delayCancellable1.cancelTimeout() should have timed-out`);
      t.notOk(delayCancellable1.cancelTimeout(true), `delayCancellable1.cancelTimeout() should NOT have timed-out yet`);
      t.ok(err instanceof CancelledError, `Promises.every([d1,d2,d3,d4]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success('d1')];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.every([d1,d2,d3,d4]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedPromises = [d2, d3, d4];
      t.deepEqual(err.unresolvedPromises, expectedUnresolvedPromises, `Promises.every([d1,d2,d3,d4]) unresolvedPromises must be ${stringify(expectedUnresolvedPromises)}`);
      throw err;
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
  let prevCancel = cancellable.cancel;


  const p2 = Promises.every([e1, e2, e3, e4], cancellable).then(
    results => {
      t.fail(`Promises.every([e1,e2,e3,e4]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.every([e1,e2,e3,e4]) when cancelled must reject with an error`);
      // Cancel delayCancellable2 delays too (just for clean-up)
      // t.ok(delayCancellable2.cancelTimeout(true), `delayCancellable2.cancelTimeout() should have timed-out`);
      t.notOk(delayCancellable2.cancelTimeout(true), `delayCancellable2.cancelTimeout() should NOT have timed-out yet`);
      t.ok(err instanceof CancelledError, `Promises.every([e1,e2,e3,e4]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success('e1')];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.every([e1,e2,e3,e4]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedPromises = [e2, e3, e4];
      t.deepEqual(err.unresolvedPromises, expectedUnresolvedPromises, `Promises.every([e1,e2,e3,e4]) unresolvedPromises must be ${stringify(expectedUnresolvedPromises)}`);
      throw err;
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must still be installed`);
  t.notEquals(cancellable.cancel, prevCancel, `cancellable.cancel must NOT be previous cancel`);
  prevCancel = cancellable.cancel;

  Promises.every([p1, p2], cancellable).then(
    outcomes => {
      t.end(`Promises.every([p1, p2]) when cancelled, must NOT complete successfully with results: ${stringify(outcomes)}`);
    },
    err => {
      t.pass(`Promises.every([p1, p2]) when cancelled must reject with an error`);
      t.ok(err instanceof CancelledError, `Promises.every([p1,p2]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      t.end();
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must still be installed`);
  t.notEquals(cancellable.cancel, prevCancel, `cancellable.cancel must NOT be previous cancel`);

  // Cancel them all!
  const completed = cancellable.cancel();
  t.notOk(completed, `Promises.every([d1,d2,d3,d4]) and Promises.every([e1,e2,e3,e4]) and Promises.every([p1, p2)] must not all be completed yet`);

});

// // =====================================================================================================================
// // extendCancel
// // =====================================================================================================================
//
// test('extendCancel', t => {
//   let cancel1Called = false;
//   let cancel2Called = false;
//   let completed1 = false;
//   let completed2 = false;
//
//   const cancellable = {};
//
//   t.notOk(cancellable.cancel, `cancellable.cancel must not exist`);
//
//   cancellable.cancel = () => {
//     console.log(`cancellable.cancel ORIGINAL called`);
//     cancel1Called = true;
//     return completed1;
//   };
//   const originalCancel = cancellable.cancel;
//
//   t.ok(cancellable.cancel, `cancellable.cancel must exist`);
//
//   const nextCancellable = {};
//
//   t.notOk(nextCancellable.cancel, `nextCancellable.cancel must not exist`);
//
//   nextCancellable.cancel = () => {
//     console.log(`nextCancellable.cancel ORIGINAL called`);
//     cancel2Called = true;
//     return completed2;
//   };
//
//   t.ok(nextCancellable.cancel, `nextCancellable.cancel must exist`);
//
//   Promises.extendCancel(cancellable, nextCancellable);
//
//   t.ok(cancellable.cancel, `cancellable.cancel must still exist after extendCancel`);
//   t.notEquals(cancellable.cancel, originalCancel, `cancellable.cancel must NOT be original cancellable.cancel`);
//   t.ok(nextCancellable.cancel, `nextCancellable.cancel must still exist`);
//   t.notEquals(nextCancellable.cancel, originalCancel, `nextCancellable.cancel must NOT be original cancellable.cancel`);
//
//   t.notOk(cancel1Called, `cancel1Called must be false before 1st cancel`);
//   t.notOk(cancel2Called, `cancel2Called must be false before 1st cancel`);
//
//   // Cancel the original cancellable
//   let completed = cancellable.cancel();
//
//   t.ok(cancel1Called, `cancel1Called must be true after 1st cancel`);
//   t.ok(cancel2Called, `cancel2Called must be true after 1st cancel`);
//   t.notOk(completed, `completed must be false after 1st cancel, since BOTH completed1 & completed2 were false`);
//
//   // Reset the flags (set only completed1)
//   cancel1Called = false;
//   cancel2Called = false;
//   completed1 = true;
//   completed2 = false;
//
//   t.notOk(cancel1Called, `cancel1Called must be false after reset before 2nd cancel`);
//   t.notOk(cancel2Called, `cancel2Called must be false after reset before 2nd cancel`);
//
//   // Cancel the original cancellable AGAIN
//   completed = cancellable.cancel();
//
//   t.ok(cancel1Called, `cancel1Called must be true after 2nd cancel`);
//   t.ok(cancel2Called, `cancel2Called must be true after 2nd cancel`);
//   // t.ok(completed, `completed must be true after 2nd cancel, since completed1 was set to true`);
//   t.notOk(completed, `completed must be false after 2nd cancel, since ONLY completed1 was set to true`);
//
//   // Reset the flags (set only completed2)
//   cancel1Called = false;
//   cancel2Called = false;
//   completed1 = false;
//   completed2 = true;
//
//   t.notOk(cancel1Called, `cancel1Called must be false after reset before 3rd cancel`);
//   t.notOk(cancel2Called, `cancel2Called must be false after reset before 3rd cancel`);
//
//   // Cancel the original cancellable AGAIN
//   completed = cancellable.cancel();
//
//   t.ok(cancel1Called, `cancel1Called must be true after 3rd cancel`);
//   t.ok(cancel2Called, `cancel2Called must be true after 3rd cancel`);
//   t.notOk(completed, `completed must be false after 3rd cancel, since ONLY completed2 was set to true`);
//
//   // Reset the flags (set only completed2)
//   cancel1Called = false;
//   cancel2Called = false;
//   completed1 = true;
//   completed2 = true;
//
//   t.notOk(cancel1Called, `cancel1Called must be false after reset before 4th cancel`);
//   t.notOk(cancel2Called, `cancel2Called must be false after reset before 4th cancel`);
//
//   // Cancel the original cancellable AGAIN
//   completed = cancellable.cancel();
//
//   t.ok(cancel1Called, `cancel1Called must be true after 4th cancel`);
//   t.ok(cancel2Called, `cancel2Called must be true after 4th cancel`);
//   t.ok(completed, `completed must be true after 4th cancel, since BOTH completed1 & completed2 were set to true`);
//
//   t.end();
// });

// ---------------------------------------------------------------------------------------------------------------------
// Promises.flatten
// ---------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten()', t => {
  const expected = undefined;
  t.deepEqual(Promises.flatten(), expected, `Promises.flatten() must be ${stringify(expected)}`);
  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten(undefined)', t => {
  const expected = undefined;
  t.deepEqual(Promises.flatten(undefined), expected, `Promises.flatten(undefined) must be ${stringify(expected)}`);
  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten(null)', t => {
  const expected = null;
  t.deepEqual(Promises.flatten(null), expected, `Promises.flatten(null) must be ${stringify(expected)}`);
  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten(123)', t => {
  const expected = 123;
  t.deepEqual(Promises.flatten(123), expected, `Promises.flatten(123) must be ${stringify(expected)}`);
  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten("Xyz")', t => {
  const expected = "Xyz";
  t.deepEqual(Promises.flatten("Xyz"), expected, `Promises.flatten("Xyz") must be ${stringify(expected)}`);
  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten([])', t => {
  const expected = [];
  t.deepEqual(Promises.flatten([]), expected, `Promises.flatten([]) must be ${stringify(expected)}`);
  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten(Promise.resolve(42))', t => {
  Promises.flatten(Promise.resolve(42)).then(results => {
    const expected = 42;
    t.deepEqual(results, expected, `Promises.flatten(Promise.resolve(42)) must be ${stringify(expected)}`);
    t.end();
  });
});

test('Promises.flatten(Promise.resolve(42), null, simplifyOutcomesOpts)', t => {
  Promises.flatten(Promise.resolve(42), null, simplifyOutcomesOpts).then(results => {
    const expected = 42;
    t.deepEqual(results, expected, `Promises.flatten(Promise.resolve(42)) must be ${stringify(expected)}`);
    t.end();
  });
});

test('Promises.flatten(Promise.resolve(42), null, skipSimplifyOutcomesOpts)', t => {
  Promises.flatten(Promise.resolve(42), null, skipSimplifyOutcomesOpts).then(results => {
    const expected = 42;
    t.deepEqual(results, expected, `Promises.flatten(Promise.resolve(42)) must be ${stringify(expected)}`);
    t.end();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten(Promise.reject(new Error("43")))', t => {
  Promises.flatten(Promise.reject(new Error("43"))).catch(err => {
    const expected = new Error("43");
    t.deepEqual(err, expected, `Promises.flatten(Promise.reject(new Error("43"))) must be reject with ${stringify(expected)}`);
    t.end();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten(Promise.resolve(42).then(x => Promise.resolve(x * 2)).then(y => Promise.resolve(y / 4))', t => {
  Promises.flatten(Promise.resolve(42).then(x => Promise.resolve(x * 2)).then(y => Promise.resolve(y / 4))).then(results => {
    const expected = 21;
    t.deepEqual(results, expected, `Promises.flatten(Promise.resolve(42).then(x => Promise.resolve(x * 2)).then(y => Promise.resolve(y / 4))) must be ${stringify(expected)}`);
    t.end();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten(Promise.resolve(Promise.reject(new Error("43"))))', t => {
  Promises.flatten(Promise.resolve(Promise.reject(new Error("43")))).catch(err => {
    const expected = new Error("43");
    t.deepEqual(err, expected, `Promises.flatten(Promise.resolve(Promise.reject(new Error("43")))) must be reject with ${stringify(expected)}`);
    t.end();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten([undefined])', t => {
  const expected = [undefined];
  t.deepEqual(Promises.flatten([undefined]), expected, `Promises.flatten([undefined]) must be ${stringify(expected)}`);
  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten([null])', t => {
  const expected = [null];
  t.deepEqual(Promises.flatten([null]), expected, `Promises.flatten([null]) must be ${stringify(expected)}`);
  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten([1, 2, 3])', t => {
  const expected = [1, 2, 3];
  t.deepEqual(Promises.flatten([1, 2, 3]), expected, `Promises.flatten([1, 2, 3]) must be ${stringify(expected)}`);
  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([1, '2', 3])", t => {
  const expected = [1, '2', 3];
  t.deepEqual(Promises.flatten([1, '2', 3]), expected, `Promises.flatten([1, '2', 3]) must be ${stringify(expected)}`);
  t.end();
});

// ---------------------------------------------------------------------------------------------------------------------
test('Promises.flatten([Promise.resolve(null), undefined])', t => {
  Promises.flatten([Promise.resolve(null), undefined]).then(results => {
    const expected = [null, undefined];
    t.deepEqual(results, expected, `Promises.flatten([Promise.resolve(null), undefined]) must be ${stringify(expected)}`);
    t.end();
  });
});

test('Promises.flatten([Promise.resolve(null), undefined], null, simplifyOutcomesOpts)', t => {
  Promises.flatten([Promise.resolve(null), undefined], null, simplifyOutcomesOpts).then(results => {
    const expected = [null, undefined];
    t.deepEqual(results, expected, `Promises.flatten([Promise.resolve(null), undefined]) must be ${stringify(expected)}`);
    t.end();
  });
});

test('Promises.flatten([Promise.resolve(null), undefined], null, skipSimplifyOutcomesOpts)', t => {
  Promises.flatten([Promise.resolve(null), undefined], null, skipSimplifyOutcomesOpts).then(results => {
    const expected = [new Success(null), new Success(undefined)];
    t.deepEqual(results, expected, `Promises.flatten([Promise.resolve(null), undefined]) must be ${stringify(expected)}`);
    t.end();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([undefined, Promise.resolve(null)])", t => {
  Promises.flatten([undefined, Promise.resolve(null)]).then(results => {
    const expected = [undefined, null];
    t.deepEqual(results, expected, `Promises.flatten([undefined, Promise.resolve(null)]) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.flatten([undefined, Promise.resolve(null)], null, simplifyOutcomesOpts)", t => {
  Promises.flatten([undefined, Promise.resolve(null)], null, simplifyOutcomesOpts).then(results => {
    const expected = [undefined, null];
    t.deepEqual(results, expected, `Promises.flatten([undefined, Promise.resolve(null)]) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.flatten([undefined, Promise.resolve(null)], null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten([undefined, Promise.resolve(null)], null, skipSimplifyOutcomesOpts).then(results => {
    const expected = [new Success(undefined), new Success(null)];
    t.deepEqual(results, expected, `Promises.flatten([undefined, Promise.resolve(null)]) must be ${stringify(expected)}`);
    t.end();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([Promise.resolve(null), null])", t => {
  Promises.flatten([Promise.resolve(null), null]).then(results => {
    const expected = [null, null];
    t.deepEqual(results, expected, `Promises.flatten([Promise.resolve(null), null]) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.flatten([Promise.resolve(null), null], null, simplifyOutcomesOpts)", t => {
  Promises.flatten([Promise.resolve(null), null], null, simplifyOutcomesOpts).then(results => {
    const expected = [null, null];
    t.deepEqual(results, expected, `Promises.flatten([Promise.resolve(null), null]) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.flatten([Promise.resolve(null), null], null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten([Promise.resolve(null), null], null, skipSimplifyOutcomesOpts).then(results => {
    const expected = [new Success(null), new Success(null)];
    t.deepEqual(results, expected, `Promises.flatten([Promise.resolve(null), null]) must be ${stringify(expected)}`);
    t.end();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([undefined, null, Promise.resolve(null), 123, 'ABCDEF'])", t => {
  Promises.flatten([undefined, null, Promise.resolve(null), 123, 'ABCDEF']).then(results => {
    const expected = [undefined, null, null, 123, 'ABCDEF'];
    t.deepEqual(results, expected, `Promises.flatten([undefined, null, Promise.resolve(null), 123, 'ABCDEF']) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.flatten([undefined, null, Promise.resolve(null), 123, 'ABCDEF'], null, simplifyOutcomesOpts)", t => {
  Promises.flatten([undefined, null, Promise.resolve(null), 123, 'ABCDEF'], null, simplifyOutcomesOpts).then(results => {
    const expected = [undefined, null, null, 123, 'ABCDEF'];
    t.deepEqual(results, expected, `Promises.flatten([undefined, null, Promise.resolve(null), 123, 'ABCDEF']) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.flatten([undefined, null, Promise.resolve(null), 123, 'ABCDEF'], null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten([undefined, null, Promise.resolve(null), 123, 'ABCDEF'], null, skipSimplifyOutcomesOpts).then(results => {
    const expected = [new Success(undefined), new Success(null), new Success(null), new Success(123), new Success('ABCDEF')];
    t.deepEqual(results, expected, `Promises.flatten([undefined, null, Promise.resolve(null), 123, 'ABCDEF']) must be ${stringify(expected)}`);
    t.end();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten(p1)", t => {
  Promises.flatten(p1).then(results => {
    const expected = 'p1';
    t.deepEqual(results, expected, `Promises.flatten(p1) must be ${JSON.stringify(expected)}`);
    t.end();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([p1])", t => {
  Promises.flatten([p1]).then(results => {
    const expected = ['p1'];
    t.deepEqual(results, expected, `Promises.flatten([p1]) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.flatten([p1], null, simplifyOutcomesOpts)", t => {
  Promises.flatten([p1], null, simplifyOutcomesOpts).then(results => {
    const expected = ['p1'];
    t.deepEqual(results, expected, `Promises.flatten([p1]) must be ${stringify(expected)}`);
    t.end();
  });
});

test("Promises.flatten([p1], null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten([p1], null, skipSimplifyOutcomesOpts).then(results => {
    const expected = [new Success('p1')];
    t.deepEqual(results, expected, `Promises.flatten([p1]) must be ${stringify(expected)}`);
    t.end();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([p1, p2])", t => {
  Promises.flatten([p1, p2])
    .then(results => {
      const expected = [new Success('p1'), new Failure(p2Error)];
      t.deepEqual(results, expected, `Promises.flatten([p1,p2]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p1, p2], null, simplifyOutcomesOpts)", t => {
  Promises.flatten([p1, p2], null, simplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success('p1'), new Failure(p2Error)];
      t.deepEqual(results, expected, `Promises.flatten([p1,p2]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p1, p2], null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten([p1, p2], null, skipSimplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success('p1'), new Failure(p2Error)];
      t.deepEqual(results, expected, `Promises.flatten([p1,p2]) must be ${stringify(expected)}`);
      t.end();
    });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([p1, p3])", t => {
  Promises.flatten([p1, p3])
    .then(results => {
      const expected = ['p1', 'p3'];
      t.deepEqual(results, expected, `Promises.flatten([p1,p3]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p1, p3], null, simplifyOutcomesOpts)", t => {
  Promises.flatten([p1, p3], null, simplifyOutcomesOpts)
    .then(results => {
      const expected = ['p1', 'p3'];
      t.deepEqual(results, expected, `Promises.flatten([p1,p3]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p1, p3], null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten([p1, p3], null, skipSimplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success('p1'), new Success('p3')];
      t.deepEqual(results, expected, `Promises.flatten([p1,p3]) must be ${stringify(expected)}`);
      t.end();
    });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([p2, p4])", t => {
  Promises.flatten([p2, p4])
    .then(results => {
      const expected = [new Failure(p2Error), new Failure(p4Error)];
      t.deepEqual(results, expected, `Promises.flatten([p2,p4]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p2, p4], null, simplifyOutcomesOpts)", t => {
  Promises.flatten([p2, p4], null, simplifyOutcomesOpts)
    .then(results => {
      const expected = [new Failure(p2Error), new Failure(p4Error)];
      t.deepEqual(results, expected, `Promises.flatten([p2,p4]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p2, p4], null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten([p2, p4], null, skipSimplifyOutcomesOpts)
    .then(results => {
      const expected = [new Failure(p2Error), new Failure(p4Error)];
      t.deepEqual(results, expected, `Promises.flatten([p2,p4]) must be ${stringify(expected)}`);
      t.end();
    });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([p1, p2, p3])", t => {
  Promises.flatten([p1, p2, p3])
    .then(results => {
      const expected = [new Success('p1'), new Failure(p2Error), new Success('p3')];
      t.deepEqual(results, expected, `Promises.flatten([p1,p2,p3]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p1, p2, p3], null, simplifyOutcomesOpts)", t => {
  Promises.flatten([p1, p2, p3], null, simplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success('p1'), new Failure(p2Error), new Success('p3')];
      t.deepEqual(results, expected, `Promises.flatten([p1,p2,p3]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p1, p2, p3], null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten([p1, p2, p3], null, skipSimplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success('p1'), new Failure(p2Error), new Success('p3')];
      t.deepEqual(results, expected, `Promises.flatten([p1,p2,p3]) must be ${stringify(expected)}`);
      t.end();
    });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([p1, p2, p3, p4])", t => {
  Promises.flatten([p1, p2, p3, p4])
    .then(results => {
      const expected = [new Success('p1'), new Failure(p2Error), new Success('p3'), new Failure(p4Error),];
      t.deepEqual(results, expected, `Promises.flatten([p1,p2,p3,p4]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p1, p2, p3, p4], null, simplifyOutcomesOpts)", t => {
  Promises.flatten([p1, p2, p3, p4], null, simplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success('p1'), new Failure(p2Error), new Success('p3'), new Failure(p4Error),];
      t.deepEqual(results, expected, `Promises.flatten([p1,p2,p3,p4]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p1, p2, p3, p4], null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten([p1, p2, p3, p4], null, skipSimplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success('p1'), new Failure(p2Error), new Success('p3'), new Failure(p4Error),];
      t.deepEqual(results, expected, `Promises.flatten([p1,p2,p3,p4]) must be ${stringify(expected)}`);
      t.end();
    });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a:1}])", t => {
  // Reversed with duplicate and with simple values
  Promises.flatten([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a: 1}])
    .then(results => {
      const expected = [new Success(Infinity), new Failure(p4Error), new Success(4.5), new Success('p3'), new Success('3.5'), new Failure(p2Error),
        new Success(null), new Success('p1'), new Success(undefined), new Failure(p2Error), new Success({a: 1})];
      t.deepEqual(results, expected, `Promises.flatten([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a:1}]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a:1}], null, simplifyOutcomesOpts)", t => {
  // Reversed with duplicate and with simple values
  Promises.flatten([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a: 1}], null, simplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success(Infinity), new Failure(p4Error), new Success(4.5), new Success('p3'), new Success('3.5'), new Failure(p2Error),
        new Success(null), new Success('p1'), new Success(undefined), new Failure(p2Error), new Success({a: 1})];
      t.deepEqual(results, expected, `Promises.flatten([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a:1}]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a:1}], null, skipSimplifyOutcomesOpts)", t => {
  // Reversed with duplicate and with simple values
  Promises.flatten([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a: 1}], null, skipSimplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success(Infinity), new Failure(p4Error), new Success(4.5), new Success('p3'), new Success('3.5'), new Failure(p2Error),
        new Success(null), new Success('p1'), new Success(undefined), new Failure(p2Error), new Success({a: 1})];
      t.deepEqual(results, expected, `Promises.flatten([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a:1}]) must be ${stringify(expected)}`);
      t.end();
    });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([Infinity, [p4, p2, p2], 4.5, p3, '3.5', null, [p1, p3, [p1, p3]], undefined, {a: 1}]", t => {
  Promises.flatten([Infinity, [p4, p2, p2], 4.5, p3, '3.5', null, [p1, p3, [p1, p3]], undefined, {a: 1}])
    .then(results => {
      const expected = [Infinity, [new Failure(p4Error), new Failure(p2Error), new Failure(p2Error)],
        4.5, 'p3', '3.5', null,
        ['p1', 'p3', ['p1', 'p3']],
        undefined, {a: 1}];
      t.deepEqual(results, expected, `Promises.flatten([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a:1}]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([Infinity, [p4, p2, p2], 4.5, p3, '3.5', null, [p1, p3, [p1, p3]], undefined, {a: 1}], null, simplifyOutcomesOpts)", t => {
  Promises.flatten([Infinity, [p4, p2, p2], 4.5, p3, '3.5', null, [p1, p3, [p1, p3]], undefined, {a: 1}], null, simplifyOutcomesOpts)
    .then(results => {
      const expected = [Infinity, [new Failure(p4Error), new Failure(p2Error), new Failure(p2Error)],
        4.5, 'p3', '3.5', null,
        ['p1', 'p3', ['p1', 'p3']],
        undefined, {a: 1}];
      t.deepEqual(results, expected, `Promises.flatten([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a:1}]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([Infinity, [p4, p2, p2], 4.5, p3, '3.5', null, [p1, p3, [p1, p3]], undefined, {a: 1}], null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten([Infinity, [p4, p2, p2], 4.5, p3, '3.5', null, [p1, p3, [p1, p3]], undefined, {a: 1}], null, skipSimplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success(Infinity), new Success([new Failure(p4Error), new Failure(p2Error), new Failure(p2Error)]),
        new Success(4.5), new Success('p3'), new Success('3.5'), new Success(null),
        new Success([new Success('p1'), new Success('p3'), new Success([new Success('p1'), new Success('p3')])]),
        new Success(undefined), new Success({a: 1})];
      t.deepEqual(results, expected, `Promises.flatten([Infinity, p4, 4.5, p3, '3.5', p2, null, p1, undefined, p2, {a:1}]) must be ${stringify(expected)}`);
      t.end();
    });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([p1, [p2, p3], p4]])", t => {
  Promises.flatten([p1, [p2, p3], p4])
    .then(results => {
      const expected = [new Success('p1'), new Success([new Failure(p2Error), new Success('p3')]), new Failure(p4Error)];
      t.deepEqual(results, expected, `Promises.flatten([p1, [p2, p3], p4]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p1, [p2, p3], p4]], null, simplifyOutcomesOpts)", t => {
  Promises.flatten([p1, [p2, p3], p4], null, simplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success('p1'), new Success([new Failure(p2Error), new Success('p3')]), new Failure(p4Error)];
      t.deepEqual(results, expected, `Promises.flatten([p1, [p2, p3], p4]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p1, [p2, p3], p4]], null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten([p1, [p2, p3], p4], null, skipSimplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success('p1'), new Success([new Failure(p2Error), new Success('p3')]), new Failure(p4Error)];
      t.deepEqual(results, expected, `Promises.flatten([p1, [p2, p3], p4]) must be ${stringify(expected)}`);
      t.end();
    });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([p1, [p2, [p3, p4]]])", t => {
  Promises.flatten([p1, [p2, [p3, p4]]])
    .then(results => {
      const expected = ['p1', [new Failure(p2Error), new Success([new Success('p3'), new Failure(p4Error)])]];
      t.deepEqual(results, expected, `Promises.flatten([p1, [p2, [p3, p4]]]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p1, [p2, [p3, p4]]], null, simplifyOutcomesOpts)", t => {
  Promises.flatten([p1, [p2, [p3, p4]]], null, simplifyOutcomesOpts)
    .then(results => {
      const expected = ['p1', [new Failure(p2Error), new Success([new Success('p3'), new Failure(p4Error)])]];
      t.deepEqual(results, expected, `Promises.flatten([p1, [p2, [p3, p4]]]) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten([p1, [p2, [p3, p4]]], null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten([p1, [p2, [p3, p4]]], null, skipSimplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success('p1'), new Success([new Failure(p2Error), new Success([new Success('p3'), new Failure(p4Error)])])];
      t.deepEqual(results, expected, `Promises.flatten([p1, [p2, [p3, p4]]]) must be ${stringify(expected)}`);
      t.end();
    });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten([p1, [p2, Promise.resolve([p3, p4])]])", t => {
  Promises.flatten([p1, [p2, Promise.resolve([p3, p4])]]).then(
    results => {
      const expected = ['p1', [new Failure(p2Error), new Success([new Success('p3'), new Failure(p4Error)])]];
      t.deepEqual(results, expected, `Promises.flatten([p1, [p2, Promise.resolve([p3, p4])]]) must be ${stringify(expected)}`);
      t.end();
    }
  );
});

test("Promises.flatten([p1, [p2, Promise.resolve([p3, p4])]], null, simplifyOutcomesOpts)", t => {
  Promises.flatten([p1, [p2, Promise.resolve([p3, p4])]], null, simplifyOutcomesOpts).then(
    results => {
      const expected = ['p1', [new Failure(p2Error), new Success([new Success('p3'), new Failure(p4Error)])]];
      t.deepEqual(results, expected, `Promises.flatten([p1, [p2, Promise.resolve([p3, p4])]]) must be ${stringify(expected)}`);
      t.end();
    }
  );
});

test("Promises.flatten([p1, [p2, Promise.resolve([p3, p4])]], null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten([p1, [p2, Promise.resolve([p3, p4])]], null, skipSimplifyOutcomesOpts).then(
    results => {
      const expected = [new Success('p1'), new Success([new Failure(p2Error), new Success([new Success('p3'), new Failure(p4Error)])])];
      t.deepEqual(results, expected, `Promises.flatten([p1, [p2, Promise.resolve([p3, p4])]]) must be ${stringify(expected)}`);
      t.end();
    }
  );
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten(Promise.resolve([p1, [p2, Promise.resolve([p3, p4])]]))", t => {
  Promises.flatten(Promise.resolve([p1, [p2, Promise.resolve([p3, p4])]]))
    .then(results => {
      const expected = ['p1', [new Failure(p2Error), new Success([new Success('p3'), new Failure(p4Error)])]];
      t.deepEqual(results, expected, `Promises.flatten(Promise.resolve([p1, [p2, Promise.resolve([p3, p4])]])) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten(Promise.resolve([p1, [p2, Promise.resolve([p3, p4])]]), null, simplifyOutcomesOpts)", t => {
  Promises.flatten(Promise.resolve([p1, [p2, Promise.resolve([p3, p4])]]), null, simplifyOutcomesOpts)
    .then(results => {
      const expected = ['p1', [new Failure(p2Error), new Success([new Success('p3'), new Failure(p4Error)])]];
      t.deepEqual(results, expected, `Promises.flatten(Promise.resolve([p1, [p2, Promise.resolve([p3, p4])]])) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten(Promise.resolve([p1, [p2, Promise.resolve([p3, p4])]]), null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten(Promise.resolve([p1, [p2, Promise.resolve([p3, p4])]]), null, skipSimplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success('p1'), new Success([new Failure(p2Error), new Success([new Success('p3'), new Failure(p4Error)])])];
      t.deepEqual(results, expected, `Promises.flatten(Promise.resolve([p1, [p2, Promise.resolve([p3, p4])]])) must be ${stringify(expected)}`);
      t.end();
    });
});

// ---------------------------------------------------------------------------------------------------------------------
test("Promises.flatten(Promise.resolve([p1, Promise.resolve([p2, Promise.resolve([p3, p4])])]))", t => {
  Promises.flatten(Promise.resolve([p1, Promise.resolve([p2, Promise.resolve([p3, p4])])]))
    .then(results => {
      const expected = ['p1', [new Failure(p2Error), new Success([new Success('p3'), new Failure(p4Error)])]];
      t.deepEqual(results, expected, `Promises.flatten(Promise.resolve([p1, Promise.resolve([p2, Promise.resolve([p3, p4])])])) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten(Promise.resolve([p1, Promise.resolve([p2, Promise.resolve([p3, p4])])]), null, simplifyOutcomesOpts)", t => {
  Promises.flatten(Promise.resolve([p1, Promise.resolve([p2, Promise.resolve([p3, p4])])]), null, simplifyOutcomesOpts)
    .then(results => {
      const expected = ['p1', [new Failure(p2Error), new Success([new Success('p3'), new Failure(p4Error)])]];
      t.deepEqual(results, expected, `Promises.flatten(Promise.resolve([p1, Promise.resolve([p2, Promise.resolve([p3, p4])])])) must be ${stringify(expected)}`);
      t.end();
    });
});

test("Promises.flatten(Promise.resolve([p1, Promise.resolve([p2, Promise.resolve([p3, p4])])]), null, skipSimplifyOutcomesOpts)", t => {
  Promises.flatten(Promise.resolve([p1, Promise.resolve([p2, Promise.resolve([p3, p4])])]), null, skipSimplifyOutcomesOpts)
    .then(results => {
      const expected = [new Success('p1'), new Success([new Failure(p2Error), new Success([new Success('p3'), new Failure(p4Error)])])];
      t.deepEqual(results, expected, `Promises.flatten(Promise.resolve([p1, Promise.resolve([p2, Promise.resolve([p3, p4])])])) must be ${stringify(expected)}`);
      t.end();
    });
});

// =====================================================================================================================
// Promises.flatten with skipSimplifyOutcomes false & with cancellations
// =====================================================================================================================

test("Promises.flatten([d1,d2,d3,d4]) cancelled immediately (i.e. before d1, d2, d3 & d4 resolve) will resolve only d1", t => {
  const cancellable = {};

  const d1Cancellable = {};
  const d1 = genDelayedPromise(null, 'd1', 10, d1Cancellable);
  t.ok(typeof d1Cancellable.cancelTimeout === "function", `d1Cancellable.cancelTimeout must be installed`);

  const d2Cancellable = {};
  const d2 = genDelayedPromise(d2Error, 'd2', 2000, d2Cancellable);
  t.ok(typeof d2Cancellable.cancelTimeout === "function", `d2Cancellable.cancelTimeout must be installed`);

  const d3Cancellable = {};
  const d3 = genDelayedPromise(null, 'd3', 3000, d3Cancellable);
  t.ok(typeof d3Cancellable.cancelTimeout === "function", `d3Cancellable.cancelTimeout must be installed`);

  const d4Cancellable = {};
  const d4 = genDelayedPromise(d4Error, 'd4', 4000, d4Cancellable);
  t.ok(typeof d4Cancellable.cancelTimeout === "function", `d4Cancellable.cancelTimeout must be installed`);

  Promises.flatten([d1, d2, d3, d4], cancellable).then(
    results => {
      t.end(`Promises.flatten([d1,d2,d3,d4]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.flatten([d1,d2,d3,d4]) when cancelled must reject with an error`);
      // Cancel the d2, d3 & d4 delays too (just for clean-up)
      t.ok(d1Cancellable.cancelTimeout(true), `d1Cancellable.cancelTimeout() should have timed-out`);
      t.notOk(d2Cancellable.cancelTimeout(true), `d2Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.notOk(d3Cancellable.cancelTimeout(true), `d3Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.notOk(d4Cancellable.cancelTimeout(true), `d4Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.ok(err instanceof CancelledError, `Promises.flatten([d1,d2,d3,d4]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success('d1')];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.flatten([d1,d2,d3,d4]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedPromises = [d2, d3, d4];
      t.deepEqual(err.unresolvedPromises, expectedUnresolvedPromises, `Promises.flatten([d1,d2,d3,d4]) unresolvedPromises must be ${stringify(expectedUnresolvedPromises)}`);
      t.end();
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
  const completed = cancellable.cancel();
  t.notOk(completed, `Promises.flatten([d1,d2,d3,d4]) must not be completed yet`);
});

test("Promises.flatten([d1,d2,d3,d4]) cancelled during d1 (i.e. before d2, d3 & d4 resolve) will resolve only d1", t => {
  const cancellable = {};

  const d1Cancellable = {};
  const d1 = genDelayedPromise(null, 'd1', 10, d1Cancellable, cancellable);
  t.ok(typeof d1Cancellable.cancelTimeout === "function", `d1Cancellable.cancelTimeout must be installed`);

  const d2Cancellable = {};
  const d2 = genDelayedPromise(d2Error, 'd2', 2000, d2Cancellable);
  t.ok(typeof d2Cancellable.cancelTimeout === "function", `d2Cancellable.cancelTimeout must be installed`);

  const d3Cancellable = {};
  const d3 = genDelayedPromise(null, 'd3', 3000, d3Cancellable);
  t.ok(typeof d3Cancellable.cancelTimeout === "function", `d3Cancellable.cancelTimeout must be installed`);

  const d4Cancellable = {};
  const d4 = genDelayedPromise(d4Error, 'd4', 4000, d4Cancellable);
  t.ok(typeof d4Cancellable.cancelTimeout === "function", `d4Cancellable.cancelTimeout must be installed`);

  Promises.flatten([d1, d2, d3, d4], cancellable).then(
    results => {
      t.end(`Promises.flatten([d1,d2,d3,d4]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.flatten([d1,d2,d3,d4]) when cancelled must reject with an error`);
      // Cancel the d2, d3 & d4 delays too (just for clean-up)
      t.ok(d1Cancellable.cancelTimeout(true), `d1Cancellable.cancelTimeout() should have timed-out`);
      t.notOk(d2Cancellable.cancelTimeout(true), `d2Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.notOk(d3Cancellable.cancelTimeout(true), `d3Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.notOk(d4Cancellable.cancelTimeout(true), `d4Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.ok(err instanceof CancelledError, `Promises.flatten([d1,d2,d3,d4]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success('d1')];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.flatten([d1,d2,d3,d4]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedPromises = [d2, d3, d4];
      t.deepEqual(err.unresolvedPromises, expectedUnresolvedPromises, `Promises.flatten([d1,d2,d3,d4]) unresolvedPromises must be ${stringify(expectedUnresolvedPromises)}`);
      t.end();
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
});

test("Promises.flatten([d1,d2,d3,d4]) cancelled during d2 (i.e. before d3 & d4 resolve) will resolve only d1 & d2", t => {
  const cancellable = {};

  const d1Cancellable = {};
  const d1 = genDelayedPromise(null, 'd1', 10, d1Cancellable);
  t.ok(typeof d1Cancellable.cancelTimeout === "function", `d1Cancellable.cancelTimeout must be installed`);

  const d2Cancellable = {};
  const d2 = genDelayedPromise(d2Error, 'd2', 20, d2Cancellable, cancellable);
  t.ok(typeof d2Cancellable.cancelTimeout === "function", `d2Cancellable.cancelTimeout must be installed`);

  const d3Cancellable = {};
  const d3 = genDelayedPromise(null, 'd3', 3000, d3Cancellable);
  t.ok(typeof d3Cancellable.cancelTimeout === "function", `d3Cancellable.cancelTimeout must be installed`);

  const d4Cancellable = {};
  const d4 = genDelayedPromise(d4Error, 'd4', 4000, d4Cancellable);
  t.ok(typeof d4Cancellable.cancelTimeout === "function", `d4Cancellable.cancelTimeout must be installed`);

  Promises.flatten([d1, d2, d3, d4], cancellable).then(
    results => {
      t.end(`Promises.flatten([d1,d2,d3,d4]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.flatten([d1,d2,d3,d4]) when cancelled must reject with an error`);
      // Cancel the d2, d3 & d4 delays too (just for clean-up)
      t.ok(d1Cancellable.cancelTimeout(true), `d1Cancellable.cancelTimeout() should have timed-out`);
      t.ok(d2Cancellable.cancelTimeout(true), `d2Cancellable.cancelTimeout() should have timed-out`);
      t.notOk(d3Cancellable.cancelTimeout(true), `d3Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.notOk(d4Cancellable.cancelTimeout(true), `d4Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.ok(err instanceof CancelledError, `Promises.flatten([d1,d2,d3,d4]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success('d1'), new Failure(d2Error)];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.flatten([d1,d2,d3,d4]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedPromises = [d3, d4];
      t.deepEqual(err.unresolvedPromises, expectedUnresolvedPromises, `Promises.flatten([d1,d2,d3,d4]) unresolvedPromises must be ${stringify(expectedUnresolvedPromises)}`);
      t.end();
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
});

test("Promises.flatten([d1,d2,d3,d4]) cancelled during d3 (i.e. before d4 completes) will resolve d1, d2 & d3", t => {
  const cancellable = {};

  const d1Cancellable = {};
  const d1 = genDelayedPromise(null, 'd1', 10, d1Cancellable);
  t.ok(typeof d1Cancellable.cancelTimeout === "function", `d1Cancellable.cancelTimeout must be installed`);

  const d2Cancellable = {};
  const d2 = genDelayedPromise(d2Error, 'd2', 20, d2Cancellable);
  t.ok(typeof d2Cancellable.cancelTimeout === "function", `d2Cancellable.cancelTimeout must be installed`);

  const d3Cancellable = {};
  const d3 = genDelayedPromise(null, 'd3', 30, d3Cancellable, cancellable);
  t.ok(typeof d3Cancellable.cancelTimeout === "function", `d3Cancellable.cancelTimeout must be installed`);

  const d4Cancellable = {};
  const d4 = genDelayedPromise(d4Error, 'd4', 4000, d4Cancellable);
  t.ok(typeof d4Cancellable.cancelTimeout === "function", `d4Cancellable.cancelTimeout must be installed`);

  Promises.flatten([d1, d2, d3, d4], cancellable).then(
    results => {
      t.end(`Promises.flatten([d1,d2,d3,d4]) when cancelled, must NOT complete successfully with results: ${stringify(results)}`);
    },
    err => {
      t.pass(`Promises.flatten([d1,d2,d3,d4]) when cancelled must reject with an error`);
      // Cancel the d2, d3 & d4 delays too (just for clean-up)
      t.ok(d1Cancellable.cancelTimeout(true), `d1Cancellable.cancelTimeout() should have timed-out`);
      t.ok(d2Cancellable.cancelTimeout(true), `d2Cancellable.cancelTimeout() should have timed-out`);
      t.ok(d3Cancellable.cancelTimeout(true), `d3Cancellable.cancelTimeout() should have timed-out`);
      t.notOk(d4Cancellable.cancelTimeout(true), `d4Cancellable.cancelTimeout() should NOT have timed-out yet`);
      t.ok(err instanceof CancelledError, `Promises.flatten([d1,d2,d3,d4]) rejected error ${stringify(err)} must be instanceof CancelledError`);
      t.notOk(err.completed, `CancelledError.completed must be false`);
      const expectedResolvedOutcomes = [new Success('d1'), new Failure(d2Error), new Success('d3')];
      t.deepEqual(err.resolvedOutcomes, expectedResolvedOutcomes, `Promises.flatten([d1,d2,d3,d4]) resolvedOutcomes must be ${stringify(expectedResolvedOutcomes)}`);
      const expectedUnresolvedPromises = [d4];
      t.deepEqual(err.unresolvedPromises, expectedUnresolvedPromises, `Promises.flatten([d1,d2,d3,d4]) unresolvedPromises must be ${stringify(expectedUnresolvedPromises)}`);
      t.end();
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
});

test("Promises.flatten([d1,d2,d3,d4]) cancelled during d4 will resolve d1, d2, d3 & d4", t => {
  const cancellable = {};

  const d1Cancellable = {};
  const d1 = genDelayedPromise(null, 'd1', 10, d1Cancellable);
  t.ok(typeof d1Cancellable.cancelTimeout === "function", `d1Cancellable.cancelTimeout must be installed`);

  const d2Cancellable = {};
  const d2 = genDelayedPromise(d2Error, 'd2', 20, d2Cancellable);
  t.ok(typeof d2Cancellable.cancelTimeout === "function", `d2Cancellable.cancelTimeout must be installed`);

  const d3Cancellable = {};
  const d3 = genDelayedPromise(null, 'd3', 30, d3Cancellable);
  t.ok(typeof d3Cancellable.cancelTimeout === "function", `d3Cancellable.cancelTimeout must be installed`);

  const d4Cancellable = {};
  const d4 = genDelayedPromise(d4Error, 'd4', 40, d4Cancellable, cancellable);
  t.ok(typeof d4Cancellable.cancelTimeout === "function", `d4Cancellable.cancelTimeout must be installed`);

  Promises.flatten([d1, d2, d3, d4], cancellable).then(
    outcomes => {
      t.pass(`Promises.flatten([d1,d2,d3,d4]) when cancelled too late must resolve with outcomes`);
      // Cancel the d2, d3 & d4 delays too (just for clean-up)
      t.ok(d1Cancellable.cancelTimeout(true), `d1Cancellable.cancelTimeout() should have timed-out`);
      t.ok(d2Cancellable.cancelTimeout(true), `d2Cancellable.cancelTimeout() should have timed-out`);
      t.ok(d3Cancellable.cancelTimeout(true), `d3Cancellable.cancelTimeout() should have timed-out`);
      t.ok(d4Cancellable.cancelTimeout(true), `d4Cancellable.cancelTimeout() should have timed-out`);
      const expectedOutcomes = [new Success('d1'), new Failure(d2Error), new Success('d3'), new Failure(d4Error)];
      t.deepEqual(outcomes, expectedOutcomes, `Promises.flatten([d1,d2,d3,d4]) outcomes must be ${stringify(expectedOutcomes)}`);
      t.end();
    },
    err => {
      t.end(`Promises.flatten([d1,d2,d3,d4]) when cancelled too late, must NOT reject with error`, err.stack);
    }
  );
  t.ok(typeof cancellable.cancel === "function", `cancellable.cancel must be installed`);
});
