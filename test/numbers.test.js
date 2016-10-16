'use strict';

const test = require('tape');

const Numbers = require('../numbers');

function isNaN(value) {
  return (typeof value === 'number' && Number.isNaN(value)) || (value instanceof Number && isNaN(value.valueOf()));
}

function stringify(value, v) {
  const val = value === +Infinity || value === -Infinity || isNaN(value) ? value : JSON.stringify(value);
  return v instanceof Number ? `Number(${val}) with valueOf (${v.valueOf()})` : val;
}

function checkOkNotOk(fn, value, expected, wrapInNumber, okSuffix, notOkSuffix, t) {
  const v = wrapInNumber && !(value instanceof Number) ? new Number(value) : value;
  if (expected) {
    t.ok(fn(v), `${stringify(value, v)}${okSuffix}`);
  } else {
    t.notOk(fn(v), `${stringify(value, v)}${notOkSuffix}`);
  }
}

function checkIsNumber(wrapInNumber, t) {
  function check(value, expected, wrapInString, t) {
    return checkOkNotOk(Numbers.isNumber, value, expected, wrapInString, ' is a number', ' is NOT a number', t);
  }

  // undefined
  check(undefined, wrapInNumber, wrapInNumber, t);

  // null
  check(null, wrapInNumber, wrapInNumber, t);

  // objects
  check({}, wrapInNumber, wrapInNumber, t);
  check({a:1,b:2}, wrapInNumber, wrapInNumber, t);

  // booleans
  check(true, wrapInNumber, wrapInNumber, t); // 1 when wrapped
  check(false, wrapInNumber, wrapInNumber, t); // 0 when wrapped

  // arrays
  check([], wrapInNumber, wrapInNumber, t);
  check([1,2,3], wrapInNumber, wrapInNumber, t);

  // special case numbers
  check(Number.POSITIVE_INFINITY, true, wrapInNumber, t);
  check(Number.NEGATIVE_INFINITY, true, wrapInNumber, t);
  check(NaN, true, wrapInNumber, t);

  // negative numbers
  check(Number.MIN_VALUE, true, wrapInNumber, t);
  check(Number.MIN_SAFE_INTEGER, true, wrapInNumber, t);
  check(-123.456, true, wrapInNumber, t);
  check(-1, true, wrapInNumber, t);

  // zero
  check(0, true, wrapInNumber, t);

  // positive numbers
  check(1, true, wrapInNumber, t);
  check(123.456, true, wrapInNumber, t);
  check(Number.MAX_SAFE_INTEGER, true, wrapInNumber, t);
  check(Number.MAX_VALUE, true, wrapInNumber, t);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, wrapInNumber, wrapInNumber, t);
  check(`${Number.MIN_SAFE_INTEGER}`, wrapInNumber, wrapInNumber, t);
  check('-123.456', wrapInNumber, wrapInNumber, t);
  check('-1', wrapInNumber, wrapInNumber, t);

  check('0', wrapInNumber, wrapInNumber, t);

  check('1', wrapInNumber, wrapInNumber, t);
  check('123.456', wrapInNumber, wrapInNumber, t);
  check(`${Number.MAX_SAFE_INTEGER}`, wrapInNumber, wrapInNumber, t);
  check(`${Number.MAX_VALUE}`, wrapInNumber, wrapInNumber, t);

  // strings not containing numbers
  check('', wrapInNumber, wrapInNumber, t); // 0 when wrapped
  check('a', wrapInNumber, wrapInNumber, t); // NaN when wrapped
  check('abc', wrapInNumber, wrapInNumber, t); // NaN when wrapped
  check('ABC', wrapInNumber, wrapInNumber, t); // NaN when wrapped
}

