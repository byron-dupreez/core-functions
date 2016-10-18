'use strict';

const test = require('tape');

const Strings = require('../strings');
const Numbers = require('../numbers');

function stringify(value, v) {
  const val = value === +Infinity || value === -Infinity || Numbers.isNaN(value) ?
    value : JSON.stringify(value);
  return v instanceof String ? `String(${val}) with valueOf ("${v.valueOf()}")` : val;
}

function checkOkNotOk(fn, value, expected, wrapInString, okSuffix, notOkSuffix, t) {
  const v = wrapInString && !(value instanceof String) ? new String(value) : value;
  if (expected) {
    t.ok(fn(v), `${stringify(value, v)}${okSuffix}`);
  } else {
    t.notOk(fn(v), `${stringify(value, v)}${notOkSuffix}`);
  }
}

function checkEqual(fn, value, expected, wrapInString, equalSuffix, t) {
  const v = wrapInString && !(value instanceof String) ? new String(value) : value;
  const result = fn(v);
  if (Numbers.isNaN(result)) {
    if (Numbers.isNaN(expected)) {
      t.pass(`${stringify(value, v)} must be NaN`);
    } else {
      t.fail(`${stringify(value, v)} must NOT be NaN`)
    }
  } else if (result instanceof Object) {
    t.deepEqual(result, expected, `${stringify(value, v)}${equalSuffix}`);
  } else {
    t.equal(result, expected, `${stringify(value, v)}${equalSuffix}`);
  }
}

function checkIsStrings(wrapInString, t) {
  function check(value, expected, wrapInString, t) {
    return checkOkNotOk(Strings.isString, value, expected, wrapInString, ' is a string', ' is NOT a string', t);
  }

  // undefined
  check(undefined, wrapInString, wrapInString, t);

  // null
  check(null, wrapInString, wrapInString, t); // '' ?

  // objects
  check({}, wrapInString, wrapInString, t);
  check({a: 1, b: 2}, wrapInString, wrapInString, t);

  // booleans
  check(true, wrapInString, wrapInString, t);
  check(false, wrapInString, wrapInString, t);

  // arrays
  check([], wrapInString, wrapInString, t);
  check([1, 2, 3], wrapInString, wrapInString, t);

  // special case numbers
  check(Number.POSITIVE_INFINITY, wrapInString, wrapInString, t);
  check(Number.NEGATIVE_INFINITY, wrapInString, wrapInString, t);
  check(NaN, wrapInString, wrapInString, t);

  // negative numbers
  check(Number.MIN_VALUE, wrapInString, wrapInString, t);
  check(Number.MIN_SAFE_INTEGER, wrapInString, wrapInString, t);
  check(-123.456, wrapInString, wrapInString, t);
  check(-1, wrapInString, wrapInString, t);

  // zero
  check(0, wrapInString, wrapInString, t);

  // positive numbers
  check(1, wrapInString, wrapInString, t);
  check(123.456, wrapInString, wrapInString, t);
  check(Number.MAX_SAFE_INTEGER, wrapInString, wrapInString, t);
  check(Number.MAX_VALUE, wrapInString, wrapInString, t);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, true, wrapInString, t);
  check(`${Number.MIN_SAFE_INTEGER}`, true, wrapInString, t);
  check('-123.456', true, wrapInString, t);
  check('-1', true, wrapInString, t);

  check('0', true, wrapInString, t);

  check('1', true, wrapInString, t);
  check('123.456', true, wrapInString, t);
  check(`${Number.MAX_SAFE_INTEGER}`, true, wrapInString, t);
  check(`${Number.MAX_VALUE}`, true, wrapInString, t);

  // strings not containing numbers
  check('', true, wrapInString, t);
  check('a', true, wrapInString, t);
  check('abc', true, wrapInString, t);
  check('ABC', true, wrapInString, t);
}

