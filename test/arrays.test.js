'use strict';

/**
 * Unit tests for core-functions/arrays.js
 * @author Byron du Preez
 */

const test = require('tape');

const Strings = require('../strings');
const stringify = Strings.stringify;

const Arrays = require('../arrays');
const distinct = Arrays.distinct;
const isDistinct = Arrays.isDistinct;
const isArrayOfType = Arrays.isArrayOfType;

const testing = require('./testing');
// const okNotOk = testing.okNotOk;
const checkOkNotOk = testing.checkOkNotOk;
// const checkMethodOkNotOk = testing.checkMethodOkNotOk;
// const equal = testing.equal;
const checkEqual = testing.checkEqual;
// const checkMethodEqual = testing.checkMethodEqual;

function wrap(value) {
  switch (typeof value) {
    case 'string': return new String(value);
    case 'number': return new Number(value);
    case 'boolean': return new Boolean(value);
    default: return value;
  }
}

test('isDistinct', t => {
  function check(array, expected) {
    checkOkNotOk(t, Arrays.isDistinct, [array], expected, 'must be distinct', 'must NOT be distinct');
  }
  // empty array
  check([], true, t);

  // arrays of strings
  check(['a'], true, t);
  check(['a', 'b'], true, t);
  check(['a', 'b', 'c'], true, t);
  check(['a', 'b', 'a'], false, t);
  check(['a', 'a', 'a'], false, t);

  // arrays of numbers
  check([1], true, t);
  check([1, 2], true, t);
  check([1, 2, 3], true, t);
  check([1, 2, 1], false, t);
  check([1, 1, 1], false, t);

  // arrays of objects
  const o1 = {a:1};
  const o2 = {a:1};
  const o3 = {a:1};
  check([o1], true, t);
  check([o1, o2], true, t);
  check([o1, o2, o3], true, t);
  check([o1, o2, o1], false, t);
  check([o1, o1, o1], false, t);

  t.end();
});

test('distinct', t => {
  function check(array, expected) {
    checkEqual(t, Arrays.distinct, [array], expected);
  }

  // empty array
  check([], []);

  // arrays of strings
  check(['a'], ['a']);
  check(['a', 'b'], ['a', 'b']);
  check(['a', 'b', 'c'], ['a', 'b', 'c']);
  check(['a', 'b', 'a'], ['a', 'b']);
  check(['a', 'a', 'a'], ['a']);

  // arrays of numbers
  check([1], [1]);
  check([1, 2], [1, 2]);
  check([1, 2, 3], [1, 2, 3]);
  check([1, 2, 1], [1, 2]);
  check([1, 1, 1], [1]);

  // arrays of objects
  const o1 = {a:1};
  const o2 = {a:1};
  const o3 = {a:1};
  check([o1], [o1]);
  check([o1, o2], [o1, o2]);
  check([o1, o2, o3], [o1, o2, o3]);
  check([o1, o2, o1], [o1, o2]);
  check([o1, o1, o1], [o1]);

  //TODO probably need a deep equals, since the above is only checking at a reference level (perhaps https://github.com/substack/node-deep-equal)

  t.end();
});

function checkIsArrayOfType(t, strict) {
  function check(array, type, expected) {
    checkOkNotOk(t, Arrays.isArrayOfType, [array, type, strict], expected, `must be an array of ${stringify(type)}`,
      `must NOT be an array of ${stringify(type)}`);
  }
  // empty array
  check([], "string", true);
  check([], "number", true);
  check([], Object, true);
  check([], String, true);
  check([], Number, true);
  check([], Error, true);

  // arrays of strings
  check(['a'], "string", true);
  check(['a', 'b'], "string", true);
  check(['a', 'b', 'c'], "string", true);
  check(['a', 'b', 'c'], String, !strict);
  check(['a', 'b', undefined], "string", false);
  check(['a', 'b', null], "string", false);
  check(['a', 'b', 1], "string", false);
  check(['a', 'b', true], "string", false);
  check(['a', 'a', {a:'a'}], "string", false);

  // arrays of Strings
  check([wrap('a')], String, true);
  check([wrap('a'), wrap('b')], String, true);
  check([wrap('a'), wrap('b'), wrap('c')], String, true);
  check([wrap('a'), wrap('b'), wrap('c')], "string", !strict);
  check([wrap('a'), wrap('b'), undefined], String, false);
  check([wrap('a'), wrap('b'), null], String, false);
  check([wrap('a'), wrap('b'), 1], String, false);
  check([wrap('a'), wrap('b'), true], String, false);
  check([wrap('a'), wrap('a'), {a:wrap('a')}], String, false);

  // arrays of both strings and Strings
  check(['a', wrap('b')], "string", !strict);
  check(['a', wrap('b')], String, !strict);

  // arrays of numbers
  check([1], "number", true);
  check([1, 2], "number", true);
  check([1, 2, 3], "number", true);
  check([1, 2, 3], Number, !strict);
  check([1, 2, undefined], "number", false);
  check([1, 2, null], "number", false);
  check([1, 2, '1'], "number", false);
  check([1, 1, {a:1}], "number", false);

  // arrays of Numbers
  check([wrap(1), wrap(2), wrap(3)], Number, true);
  check([wrap(1), wrap(2), wrap(3)], "number", !strict);

  // arrays of both numbers and Numbers
  check([1, wrap(2)], "number", !strict);
  check([1, wrap(2)], Number, !strict);

  // arrays of booleans
  check([true], "boolean", true);
  check([true, false], "boolean", true);
  check([true, false, true], "boolean", true);
  check([true, false, true], Boolean, !strict);
  check([true, false, undefined], "boolean", false);
  check([true, false, null], "boolean", false);
  check([true, false, 'true'], "boolean", false);
  check([true, true, {a:true}], "boolean", false);

  // arrays of Booleans
  check([wrap(true)], Boolean, true);
  check([wrap(true), wrap(false)], Boolean, true);
  check([wrap(true), wrap(false), wrap(true)], Boolean, true);
  check([wrap(true), wrap(false), wrap(true)], "boolean", !strict);
  check([wrap(true), wrap(false), undefined], Boolean, false);
  check([wrap(true), wrap(false), null], Boolean, false);
  check([wrap(true), wrap(false), 'true'], Boolean, false);
  check([wrap(true), wrap(true), {a:wrap(true)}], Boolean, false);

  // arrays of both booleans and Booleans
  check([true, wrap(false)], "boolean", !strict);
  check([true, wrap(false)], Boolean, !strict);

  // arrays of objects
  const o1 = {a:1};
  const o2 = {a:1};
  const o3 = {a:1};
  check([o1], Object, true);
  check([o1, o2], Object, true);
  check([o1, o2, o3], Object, true);
  check([o1, o2, undefined], Object, false);
  check([o1, o2, null], Object, false);
  check([o1, o2, 1], Object, false);
  check([o1, o1, 'a'], Object, false);

  // arrays of Errors
  const e1 = new Error('A');
  const e2 = new Error('B');
  const e3 = new Error('C');
  check([e1], Error, true);
  check([e1, e2], Error, true);
  check([e1, e2, e3], Error, true);
  check([e1, e2, undefined], Error, false);
  check([e1, e2, null], Error, false);
  check([e1, e2, o1], Error, false);
  check([e1, o1, o2], Error, false);
}

test('isArrayOfType with strict', t => {
  checkIsArrayOfType(t, true);
  t.end();
});

test('isArrayOfType with non-strict', t => {
  checkIsArrayOfType(t, true);
  t.end();
});

