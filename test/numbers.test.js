'use strict';

/**
 * Unit tests for core-functions/numbers.js
 * @author Byron du Preez
 */

const test = require('tape');

const Numbers = require('../numbers');

const isInteger = Numbers.isInteger;
const isSafeInteger = Numbers.isSafeInteger;
const toInteger = Numbers.toInteger;

const isNumberLike = Numbers.isNumberLike;
const isIntegerLike = Numbers.isIntegerLike;
const isZeroLike = Numbers.isZeroLike;

const toNumberLike = Numbers.toNumberLike;

const toDecimalLike = Numbers.toDecimalLike;
const toDecimalLikeOrNaN = Numbers.toDecimalLikeOrNaN;

const toIntegerLike = Numbers.toIntegerLike;
const toIntegerLikeOrNaN = Numbers.toIntegerLikeOrNaN;

const toNumberOrIntegerLike = Numbers.toNumberOrIntegerLike;

const removeLeadingZeroes = Numbers.removeLeadingZeroes;
const removeTrailingZeroes = Numbers.removeTrailingZeroes;
const zeroPadLeft = Numbers.zeroPadLeft;

const nearlyEqual = Numbers.nearlyEqual;

function wrap(value, wrapInNumber) {
  //noinspection JSPrimitiveTypeWrapperUsage
  return wrapInNumber && !(value instanceof Number) ? new Number(value) : value;
}
function toPrefix(value, wrapInNumber) {
  const wrapped = wrap(value, wrapInNumber);
  return wrapInNumber || value instanceof Number ? `Number(${value}) = (${wrapped ? wrapped.valueOf() : value}) ` : '';
}

