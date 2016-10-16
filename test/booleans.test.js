'use strict';

const test = require('tape');

const Booleans = require('../booleans');

function stringify(value, v) {
  const val = value === +Infinity || value === -Infinity || (typeof value === 'number' && Number.isNaN(value)) ?
    value : JSON.stringify(value);
  return v instanceof Boolean ? `Boolean(${val}) with valueOf (${v.valueOf()})` : val;
}

function checkOkNotOk(fn, value, expected, wrapInBoolean, okSuffix, notOkSuffix, t) {
  const v = wrapInBoolean && !(value instanceof Boolean) ? new Boolean(value) : value;
  if (expected) {
    t.ok(fn(v), `${stringify(value, v)}${okSuffix}`);
  } else {
    t.notOk(fn(v), `${stringify(value, v)}${notOkSuffix}`);
  }
}

function checkIsBooleans(wrapInBoolean, t) {
  function check(value, expected, wrapInBoolean, t) {
    return checkOkNotOk(Booleans.isBoolean, value, expected, wrapInBoolean, ' is a boolean', ' is NOT a boolean', t);
  }
  // undefined
  check(undefined, wrapInBoolean, wrapInBoolean, t);

  // null
  check(null, wrapInBoolean, wrapInBoolean, t); // '' ?

  // objects
  check({}, wrapInBoolean, wrapInBoolean, t);
  check({a:1,b:2}, wrapInBoolean, wrapInBoolean, t);

  // booleans
  check(true, true, wrapInBoolean, t);
  check(false, true, wrapInBoolean, t);

  // arrays
  check([], wrapInBoolean, wrapInBoolean, t);
  check([1,2,3], wrapInBoolean, wrapInBoolean, t);

  // special case numbers
  check(Number.POSITIVE_INFINITY, wrapInBoolean, wrapInBoolean, t);
  check(Number.NEGATIVE_INFINITY, wrapInBoolean, wrapInBoolean, t);
  check(NaN, wrapInBoolean, wrapInBoolean, t);

  // negative numbers
  check(Number.MIN_VALUE, wrapInBoolean, wrapInBoolean, t);
  check(Number.MIN_SAFE_INTEGER, wrapInBoolean, wrapInBoolean, t);
  check(-123.456, wrapInBoolean, wrapInBoolean, t);
  check(-1, wrapInBoolean, wrapInBoolean, t);

  // zero
  check(0, wrapInBoolean, wrapInBoolean, t);

  // positive numbers
  check(1, wrapInBoolean, wrapInBoolean, t);
  check(123.456, wrapInBoolean, wrapInBoolean, t);
  check(Number.MAX_SAFE_INTEGER, wrapInBoolean, wrapInBoolean, t);
  check(Number.MAX_VALUE, wrapInBoolean, wrapInBoolean, t);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, wrapInBoolean, wrapInBoolean, t);
  check(`${Number.MIN_SAFE_INTEGER}`, wrapInBoolean, wrapInBoolean, t);
  check('-123.456', wrapInBoolean, wrapInBoolean, t);
  check('-1', wrapInBoolean, wrapInBoolean, t);

  check('0', wrapInBoolean, wrapInBoolean, t);

  check('1', wrapInBoolean, wrapInBoolean, t);
  check('123.456', wrapInBoolean, wrapInBoolean, t);
  check(`${Number.MAX_SAFE_INTEGER}`, wrapInBoolean, wrapInBoolean, t);
  check(`${Number.MAX_VALUE}`, wrapInBoolean, wrapInBoolean, t);

  // strings containing booleans
  check('true', wrapInBoolean, wrapInBoolean, t);
  check('false', wrapInBoolean, wrapInBoolean, t);

  // strings not containing numbers
  check('', wrapInBoolean, wrapInBoolean, t);
  check('abc', wrapInBoolean, wrapInBoolean, t);
  check('ABC', wrapInBoolean, wrapInBoolean, t);
}

function checkIsTrueOrFalses(wrapInBoolean, t) {
  function check(value, expected, wrapInBoolean, t) {
    return checkOkNotOk(Booleans.isTrueOrFalse, value, expected, wrapInBoolean, ' is true or false', ' is NOT true or false', t);
  }
  // undefined
  check(undefined, wrapInBoolean, wrapInBoolean, t);

  // null
  check(null, wrapInBoolean, wrapInBoolean, t); // '' ?

  // objects
  check({}, wrapInBoolean, wrapInBoolean, t);
  check({a:1,b:2}, wrapInBoolean, wrapInBoolean, t);

  // booleans
  check(true, true, wrapInBoolean, t);
  check(false, true, wrapInBoolean, t);

  // arrays
  check([], wrapInBoolean, wrapInBoolean, t);
  check([1,2,3], wrapInBoolean, wrapInBoolean, t);

  // special case numbers
  check(Number.POSITIVE_INFINITY, wrapInBoolean, wrapInBoolean, t);
  check(Number.NEGATIVE_INFINITY, wrapInBoolean, wrapInBoolean, t);
  check(NaN, wrapInBoolean, wrapInBoolean, t);

  // negative numbers
  check(Number.MIN_VALUE, wrapInBoolean, wrapInBoolean, t);
  check(Number.MIN_SAFE_INTEGER, wrapInBoolean, wrapInBoolean, t);
  check(-123.456, wrapInBoolean, wrapInBoolean, t);
  check(-1, wrapInBoolean, wrapInBoolean, t);

  // zero
  check(0, wrapInBoolean, wrapInBoolean, t);

  // positive numbers
  check(1, wrapInBoolean, wrapInBoolean, t);
  check(123.456, wrapInBoolean, wrapInBoolean, t);
  check(Number.MAX_SAFE_INTEGER, wrapInBoolean, wrapInBoolean, t);
  check(Number.MAX_VALUE, wrapInBoolean, wrapInBoolean, t);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, wrapInBoolean, wrapInBoolean, t);
  check(`${Number.MIN_SAFE_INTEGER}`, wrapInBoolean, wrapInBoolean, t);
  check('-123.456', wrapInBoolean, wrapInBoolean, t);
  check('-1', wrapInBoolean, wrapInBoolean, t);

  check('0', wrapInBoolean, wrapInBoolean, t);

  check('1', wrapInBoolean, wrapInBoolean, t);
  check('123.456', wrapInBoolean, wrapInBoolean, t);
  check(`${Number.MAX_SAFE_INTEGER}`, wrapInBoolean, wrapInBoolean, t);
  check(`${Number.MAX_VALUE}`, wrapInBoolean, wrapInBoolean, t);

  // strings containing booleans
  check('true', wrapInBoolean, wrapInBoolean, t);
  check('false', wrapInBoolean, wrapInBoolean, t);

  // strings not containing numbers
  check('', wrapInBoolean, wrapInBoolean, t);
  check('abc', wrapInBoolean, wrapInBoolean, t);
  check('ABC', wrapInBoolean, wrapInBoolean, t);
}

test('isTrueOrFalse on Booleans', t => {
  checkIsTrueOrFalses(true, t);
  t.end();
});

test('isTrueOrFalse on booleans', t => {
  checkIsTrueOrFalses(false, t);
  t.end();
});

test('isBoolean on Booleans', t => {
  checkIsBooleans(true, t);
  t.end();
});

test('isBoolean on booleans', t => {
  checkIsBooleans(false, t);
  t.end();
});
