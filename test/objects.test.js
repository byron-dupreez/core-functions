'use strict';

/**
 * Unit tests for core-functions/strings.js
 * @author Byron du Preez
 */

const test = require('tape');

const Objects = require('../objects');
const valueOf = Objects.valueOf;

const testing = require('./testing');
// const okNotOk = testing.okNotOk;
// const checkOkNotOk = testing.checkOkNotOk;
// const checkMethodOkNotOk = testing.checkMethodOkNotOk;
// const equal = testing.equal;
const checkEqual = testing.checkEqual;
// const checkMethodEqual = testing.checkMethodEqual;

test('valueOf', t => {
  function check(value, expected) {
    return checkEqual(t, Objects.valueOf, [value], expected, false);
  }
  // undefined
  check(undefined, undefined);
  check(null, null);

  // strings
  check('', '');
  check('a', 'a');
  check('Abc', 'Abc');
  check(new Object(''), ''); // wrapped must unwrap
  check(new Object('a'), 'a'); // wrapped must unwrap
  check(new Object('Abc'), 'Abc'); // wrapped must unwrap

  check(0, 0);
  check(1, 1);
  check(3.14, 3.14);
  check(new Object(0), 0); // wrapped must unwrap
  check(new Object(1), 1); // wrapped must unwrap
  check(new Object(3.14), 3.14); // wrapped must unwrap

  check(true, true);
  check(false, false);
  check(new Object(true), true); // wrapped must unwrap
  check(new Object(false), false); // wrapped must unwrap

  check({}, {});
  check({a:1}, {a:1});

  check([], []);
  check(['a'], ['a']);
  check(['a', 1], ['a', 1]);

  t.end();
});