function checkIsNumber(t, wrapInNumber) {
  function check(value, expected) {
    return t.equal(Numbers.isNumber(wrap(value, wrapInNumber)), expected, `Numbers.isNumber(${toPrefix(value, wrapInNumber)}) is ${expected ? '' : 'NOT '}a number`); // :
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
    return t.equal(Numbers.isFiniteNumber(wrap(value, wrapInNumber)), expected, `Numbers.isFiniteNumber(${toPrefix(value, wrapInNumber)}) is ${expected ? '' : 'NOT '}a finite number`); // :
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
    return t.equal(Numbers.isSpecialNumber(wrap(value, wrapInNumber)), expected, `Numbers.isSpecialNumber(${toPrefix(value, wrapInNumber)}) is ${expected ? '' : 'NOT '}a special number`); // :
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
    return t.equal(Numbers.isNaN(wrap(value, wrapInNumber)), expected, `Numbers.isNaN(${toPrefix(value, wrapInNumber)}) is ${expected ? '' : 'NOT '}a NaN`); // :
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

// =====================================================================================================================
// Numbers
// =====================================================================================================================

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

test('isInteger', t => {
  t.notOk(isInteger(undefined), `undefined must NOT be an integer`);
  t.notOk(isInteger(null), `null must NOT be an integer`);
  t.notOk(isInteger({}), `{} must NOT be an integer`);
  t.notOk(isInteger([]), `[] must NOT be an integer`);
  t.notOk(isInteger(''), `'' must NOT be an integer`);
  t.notOk(isInteger('abc'), `'abc' must NOT be an integer`);
  t.notOk(isInteger(true), `true must NOT be an integer`);

  t.ok(isInteger(0), `0 must be an integer`);
  t.ok(isInteger(1), `1 must be an integer`);
  t.ok(isInteger(+1), `+1 must be an integer`);
  t.ok(isInteger(-1), `-1 must be an integer`);
  t.ok(isInteger(Number.MAX_SAFE_INTEGER), `MAX_SAFE_INTEGER must be an integer`);
  t.ok(isInteger(Number.MIN_SAFE_INTEGER), `MIN_SAFE_INTEGER must be an integer`);
  t.ok(isInteger(999999999999999999999999999), `999999999999999999999999999 must be an integer`);
  t.ok(isInteger(+999999999999999999999999999), `+999999999999999999999999999 must be an integer`);
  t.ok(isInteger(-999999999999999999999999999), `-999999999999999999999999999 must be an integer`);

  t.notOk(isInteger(0.000001), `0.000001 must NOT be an integer`);
  t.notOk(isInteger(+0.000001), `+0.000001 must NOT be an integer`);
  t.notOk(isInteger(-0.000001), `-0.000001 must NOT be an integer`);
  t.notOk(isInteger(999999999.3333333333), `999999999.3333333333 must NOT be an integer`);
  t.notOk(isInteger(+999999999.3333333333), `+999999999.3333333333 must NOT be an integer`);
  t.notOk(isInteger(-999999999.3333333333), `-999999999.3333333333 must NOT be an integer`);
  t.end();
});

test('isSafeInteger', t => {
  t.notOk(isSafeInteger(undefined), `undefined must NOT be a safe integer`);
  t.notOk(isSafeInteger(null), `null must NOT be a safe integer`);
  t.notOk(isSafeInteger({}), `{} must NOT be a safe integer`);
  t.notOk(isSafeInteger([]), `[] must NOT be a safe integer`);
  t.notOk(isSafeInteger(''), `'' must NOT be a safe integer`);
  t.notOk(isSafeInteger('abc'), `'abc' must NOT be a safe integer`);
  t.notOk(isSafeInteger(true), `true must NOT be a safe integer`);

  t.ok(isSafeInteger(0), `0 must be a safe integer`);
  t.ok(isSafeInteger(1), `1 must be a safe integer`);
  t.ok(isSafeInteger(+1), `+1 must be a safe integer`);
  t.ok(isSafeInteger(-1), `-1 must be a safe integer`);
  t.ok(isSafeInteger(Number.MAX_SAFE_INTEGER), `MAX_SAFE_INTEGER must be a safe integer`);
  t.ok(isSafeInteger(Number.MIN_SAFE_INTEGER), `MIN_SAFE_INTEGER must be a safe integer`);

  t.notOk(isSafeInteger(Number.MAX_SAFE_INTEGER + 1), `Number.MAX_SAFE_INTEGER+1 must NOT be a safe integer`);
  t.notOk(isSafeInteger(Number.MIN_SAFE_INTEGER - 1), `Number.MIN_SAFE_INTEGER-1 must NOT be a safe integer`);
  t.notOk(isSafeInteger(999999999999999999999999999), `999999999999999999999999999 must NOT be a safe integer`);
  t.notOk(isSafeInteger(+999999999999999999999999999), `+999999999999999999999999999 must NOT be a safe integer`);
  t.notOk(isSafeInteger(-999999999999999999999999999), `-999999999999999999999999999 must NOT be a safe integer`);

  t.notOk(isSafeInteger(0.000001), `0.000001 must NOT be a safe integer`);
  t.notOk(isSafeInteger(+0.000001), `+0.000001 must NOT be a safe integer`);
  t.notOk(isSafeInteger(-0.000001), `-0.000001 must NOT be a safe integer`);
  t.notOk(isSafeInteger(999999999.3333333333), `999999999.3333333333 must NOT be a safe integer`);
  t.notOk(isSafeInteger(+999999999.3333333333), `+999999999.3333333333 must NOT be a safe integer`);
  t.notOk(isSafeInteger(-999999999.3333333333), `-999999999.3333333333 must NOT be a safe integer`);
  t.end();
});

// =====================================================================================================================
// Number-, integer- & decimal-likes
// =====================================================================================================================

test('isNumberLike', t => {
  // Others
  t.notOk(isNumberLike(undefined), `undefined is NOT number-like`);
  t.notOk(isNumberLike(null), `null is NOT number-like`);
  t.notOk(isNumberLike(0), `number 0 is NOT number-like`);
  t.notOk(isNumberLike(1), `number 1 is NOT number-like`);
  t.notOk(isNumberLike(-1), `number -1 is NOT number-like`);
  t.notOk(isNumberLike('123abc'), `123abc is NOT number-like`);

  // Integers
  t.ok(isNumberLike('0'), `0 is number-like`);
  t.ok(isNumberLike('0.'), `0. is number-like`);
  t.ok(isNumberLike('0.0'), `0.0 is number-like`);
  t.ok(isNumberLike('0.00'), `0.00 is number-like`);
  t.ok(isNumberLike('0.000'), `0.000 is number-like`);
  t.ok(isNumberLike('+0'), `+0 is number-like`);
  t.ok(isNumberLike('+0.'), `+0. is number-like`);
  t.ok(isNumberLike('-0'), `-0 is number-like`);
  t.ok(isNumberLike('-0.'), `-0. is number-like`);
  t.ok(isNumberLike('1'), `1 is number-like`);
  t.ok(isNumberLike('+1'), `+1 is number-like`);
  t.ok(isNumberLike('-1'), `-1 is number-like`);
  t.ok(isNumberLike('1.'), `1. is number-like`);
  t.ok(isNumberLike('+1.'), `+1. is number-like`);
  t.ok(isNumberLike('-1.'), `-1. is number-like`);
  t.ok(isNumberLike(`${Number.MAX_SAFE_INTEGER}`), `${Number.MAX_SAFE_INTEGER} is number-like`);
  t.ok(isNumberLike(`${Number.MIN_SAFE_INTEGER}`), `${Number.MIN_SAFE_INTEGER} is number-like`);
  t.ok(isNumberLike('99999999999999999999999999999999999999999999999999999999999'), `99999999999999999999999999999999999999999999999999999999999 is number-like`);
  t.ok(isNumberLike('-99999999999999999999999999999999999999999999999999999999999'), `-99999999999999999999999999999999999999999999999999999999999 is number-like`);
  t.ok(isNumberLike('99999999999999999999999999999999999999999999999999999999999.'), `99999999999999999999999999999999999999999999999999999999999. is number-like`);
  t.ok(isNumberLike('-99999999999999999999999999999999999999999999999999999999999.'), `-99999999999999999999999999999999999999999999999999999999999. is number-like`);
  t.ok(isNumberLike('99999999999999999999999999999999999999999999999999999999999.00000000'), `99999999999999999999999999999999999999999999999999999999999.00000000 is number-like`);
  t.ok(isNumberLike('-99999999999999999999999999999999999999999999999999999999999.00000000'), `-99999999999999999999999999999999999999999999999999999999999.00000000 is number-like`);

  // Floating points
  t.ok(isNumberLike('0.0000000000000000000000'), `0.0000000000000000000000 is number-like`);
  t.ok(isNumberLike('1.0000000000000000000000'), `1.0000000000000000000000 is number-like`);
  t.ok(isNumberLike('+1.0000000000000000000000'), `+1.0000000000000000000000 is number-like`);
  t.ok(isNumberLike('-1.0000000000000000000000'), `-1.0000000000000000000000 is number-like`);
  t.ok(isNumberLike('0.000000000000000000001'), `0.000000000000000000001 is number-like`);
  t.ok(isNumberLike('1.000000000000000000001'), `1.000000000000000000001 is number-like`);
  t.ok(isNumberLike('+1.000000000000000000001'), `+1.000000000000000000001 is number-like`);
  t.ok(isNumberLike('-1.000000000000000000001'), `-1.000000000000000000001 is number-like`);
  t.ok(isNumberLike('0.1'), `0.1 is number-like`);
  t.ok(isNumberLike('+0.1'), `+0.1 is number-like`);
  t.ok(isNumberLike('-0.1'), `-0.1 is number-like`);
  t.ok(isNumberLike('1.1'), `1.1 is number-like`);
  t.ok(isNumberLike('+1.1'), `+1.1 is number-like`);
  t.ok(isNumberLike('-1.1'), `-1.1 is number-like`);
  t.ok(isNumberLike('99999999999999999999999999999999999999999999999999999999999.1'), `99999999999999999999999999999999999999999999999999999999999.1 is number-like`);
  t.ok(isNumberLike('-99999999999999999999999999999999999999999999999999999999999.1'), `-99999999999999999999999999999999999999999999999999999999999.1 is number-like`);

  t.ok(isNumberLike('1e10'), `1e10 is number-like`);
  t.end();
});

test('isIntegerLike', t => {
  // Others
  t.notOk(isIntegerLike(undefined), `undefined is NOT integer-like`);
  t.notOk(isIntegerLike(null), `null is NOT integer-like`);
  t.notOk(isIntegerLike(0), `number 0 is NOT integer-like`);
  t.notOk(isIntegerLike(1), `number 1 is NOT integer-like`);
  t.notOk(isIntegerLike(-1), `number -1 is NOT integer-like`);
  t.notOk(isIntegerLike('123abc'), `123abc is NOT integer-like`);

  // Integers
  t.ok(isIntegerLike('0'), `0 is integer-like`);
  t.ok(isIntegerLike('0.'), `0. is integer-like`);
  t.ok(isIntegerLike('0.0'), `0.0 is integer-like`);
  t.ok(isIntegerLike('0.00'), `0.00 is integer-like`);
  t.ok(isIntegerLike('0.000'), `0.000 is integer-like`);
  t.ok(isIntegerLike('+0'), `+0 is integer-like`);
  t.ok(isIntegerLike('+0.'), `+0. is integer-like`);
  t.ok(isIntegerLike('-0'), `-0 is integer-like`);
  t.ok(isIntegerLike('-0.'), `-0. is integer-like`);
  t.ok(isIntegerLike('1'), `1 is integer-like`);
  t.ok(isIntegerLike('+1'), `+1 is integer-like`);
  t.ok(isIntegerLike('-1'), `-1 is integer-like`);
  t.ok(isIntegerLike('1.'), `1. is integer-like`);
  t.ok(isIntegerLike('+1.'), `+1. is integer-like`);
  t.ok(isIntegerLike('-1.'), `-1. is integer-like`);
  t.ok(isIntegerLike(`${Number.MAX_SAFE_INTEGER}`), `${Number.MAX_SAFE_INTEGER} is integer-like`);
  t.ok(isIntegerLike(`${Number.MIN_SAFE_INTEGER}`), `${Number.MIN_SAFE_INTEGER} is integer-like`);
  t.ok(isIntegerLike('99999999999999999999999999999999999999999999999999999999999'), `99999999999999999999999999999999999999999999999999999999999 is integer-like`);
  t.ok(isIntegerLike('-99999999999999999999999999999999999999999999999999999999999'), `-99999999999999999999999999999999999999999999999999999999999 is integer-like`);
  t.ok(isIntegerLike('99999999999999999999999999999999999999999999999999999999999.'), `99999999999999999999999999999999999999999999999999999999999. is integer-like`);
  t.ok(isIntegerLike('-99999999999999999999999999999999999999999999999999999999999.'), `-99999999999999999999999999999999999999999999999999999999999. is integer-like`);
  t.ok(isIntegerLike('99999999999999999999999999999999999999999999999999999999999.00000000'), `99999999999999999999999999999999999999999999999999999999999.00000000 is integer-like`);
  t.ok(isIntegerLike('-99999999999999999999999999999999999999999999999999999999999.00000000'), `-99999999999999999999999999999999999999999999999999999999999.00000000 is integer-like`);

  // Floating points
  t.ok(isIntegerLike('0.0000000000000000000000'), `0.0000000000000000000000 is integer-like`);
  t.ok(isIntegerLike('1.0000000000000000000000'), `1.0000000000000000000000 is integer-like`);
  t.ok(isIntegerLike('+1.0000000000000000000000'), `+1.0000000000000000000000 is integer-like`);
  t.ok(isIntegerLike('-1.0000000000000000000000'), `-1.0000000000000000000000 is integer-like`);
  t.notOk(isIntegerLike('0.000000000000000000001'), `0.000000000000000000001 is NOT integer-like`);
  t.notOk(isIntegerLike('1.000000000000000000001'), `1.000000000000000000001 is NOT integer-like`);
  t.notOk(isIntegerLike('+1.000000000000000000001'), `+1.000000000000000000001 is NOT integer-like`);
  t.notOk(isIntegerLike('-1.000000000000000000001'), `-1.000000000000000000001 is NOT integer-like`);
  t.notOk(isIntegerLike('0.1'), `0.1 is NOT integer-like`);
  t.notOk(isIntegerLike('+0.1'), `+0.1 is NOT integer-like`);
  t.notOk(isIntegerLike('-0.1'), `-0.1 is NOT integer-like`);
  t.notOk(isIntegerLike('1.1'), `1.1 is NOT integer-like`);
  t.notOk(isIntegerLike('+1.1'), `+1.1 is NOT integer-like`);
  t.notOk(isIntegerLike('-1.1'), `-1.1 is NOT integer-like`);
  t.notOk(isIntegerLike('99999999999999999999999999999999999999999999999999999999999.1'), `99999999999999999999999999999999999999999999999999999999999.1 is NOT integer-like`);
  t.notOk(isIntegerLike('-99999999999999999999999999999999999999999999999999999999999.1'), `-99999999999999999999999999999999999999999999999999999999999.1 is NOT integer-like`);

  t.end();
});

test('isZeroLike', t => {
  t.ok(isZeroLike('0'), `0 is zero-like`);
  t.notOk(isZeroLike('0.1'), `0.1 is NOT zero-like`);
  t.notOk(isZeroLike('-0.1'), `-0.1 is NOT zero-like`);
  t.notOk(isZeroLike('1'), `1 is NOT zero-like`);
  t.notOk(isZeroLike('-1'), `-1 is NOT zero-like`);
  t.notOk(isZeroLike(`${Number.MAX_SAFE_INTEGER}`), `MAX_SAFE_INTEGER is NOT zero-like`);
  t.notOk(isZeroLike(`${Number.MIN_SAFE_INTEGER}`), `MIN_SAFE_INTEGER is NOT zero-like`);
  t.notOk(isZeroLike(`${Number.MAX_VALUE}`), `MAX_VALUE is NOT zero-like`);
  t.notOk(isZeroLike(`${Number.MIN_VALUE}`), `MIN_VALUE is NOT zero-like`);
  t.ok(isZeroLike('0.000000e100'), `0.000000e100 is zero-like`);
  t.ok(isZeroLike('0.000000e+100'), `0.000000e+100 is zero-like`);
  t.ok(isZeroLike('0.000000e-100'), `0.000000e-100 is zero-like`);
  t.ok(isZeroLike('0.0000000000000000000000000000000000'), `0.0000000000000000000000000000000000 is zero-like`);
  t.notOk(isZeroLike('0.0000000000000000000000000000000001'), `0.0000000000000000000000000000000001 is NOT zero-like`);
  t.end();
});

test('toNumberLike', t => {
  t.equal(toNumberLike(0), '0', `0 must be '0'`);
  t.equal(toNumberLike(1), '1', `1 must be '1'`);
  t.equal(toNumberLike(-1), '-1', `-1 must be '-1'`);

  t.equal(toNumberLike(+0.0), `0`, `+0.0 must be '0'`);
  t.equal(toNumberLike(-0.0), `0`, `-0.0 must be '0'`);
  t.equal(toNumberLike(+0.2), `0.2`, `+0.2 must be '0.2'`);
  t.equal(toNumberLike(-0.1), `-0.1`, `-0.1 must be '0.1'`);

  t.equal(toNumberLike(Number.MAX_SAFE_INTEGER), `${Number.MAX_SAFE_INTEGER}`, `MAX_SAFE_INTEGER must be '${Number.MAX_SAFE_INTEGER}'`);
  t.equal(toNumberLike(Number.MIN_SAFE_INTEGER), `${Number.MIN_SAFE_INTEGER}`, `MIN_SAFE_INTEGER must be '${Number.MIN_SAFE_INTEGER}'`);

  t.equal(toNumberLike(Number.MAX_VALUE), `${Number.MAX_VALUE}`, `MAX_VALUE must be '${Number.MAX_VALUE}'`);
  t.equal(toNumberLike(Number.MIN_VALUE), `${Number.MIN_VALUE}`, `MIN_VALUE must be '${Number.MIN_VALUE}'`);

  t.equal(toNumberLike(Math.PI), `${Math.PI.toPrecision()}`, `PI must be '${Math.PI.toPrecision()}'`);

  t.end();
});

test('toDecimalLike', t => {
  // Non-integer strings
  t.equal(toDecimalLike(undefined), undefined, `undefined must be undefined`);
  t.equal(toDecimalLike(null), undefined, `null must be undefined`);
  t.equal(toDecimalLike({}), undefined, `{} must be undefined`);
  t.equal(toDecimalLike([]), undefined, `[] must be undefined`);
  t.equal(toDecimalLike(''), undefined, `'' must be undefined`);
  t.equal(toDecimalLike('abc'), undefined, `'abc' must be undefined`);
  t.equal(toDecimalLike(true), undefined, `true must be undefined`);

  // NaN versions
  t.ok(Number.isNaN(toDecimalLikeOrNaN(undefined)), `undefined must be NaN`);
  t.ok(Number.isNaN(toDecimalLikeOrNaN(null)), `null must be NaN`);
  t.ok(Number.isNaN(toDecimalLikeOrNaN({})), `{} must be NaN`);
  t.ok(Number.isNaN(toDecimalLikeOrNaN([])), `[] must be NaN`);
  t.ok(Number.isNaN(toDecimalLikeOrNaN('')), `'' must be NaN`);
  t.ok(Number.isNaN(toDecimalLikeOrNaN('abc')), `'abc' must be NaN`);
  t.ok(Number.isNaN(toDecimalLikeOrNaN(true)), `true must be NaN`);

  // Numbers or number-likes
  t.equal(toDecimalLike(123), '123', `123 must be '123'`);
  t.equal(toDecimalLike(1.1), '1.1', `1.1 => ${toDecimalLike(1.1)} must be '1.1'`);
  t.equal(toDecimalLike('123'), '123', `'123' must be '123'`);
  t.equal(toDecimalLike('1.1'), '1.1', `'1.1' => (${toDecimalLike('1.1')}) must be '1.1'`);

  // Numbers
  t.equal(toDecimalLike(0), '0', `0 must be '+0'`);
  t.equal(toDecimalLike(+0), '0', `+0 must be '0'`);
  t.equal(toDecimalLike(-0), '0', `-0 must be '0'`);

  t.equal(toDecimalLike(-0), `0`, `-0 must be '0`);
  t.equal(toDecimalLike(0), `0`, `0 must be '0`);
  t.equal(toDecimalLike(+0), `0`, `+0 must be '0`);

  t.equal(toDecimalLike(1), '1', `1 must be '1'`);
  t.equal(toDecimalLike(+1), '1', `+1 must be '1'`);
  t.equal(toDecimalLike(-1), '-1', `-1 must be '-1'`);

  t.equal(toDecimalLike(123), '123', `123 must be '123'`);
  t.equal(toDecimalLike(+123), '123', `+123 must be '123'`);
  t.equal(toDecimalLike(-123), '-123', `-123 must be '-123'`);

  t.equal(toDecimalLike(Number.MAX_SAFE_INTEGER), `${Number.MAX_SAFE_INTEGER}`, `(MAX_SAFE_INTEGER) must be '${Number.MAX_SAFE_INTEGER}'`);
  t.equal(toDecimalLike(Number.MIN_SAFE_INTEGER), `${Number.MIN_SAFE_INTEGER}`, `(MIN_SAFE_INTEGER) must be '${Number.MIN_SAFE_INTEGER}'`);

  // With exponents
  t.equal(toDecimalLike(1e0), '1', `1e0 must be '1'`);
  t.equal(toDecimalLike(1e1), '10', `1e1 must be '10'`);
  t.equal(toDecimalLike(1.2e0), '1.2', `1.2e0 must be '1.2'`);
  t.equal(toDecimalLike(1.2e1), '12', `1.2e1 must be '12'`);
  t.equal(toDecimalLike(1.2e-1), '0.12', `1.2e-1 => '0.12'`);
  t.equal(toDecimalLike(0.1e1), '1', `0.1e1 must be '1'`);
  t.equal(toDecimalLike(1.2e1), '12', `1.2e1 must be '12'`);
  t.equal(toDecimalLike(1.23e2), '123', `1.23e2 must be '123'`);
  t.equal(toDecimalLike(1.23e3), '1230', `1.23e3 must be '1230'`);
  t.equal(toDecimalLike(1.23e+3), '1230', `1.23e+3 must be '1230'`);
  t.equal(toDecimalLike(1.2345e+4), '12345', `1.2345e+4 must be '12345'`);
  t.equal(toDecimalLike(1.23456e+4), '12345.6', `1.23456e+4 => (${toDecimalLike(1.23456e+4)}) must be '12345.6'`);
  t.equal(toDecimalLike(1.23456e+5), '123456', `1.23456e+5 must be '123456'`);
  t.equal(toDecimalLike(1.2345e+19), `12345${'0'.repeat(20 - 5)}`, `1.2345e+19 must be '12345${'0'.repeat(20 - 5)}'`);
  t.equal(toDecimalLike(1.2345e+20), `12345${'0'.repeat(21 - 5)}`, `1.2345e+4 must be '12345${'0'.repeat(21 - 5)}'`);
  t.equal(toDecimalLike(1.2345e+99), `12345${'0'.repeat(100 - 5)}`, `1.2345e+99 must be '12345${'0'.repeat(100 - 5)}'`);
  t.equal(toDecimalLike(1.22222333334444455555e+20), `${1.22222333334444455555e+20.toFixed(0)}`, `1.22222333334444455555e+20 must be '${1.22222333334444455555e+20.toFixed(0)}'`);
  t.equal(toDecimalLike(1.22222333334444455556e+21), `1222223333344444700000`, `1.222223333344444555556e+21 must be '1222223333344444700000'`);

  t.equal(toDecimalLike(-1e0), '-1', `(-1e0, 1) must be '-1'`);
  t.equal(toDecimalLike(-1e1), '-10', `(-1e1, 1) must be '-10'`);
  t.equal(toDecimalLike(-1.2e0), '-1.2', `-1.2e0 => (${toDecimalLike(-1.2e0)}) must be '-1.2'`);
  t.equal(toDecimalLike(-1.2e-1), '-0.12', `-1.2e-1 => (${toDecimalLike(-1.2e-1)}) must be '0.12'`);
  t.equal(toDecimalLike(-0.1e1), '-1', `-0.1e1 must be '-1'`);
  t.equal(toDecimalLike(-1.2e1), '-12', `-1.2e1 must be '-12'`);
  t.equal(toDecimalLike(-1.23e2), '-123', `-1.23e2 must be '-123'`);
  t.equal(toDecimalLike(-1.23e3), '-1230', `-1.23e3 must be '-1230'`);
  t.equal(toDecimalLike(-1.23e+3), '-1230', `-1.23e+3 must be '-1230'`);
  t.equal(toDecimalLike(-1.2345e+4), '-12345', `-1.2345e+4 must be '-12345'`);
  t.equal(toDecimalLike(-1.23456e+4), `-12345.6`, `-1.23456e+4 => ${toDecimalLike(-1.23456e+4)} must be '12345.6'`);
  t.equal(toDecimalLike(-1.23456e+5), '-123456', `-1.23456e+5 must be '-123456'`);
  t.equal(toDecimalLike(-1.2345e+19), `-12345${'0'.repeat(20 - 5)}`, `-1.2345e+19 must be '-12345${'0'.repeat(20 - 5)}'`);
  t.equal(toDecimalLike(-1.2345e+20), `-12345${'0'.repeat(21 - 5)}`, `-1.2345e+4 must be '-12345${'0'.repeat(21 - 5)}'`);
  t.equal(toDecimalLike(-1.2345e+99), `-12345${'0'.repeat(100 - 5)}`, `-1.2345e+99 must be '-12345${'0'.repeat(100 - 5)}'`);
  t.equal(toDecimalLike(-1.22222333334444455555e+20), (-1.22222333334444455555e+20).toFixed(0), `-1.22222333334444455555e+20 => (${toDecimalLike(-1.22222333334444455555e+20)}) must be '${(-1.22222333334444455555e+20).toFixed(0)}'`);
  t.equal(toDecimalLike(-1.22222333334444455556e+21), `-1222223333344444700000`, `-1.222223333344444555556e+21 must be '-1222223333344444700000'`);

  // without digits (i.e. without zero padding on left)
  t.equal(toDecimalLike(-1.2345e+41), `-12345${'0'.repeat(42 - 5)}`, `-1.2345e+41 must be '-12345${'0'.repeat(42 - 5)}'`);
  t.equal(toDecimalLike(-0.12345e+42).length, 42 + 1, `-0.12345e+41 length must be ${42 + 1}`);
  t.equal(toDecimalLike(-1.2345e+41).length, 41 + 2, `-1.2345e+41 length must be ${41 + 2}`);
  t.equal(toDecimalLike(-1.22222333334444455556e+21), `-1222223333344444700000`, `-1.222223333344444555556e+21 must be '-1222223333344444700000'`);
  t.equal(toDecimalLike(-1.22222333334444455556e+21).length, 21 + 2, `-1.222223333344444555556e+21 length must be ${21 + 2}`);

  t.end();
});

test('toIntegerLike', t => {
  // Non-integer strings
  t.equal(toIntegerLike(undefined), undefined, `undefined must be undefined`);
  t.equal(toIntegerLike(null), undefined, `null must be undefined`);
  t.equal(toIntegerLike({}), undefined, `{} must be undefined`);
  t.equal(toIntegerLike([]), undefined, `[] must be undefined`);
  t.equal(toIntegerLike(''), undefined, `'' must be undefined`);
  t.equal(toIntegerLike('abc'), undefined, `'abc' must be undefined`);
  t.equal(toIntegerLike(true), undefined, `true must be undefined`);

  // NaN versions
  t.ok(Number.isNaN(toIntegerLikeOrNaN(undefined)), `undefined must be NaN`);
  t.ok(Number.isNaN(toIntegerLikeOrNaN(null)), `null must be NaN`);
  t.ok(Number.isNaN(toIntegerLikeOrNaN({})), `{} must be NaN`);
  t.ok(Number.isNaN(toIntegerLikeOrNaN([])), `[] must be NaN`);
  t.ok(Number.isNaN(toIntegerLikeOrNaN('')), `'' must be NaN`);
  t.ok(Number.isNaN(toIntegerLikeOrNaN('abc')), `'abc' must be NaN`);
  t.ok(Number.isNaN(toIntegerLikeOrNaN(true)), `true must be NaN`);

  // Numbers or number-likes
  t.equal(toIntegerLike(123), '123', `123 must be '123'`);
  t.equal(toIntegerLike(1.1), '1', `1.1 must be '1'`);
  t.equal(toIntegerLike('123'), '123', `'123' must be '123'`);
  t.equal(toIntegerLike('1.1'), '1', `'1.1' must be '1'`);

  // Numbers
  t.equal(toIntegerLike(0), '0', `0 must be '+0'`);
  t.equal(toIntegerLike(+0), '0', `+0 must be '0'`);
  t.equal(toIntegerLike(-0), '0', `-0 must be '0'`);

  t.equal(toIntegerLike(-0), `0`, `-0 must be '0`);
  t.equal(toIntegerLike(0), `0`, `0 must be '0`);
  t.equal(toIntegerLike(+0), `0`, `+0 must be '0`);

  t.equal(toIntegerLike(1), '1', `1 must be '1'`);
  t.equal(toIntegerLike(+1), '1', `+1 must be '1'`);
  t.equal(toIntegerLike(-1), '-1', `-1 must be '-1'`);

  t.equal(toIntegerLike(123), '123', `123 must be '123'`);
  t.equal(toIntegerLike(+123), '123', `+123 must be '123'`);
  t.equal(toIntegerLike(-123), '-123', `-123 must be '-123'`);

  t.equal(toIntegerLike(Number.MAX_SAFE_INTEGER), `${Number.MAX_SAFE_INTEGER}`, `(MAX_SAFE_INTEGER) must be '${Number.MAX_SAFE_INTEGER}'`);
  t.equal(toIntegerLike(Number.MIN_SAFE_INTEGER), `${Number.MIN_SAFE_INTEGER}`, `(MIN_SAFE_INTEGER) must be '${Number.MIN_SAFE_INTEGER}'`);

  // With exponents
  t.equal(toIntegerLike(1e0), '1', `1e0 must be '1'`);
  t.equal(toIntegerLike(1e1), '10', `1e1 must be '10'`);
  t.equal(toIntegerLike(1.2e0), '1', `1.2e1 must be '1'`);
  t.equal(toIntegerLike(1.2e-1), '0', `1.2e-1 must be '0'`);
  t.equal(toIntegerLike(0.1e1), '1', `0.1e1 must be '1'`);
  t.equal(toIntegerLike(1.2e1), '12', `1.2e1 must be '12'`);
  t.equal(toIntegerLike(1.23e2), '123', `1.23e2 must be '123'`);
  t.equal(toIntegerLike(1.23e3), '1230', `1.23e3 must be '1230'`);
  t.equal(toIntegerLike(1.23e+3), '1230', `1.23e+3 must be '1230'`);
  t.equal(toIntegerLike(1.2345e+4), '12345', `1.2345e+4 must be '12345'`);
  t.equal(toIntegerLike(1.23456e+4), '12345', `1.23456e+4 must be '12345'`);
  t.equal(toIntegerLike(1.23456e+5), '123456', `1.23456e+5 must be '123456'`);
  t.equal(toIntegerLike(1.2345e+19), `12345${'0'.repeat(20 - 5)}`, `1.2345e+19 must be '12345${'0'.repeat(20 - 5)}'`);
  t.equal(toIntegerLike(1.2345e+20), `12345${'0'.repeat(21 - 5)}`, `1.2345e+4 must be '12345${'0'.repeat(21 - 5)}'`);
  t.equal(toIntegerLike(1.2345e+99), `12345${'0'.repeat(100 - 5)}`, `1.2345e+99 must be '12345${'0'.repeat(100 - 5)}'`);
  t.equal(toIntegerLike(1.22222333334444455555e+20), `${1.22222333334444455555e+20.toFixed(0)}`, `1.22222333334444455555e+20 must be '${1.22222333334444455555e+20.toFixed(0)}'`);
  t.equal(toIntegerLike(1.22222333334444455556e+21), `1222223333344444700000`, `1.222223333344444555556e+21 must be '1222223333344444700000'`);

  t.equal(toIntegerLike(-1e0), '-1', `(-1e0, 1) must be '-1'`);
  t.equal(toIntegerLike(-1e1), '-10', `(-1e1, 1) must be '-10'`);
  t.equal(toIntegerLike(-1.2e0), '-1', `-1.2e1 must be '-1'`);
  t.equal(toIntegerLike(-1.2e-1), '0', `-1.2e-1 must be '0'`);
  t.equal(toIntegerLike(-0.1e1), '-1', `-0.1e1 must be '-1'`);
  t.equal(toIntegerLike(-1.2e1), '-12', `-1.2e1 must be '-12'`);
  t.equal(toIntegerLike(-1.23e2), '-123', `-1.23e2 must be '-123'`);
  t.equal(toIntegerLike(-1.23e3), '-1230', `-1.23e3 must be '-1230'`);
  t.equal(toIntegerLike(-1.23e+3), '-1230', `-1.23e+3 must be '-1230'`);
  t.equal(toIntegerLike(-1.2345e+4), '-12345', `-1.2345e+4 must be '-12345'`);
  t.equal(toIntegerLike(-1.23456e+4), '-12345', `-1.23456e+4 must be '-12345'`);
  t.equal(toIntegerLike(-1.23456e+5), '-123456', `-1.23456e+5 must be '-123456'`);
  t.equal(toIntegerLike(-1.2345e+19), `-12345${'0'.repeat(20 - 5)}`, `-1.2345e+19 must be '-12345${'0'.repeat(20 - 5)}'`);
  t.equal(toIntegerLike(-1.2345e+20), `-12345${'0'.repeat(21 - 5)}`, `-1.2345e+4 must be '-12345${'0'.repeat(21 - 5)}'`);
  t.equal(toIntegerLike(-1.2345e+99), `-12345${'0'.repeat(100 - 5)}`, `-1.2345e+99 must be '-12345${'0'.repeat(100 - 5)}'`);
  t.equal(toIntegerLike(-1.22222333334444455555e+20), `-${1.22222333334444455555e+20.toFixed(0)}`, `-1.22222333334444455555e+20 must be '-${1.22222333334444455555e+20.toFixed(0)}'`);
  t.equal(toIntegerLike(-1.22222333334444455556e+21), `-1222223333344444700000`, `-1.222223333344444555556e+21 must be '-1222223333344444700000'`);

  // without digits (i.e. without zero padding on left)
  t.equal(toIntegerLike(-1.2345e+41), `-12345${'0'.repeat(42 - 5)}`, `-1.2345e+41 must be '-12345${'0'.repeat(42 - 5)}'`);
  t.equal(toIntegerLike(-0.12345e+42).length, 42 + 1, `-0.12345e+41 length must be ${42 + 1}`);
  t.equal(toIntegerLike(-1.2345e+41).length, 41 + 2, `-1.2345e+41 length must be ${41 + 2}`);
  t.equal(toIntegerLike(-1.22222333334444455556e+21), `-1222223333344444700000`, `-1.222223333344444555556e+21 must be '-1222223333344444700000'`);
  t.equal(toIntegerLike(-1.22222333334444455556e+21).length, 21 + 2, `-1.222223333344444555556e+21 length must be ${21 + 2}`);

  t.end();
});

test('toNumberOrIntegerLike', t => {
  // A simple integer
  t.equal(toNumberOrIntegerLike('0'), 0, `toNumberOrIntegerLike('0') must be ${0}`);
  t.equal(toNumberOrIntegerLike('1'), 1, `toNumberOrIntegerLike('1') must be ${1}`);
  t.equal(toNumberOrIntegerLike('+1'), 1, `toNumberOrIntegerLike('+1') must be ${1}`);
  t.equal(toNumberOrIntegerLike('-1'), -1, `toNumberOrIntegerLike('-1') must be ${-1}`);
  t.equal(toNumberOrIntegerLike('1.'), 1, `toNumberOrIntegerLike('1.') must be ${1}`);
  t.equal(toNumberOrIntegerLike('+1.'), 1, `toNumberOrIntegerLike('+1.') must be ${1}`);
  t.equal(toNumberOrIntegerLike('-1.'), -1, `toNumberOrIntegerLike('-1.') must be ${-1}`);
  t.equal(toNumberOrIntegerLike('103'), 103, `toNumberOrIntegerLike('103') must be ${103}`);

  // A simple float
  t.equal(toNumberOrIntegerLike('3.1415679'), 3.1415679, `toNumberOrIntegerLike('3.1415679') must be ${3.1415679}`);

  t.equal(toNumberOrIntegerLike(`${Number.MAX_SAFE_INTEGER}`), Number.MAX_SAFE_INTEGER, `toNumberOrIntegerLike(Number.MAX_SAFE_INTEGER) must be ${Number.MAX_SAFE_INTEGER}`);
  t.equal(toNumberOrIntegerLike(`${Number.MIN_SAFE_INTEGER}`), Number.MIN_SAFE_INTEGER, `toNumberOrIntegerLike(Number.MIN_SAFE_INTEGER) must be ${Number.MIN_SAFE_INTEGER}`);

  // +/- 2 to the power of 53 is unsafe
  t.equal(toNumberOrIntegerLike('9007199254740992'), '9007199254740992', `toNumberOrIntegerLike('9007199254740992') must be '9007199254740992'`);
  t.equal(toNumberOrIntegerLike('-9007199254740992'), '-9007199254740992', `toNumberOrIntegerLike('-9007199254740992') must be '-9007199254740992'`);

  // +/- 2 to the power of 54 is unsafe
  t.equal(toNumberOrIntegerLike('18014398509481984'), '18014398509481984', `toNumberOrIntegerLike('18014398509481984') must be '18014398509481984'`);
  t.equal(toNumberOrIntegerLike('-18014398509481984'), '-18014398509481984', `toNumberOrIntegerLike('-18014398509481984') must be '-18014398509481984'`);

  // +/- 2 to the power of 55 is unsafe
  t.equal(toNumberOrIntegerLike('36028797018963968'), '36028797018963968', `toNumberOrIntegerLike('36028797018963968') must be '36028797018963968'`);
  t.equal(toNumberOrIntegerLike('-36028797018963968'), '-36028797018963968', `toNumberOrIntegerLike('-36028797018963968') must be '-36028797018963968'`);

  // +/- 2 to the power of 56 is unsafe
  t.equal(toNumberOrIntegerLike('72057594037927936'), '72057594037927936', `toNumberOrIntegerLike('72057594037927936') must be '72057594037927936'`);
  t.equal(toNumberOrIntegerLike('-72057594037927936'), '-72057594037927936', `toNumberOrIntegerLike('-72057594037927936') must be '-72057594037927936'`);

  // Maximum Long is too big to hold in an integer
  t.equal(toNumberOrIntegerLike('9223372036854775807'), '9223372036854775807', `toNumberOrIntegerLike('9223372036854775807') must be '9223372036854775807'`);
  t.equal(toNumberOrIntegerLike('-9223372036854775808'), '-9223372036854775808', `toNumberOrIntegerLike('-9223372036854775808') must be '-9223372036854775808'`);

  t.ok(Number.isNaN(toNumberOrIntegerLike('')), `toNumberOrIntegerLike('') must be NaN`);
  t.ok(Number.isNaN(toNumberOrIntegerLike('abc')), `toNumberOrIntegerLike('abc') must be NaN`);
  t.ok(Number.isNaN(toNumberOrIntegerLike(undefined)), `toNumberOrIntegerLike(undefined) must be NaN`);
  t.ok(Number.isNaN(toNumberOrIntegerLike(null)), `toNumberOrIntegerLike(null) must be NaN`);
  t.ok(Number.isNaN(toNumberOrIntegerLike({})), `toNumberOrIntegerLike({}) must be NaN`);
  t.ok(Number.isNaN(toNumberOrIntegerLike([])), `toNumberOrIntegerLike([]) must be NaN`);

  t.end();
});

test('removeLeadingZeroes', t => {
  t.equal(removeLeadingZeroes(undefined), undefined, `undefined must be undefined`);
  t.equal(removeLeadingZeroes(null), null, `null must be null`);
  t.equal(removeLeadingZeroes(''), '', `'' must be ''`);

  t.equal(removeLeadingZeroes('.00000'), '.00000', `'.00000' must be '.00000'`);

  t.equal(removeLeadingZeroes('0'), '0', `'0' must be '0'`);
  t.equal(removeLeadingZeroes('00'), '0', `'00' must be '0'`);
  t.equal(removeLeadingZeroes('000'), '0', `'000' must be '0'`);
  t.equal(removeLeadingZeroes('0000000'), '0', `'0000000' must be '0'`);
  t.equal(removeLeadingZeroes('0000000.'), '0.', `'0000000.' must be '0.'`);
  t.equal(removeLeadingZeroes('0000000.0'), '0.0', `'0000000.' must be '0.0'`);
  t.equal(removeLeadingZeroes('0000000.00'), '0.00', `'0000000.' must be '0.00'`);
  t.equal(removeLeadingZeroes('0000000.000'), '0.000', `'0000000.' must be '0.000'`);
  t.equal(removeLeadingZeroes('0000000.0000000'), '0.0000000', `'0000000.0000000' must be '0.0000000'`);
  t.equal(removeLeadingZeroes('0000000.0000000123'), '0.0000000123', `'0000000.0000000123' must be '0.0000000123'`);
  t.equal(removeLeadingZeroes('000100100.000'), '100100.000', `'000100100.000' must be '100100.000'`);
  t.equal(removeLeadingZeroes('10000000.000'), '10000000.000', `'10000000.000' must be '10000000.000'`);

  t.equal(removeLeadingZeroes('+0'), '+0', `'+0' must be '+0'`);
  t.equal(removeLeadingZeroes('+00'), '+0', `'+00' must be '+0'`);
  t.equal(removeLeadingZeroes('+000'), '+0', `'+000' must be '+0'`);
  t.equal(removeLeadingZeroes('+0000000'), '+0', `'+0000000' must be '+0'`);
  t.equal(removeLeadingZeroes('+0000000.'), '+0.', `'+0000000.' must be '+0.'`);
  t.equal(removeLeadingZeroes('+0000000.0'), '+0.0', `'+0000000.' must be '+0.0'`);
  t.equal(removeLeadingZeroes('+0000000.00'), '+0.00', `'+0000000.' must be '+0.00'`);
  t.equal(removeLeadingZeroes('+0000000.000'), '+0.000', `'+0000000.' must be '+0.000'`);
  t.equal(removeLeadingZeroes('+0000000.0000000'), '+0.0000000', `'+0000000.0000000' must be '+0.0000000'`);
  t.equal(removeLeadingZeroes('+0000000.0000000123'), '+0.0000000123', `'+0000000.0000000123' must be '+0.0000000123'`);
  t.equal(removeLeadingZeroes('+000100100.000'), '+100100.000', `'+000100100.000' must be '+100100.000'`);
  t.equal(removeLeadingZeroes('+10000000.000'), '+10000000.000', `'+10000000.000' must be '+10000000.000'`);

  t.equal(removeLeadingZeroes('-0'), '-0', `'-0' must be '-0'`);
  t.equal(removeLeadingZeroes('-00'), '-0', `'-00' must be '-0'`);
  t.equal(removeLeadingZeroes('-000'), '-0', `'-000' must be '-0'`);
  t.equal(removeLeadingZeroes('-0000000'), '-0', `'-0000000' must be '-0'`);
  t.equal(removeLeadingZeroes('-0000000.'), '-0.', `'-0000000.' must be '-0.'`);
  t.equal(removeLeadingZeroes('-0000000.0'), '-0.0', `'-0000000.' must be '-0.0'`);
  t.equal(removeLeadingZeroes('-0000000.00'), '-0.00', `'-0000000.' must be '-0.00'`);
  t.equal(removeLeadingZeroes('-0000000.000'), '-0.000', `'-0000000.' must be '-0.000'`);
  t.equal(removeLeadingZeroes('-0000000.0000000'), '-0.0000000', `'-0000000.0000000' must be '-0.0000000'`);
  t.equal(removeLeadingZeroes('-0000000.0000000123'), '-0.0000000123', `'-0000000.0000000123' must be '-0.0000000123'`);
  t.equal(removeLeadingZeroes('-000100100.000'), '-100100.000', `'-000100100.000' must be '-100100.000'`);
  t.equal(removeLeadingZeroes('-10000000.000'), '-10000000.000', `'-10000000.000' must be '-10000000.000'`);

  t.equal(removeLeadingZeroes('003'), '3', `'003' must be '3'`);

  t.end();
});

test('removeTrailingZeroes', t => {
  t.equal(removeTrailingZeroes(undefined), undefined, `undefined must be undefined`);
  t.equal(removeTrailingZeroes(null), null, `null must be null`);
  t.equal(removeTrailingZeroes(''), '', `'' must be ''`);

  t.equal(removeTrailingZeroes('.00000'), '.0', `'.00000' must be '.0'`);

  t.equal(removeTrailingZeroes('0'), '0', `'0' must be '0'`);
  t.equal(removeTrailingZeroes('0.0'), '0.0', `'0.0' must be '0.0'`);

  t.equal(removeTrailingZeroes('00.00'), '00.0', `'00.00' must be '00.0'`);
  t.equal(removeTrailingZeroes('000.000'), '000.0', `'000.000' must be '000.0'`);
  t.equal(removeTrailingZeroes('0000000.0000000'), '0000000.0', `'0000000.0000000' must be '0000000.0'`);
  t.equal(removeTrailingZeroes('0000000.'), '0000000.', `'0000000.' must be '0000000.'`);
  t.equal(removeTrailingZeroes('0000000.0'), '0000000.0', `'0000000.0' must be '0000000.0'`);

  t.equal(removeTrailingZeroes('0.00'), '0.0', `'0.00' must be '0.0'`);
  t.equal(removeTrailingZeroes('0.000'), '0.0', `'0.000' must be '0.0'`);
  t.equal(removeTrailingZeroes('0.0000000'), '0.0', `'0.0000000' must be '0.0'`);
  t.equal(removeTrailingZeroes('0.0000000123'), '0.0000000123', `'0.0000000123' must be '0.0000000123'`);
  t.equal(removeTrailingZeroes('0.00000001230'), '0.0000000123', `'0.00000001230' must be '0.0000000123'`);
  t.equal(removeTrailingZeroes('000100100.000200200'), '000100100.0002002', `'000100100.000' must be '000100100.0002002'`);
  t.equal(removeTrailingZeroes('10000000.100020003000'), '10000000.100020003', `'10000000.100020003000' must be '10000000.100020003'`);

  t.equal(removeTrailingZeroes('+0'), '+0', `'+0' must be '+0'`);
  t.equal(removeTrailingZeroes('+00'), '+00', `'+00' must be '+00'`);
  t.equal(removeTrailingZeroes('+000'), '+000', `'+000' must be '+000'`);
  t.equal(removeTrailingZeroes('+0000000'), '+0000000', `'+0000000' must be '+0000000'`);
  t.equal(removeTrailingZeroes('+0000000.'), '+0000000.', `'+0000000.' must be '+0000000.'`);
  t.equal(removeTrailingZeroes('+0000000.0'), '+0000000.0', `'+0000000.0' must be '+0000000.0'`);
  t.equal(removeTrailingZeroes('+0000000.00'), '+0000000.0', `'+0000000.00' must be '+0000000.0'`);
  t.equal(removeTrailingZeroes('+0000000.000'), '+0000000.0', `'+0000000.000' must be '+0000000.0'`);
  t.equal(removeTrailingZeroes('+0000000.0000000'), '+0000000.0', `'+0000000.0000000' must be '+0000000.0'`);
  t.equal(removeTrailingZeroes('+0000000.0000000123'), '+0000000.0000000123', `'+0000000.0000000123' must be '+0000000.0000000123'`);
  t.equal(removeTrailingZeroes('+0000000.0000000123000000000'), '+0000000.0000000123', `'+0000000.0000000123000000000' must be '+0000000.0000000123'`);
  t.equal(removeTrailingZeroes('+000100100.000'), '+000100100.0', `'+000100100.000' must be '+000100100.0'`);
  t.equal(removeTrailingZeroes('+10000000.000'), '+10000000.0', `'+10000000.000' must be '+10000000.0'`);

  t.equal(removeTrailingZeroes('-0'), '-0', `'-0' must be '-0'`);
  t.equal(removeTrailingZeroes('-00'), '-00', `'-00' must be '-00'`);
  t.equal(removeTrailingZeroes('-000'), '-000', `'-000' must be '-000'`);
  t.equal(removeTrailingZeroes('-0000000'), '-0000000', `'-0000000' must be '-0000000'`);
  t.equal(removeTrailingZeroes('-0000000.'), '-0000000.', `'-0000000.' must be '-0000000.'`);
  t.equal(removeTrailingZeroes('-0000000.0'), '-0000000.0', `'-0000000.0' must be '-0000000.0'`);
  t.equal(removeTrailingZeroes('-0000000.00'), '-0000000.0', `'-0000000.00' must be '-0000000.0'`);
  t.equal(removeTrailingZeroes('-0000000.000'), '-0000000.0', `'-0000000.000' must be '-0000000.000'`);
  t.equal(removeTrailingZeroes('-0000000.0000000'), '-0000000.0', `'-0000000.0000000' must be '-0000000.0'`);
  t.equal(removeTrailingZeroes('-0000000.0000000123'), '-0000000.0000000123', `'-0000000.0000000123' must be '-0000000.0000000123'`);
  t.equal(removeTrailingZeroes('-0000000.00000001230000'), '-0000000.0000000123', `'-0000000.00000001230000' must be '-0000000.0000000123'`);
  t.equal(removeTrailingZeroes('-000100100.000'), '-000100100.0', `'-000100100.000' must be '-000100100.0'`);
  t.equal(removeTrailingZeroes('-10000000.000'), '-10000000.0', `'-10000000.000' must be '-10000000.0'`);

  t.equal(removeTrailingZeroes('003'), '003', `'003' must be '003'`);

  t.equal(removeTrailingZeroes('-001.e100'), '-001.e100', `'-001.e100' must be '-001.e100'`);
  t.equal(removeTrailingZeroes('-01.0e100'), '-01.0e100', `'-01.0e100' must be '-01.0e100'`);
  t.equal(removeTrailingZeroes('-1.00e100'), '-1.0e100', `'-1.00e100' must be '-1.0e100'`);
  t.equal(removeTrailingZeroes('-1.00e100'), '-1.0e100', `'-1.00e100' must be '-1.0e100'`);
  t.equal(removeTrailingZeroes('-1.100e100'), '-1.1e100', `'-1.100e100' must be '-1.1e100'`);

  t.equal(removeTrailingZeroes('1.123000456000'), '1.123000456', `'1.123000456000' must be '1.123000456'`);
  t.equal(removeTrailingZeroes('1.123000456000e0'), '1.123000456e0', `'1.123000456000e0' must be '1.123000456e0'`);
  t.equal(removeTrailingZeroes('1.123000456000e100'), '1.123000456e100', `'1.123000456000e100' must be '1.123000456e100'`);
  t.equal(removeTrailingZeroes('1.123000456000e+100'), '1.123000456e+100', `'1.123000456000e+100' must be '1.123000456e+100'`);
  t.equal(removeTrailingZeroes('1.123000456000e-100'), '1.123000456e-100', `'1.123000456000e-100' must be '1.123000456e-100'`);
  t.equal(removeTrailingZeroes('1.00000000000000e10000'), '1.0e10000', `'1.00000000000000e10000' must be '1.0e10000'`);
  t.equal(removeTrailingZeroes('1.00000009000000e10000'), '1.00000009e10000', `'1.00000009000000e10000' must be '1.00000009e10000'`);
  t.equal(removeTrailingZeroes('999.9999999e-99'), '999.9999999e-99', `'999.9999999e-99' must be '999.9999999e-99'`);

  t.end();
});

test('zeroPadLeft', t => {
  const hasMoreThanNDigits = /has more than \d+ digits/;
  t.equal(zeroPadLeft('123456'), '123456', `('123456') must be '123456'`);
  t.equal(zeroPadLeft('123456', 0), '123456', `('123456', 0) must be '123456'`);
  t.equal(zeroPadLeft('123456', -1), '123456', `('123456', -1) must be '123456'`);
  t.equal(zeroPadLeft('123456', undefined), '123456', `('123456', undefined) must be '123456'`);
  t.equal(zeroPadLeft('123456', null), '123456', `('123456', null) must be '123456'`);

  t.throws(() => zeroPadLeft('123456', 1), hasMoreThanNDigits, `('123456', 1) must throw a 'has more than N digits' error`);
  t.throws(() => zeroPadLeft('123456', 5), hasMoreThanNDigits, `('123456', 5) must throw a 'has more than N digits' error`);

  t.equal(zeroPadLeft('123456', 6), '123456', `('123456', 6) must be '123456'`);
  t.equal(zeroPadLeft('123456', 7), '0123456', `('123456', 7) must be '0123456'`);
  t.equal(zeroPadLeft('123456', 10), '0000123456', `('123456', 10) must be '0000123456'`);
  t.equal(zeroPadLeft('+123456', 10), '+0000123456', `('+123456', 10) must be '+0000123456'`);
  t.equal(zeroPadLeft('-123456', 10), '-0000123456', `('-123456', 10) must be '-0000123456'`);

  t.equal(zeroPadLeft(''), '', `('') must be ''`);
  t.equal(zeroPadLeft('', 0), '', `('', 0) must be ''`);
  t.equal(zeroPadLeft('', 1), '0', `('', 1) must be '0'`);
  t.equal(zeroPadLeft('', 2), '00', `('', 2) must be '00'`);
  t.equal(zeroPadLeft('', 21), '0'.repeat(21), `('', 21) must be '${'0'.repeat(21)}'`);

  t.throws(() => zeroPadLeft(`${Number.MAX_SAFE_INTEGER}`, 1), hasMoreThanNDigits, `(MAX_SAFE_INTEGER, 1) must throw a 'has more than N digits' error`);
  t.throws(() => zeroPadLeft(`${Number.MAX_SAFE_INTEGER}`, 15), hasMoreThanNDigits, `(MAX_SAFE_INTEGER, 15) must throw a 'has more than N digits' error`);
  t.throws(() => zeroPadLeft(`${Number.MIN_SAFE_INTEGER}`, 1), hasMoreThanNDigits, `(MIN_SAFE_INTEGER, 1) must throw a 'has more than N digits' error`);
  t.throws(() => zeroPadLeft(`${Number.MIN_SAFE_INTEGER}`, 15), hasMoreThanNDigits, `(MIN_SAFE_INTEGER, 15) must throw a 'has more than N digits' error`);
  t.equal(zeroPadLeft(`${Number.MAX_SAFE_INTEGER}`, 16), `${Number.MAX_SAFE_INTEGER}`, `(MAX_SAFE_INTEGER, 16) must be '${Number.MAX_SAFE_INTEGER}'`);
  t.equal(zeroPadLeft(`+${Number.MAX_SAFE_INTEGER}`, 16), `+${Number.MAX_SAFE_INTEGER}`, `(+MAX_SAFE_INTEGER, 16) must be '+${Number.MAX_SAFE_INTEGER}'`);
  t.equal(zeroPadLeft(`${Number.MIN_SAFE_INTEGER}`, 16), `${Number.MIN_SAFE_INTEGER}`, `(MIN_SAFE_INTEGER, 16) must be '${Number.MIN_SAFE_INTEGER}'`);
  t.throws(() => zeroPadLeft(toIntegerLike(1.22222333334444455556e+21), 21), hasMoreThanNDigits, `(1.22222333334444455556e+21, 21) must throw a 'has more than N digits' error`);
  t.throws(() => zeroPadLeft(toIntegerLike(-1.23456e+5), 5), hasMoreThanNDigits, `(-1.23456e+5, 5) must throw a 'has more than N digits' error`);
  t.throws(() => zeroPadLeft(toIntegerLike(-1.222223333344444555556e+21), 21), hasMoreThanNDigits, `(-1.222223333344444555556e+21, 21) must throw a 'has more than N digits' error`);
  t.throws(() => zeroPadLeft(toIntegerLike(1.23456e+5), 5), hasMoreThanNDigits, `(1.23456e+5, 5) must throw a 'has more than N digits' error`);

  t.end();
});

test('nearlyEqual', t => {
  // Others
  t.ok(nearlyEqual(undefined, undefined), `undefined is nearly equal to undefined`);
  t.notOk(nearlyEqual(undefined, 0), `undefined is NOT nearly equal to 0`);
  t.notOk(nearlyEqual(0, undefined), `0 is NOT nearly equal to undefined`);

  // Not-a-Numbers
  t.notOk(nearlyEqual(NaN, NaN), `NaN is NOT nearly equal to NaN`);
  t.notOk(nearlyEqual(NaN, 0), `NaN is NOT nearly equal to 0`);

  // Simple integers
  t.ok(nearlyEqual(0, 0), `0 is nearly equal to 0`);
  t.ok(nearlyEqual(1, 1), `1 is nearly equal to 1`);
  t.ok(nearlyEqual(-1, -1), `-1 is nearly equal to -1`);

  t.notOk(nearlyEqual(-2, -1), `-2 is NOT nearly equal to -1`);
  t.notOk(nearlyEqual(-1, -2), `-1 is NOT nearly equal to -2`);
  t.notOk(nearlyEqual(-1, 0), `-1 is NOT nearly equal to 0`);
  t.notOk(nearlyEqual(0, -1), `0 is NOT nearly equal to -1`);
  t.notOk(nearlyEqual(0, 1), `0 is NOT nearly equal to 1`);
  t.notOk(nearlyEqual(1, 0), `1 is NOT nearly equal to 0`);
  t.notOk(nearlyEqual(1, 2), `1 is NOT nearly equal to 2`);
  t.notOk(nearlyEqual(2, 1), `2 is NOT nearly equal to 1`);

  // Max safe integers
  // =================
  // ENTERING SAFE POSITIVE INTEGERS SPACE ...
  // -----------------------------------------
  t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER - 3, Number.MAX_SAFE_INTEGER - 3), `MAX_SAFE_INTEGER - 3 is nearly equal to MAX_SAFE_INTEGER - 3`);

  t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER - 3, Number.MAX_SAFE_INTEGER - 2), `MAX_SAFE_INTEGER - 3 is NOT nearly equal to MAX_SAFE_INTEGER - 2`);
  t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER - 2, Number.MAX_SAFE_INTEGER - 3), `MAX_SAFE_INTEGER - 2 is NOT nearly equal to MAX_SAFE_INTEGER - 3`);

  t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER - 2 , Number.MAX_SAFE_INTEGER - 2), `MAX_SAFE_INTEGER - 2 is nearly equal to MAX_SAFE_INTEGER - 2`);

  t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER - 2, Number.MAX_SAFE_INTEGER - 1), `MAX_SAFE_INTEGER - 2 is NOT nearly equal to MAX_SAFE_INTEGER - 1`);
  t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER - 2), `MAX_SAFE_INTEGER - 1 is NOT nearly equal to MAX_SAFE_INTEGER - 2`);

  t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER -1 , Number.MAX_SAFE_INTEGER - 1), `MAX_SAFE_INTEGER - 1 is nearly equal to MAX_SAFE_INTEGER - 1`);

  t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER), `MAX_SAFE_INTEGER - 1 is NOT nearly equal to MAX_SAFE_INTEGER`);
  t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER - 1), `MAX_SAFE_INTEGER is NOT nearly equal to MAX_SAFE_INTEGER - 1`);

  t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER), `MAX_SAFE_INTEGER is nearly equal to MAX_SAFE_INTEGER`);

  // ENTERING UNSAFE POSITIVE INTEGERS SPACE ...
  // -------------------------------------------
  // t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1), `MAX_SAFE_INTEGER is NOT nearly equal to MAX_SAFE_INTEGER + 1`);
  // t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER), `MAX_SAFE_INTEGER + 1 is NOT nearly equal to MAX_SAFE_INTEGER`);
  t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1), `MAX_SAFE_INTEGER is nearly equal to MAX_SAFE_INTEGER + 1 (*** BREAKING DOWN)`);
  t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER), `MAX_SAFE_INTEGER + 1 is nearly equal to MAX_SAFE_INTEGER (*** BREAKING DOWN)`);

  t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER + 1), `MAX_SAFE_INTEGER is nearly equal to MAX_SAFE_INTEGER`);

  // t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER + 2), `MAX_SAFE_INTEGER + 1 is NOT nearly equal to MAX_SAFE_INTEGER + 2`);
  // t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER + 2, Number.MAX_SAFE_INTEGER + 1), `MAX_SAFE_INTEGER + 2 is NOT nearly equal to MAX_SAFE_INTEGER + 1`);
  t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER + 2), `MAX_SAFE_INTEGER + 1 is nearly equal to MAX_SAFE_INTEGER + 2 (*** UNAVOIDABLE)`);
  t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER + 2, Number.MAX_SAFE_INTEGER + 1), `MAX_SAFE_INTEGER + 2 is nearly equal to MAX_SAFE_INTEGER + 1 (*** UNAVOIDABLE)`);

  t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER + 2, Number.MAX_SAFE_INTEGER + 2), `MAX_SAFE_INTEGER +2 is nearly equal to MAX_SAFE_INTEGER + 2`);

  t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER + 2, Number.MAX_SAFE_INTEGER + 3), `MAX_SAFE_INTEGER + 2 is NOT nearly equal to MAX_SAFE_INTEGER + 3`);
  t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER + 3, Number.MAX_SAFE_INTEGER + 2), `MAX_SAFE_INTEGER + 3 is NOT nearly equal to MAX_SAFE_INTEGER + 2`);
  // t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER + 2, Number.MAX_SAFE_INTEGER + 3), `MAX_SAFE_INTEGER + 2 is nearly equal to MAX_SAFE_INTEGER + 3 (*** BREAKING DOWN)`);
  // t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER + 3, Number.MAX_SAFE_INTEGER + 2), `MAX_SAFE_INTEGER + 3 is nearly equal to MAX_SAFE_INTEGER + 2 (*** BREAKING DOWN)`);

  t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER + 3, Number.MAX_SAFE_INTEGER + 3), `MAX_SAFE_INTEGER + 3 is nearly equal to MAX_SAFE_INTEGER + 3`);

  // Max safe integer - differing by 2
  // ---------------------------------
  t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER - 1), `MAX_SAFE_INTEGER + 1 is NOT nearly equal to MAX_SAFE_INTEGER - 1`);
  t.notOk(nearlyEqual(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER + 1), `MAX_SAFE_INTEGER - 1 is NOT nearly equal to MAX_SAFE_INTEGER + 1`);
  // t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER - 1), `MAX_SAFE_INTEGER + 1 is nearly equal to MAX_SAFE_INTEGER - 1 (*** BREAKING DOWN)`);
  // t.ok(nearlyEqual(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER + 1), `MAX_SAFE_INTEGER - 1 is nearly equal to MAX_SAFE_INTEGER + 1 (*** BREAKING DOWN)`);



  // Min safe integer - differing by 1
  // ---------------------------------
  // ENTERING UNSAFE NEGATIVE INTEGERS SPACE ...
  // -------------------------------------------
  t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER - 3, Number.MIN_SAFE_INTEGER - 3), `MIN_SAFE_INTEGER - 3 is nearly equal to MIN_SAFE_INTEGER - 3`);

  t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER - 3, Number.MIN_SAFE_INTEGER - 2), `MIN_SAFE_INTEGER - 3 is NOT nearly equal to MIN_SAFE_INTEGER - 2`);
  t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER - 2, Number.MIN_SAFE_INTEGER - 3), `MIN_SAFE_INTEGER - 2 is NOT nearly equal to MIN_SAFE_INTEGER - 3`);
  // t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER - 3, Number.MIN_SAFE_INTEGER - 2), `MIN_SAFE_INTEGER - 3 is nearly equal to MIN_SAFE_INTEGER - 2 (*** BREAKING DOWN)`);
  // t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER - 2, Number.MIN_SAFE_INTEGER - 3), `MIN_SAFE_INTEGER - 2 is nearly equal to MIN_SAFE_INTEGER - 3 (*** BREAKING DOWN)`);

  t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER - 2 , Number.MIN_SAFE_INTEGER - 2), `MIN_SAFE_INTEGER - 2 is nearly equal to MIN_SAFE_INTEGER - 2`);

  // t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER - 2, Number.MIN_SAFE_INTEGER - 1), `MIN_SAFE_INTEGER - 2 is NOT nearly equal to MIN_SAFE_INTEGER - 1`);
  // t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER - 1, Number.MIN_SAFE_INTEGER - 2), `MIN_SAFE_INTEGER - 1 is NOT nearly equal to MIN_SAFE_INTEGER - 2`);
  t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER - 2, Number.MIN_SAFE_INTEGER - 1), `MIN_SAFE_INTEGER - 2 is nearly equal to MIN_SAFE_INTEGER - 1 (*** UNAVOIDABLE)`);
  t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER - 1, Number.MIN_SAFE_INTEGER - 2), `MIN_SAFE_INTEGER - 1 is nearly equal to MIN_SAFE_INTEGER - 2 (*** UNAVOIDABLE)`);

  t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER -1 , Number.MIN_SAFE_INTEGER - 1), `MIN_SAFE_INTEGER - 1 is nearly equal to MIN_SAFE_INTEGER - 1`);

  // t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER - 1, Number.MIN_SAFE_INTEGER), `MIN_SAFE_INTEGER - 1 is NOT nearly equal to MIN_SAFE_INTEGER`);
  // t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER - 1), `MIN_SAFE_INTEGER is NOT nearly equal to MIN_SAFE_INTEGER - 1`);
  t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER - 1, Number.MIN_SAFE_INTEGER), `MIN_SAFE_INTEGER - 1 is nearly equal to MIN_SAFE_INTEGER (*** BREAKING DOWN)`);
  t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER - 1), `MIN_SAFE_INTEGER is nearly equal to MIN_SAFE_INTEGER - 1 (*** BREAKING DOWN)`);

  // ENTERING SAFE NEGATIVE INTEGERS SPACE ...
  // -------------------------------------------
  t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER), `MIN_SAFE_INTEGER is nearly equal to MIN_SAFE_INTEGER`);

  t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER + 1), `MIN_SAFE_INTEGER is NOT nearly equal to MIN_SAFE_INTEGER + 1`);
  t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER + 1, Number.MIN_SAFE_INTEGER), `MIN_SAFE_INTEGER + 1 is NOT nearly equal to MIN_SAFE_INTEGER`);

  t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER + 1, Number.MIN_SAFE_INTEGER + 1), `MIN_SAFE_INTEGER + 1 is nearly equal to MIN_SAFE_INTEGER + 1`);

  t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER + 1, Number.MIN_SAFE_INTEGER + 2), `MIN_SAFE_INTEGER + 1 is NOT nearly equal to MIN_SAFE_INTEGER + 2`);
  t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER + 2, Number.MIN_SAFE_INTEGER + 1), `MIN_SAFE_INTEGER + 2 is NOT nearly equal to MIN_SAFE_INTEGER + 1`);
  // t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER + 1, Number.MIN_SAFE_INTEGER + 2), `MIN_SAFE_INTEGER + 1 is "nearly" equal to MIN_SAFE_INTEGER + 2 (*** BREAKING DOWN)`);
  // t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER + 2, Number.MIN_SAFE_INTEGER + 1), `MIN_SAFE_INTEGER + 2 is "nearly" equal to MIN_SAFE_INTEGER + 1 (*** BREAKING DOWN)`);

  t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER + 2, Number.MIN_SAFE_INTEGER + 2), `MIN_SAFE_INTEGER + 2 is nearly equal to MIN_SAFE_INTEGER + 2`);

  t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER + 2, Number.MIN_SAFE_INTEGER + 3), `MIN_SAFE_INTEGER + 2 is NOT nearly equal to MIN_SAFE_INTEGER + 3`);
  t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER + 3, Number.MIN_SAFE_INTEGER + 2), `MIN_SAFE_INTEGER + 3 is NOT nearly equal to MIN_SAFE_INTEGER + 2`);

  t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER + 3, Number.MIN_SAFE_INTEGER + 3), `MIN_SAFE_INTEGER + 3 is nearly equal to MIN_SAFE_INTEGER + 3`);

  // Min safe integer - differing by 2
  // ---------------------------------
  t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER + 1, Number.MIN_SAFE_INTEGER - 1), `MIN_SAFE_INTEGER + 1 is NOT nearly equal to MIN_SAFE_INTEGER - 1`);
  t.notOk(nearlyEqual(Number.MIN_SAFE_INTEGER - 1, Number.MIN_SAFE_INTEGER + 1), `MIN_SAFE_INTEGER - 1 is NOT nearly equal to MIN_SAFE_INTEGER + 1`);
  // t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER + 1, Number.MIN_SAFE_INTEGER - 1), `MIN_SAFE_INTEGER + 1 is nearly equal to MIN_SAFE_INTEGER - 1 (*** BREAKING DOWN)`);
  // t.ok(nearlyEqual(Number.MIN_SAFE_INTEGER - 1, Number.MIN_SAFE_INTEGER + 1), `MIN_SAFE_INTEGER - 1 is nearly equal to MIN_SAFE_INTEGER + 1 (*** BREAKING DOWN)`);


  // Max values (largest floating-point number)
  // ------------------------------------------
  t.ok(nearlyEqual(Number.MAX_VALUE, Number.MAX_VALUE - 1e+100), `MAX_VALUE is nearly equal to MAX_VALUE - 1e+100`);
  t.ok(nearlyEqual(Number.MAX_VALUE, Number.MAX_VALUE - Number.EPSILON), `MAX_VALUE is nearly equal to MAX_VALUE - EPSILON`);
  t.ok(nearlyEqual(Number.MAX_VALUE, Number.MAX_VALUE - 1), `MAX_VALUE is nearly equal to MAX_VALUE - 1`);
  t.ok(nearlyEqual(Number.MAX_VALUE, Number.MAX_VALUE - 1e-100), `MAX_VALUE is nearly equal to MAX_VALUE - 1e-100`);

  t.ok(nearlyEqual(Number.MAX_VALUE, Number.MAX_VALUE), `MAX_VALUE is nearly equal to MAX_VALUE`);

  t.ok(nearlyEqual(Number.MAX_VALUE, Number.MAX_VALUE + 1e-100), `MAX_VALUE is nearly equal to MAX_VALUE + 1e-100`);
  t.ok(nearlyEqual(Number.MAX_VALUE, Number.MAX_VALUE + Number.EPSILON), `MAX_VALUE is nearly equal to MAX_VALUE + EPSILON`);
  t.ok(nearlyEqual(Number.MAX_VALUE, Number.MAX_VALUE + 1), `MAX_VALUE is nearly equal to MAX_VALUE + 1`);
  t.ok(nearlyEqual(Number.MAX_VALUE, Number.MAX_VALUE + 1e+100), `MAX_VALUE is nearly equal to MAX_VALUE + 1e+100 (${Number.MAX_VALUE + 1e-100})`);

  // Min values (smallest floating-point number)
  // -------------------------------------------
  t.ok(nearlyEqual(Number.MIN_VALUE, Number.MIN_VALUE), `MIN_VALUE is nearly equal to MIN_VALUE`);

  // t.ok(nearlyEqual(Number.MIN_VALUE, Number.MIN_VALUE - 1e-100), `MIN_VALUE is nearly equal to MIN_VALUE - 1e-100`);
  // t.ok(nearlyEqual(Number.MIN_VALUE, Number.MIN_VALUE + 1e-100), `MIN_VALUE is nearly equal to MIN_VALUE + 1e-100`);
  t.notOk(nearlyEqual(Number.MIN_VALUE, Number.MIN_VALUE - 1e-100), `MIN_VALUE is NOT nearly equal to MIN_VALUE - 1e-100`);
  t.notOk(nearlyEqual(Number.MIN_VALUE, Number.MIN_VALUE + 1e-100), `MIN_VALUE is NOT nearly equal to MIN_VALUE + 1e-100`);

  t.notOk(nearlyEqual(Number.MIN_VALUE, Number.MIN_VALUE - Number.EPSILON), `MIN_VALUE is NOT nearly equal to MIN_VALUE - EPSILON`);
  t.notOk(nearlyEqual(Number.MIN_VALUE, Number.MIN_VALUE + Number.EPSILON), `MIN_VALUE is NOT nearly equal to MIN_VALUE + EPSILON`);

  t.notOk(nearlyEqual(Number.MIN_VALUE, Number.MIN_VALUE - 1e+100), `MIN_VALUE is NOT nearly equal to MIN_VALUE - 1e+100`);
  t.notOk(nearlyEqual(Number.MIN_VALUE, Number.MIN_VALUE + 1e+100), `MIN_VALUE is NOT nearly equal to MIN_VALUE + 1e+100`);

  // Floating-point numbers near MAX_VALUE
  // -------------------------------------
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+1), `MAX_VALUE is NOT nearly equal to 1e+1`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+5), `MAX_VALUE is NOT nearly equal to 1e+5`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+10), `MAX_VALUE is NOT nearly equal to 1e+10`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+15), `MAX_VALUE is NOT nearly equal to 1e+15`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+20), `MAX_VALUE is NOT nearly equal to 1e+20`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+50), `MAX_VALUE is NOT nearly equal to 1e+50`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+100), `MAX_VALUE is NOT nearly equal to 1e+100`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+200), `MAX_VALUE is NOT nearly equal to 1e+200`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+300), `MAX_VALUE is NOT nearly equal to 1e+300`);

  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+307), `MAX_VALUE is NOT nearly equal to 1e+307`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1.5e+308), `MAX_VALUE is NOT nearly equal to 1.5e+308`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1.6e+308), `MAX_VALUE is NOT nearly equal to 1.6e+308`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1.7e+308), `MAX_VALUE is NOT nearly equal to 1.7e+308`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1.79e+308), `MAX_VALUE is NOT nearly equal to 1.79e+308`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1.797e+308), `MAX_VALUE is NOT nearly equal to 1.797e+308`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1.7976e+308), `MAX_VALUE is NOT nearly equal to 1.7976e+308`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1.79769e+308), `MAX_VALUE is NOT nearly equal to 1.79769e+308`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1.797693e+308), `MAX_VALUE is NOT nearly equal to 1.797693e+308`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1.79769313e+308), `MAX_VALUE is NOT nearly equal to 1.79769313e+308`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1.7976931348623154e+308), `MAX_VALUE is NOT nearly equal to 1.7976931348623154e+308`);
  t.ok(nearlyEqual(Number.MAX_VALUE, 1.7976931348623155e+308), `MAX_VALUE is nearly equal to 1.7976931348623155e+308`);
  t.ok(nearlyEqual(Number.MAX_VALUE, 1.7976931348623156e+308), `MAX_VALUE is nearly equal to 1.7976931348623156e+308`);
  t.ok(nearlyEqual(Number.MAX_VALUE, 1.79769313486231567e+308), `MAX_VALUE is nearly equal to 1.79769313486231567e+308`);

  t.ok(nearlyEqual(Number.MAX_VALUE, Number.MAX_VALUE), `MAX_VALUE is nearly equal to MAX_VALUE (${Number.MAX_VALUE})`);

  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+309), `MAX_VALUE is NOT nearly equal to 1e+309 (~${1e+309})`);

  // bigger become +Infinity
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+312), `MAX_VALUE is NOT nearly equal to 1e+312 (~${1e+312})`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+325), `MAX_VALUE is NOT nearly equal to 1e+325 (~${1e+325})`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+350), `MAX_VALUE is NOT nearly equal to 1e+350 (~${1e+350})`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, 1e+400), `MAX_VALUE is NOT nearly equal to 1e+400 (~${1e+400})`);

  // Floating-point numbers near zero
  // --------------------------------
  t.notOk(nearlyEqual(0, 1e-1), `0 is NOT nearly equal to 1e-1`);
  t.notOk(nearlyEqual(0, 1e-5), `0 is NOT nearly equal to 1e-5`);
  t.notOk(nearlyEqual(0, 1e-10), `0 is NOT nearly equal to 1e-10`);
  t.notOk(nearlyEqual(0, 1e-15), `0 is NOT nearly equal to 1e-15`);
  t.notOk(nearlyEqual(0, 1e-20), `0 is NOT nearly equal to 1e-20`);
  t.notOk(nearlyEqual(0, 1e-50), `0 is NOT nearly equal to 1e-50`);
  t.notOk(nearlyEqual(0, 1e-100), `0 is NOT nearly equal to 1e-100`);
  t.notOk(nearlyEqual(0, 1e-200), `0 is NOT nearly equal to 1e-200`);
  t.notOk(nearlyEqual(0, 1e-300), `0 is NOT nearly equal to 1e-300`);
  t.notOk(nearlyEqual(0, 1e-312), `0 is NOT nearly equal to 1e-312`);

  t.notOk(nearlyEqual(0, Number.MIN_VALUE), `0 is NOT nearly equal to MIN_VALUE`);
  t.notOk(nearlyEqual(Number.MIN_VALUE, 0), `MIN_VALUE is NOT nearly equal to 0`);

  // smaller become zero
  t.ok(nearlyEqual(0, 1e-325), `0 is nearly equal to 1e-325 (~${1e-325})`);
  t.ok(nearlyEqual(0, 1e-350), `0 is nearly equal to 1e-350 (~${1e-350})`);
  t.ok(nearlyEqual(0, 1e-400), `0 is nearly equal to 1e-400 (~${1e-400})`);

  // Simple floating-point numbers
  // -----------------------------
  t.ok(0.1 + 0.2 !== 0.3, `0.1 + 0.2 !== 0.3`);
  t.ok(nearlyEqual(0.1 + 0.2, 0.3), `0.1 + 0.2 is nearly equal to 0.3`);
  t.ok(nearlyEqual(0.3, 0.1 + 0.2), `0.3 is nearly equal to 0.1 + 0.2`);

  t.ok(-0.1 + -0.2 !== -0.3, `-0.1 + -0.2 !== -0.3`);
  t.ok(nearlyEqual(-0.1 + -0.2, -0.3), `-0.1 + -0.2 is nearly equal to -0.3`);
  t.ok(nearlyEqual(-0.3, -0.1 + -0.2), `-0.3 is nearly equal to -0.1 + -0.2`);

  t.ok(0.2 + 0.7 !== 0.9, `0.2 + 0.7 !== 0.9`);
  t.ok(nearlyEqual(0.2 + 0.7, 0.9), `0.2 + 0.7 is nearly equal to 0.9`);
  t.ok(nearlyEqual(0.9, 0.2 + 0.7), `0.9 is nearly equal to 0.2 + 0.7`);

  t.ok(-0.2 + -0.7 !== -0.9, `-0.2 + -0.7 !== -0.9`);
  t.ok(nearlyEqual(-0.2 + -0.7, -0.9), `-0.2 + -0.7 is nearly equal to -0.9`);
  t.ok(nearlyEqual(-0.9, -0.2 + -0.7), `-0.9 is nearly equal to -0.2 + -0.7`);

  t.ok(0.1 + 1.1 !== 1.2, `0.1 + 1.1 !== 1.2`);
  t.ok(nearlyEqual(0.1 + 1.1, 1.2), `0.1 + 1.1 is nearly equal to 1.2`);
  t.ok(nearlyEqual(1.2, 0.1 + 1.1), `1.2 is nearly equal to 0.1 + 1.1`);

  t.ok(-0.1 + -1.1 !== -1.2, `-0.1 + -1.1 !== -1.2`);
  t.ok(nearlyEqual(-0.1 + -1.1, -1.2), `-0.1 + -1.1 is nearly equal to -1.2`);
  t.ok(nearlyEqual(-1.2, -0.1 + -1.1), `-1.2 is nearly equal to -0.1 + -1.1`);


  // Infinities
  // ----------
  t.ok(nearlyEqual(Infinity, Infinity), `Infinity is nearly equal to Infinity`);
  t.ok(nearlyEqual(-Infinity, -Infinity), `-Infinity is nearly equal to -Infinity`);

  t.notOk(nearlyEqual(Infinity, Number.MAX_VALUE), `Infinity is NOT nearly equal to Number.MAX_VALUE`);
  t.notOk(nearlyEqual(Number.MAX_VALUE, Infinity), `Number.MAX_VALUE is NOT nearly equal to Infinity`);

  t.notOk(nearlyEqual(-Infinity, -Number.MAX_VALUE), `-Infinity is NOT nearly equal to -Number.MAX_VALUE`);
  t.notOk(nearlyEqual(-Number.MAX_VALUE, -Infinity), `-Number.MAX_VALUE is NOT nearly equal to -Infinity`);

  t.end();
});