function checkIsBlank(wrapInString, t) {
  function check(value, expected, wrapInString, t) {
    return checkOkNotOk(Strings.isBlank, value, expected, wrapInString, ' is blank', ' is NOT blank', t);
  }

  // undefined
  check(undefined, !wrapInString, wrapInString, t); // blank ?

  // null
  check(null, !wrapInString, wrapInString, t); // blank ?

  // objects
  check({}, false, wrapInString, t);
  check({a: 1, b: 2}, false, wrapInString, t);

  // booleans
  check(true, false, wrapInString, t);
  check(false, !wrapInString, wrapInString, t); // blank ?

  // arrays
  check([], wrapInString, wrapInString, t); // [] -> '' wrapped
  check([1, 2, 3], false, wrapInString, t);

  // special case numbers
  check(Number.POSITIVE_INFINITY, false, wrapInString, t);
  check(Number.NEGATIVE_INFINITY, false, wrapInString, t);
  check(NaN, !wrapInString, wrapInString, t);

  // negative numbers
  check(Number.MIN_VALUE, false, wrapInString, t);
  check(Number.MIN_SAFE_INTEGER, false, wrapInString, t);
  check(-123.456, false, wrapInString, t);
  check(-1, false, wrapInString, t);

  // zero
  check(0, !wrapInString, wrapInString, t); // not sure if this should return blank for 0

  // positive numbers
  check(1, false, wrapInString, t);
  check(123.456, false, wrapInString, t);
  check(Number.MAX_SAFE_INTEGER, false, wrapInString, t);
  check(Number.MAX_VALUE, false, wrapInString, t);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, false, wrapInString, t);
  check(`${Number.MIN_SAFE_INTEGER}`, false, wrapInString, t);
  check('-123.456', false, wrapInString, t);
  check('-1', false, wrapInString, t);

  check('0', false, wrapInString, t);

  check('1', false, wrapInString, t);
  check('123.456', false, wrapInString, t);
  check(`${Number.MAX_SAFE_INTEGER}`, false, wrapInString, t);
  check(`${Number.MAX_VALUE}`, false, wrapInString, t);

  // strings containing only whitespace
  check('', true, wrapInString, t);
  check(' ', true, wrapInString, t);
  check('\n', true, wrapInString, t);
  check('\r', true, wrapInString, t);
  check('\t', true, wrapInString, t);
  check('      ', true, wrapInString, t);
  check('  \n  ', true, wrapInString, t);
  check('  \r  ', true, wrapInString, t);
  check('  \t  ', true, wrapInString, t);
  check(' \n \r \t \n \r \t ', true, wrapInString, t);

  // strings not containing numbers
  check('a', false, wrapInString, t);
  check('abc', false, wrapInString, t);
  check('ABC', false, wrapInString, t);
}

function checkIsNotBlank(wrapInString, t) {
  function check(value, expected, wrapInString, t) {
    return checkOkNotOk(Strings.isNotBlank, value, expected, wrapInString, ' is not blank', ' is blank', t);
  }

  // undefined
  check(undefined, wrapInString, wrapInString, t); // blank ?

  // null
  check(null, wrapInString, wrapInString, t); // blank ?

  // objects
  check({}, true, wrapInString, t);
  check({a: 1, b: 2}, true, wrapInString, t);

  // booleans
  check(true, true, wrapInString, t);
  check(false, wrapInString, wrapInString, t); // blank ?

  // arrays
  check([], !wrapInString, wrapInString, t); // [] -> '' wrapped
  check([1, 2, 3], true, wrapInString, t);

  // special case numbers
  check(Number.POSITIVE_INFINITY, true, wrapInString, t);
  check(Number.NEGATIVE_INFINITY, true, wrapInString, t);
  check(NaN, wrapInString, wrapInString, t);

  // negative numbers
  check(Number.MIN_VALUE, true, wrapInString, t);
  check(Number.MIN_SAFE_INTEGER, true, wrapInString, t);
  check(-123.456, true, wrapInString, t);
  check(-1, true, wrapInString, t);

  // zero
  check(0, wrapInString, wrapInString, t); // not sure if this should return blank for 0

  // positive numbers
  check(1, true, wrapInString, t);
  check(123.456, true, wrapInString, t);
  check(Number.MAX_SAFE_INTEGER, true, wrapInString, t);
  check(Number.MAX_VALUE, true, wrapInString, t);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, true, wrapInString, t);
  check(`${Number.MIN_SAFE_INTEGER}`, true, wrapInString, t);
  check('-123.456', true, wrapInString, t);
  check('-1', true, wrapInString, t);

  check('0', true, wrapInString, t);

  check('1', true, wrapInString, t);
  check('123.456', true, wrapInString, t);
  check(`${Number.MAX_SAFE_INTEGER}`, true, wrapInString, t);
  check(`${Number.MAX_VALUE}`, true, wrapInString, t);

  // strings containing only whitespace
  check('', false, wrapInString, t);
  check(' ', false, wrapInString, t);
  check('\n', false, wrapInString, t);
  check('\r', false, wrapInString, t);
  check('\t', false, wrapInString, t);
  check('      ', false, wrapInString, t);
  check('  \n  ', false, wrapInString, t);
  check('  \r  ', false, wrapInString, t);
  check('  \t  ', false, wrapInString, t);
  check(' \n \r \t \n \r \t ', false, wrapInString, t);

  // strings not containing numbers
  check('a', true, wrapInString, t);
  check('abc', true, wrapInString, t);
  check('ABC', true, wrapInString, t);
}