function checkIsFiniteNumber(wrapInNumber, t) {
  function check(value, expected, wrapInString, t) {
    return checkOkNotOk(Numbers.isFiniteNumber, value, expected, wrapInString, ' is a finite number', ' is NOT a finite number', t);
  }

  // undefined
  check(undefined, false, wrapInNumber, t);

  // null
  check(null, wrapInNumber, wrapInNumber, t); // null becomes 0 when wrapped

  // objects
  check({}, false, wrapInNumber, t); // i.e. NaN
  check({a:1,b:2}, false, wrapInNumber, t); // i.e. NaN

  // booleans
  check(true, wrapInNumber, wrapInNumber, t); // 1 when wrapped
  check(false, wrapInNumber, wrapInNumber, t); // 0 when wrapped

  check([], wrapInNumber, wrapInNumber, t); // i.e. 0
  check([1,2,3], false, wrapInNumber, t); // i.e. NaN

  check(Number.POSITIVE_INFINITY, false, wrapInNumber, t);
  check(Number.NEGATIVE_INFINITY, false, wrapInNumber, t);
  check(NaN, false, wrapInNumber, t);

  // negative numbers
  check(Number.MIN_VALUE, true, wrapInNumber, t);
  check(Number.MIN_SAFE_INTEGER, true, wrapInNumber, t);
  check(-123.456, true, wrapInNumber, t);
  check(-1, true, wrapInNumber, t);

  // zero
  check(0, true, wrapInNumber, t);

  // positive numbers
  check(1, true, wrapInNumber, t);
  check(123.456, true, wrapInNumber, t);
  check(Number.MAX_SAFE_INTEGER, true, wrapInNumber, t);
  check(Number.MAX_VALUE, true, wrapInNumber, t);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, wrapInNumber, wrapInNumber, t);
  check(`${Number.MIN_SAFE_INTEGER}`, wrapInNumber, wrapInNumber, t);
  check('-123.456', wrapInNumber, wrapInNumber, t);
  check('-1', wrapInNumber, wrapInNumber, t);

  check('0', wrapInNumber, wrapInNumber, t);

  check('1', wrapInNumber, wrapInNumber, t);
  check('123.456', wrapInNumber, wrapInNumber, t);
  check(`${Number.MAX_SAFE_INTEGER}`, wrapInNumber, wrapInNumber, t);
  check(`${Number.MAX_VALUE}`, wrapInNumber, wrapInNumber, t);

  // strings not containing numbers
  check('abc', false, wrapInNumber, t); // NaN when wrapped
  check('', wrapInNumber, wrapInNumber, t); // 0 when wrapped
}

function checkIsSpecialNumber(wrapInNumber, t) {
  function check(value, expected, wrapInString, t) {
    return checkOkNotOk(Numbers.isSpecialNumber, value, expected, wrapInString, ' is a special number', ' is NOT a special number', t);
  }

  // undefined
  check(undefined, wrapInNumber, wrapInNumber, t); // NaN wrapped

  // null
  check(null, false, wrapInNumber, t); // 0 wrapped

  // objects
  check({}, wrapInNumber, wrapInNumber, t); // NaN wrapped
  check({a:1,b:2}, wrapInNumber, wrapInNumber, t); // NaN wrapped

  // booleans
  check(true, false, wrapInNumber, t); // 1 when wrapped
  check(false, false, wrapInNumber, t); // 0 when wrapped

  // arrays
  check([], false, wrapInNumber, t); // 0 when wrapped
  check([1,2,3], wrapInNumber, wrapInNumber, t); // NaN when wrapped

  // special case numbers
  check(Number.POSITIVE_INFINITY, true, wrapInNumber, t);
  check(Number.NEGATIVE_INFINITY, true, wrapInNumber, t);
  check(NaN, true, wrapInNumber, t);

  // negative numbers
  check(Number.MIN_VALUE, false, wrapInNumber, t);
  check(Number.MIN_SAFE_INTEGER, false, wrapInNumber, t);
  check(-123.456, false, wrapInNumber, t);
  check(-1, false, wrapInNumber, t);

  // zero
  check(0, false, wrapInNumber, t);

  // positive numbers
  check(1, false, wrapInNumber, t);
  check(123.456, false, wrapInNumber, t);
  check(Number.MAX_SAFE_INTEGER, false, wrapInNumber, t);
  check(Number.MAX_VALUE, false, wrapInNumber, t);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, false, wrapInNumber, t);
  check(`${Number.MIN_SAFE_INTEGER}`, false, wrapInNumber, t);
  check('-123.456', false, wrapInNumber, t);
  check('-1', false, wrapInNumber, t);

  check('0', false, wrapInNumber, t);

  check('1', false, wrapInNumber, t);
  check('123.456', false, wrapInNumber, t);
  check(`${Number.MAX_SAFE_INTEGER}`, false, wrapInNumber, t);
  check(`${Number.MAX_VALUE}`, false, wrapInNumber, t);

  // special case numbers in strings
  check(`${Number.POSITIVE_INFINITY}`, wrapInNumber, wrapInNumber, t);
  check(`${Number.NEGATIVE_INFINITY}`, wrapInNumber, wrapInNumber, t);
  check(`${NaN}`, wrapInNumber, wrapInNumber, t);

  // strings not containing numbers
  check('', false, wrapInNumber, t); // 0 when wrapped
  check('a', wrapInNumber, wrapInNumber, t); // NaN when wrapped
  check('abc', wrapInNumber, wrapInNumber, t); // NaN when wrapped
  check('ABC', wrapInNumber, wrapInNumber, t); // NaN when wrapped
}

