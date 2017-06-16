'use strict';

/**
 * Unit tests for core-functions/any.js
 * @author Byron du Preez
 */

const test = require('tape');

const any = require('../any');
const defined = any.defined;
const notDefined = any.notDefined;
const valueOf = any.valueOf;

const strings = require('../strings');
const stringify = strings.stringify;

// =====================================================================================================================
// defined
// =====================================================================================================================

test('defined', t => {
  // NOT defined
  let expected = false;

  let value = undefined;
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = null;
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);


  // defined
  expected = true;

  value = false;
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = true;
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = 0;
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = 123.456;
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = -123.456;
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = '';
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = 'abc';
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = {};
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = [];
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = {a:1};
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = [1,2,3];
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = {a: undefined};
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = [undefined];
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = {a: null};
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  value = [null];
  t.equal(defined(value), expected, `defined(${stringify(value)}) must be ${stringify(expected)}`);

  t.end();
});

// =====================================================================================================================
// notDefined
// =====================================================================================================================

test('notDefined', t => {
  // NOT notDefined
  let expected = true;

  let value = undefined;
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = null;
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);


  // notDefined
  expected = false;

  value = false;
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = true;
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = 0;
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = 123.456;
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = -123.456;
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = '';
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = 'abc';
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = {};
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = [];
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = {a:1};
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = [1,2,3];
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = {a: undefined};
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = [undefined];
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = {a: null};
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  value = [null];
  t.equal(notDefined(value), expected, `notDefined(${stringify(value)}) must be ${stringify(expected)}`);

  t.end();
});

// =====================================================================================================================
// valueOf
// =====================================================================================================================

test('valueOf', t => {
  function check(value, expected) {
    return t.deepEqual(valueOf(value), expected, `valueOf(${stringify(value)}) must be ${stringify(expected)}`);
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
  check({a: 1}, {a: 1});

  check([], []);
  check(['a'], ['a']);
  check(['a', 1], ['a', 1]);

  t.end();
});