function checkStringify(wrapInString, t) {
  function check(value, expected, wrapInString, t) {
    return checkEqual(Strings.stringify, value, expected, wrapInString, ` must be ${stringify(expected, undefined)}`, t);
  }

  // undefined
  check(undefined, 'undefined', wrapInString, t);

  // null
  check(null, 'null', wrapInString, t);

  // objects
  check({}, wrapInString ? '[object Object]' : '{}', wrapInString, t);
  check({a: 1, b: 2}, wrapInString ? '[object Object]' : `${JSON.stringify({a: 1, b: 2})}`, wrapInString, t);

  // booleans
  check(true, 'true', wrapInString, t);
  check(false, 'false', wrapInString, t);

  // arrays
  check([], wrapInString ? '' : '[]', wrapInString, t);
  check([1, 2, 3], wrapInString ? '1,2,3' : `${JSON.stringify([1, 2, 3])}`, wrapInString, t);

  // special case numbers
  check(Number.POSITIVE_INFINITY, `${Number.POSITIVE_INFINITY}`, wrapInString, t);
  check(Number.NEGATIVE_INFINITY, `${Number.NEGATIVE_INFINITY}`, wrapInString, t);
  check(NaN, 'NaN', wrapInString, t);

  // negative numbers
  check(Number.MIN_VALUE, `${Number.MIN_VALUE}`, wrapInString, t);
  check(Number.MIN_SAFE_INTEGER, `${Number.MIN_SAFE_INTEGER}`, wrapInString, t);
  check(-123.456, '-123.456', wrapInString, t);
  check(-1, '-1', wrapInString, t);

  // zero
  check(0, '0', wrapInString, t); // not sure if this should return blank for 0

  // positive numbers
  check(1, '1', wrapInString, t);
  check(123.456, '123.456', wrapInString, t);
  check(Number.MAX_SAFE_INTEGER, `${Number.MAX_SAFE_INTEGER}`, wrapInString, t);
  check(Number.MAX_VALUE, `${Number.MAX_VALUE}`, wrapInString, t);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, `${Number.MIN_VALUE}`, wrapInString, t);
  check(`${Number.MIN_SAFE_INTEGER}`, `${Number.MIN_SAFE_INTEGER}`, wrapInString, t);
  check('-123.456', '-123.456', wrapInString, t);
  check('-1', '-1', wrapInString, t);

  check('0', '0', wrapInString, t);

  check('1', '1', wrapInString, t);
  check('123.456', '123.456', wrapInString, t);
  check(`${Number.MAX_SAFE_INTEGER}`, `${Number.MAX_SAFE_INTEGER}`, wrapInString, t);
  check(`${Number.MAX_VALUE}`, `${Number.MAX_VALUE}`, wrapInString, t);

  // strings containing only whitespace
  check('', '', wrapInString, t);
  check(' ', ' ', wrapInString, t);
  check('\n', '\n', wrapInString, t);
  check('\r', '\r', wrapInString, t);
  check('\t', '\t', wrapInString, t);
  check('      ', '      ', wrapInString, t);
  check('  \n  ', '  \n  ', wrapInString, t);
  check('  \r  ', '  \r  ', wrapInString, t);
  check('  \t  ', '  \t  ', wrapInString, t);
  check(' \n \r \t \n \r \t ', ' \n \r \t \n \r \t ', wrapInString, t);

  // strings not containing numbers
  check('a', 'a', wrapInString, t);
  check('abc', 'abc', wrapInString, t);
  check('ABC', 'ABC', wrapInString, t);
}

