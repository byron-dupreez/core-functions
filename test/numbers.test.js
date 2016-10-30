'use strict';

/**
 * Unit tests for core-functions/numbers.js
 * @author Byron du Preez
 */

const test = require('tape');

const Numbers = require('../numbers');

const testing = require('./testing');
// const okNotOk = testing.okNotOk;
const checkOkNotOk = testing.checkOkNotOk;
// const checkMethodOkNotOk = testing.checkMethodOkNotOk;
// const equal = testing.equal;
const checkEqual = testing.checkEqual;
// const checkMethodEqual = testing.checkMethodEqual;

function wrap(value, wrapInNumber) {
  return wrapInNumber && !(value instanceof Number) ? new Number(value) : value;
}
function toPrefix(value, wrapInNumber) {
  const wrapped = wrap(value, wrapInNumber);
  return wrapInNumber || value instanceof Number ? `Number(${value}) = (${wrapped ? wrapped.valueOf() : value}) ` : '';
}

function checkIsNumber(t, wrapInNumber) {
  function check(value, expected) {
    return checkOkNotOk(t, Numbers.isNumber, [wrap(value, wrapInNumber)], expected, ' is a number', ' is NOT a number',
      toPrefix(value, wrapInNumber));
  }
  // undefined
  check(undefined, wrapInNumber);

  // null
  check(null, wrapInNumber);

  // objects
  check({}, wrapInNumber);
  check({a: 1, b: 2}, wrapInNumber);

  // booleans
  check(true, wrapInNumber); // 1 when wrapped
  check(false, wrapInNumber); // 0 when wrapped

  // arrays
  check([], wrapInNumber);
  check([1, 2, 3], wrapInNumber);

  // special case numbers
  check(Number.POSITIVE_INFINITY, true);
  check(Number.NEGATIVE_INFINITY, true);
  check(NaN, true);

  // negative numbers
  check(Number.MIN_VALUE, true);
  check(Number.MIN_SAFE_INTEGER, true);
  check(-123.456, true);
  check(-1, true);

  // zero
  check(0, true);

  // positive numbers
  check(1, true);
  check(123.456, true);
  check(Number.MAX_SAFE_INTEGER, true);
  check(Number.MAX_VALUE, true);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, wrapInNumber);
  check(`${Number.MIN_SAFE_INTEGER}`, wrapInNumber);
  check('-123.456', wrapInNumber);
  check('-1', wrapInNumber);

  check('0', wrapInNumber);

  check('1', wrapInNumber);
  check('123.456', wrapInNumber);
  check(`${Number.MAX_SAFE_INTEGER}`, wrapInNumber);
  check(`${Number.MAX_VALUE}`, wrapInNumber);

  // strings not containing numbers
  check('', wrapInNumber); // 0 when wrapped
  check('a', wrapInNumber); // NaN when wrapped
  check('abc', wrapInNumber); // NaN when wrapped
  check('ABC', wrapInNumber); // NaN when wrapped
}

function checkIsFiniteNumber(t, wrapInNumber) {
  function check(value, expected) {
    return checkOkNotOk(t, Numbers.isFiniteNumber, [wrap(value, wrapInNumber)], expected, ' is a finite number',
      ' is NOT a finite number', toPrefix(value, wrapInNumber));
  }
  // undefined
  check(undefined, false);

  // null
  check(null, wrapInNumber); // null becomes 0 when wrapped

  // objects
  check({}, false); // i.e. NaN
  check({a: 1, b: 2}, false); // i.e. NaN

  // booleans
  check(true, wrapInNumber); // 1 when wrapped
  check(false, wrapInNumber); // 0 when wrapped

  check([], wrapInNumber); // i.e. 0
  check([1, 2, 3], false); // i.e. NaN

  check(Number.POSITIVE_INFINITY, false);
  check(Number.NEGATIVE_INFINITY, false);
  check(NaN, false);

  // negative numbers
  check(Number.MIN_VALUE, true);
  check(Number.MIN_SAFE_INTEGER, true);
  check(-123.456, true);
  check(-1, true);

  // zero
  check(0, true);

  // positive numbers
  check(1, true);
  check(123.456, true);
  check(Number.MAX_SAFE_INTEGER, true);
  check(Number.MAX_VALUE, true);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, wrapInNumber);
  check(`${Number.MIN_SAFE_INTEGER}`, wrapInNumber);
  check('-123.456', wrapInNumber);
  check('-1', wrapInNumber);

  check('0', wrapInNumber);

  check('1', wrapInNumber);
  check('123.456', wrapInNumber);
  check(`${Number.MAX_SAFE_INTEGER}`, wrapInNumber);
  check(`${Number.MAX_VALUE}`, wrapInNumber);

  // strings not containing numbers
  check('abc', false); // NaN when wrapped
  check('', wrapInNumber); // 0 when wrapped
}