function checkIsNaN(wrapInNumber, t) {
  function check(value, expected, wrapInString, t) {
    return checkOkNotOk(Numbers.isNaN, value, expected, wrapInString, ' is NaN', ' is NOT NaN', t);
  }

  // undefined
  check(undefined, wrapInNumber, wrapInNumber, t); // NaN wrapped

  // null
  check(null, false, wrapInNumber, t); // 0 wrapped

  // objects
  check({}, wrapInNumber, wrapInNumber, t); // NaN wrapped
  check({a:1,b:2}, wrapInNumber, wrapInNumber, t); // NaN wrapped

  // booleans
  check(true, false, wrapInNumber, t); // 1 when wrapped
  check(false, false, wrapInNumber, t); // 0 when wrapped

  // arrays
  check([], false, wrapInNumber, t); // 0 when wrapped
  check([1,2,3], wrapInNumber, wrapInNumber, t); // NaN when wrapped

  // special case numbers
  check(Number.POSITIVE_INFINITY, false, wrapInNumber, t);
  check(Number.NEGATIVE_INFINITY, false, wrapInNumber, t);
  check(NaN, true, wrapInNumber, t);

  // negative numbers
  check(Number.MIN_VALUE, false, wrapInNumber, t);
  check(Number.MIN_SAFE_INTEGER, false, wrapInNumber, t);
  check(-123.456, false, wrapInNumber, t);
  check(-1, false, wrapInNumber, t);

  // zero
  check(0, false, wrapInNumber, t);

  // positive numbers
  check(1, false, wrapInNumber, t);
  check(123.456, false, wrapInNumber, t);
  check(Number.MAX_SAFE_INTEGER, false, wrapInNumber, t);
  check(Number.MAX_VALUE, false, wrapInNumber, t);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, false, wrapInNumber, t);
  check(`${Number.MIN_SAFE_INTEGER}`, false, wrapInNumber, t);
  check('-123.456', false, wrapInNumber, t);
  check('-1', false, wrapInNumber, t);

  check('0', false, wrapInNumber, t);

  check('1', false, wrapInNumber, t);
  check('123.456', false, wrapInNumber, t);
  check(`${Number.MAX_SAFE_INTEGER}`, false, wrapInNumber, t);
  check(`${Number.MAX_VALUE}`, false, wrapInNumber, t);

  // special case numbers in strings
  check(`${Number.POSITIVE_INFINITY}`, wrapInNumber, wrapInNumber, t);
  check(`${Number.NEGATIVE_INFINITY}`, wrapInNumber, wrapInNumber, t);
  check(`${NaN}`, wrapInNumber, wrapInNumber, t);

  // strings not containing numbers
  check('', false, wrapInNumber, t); // 0 when wrapped
  check('a', wrapInNumber, wrapInNumber, t); // NaN when wrapped
  check('abc', wrapInNumber, wrapInNumber, t); // NaN when wrapped
  check('ABC', wrapInNumber, wrapInNumber, t); // NaN when wrapped
}

test('isNumber on Numbers', t => {
  checkIsNumber(true, t);
  t.end();
});

test('isNumber on numbers', t => {
  checkIsNumber(false, t);
  t.end();
});

test('isFiniteNumber on Numbers', t => {
  checkIsFiniteNumber(true, t);
  t.end();
});

test('isFiniteNumber on numbers', t => {
  checkIsFiniteNumber(false, t);
  t.end();
});

test('isSpecialNumber on numbers', t => {
  checkIsSpecialNumber(false, t);
  t.end();
});

test('isSpecialNumber on Numbers', t => {
  checkIsSpecialNumber(true, t);
  t.end();
});

test('isNaN on numbers', t => {
  checkIsNaN(false, t);
  t.end();
});

test('isNaN on Numbers', t => {
  checkIsNaN(false, t);
  t.end();
});