function checkTrim(wrapInString, t) {
  function check(value, expected, wrapInString, t) {
    return checkEqual(Strings.trim, value, expected, wrapInString, ` must be ${stringify(expected, undefined)}`, t);
  }

  // undefined
  check(undefined, wrapInString ? "undefined" : undefined, wrapInString, t);

  // null
  check(null, wrapInString ? "null" : null, wrapInString, t);

  // objects
  check({}, wrapInString ? "[object Object]" : {}, wrapInString, t);
  check({a: 1, b: 2}, wrapInString ? "[object Object]" : {a: 1, b: 2}, wrapInString, t);

  // booleans
  check(true, wrapInString ? "true" : true, wrapInString, t);
  check(false, wrapInString ? "false" : false, wrapInString, t);

  // arrays
  check([], wrapInString ? "" : [], wrapInString, t);
  check([1, 2, 3], wrapInString ? "1,2,3" : [1, 2, 3], wrapInString, t);

  // special case numbers
  check(Number.POSITIVE_INFINITY, wrapInString ? `${Number.POSITIVE_INFINITY}` : Number.POSITIVE_INFINITY, wrapInString, t);
  check(Number.NEGATIVE_INFINITY, wrapInString ? `${Number.NEGATIVE_INFINITY}` : Number.NEGATIVE_INFINITY, wrapInString, t);
  check(NaN, wrapInString ? 'NaN' : NaN, wrapInString, t);

  // negative numbers
  check(Number.MIN_VALUE, wrapInString ? `${Number.MIN_VALUE}` : Number.MIN_VALUE, wrapInString, t);
  check(Number.MIN_SAFE_INTEGER, wrapInString ? `${Number.MIN_SAFE_INTEGER}` : Number.MIN_SAFE_INTEGER, wrapInString, t);
  check(-123.456, wrapInString ? '-123.456' : -123.456, wrapInString, t);
  check(-1, wrapInString ? '-1' : -1, wrapInString, t);

  // zero
  check(0, wrapInString ? '0' : 0, wrapInString, t); // not sure if this should return blank for 0

  // positive numbers
  check(1, wrapInString ? '1' : 1, wrapInString, t);
  check(123.456, wrapInString ? '123.456' : 123.456, wrapInString, t);
  check(Number.MAX_SAFE_INTEGER, wrapInString ? `${Number.MAX_SAFE_INTEGER}` : Number.MAX_SAFE_INTEGER, wrapInString, t);
  check(Number.MAX_VALUE, wrapInString ? `${Number.MAX_VALUE}` : Number.MAX_VALUE, wrapInString, t);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, `${Number.MIN_VALUE}`, wrapInString, t);
  check(`${Number.MIN_SAFE_INTEGER}`, `${Number.MIN_SAFE_INTEGER}`, wrapInString, t);
  check('-123.456', '-123.456', wrapInString, t);
  check('-1', '-1', wrapInString, t);

  check('0', '0', wrapInString, t);

  check('1', '1', wrapInString, t);
  check('123.456', '123.456', wrapInString, t);
  check(`${Number.MAX_SAFE_INTEGER}`, `${Number.MAX_SAFE_INTEGER}`, wrapInString, t);
  check(`${Number.MAX_VALUE}`, `${Number.MAX_VALUE}`, wrapInString, t);

  // strings containing only whitespace
  check('', '', wrapInString, t);
  check(' ', '', wrapInString, t);
  check('\n', '', wrapInString, t);
  check('\r', '', wrapInString, t);
  check('\t', '', wrapInString, t);
  check('      ', '', wrapInString, t);
  check('  \n  ', '', wrapInString, t);
  check('  \r  ', '', wrapInString, t);
  check('  \t  ', '', wrapInString, t);
  check(' \n \r \t \n \r \t ', '', wrapInString, t);

  // strings not containing numbers
  check('a', 'a', wrapInString, t);
  check('abc', 'abc', wrapInString, t);
  check('ABC', 'ABC', wrapInString, t);
  check('   ABC   ', 'ABC', wrapInString, t);
  check('  A B C  ', 'A B C', wrapInString, t);
}