function checkIsSpecialNumber(t, wrapInNumber) {
  function check(value, expected) {
    return checkOkNotOk(t, Numbers.isSpecialNumber, [wrap(value, wrapInNumber)], expected, ' is a special number',
      ' is NOT a special number', toPrefix(value, wrapInNumber));
  }
  // undefined
  check(undefined, wrapInNumber); // NaN wrapped

  // null
  check(null, false); // 0 wrapped

  // objects
  check({}, wrapInNumber); // NaN wrapped
  check({a: 1, b: 2}, wrapInNumber); // NaN wrapped

  // booleans
  check(true, false); // 1 when wrapped
  check(false, false); // 0 when wrapped

  // arrays
  check([], false); // 0 when wrapped
  check([1, 2, 3], wrapInNumber); // NaN when wrapped

  // special case numbers
  check(Number.POSITIVE_INFINITY, true);
  check(Number.NEGATIVE_INFINITY, true);
  check(NaN, true);

  // negative numbers
  check(Number.MIN_VALUE, false);
  check(Number.MIN_SAFE_INTEGER, false);
  check(-123.456, false);
  check(-1, false);

  // zero
  check(0, false);

  // positive numbers
  check(1, false);
  check(123.456, false);
  check(Number.MAX_SAFE_INTEGER, false);
  check(Number.MAX_VALUE, false);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, false);
  check(`${Number.MIN_SAFE_INTEGER}`, false);
  check('-123.456', false);
  check('-1', false);

  check('0', false);

  check('1', false);
  check('123.456', false);
  check(`${Number.MAX_SAFE_INTEGER}`, false);
  check(`${Number.MAX_VALUE}`, false);

  // special case numbers in strings
  check(`${Number.POSITIVE_INFINITY}`, wrapInNumber);
  check(`${Number.NEGATIVE_INFINITY}`, wrapInNumber);
  check(`${NaN}`, wrapInNumber);

  // strings not containing numbers
  check('', false); // 0 when wrapped
  check('a', wrapInNumber); // NaN when wrapped
  check('abc', wrapInNumber); // NaN when wrapped
  check('ABC', wrapInNumber); // NaN when wrapped
}

function checkIsNaN(t, wrapInNumber) {
  function check(value, expected) {
    return checkOkNotOk(t, Numbers.isNaN, [wrap(value, wrapInNumber)], expected, ' is NaN', ' is NOT NaN',
      toPrefix(value, wrapInNumber));
  }

  // undefined
  check(undefined, wrapInNumber); // NaN wrapped

  // null
  check(null, false); // 0 wrapped

  // objects
  check({}, wrapInNumber); // NaN wrapped
  check({a: 1, b: 2}, wrapInNumber); // NaN wrapped

  // booleans
  check(true, false); // 1 when wrapped
  check(false, false); // 0 when wrapped

  // arrays
  check([], false); // 0 when wrapped
  check([1, 2, 3], wrapInNumber); // NaN when wrapped

  // special case numbers
  check(Number.POSITIVE_INFINITY, false);
  check(Number.NEGATIVE_INFINITY, false);
  check(NaN, true);

  // negative numbers
  check(Number.MIN_VALUE, false);
  check(Number.MIN_SAFE_INTEGER, false);
  check(-123.456, false);
  check(-1, false);

  // zero
  check(0, false);

  // positive numbers
  check(1, false);
  check(123.456, false);
  check(Number.MAX_SAFE_INTEGER, false);
  check(Number.MAX_VALUE, false);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, false);
  check(`${Number.MIN_SAFE_INTEGER}`, false);
  check('-123.456', false);
  check('-1', false);

  check('0', false);

  check('1', false);
  check('123.456', false);
  check(`${Number.MAX_SAFE_INTEGER}`, false);
  check(`${Number.MAX_VALUE}`, false);

  // special case numbers in strings
  check(`${Number.POSITIVE_INFINITY}`, wrapInNumber);
  check(`${Number.NEGATIVE_INFINITY}`, wrapInNumber);
  check(`${NaN}`, wrapInNumber);

  // strings not containing numbers
  check('', false); // 0 when wrapped
  check('a', wrapInNumber); // NaN when wrapped
  check('abc', wrapInNumber); // NaN when wrapped
  check('ABC', wrapInNumber); // NaN when wrapped
}

test('isNumber on Numbers', t => {
  checkIsNumber(t, true);
  t.end();
});

test('isNumber on numbers', t => {
  checkIsNumber(t, false);
  t.end();
});

test('isFiniteNumber on Numbers', t => {
  checkIsFiniteNumber(t, true);
  t.end();
});

test('isFiniteNumber on numbers', t => {
  checkIsFiniteNumber(t, false);
  t.end();
});

test('isSpecialNumber on numbers', t => {
  checkIsSpecialNumber(t, false);
  t.end();
});

test('isSpecialNumber on Numbers', t => {
  checkIsSpecialNumber(t, true);
  t.end();
});

test('isNaN on numbers', t => {
  checkIsNaN(t, false);
  t.end();
});

test('isNaN on Numbers', t => {
  checkIsNaN(t, false);
  t.end();
});