test('toInteger', t => {
  // With strings
  t.equal(toInteger('-1.2e22'), -1.2e+22, `toInteger('-1.2e22') must be -1.2e+22`);
  t.equal(toInteger(`${Number.MIN_SAFE_INTEGER}`), Number.MIN_SAFE_INTEGER, `toInteger('Number.MIN_SAFE_INTEGER') must be Number.MIN_SAFE_INTEGER`);
  t.equal(toInteger('-12345.59'), -12345, `toInteger('-12345.59') must be -12345`);
  t.equal(toInteger('-12345'), -12345, `toInteger('-12345') must be -12345`);
  t.equal(toInteger('-2'), -2, `toInteger('-2') must be -2`);
  t.equal(toInteger('-1.999'), -1, `toInteger('-1.999') must be -1`);
  t.equal(toInteger('-1.5'), -1, `toInteger('-1.5') must be -1`);
  t.equal(toInteger('-1.01'), -1, `toInteger('-1.01') must be -1`);
  t.equal(toInteger('-1'), -1, `toInteger('-1') must be -1`);
  t.equal(toInteger('-0.999'), 0, `toInteger('-0.999') must be 0`);
  t.equal(toInteger('-0.5'), 0, `toInteger('-0.5') must be 0`);
  t.equal(toInteger('-0.01'), 0, `toInteger('-0.01') must be 0`);
  t.equal(toInteger('0'), 0, `toInteger('0') must be 0`);
  t.equal(toInteger('0.01'), 0, `toInteger('0.01') must be 0`);
  t.equal(toInteger('0.5'), 0, `toInteger('0.5') must be 0`);
  t.equal(toInteger('0.999'), 0, `toInteger('0.999') must be 0`);
  t.equal(toInteger('+1'), +1, `toInteger('+1') must be +1`);
  t.equal(toInteger('+1.01'), +1, `toInteger('+1.01') must be +1`);
  t.equal(toInteger('+1.5'), +1, `toInteger('+1.5') must be +1`);
  t.equal(toInteger('+1.999'), +1, `toInteger('+1.999') must be +1`);
  t.equal(toInteger('+2'), +2, `toInteger('+2') must be +2`);
  t.equal(toInteger('+12345'), +12345, `toInteger('+12345') must be +12345`);
  t.equal(toInteger('+12345.59'), +12345, `toInteger('+12345.59') must be +12345`);
  t.equal(toInteger(`${Number.MAX_SAFE_INTEGER}`), Number.MAX_SAFE_INTEGER, `toInteger('${Number.MAX_SAFE_INTEGER}') must be Number.MAX_SAFE_INTEGER`);
  t.equal(toInteger('1.2e22'), 1.2e+22, `toInteger('1.2e22') must be 1.2e+22`);

  // With numbers
  t.equal(toInteger(-1.2e22), -1.2e+22, `toInteger(-1.2e22) must be -1.2e+22`);
  t.equal(toInteger(Number.MIN_SAFE_INTEGER), Number.MIN_SAFE_INTEGER, `toInteger(Number.MIN_SAFE_INTEGER) must be Number.MIN_SAFE_INTEGER`);
  t.equal(toInteger(-12345.59), -12345, `toInteger(-12345.59) must be -12345`);
  t.equal(toInteger(-12345), -12345, `toInteger(-12345) must be -12345`);
  t.equal(toInteger(-2), -2, `toInteger(-2) must be -2`);
  t.equal(toInteger(-1.999), -1, `toInteger(-1.999) must be -1`);
  t.equal(toInteger(-1.5), -1, `toInteger(-1.5) must be -1`);
  t.equal(toInteger(-1.01), -1, `toInteger(-1.01) must be -1`);
  t.equal(toInteger(-1), -1, `toInteger(-1) must be -1`);
  t.equal(toInteger(-0.999), 0, `toInteger(-0.999) must be 0`);
  t.equal(toInteger(-0.5), 0, `toInteger(-0.5) must be 0`);
  t.equal(toInteger(-0.01), 0, `toInteger(-0.01) must be 0`);
  t.equal(toInteger(0), 0, `toInteger(0) must be 0`);
  t.equal(toInteger(0.01), 0, `toInteger(0.01) must be 0`);
  t.equal(toInteger(0.5), 0, `toInteger(0.5) must be 0`);
  t.equal(toInteger(0.999), 0, `toInteger(0.999) must be 0`);
  t.equal(toInteger(+1), +1, `toInteger(+1) must be +1`);
  t.equal(toInteger(+1.01), +1, `toInteger(+1.01) must be +1`);
  t.equal(toInteger(+1.5), +1, `toInteger(+1.5) must be +1`);
  t.equal(toInteger(+1.999), +1, `toInteger(+1.999) must be +1`);
  t.equal(toInteger(+2), +2, `toInteger(+2) must be +2`);
  t.equal(toInteger(+12345), +12345, `toInteger(+12345) must be +12345`);
  t.equal(toInteger(+12345.59), +12345, `toInteger(+12345.59) must be +12345`);
  t.equal(toInteger(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER, `toInteger(Number.MAX_SAFE_INTEGER) must be Number.MAX_SAFE_INTEGER`);
  t.equal(toInteger(1.2e22), 1.2e+22, `toInteger(1.2e22) must be 1.2e+22`);

  t.end();
});