function checkTrimOrEmpty(wrapInString, t) {
  function check(value, expected, wrapInString, t) {
    return checkEqual(Strings.trimOrEmpty, value, expected, wrapInString, ` must be ${stringify(expected, undefined)}`, t);
  }

  // undefined
  check(undefined, wrapInString ? "undefined" : '', wrapInString, t);

  // null
  check(null, wrapInString ? "null" : '', wrapInString, t);

  // objects
  check({}, wrapInString ? "[object Object]" : {}, wrapInString, t);
  check({a: 1, b: 2}, wrapInString ? "[object Object]" : {a: 1, b: 2}, wrapInString, t);

  // booleans
  check(true, wrapInString ? "true" : true, wrapInString, t);
  check(false, wrapInString ? "false" : false, wrapInString, t);

  // arrays
  check([], wrapInString ? "" : [], wrapInString, t);
  check([1, 2, 3], wrapInString ? "1,2,3" : [1, 2, 3], wrapInString, t);

  // special case numbers
  check(Number.POSITIVE_INFINITY, wrapInString ? `${Number.POSITIVE_INFINITY}` : Number.POSITIVE_INFINITY, wrapInString, t);
  check(Number.NEGATIVE_INFINITY, wrapInString ? `${Number.NEGATIVE_INFINITY}` : Number.NEGATIVE_INFINITY, wrapInString, t);
  check(NaN, wrapInString ? 'NaN' : NaN, wrapInString, t);

  // negative numbers
  check(Number.MIN_VALUE, wrapInString ? `${Number.MIN_VALUE}` : Number.MIN_VALUE, wrapInString, t);
  check(Number.MIN_SAFE_INTEGER, wrapInString ? `${Number.MIN_SAFE_INTEGER}` : Number.MIN_SAFE_INTEGER, wrapInString, t);
  check(-123.456, wrapInString ? '-123.456' : -123.456, wrapInString, t);
  check(-1, wrapInString ? '-1' : -1, wrapInString, t);

  // zero
  check(0, wrapInString ? '0' : 0, wrapInString, t); // not sure if this should return blank for 0

  // positive numbers
  check(1, wrapInString ? '1' : 1, wrapInString, t);
  check(123.456, wrapInString ? '123.456' : 123.456, wrapInString, t);
  check(Number.MAX_SAFE_INTEGER, wrapInString ? `${Number.MAX_SAFE_INTEGER}` : Number.MAX_SAFE_INTEGER, wrapInString, t);
  check(Number.MAX_VALUE, wrapInString ? `${Number.MAX_VALUE}` : Number.MAX_VALUE, wrapInString, t);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, `${Number.MIN_VALUE}`, wrapInString, t);
  check(`${Number.MIN_SAFE_INTEGER}`, `${Number.MIN_SAFE_INTEGER}`, wrapInString, t);
  check('-123.456', '-123.456', wrapInString, t);
  check('-1', '-1', wrapInString, t);

  check('0', '0', wrapInString, t);

  check('1', '1', wrapInString, t);
  check('123.456', '123.456', wrapInString, t);
  check(`${Number.MAX_SAFE_INTEGER}`, `${Number.MAX_SAFE_INTEGER}`, wrapInString, t);
  check(`${Number.MAX_VALUE}`, `${Number.MAX_VALUE}`, wrapInString, t);

  // strings containing only whitespace
  check('', '', wrapInString, t);
  check(' ', '', wrapInString, t);
  check('\n', '', wrapInString, t);
  check('\r', '', wrapInString, t);
  check('\t', '', wrapInString, t);
  check('      ', '', wrapInString, t);
  check('  \n  ', '', wrapInString, t);
  check('  \r  ', '', wrapInString, t);
  check('  \t  ', '', wrapInString, t);
  check(' \n \r \t \n \r \t ', '', wrapInString, t);

  // strings not containing numbers
  check('a', 'a', wrapInString, t);
  check('abc', 'abc', wrapInString, t);
  check('ABC', 'ABC', wrapInString, t);
  check('   ABC   ', 'ABC', wrapInString, t);
  check('  A B C  ', 'A B C', wrapInString, t);
}

test('isString on Strings', t => {
  checkIsStrings(true, t);
  t.end();
});

test('isString on strings', t => {
  checkIsStrings(false, t);
  t.end();
});

test('isBlank on Strings', t => {
  checkIsBlank(true, t);
  t.end();
});

test('isBlank on strings', t => {
  checkIsBlank(false, t);
  t.end();
});

test('isNotBlank on Strings', t => {
  checkIsNotBlank(true, t);
  t.end();
});

test('isNotBlank on strings', t => {
  checkIsNotBlank(false, t);
  t.end();
});

test('stringify on strings', t => {
  checkStringify(false, t);
  t.end();
});

test('stringify on Strings', t => {
  checkStringify(true, t);
  t.end();
});

test('trim on strings', t => {
  checkTrim(false, t);
  t.end();
});

test('trim on Strings', t => {
  checkTrim(true, t);
  t.end();
});

test('trimOrEmpty on strings', t => {
  checkTrimOrEmpty(false, t);
  t.end();
});

test('trimOrEmpty on Strings', t => {
  checkTrimOrEmpty(true, t);
  t.end();
});
