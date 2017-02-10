'use strict';

/**
 * Unit tests for core-functions/booleans.js
 * @author Byron du Preez
 */

const test = require('tape');

const Booleans = require('../booleans');

// const Strings = require('../strings');

function wrap(value, wrapInBoolean) {
  //noinspection JSPrimitiveTypeWrapperUsage
  return wrapInBoolean && !(value instanceof Boolean) ? new Boolean(value) : value;
}

function toPrefix(value, wrapInBoolean) {
  const wrapped = wrap(value, wrapInBoolean);
  return wrapInBoolean || value instanceof Boolean ? `Boolean(${value}) = (${wrapped ? wrapped.valueOf() : value}) ` : '';
}

function checkIsBooleans(t, wrapInBoolean) {
  function check(value, expected) {
    return t.equal(Booleans.isBoolean(wrap(value, wrapInBoolean)), expected, `Booleans.isBoolean(${toPrefix(value, wrapInBoolean)}) is ${expected ? '' : 'NOT '}a boolean`); // :
  }
  // undefined
  check(undefined, wrapInBoolean);

  // null
  check(null, wrapInBoolean); // '' ?

  // objects
  check({}, wrapInBoolean);
  check({a: 1, b: 2}, wrapInBoolean);

  // booleans
  check(true, true);
  check(false, true);

  // arrays
  check([], wrapInBoolean);
  check([1, 2, 3], wrapInBoolean);

  // special case numbers
  check(Number.POSITIVE_INFINITY, wrapInBoolean);
  check(Number.NEGATIVE_INFINITY, wrapInBoolean);
  check(NaN, wrapInBoolean);

  // negative numbers
  check(Number.MIN_VALUE, wrapInBoolean);
  check(Number.MIN_SAFE_INTEGER, wrapInBoolean);
  check(-123.456, wrapInBoolean);
  check(-1, wrapInBoolean);

  // zero
  check(0, wrapInBoolean);

  // positive numbers
  check(1, wrapInBoolean);
  check(123.456, wrapInBoolean);
  check(Number.MAX_SAFE_INTEGER, wrapInBoolean);
  check(Number.MAX_VALUE, wrapInBoolean);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, wrapInBoolean);
  check(`${Number.MIN_SAFE_INTEGER}`, wrapInBoolean);
  check('-123.456', wrapInBoolean);
  check('-1', wrapInBoolean);

  check('0', wrapInBoolean);

  check('1', wrapInBoolean);
  check('123.456', wrapInBoolean);
  check(`${Number.MAX_SAFE_INTEGER}`, wrapInBoolean);
  check(`${Number.MAX_VALUE}`, wrapInBoolean);

  // strings containing booleans
  check('true', wrapInBoolean);
  check('false', wrapInBoolean);

  // strings not containing numbers
  check('', wrapInBoolean);
  check('abc', wrapInBoolean);
  check('ABC', wrapInBoolean);
}

function checkIsTrueOrFalses(t, wrapInBoolean) {
  function check(value, expected) {
    return t.equal(Booleans.isTrueOrFalse(wrap(value, wrapInBoolean)), expected, `Booleans.isTrueOrFalse(${toPrefix(value, wrapInBoolean)}) is ${expected ? '' : 'NOT '}true or false`); // :
  }
  // undefined
  check(undefined, wrapInBoolean);

  // null
  check(null, wrapInBoolean); // '' ?

  // objects
  check({}, wrapInBoolean);
  check({a: 1, b: 2}, wrapInBoolean);

  // booleans
  check(true, true);
  check(false, true);

  // arrays
  check([], wrapInBoolean);
  check([1, 2, 3], wrapInBoolean);

  // special case numbers
  check(Number.POSITIVE_INFINITY, wrapInBoolean);
  check(Number.NEGATIVE_INFINITY, wrapInBoolean);
  check(NaN, wrapInBoolean);

  // negative numbers
  check(Number.MIN_VALUE, wrapInBoolean);
  check(Number.MIN_SAFE_INTEGER, wrapInBoolean);
  check(-123.456, wrapInBoolean);
  check(-1, wrapInBoolean);

  // zero
  check(0, wrapInBoolean);

  // positive numbers
  check(1, wrapInBoolean);
  check(123.456, wrapInBoolean);
  check(Number.MAX_SAFE_INTEGER, wrapInBoolean);
  check(Number.MAX_VALUE, wrapInBoolean);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, wrapInBoolean);
  check(`${Number.MIN_SAFE_INTEGER}`, wrapInBoolean);
  check('-123.456', wrapInBoolean);
  check('-1', wrapInBoolean);

  check('0', wrapInBoolean);

  check('1', wrapInBoolean);
  check('123.456', wrapInBoolean);
  check(`${Number.MAX_SAFE_INTEGER}`, wrapInBoolean);
  check(`${Number.MAX_VALUE}`, wrapInBoolean);

  // strings containing booleans
  check('true', wrapInBoolean);
  check('false', wrapInBoolean);

  // strings not containing numbers
  check('', wrapInBoolean);
  check('abc', wrapInBoolean);
  check('ABC', wrapInBoolean);
}

test('isTrueOrFalse on Booleans', t => {
  checkIsTrueOrFalses(t, true);
  t.end();
});

test('isTrueOrFalse on booleans', t => {
  checkIsTrueOrFalses(t, false);
  t.end();
});

test('isBoolean on Booleans', t => {
  checkIsBooleans(t, true);
  t.end();
});

test('isBoolean on booleans', t => {
  checkIsBooleans(t, false);
  t.end();
});
