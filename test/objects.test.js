'use strict';

/**
 * Unit tests for core-functions/strings.js
 * @author Byron du Preez
 */

const test = require('tape');

const Objects = require('../objects');
const valueOf = Objects.valueOf;
const toKeyValuePairs = Objects.toKeyValuePairs;
const getOwnPropertyNamesRecursively = Objects.getOwnPropertyNamesRecursively;

const strings = require('../strings');
const stringify = strings.stringify;

// =====================================================================================================================
// valueOf
// =====================================================================================================================

test('valueOf', t => {
  function check(value, expected) {
    return t.deepEqual(Objects.valueOf(value), expected, `Objects.valueOf(${stringify(value)}) must be ${stringify(expected)}`);
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

// =====================================================================================================================
// toKeyValuePairs
// =====================================================================================================================

test('toKeyValuePairs', t => {
  // Applied to non-objects
  let expected = [];
  t.deepEqual(toKeyValuePairs(undefined), expected, `toKeyValuePairs(undefined) must be ${stringify(expected)}`);
  t.deepEqual(toKeyValuePairs(null), expected, `toKeyValuePairs(null) must be ${stringify(expected)}`);
  t.deepEqual(toKeyValuePairs('abc'), expected, `toKeyValuePairs('abc') must be ${stringify(expected)}`);
  t.deepEqual(toKeyValuePairs(123), expected, `toKeyValuePairs(123) must be ${stringify(expected)}`);

  // Applied to objects
  expected = [];
  t.deepEqual(toKeyValuePairs({}), expected, `toKeyValuePairs({}) must be ${stringify(expected)}`);

  expected = [['a', 1], ['b', {c:2}], ['d', '3']];
  t.deepEqual(toKeyValuePairs({a:1, b:{c:2}, d:'3'}), expected, `toKeyValuePairs({a:1, b:{c:2}, d:'3'}) must be ${stringify(expected)}`);

  expected = [['d', '3'], ['b', {c:2}], ['a', 1]];
  t.deepEqual(toKeyValuePairs({d:'3', b:{c:2}, a:1}), expected, `toKeyValuePairs({d:'3', b:{c:2}, a:1}) must be ${stringify(expected)}`);

  // Not meant to be applied to arrays, but if so ...
  expected = [['length', 0]];
  t.deepEqual(toKeyValuePairs([]), expected, `toKeyValuePairs([]) must be ${stringify(expected)}`);
  expected = [['0', '1'], ['1', 2], ['2', '3'], ['length', 3]];
  t.deepEqual(toKeyValuePairs(['1', 2, '3']), expected, `toKeyValuePairs(['1', 2, '3']) must be ${stringify(expected)}`);

  expected = [['0', '3'], ['1', 2], ['2', '1'], ['length', 3]];
  t.deepEqual(toKeyValuePairs(['3',2,'1']), expected, `toKeyValuePairs(['3',2,'1']) must be ${stringify(expected)}`);

  t.end();
});

test('getOwnPropertyNamesRecursively', t => {
  // const skip = true;
  t.deepEqual(getOwnPropertyNamesRecursively(undefined), [], `getOwnPropertyNamesRecursively(undefined) must be []`);
  t.deepEqual(getOwnPropertyNamesRecursively(null), [], `getOwnPropertyNamesRecursively(null) must be []`);
  t.deepEqual(getOwnPropertyNamesRecursively(123), [], `getOwnPropertyNamesRecursively(123) must be []`);
  t.deepEqual(getOwnPropertyNamesRecursively("Abc"), [], `getOwnPropertyNamesRecursively("Abc") must be []`);

  t.deepEqual(getOwnPropertyNamesRecursively({a:1}), ['a'], `getOwnPropertyNamesRecursively({a:1}) must be ['a']`);
  t.deepEqual(getOwnPropertyNamesRecursively({a:1, b:2, c:3}), ['a', 'b', 'c'], `getOwnPropertyNamesRecursively({a:1, b:2, c:3}) must be ['a, 'b', 'c']`);
  t.deepEqual(getOwnPropertyNamesRecursively({a: {b:2}, c:3}), ['a', 'a.b', 'c'], `getOwnPropertyNamesRecursively({a: {b:2}, c:3}) must be ['a, 'a.b', 'c']`);

  const expected1 = ['a', 'a.b', 'a.b.c', 'a.b.d', 'a.b.d.e', 'a.b.d.f', 'a.b.d.f.g', 'a.b.d.f.g[0].h', 'a.b.d.f.g[1].i'];
  const o1 = {a: {b: {c: 1, d: {e: 2, f: {g: [{h: 3}, {i: 4}]}}}}};
  t.deepEqual(getOwnPropertyNamesRecursively(o1), expected1, `getOwnPropertyNamesRecursively({a: {b: {c: 1, d: {e: 2, f: {g: [{h: 3}, {i: 4}]}}}}}) must be [${JSON.stringify(expected1)}]`);

  const expected2 = ['a', 'a.b', 'a.b.c', 'a.b.d', 'a.b.d.e', 'a.b.d.f', 'a.b.d.f.g', 'a.b.d.f.g[0].h', 'a.b.d.f.g[1].i'];
  const o2 = {a: {b: {c: 1, d: {e: 2, f: {g: [{h: 3}, {i: 4}]}}}}};
  t.deepEqual(getOwnPropertyNamesRecursively(o2), expected2, `getOwnPropertyNamesRecursively({a: {b: {c: 1, d: {e: 2, f: {g: [{h: 3}, {i: 4}]}}}}}) must be [${JSON.stringify(expected2)}]`);

  // Test handling of circular reference
  const o3 = {a: {b: {c: 1, d: {e: 2, f: {g: [{h: 3}, {i: 4}]}}}}};
  o3.a.thisAgain = o3;
  o3.thisAgain = o3;
  const expected3 = ['a', 'a.b', 'a.b.c', 'a.b.d', 'a.b.d.e', 'a.b.d.f', 'a.b.d.f.g', 'a.b.d.f.g[0].h', 'a.b.d.f.g[1].i', 'a.thisAgain', 'thisAgain'];
  t.deepEqual(getOwnPropertyNamesRecursively(o3), expected3, `getOwnPropertyNamesRecursively({a: {b: {c: 1, d: {e: 2, f: {g: [{h: 3}, {i: 4}]}}}}}) must be [${JSON.stringify(expected3)}]`);

  // Test handling of circular reference
  const o4 = {a: {b: {c: 1, d: {e: 2, f: {g: [{h: 3}, {i: 4}]}}}}};
  o4.a.thisAgain = o4;
  o4.thisAgain = o4;
  const expected4 = ['a', 'a.b', 'a.b.c', 'a.b.d', 'a.b.d.e', 'a.b.d.f', 'a.b.d.f.g', 'a.b.d.f.g[0].h', 'a.b.d.f.g[1].i', 'a.thisAgain', 'thisAgain'];
  t.deepEqual(getOwnPropertyNamesRecursively(o4), expected4, `getOwnPropertyNamesRecursively({a: {b: {c: 1, d: {e: 2, f: {g: [{h: 3}, {i: 4}]}}}}}) must be [${JSON.stringify(expected4)}]`);

  t.end();
});

test(`getOwnPropertyNamesRecursively with onlyEnumerable`, t => {
  const onlyE = true;
  const skip = true;

  const o1 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  Object.defineProperty(o1, 'b', {enumerable: false});
  Object.defineProperty(o1.c, 'd', {enumerable: false});
  Object.defineProperty(o1.c.e, 'f', {enumerable: false});
  Object.defineProperty(o1.c.e, 'h', {enumerable: false});
  Object.defineProperty(o1, 'i', {enumerable: false});
  Object.defineProperty(o1.i, 'k', {enumerable: false});

  let x1 = ['a', 'b', 'c', 'c.d', 'c.e', 'c.e.f', 'c.e.f.g', 'c.e.h', 'i', 'i.j', 'i.k'];
  t.deepEqual(getOwnPropertyNamesRecursively(o1, {onlyEnumerable: !onlyE}), x1, `getOwnPropertyNamesRecursively(o1, {!onlyE, !skip}) must be ${stringify(x1)}`);
  t.deepEqual(getOwnPropertyNamesRecursively(o1, {onlyEnumerable: !onlyE}), x1, `getOwnPropertyNamesRecursively(o1, {!onlyE, skip}) must be ${stringify(x1)}`);
  x1 = ['a', 'c', 'c.e'];
  t.deepEqual(getOwnPropertyNamesRecursively(o1, {onlyEnumerable: onlyE}), x1, `getOwnPropertyNamesRecursively(o1, {onlyE, !skip}) must be ${stringify(x1)}`);
  t.deepEqual(getOwnPropertyNamesRecursively(o1, {onlyEnumerable: onlyE}), x1, `getOwnPropertyNamesRecursively(o1, {onlyE, skip}) must be ${stringify(x1)}`);

  const o2 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  Object.defineProperty(o2, 'a', {enumerable: false});
  Object.defineProperty(o2, 'c', {enumerable: false});
  Object.defineProperty(o2.c, 'e', {enumerable: false});
  Object.defineProperty(o2.c.e.f, 'g', {enumerable: false});
  Object.defineProperty(o2.i, 'j', {enumerable: false});

  let x2 = ['a', 'b', 'c', 'c.d', 'c.e', 'c.e.f', 'c.e.f.g', 'c.e.h', 'i', 'i.j', 'i.k'];
  t.deepEqual(getOwnPropertyNamesRecursively(o2, {onlyEnumerable: !onlyE}), x2, `getOwnPropertyNamesRecursively(o2, {!onlyE, !skip}) must be ${stringify(x2)}`);
  x2 = ['b', 'i', 'i.k'];
  t.deepEqual(getOwnPropertyNamesRecursively(o2, {onlyEnumerable: onlyE}), x2, `getOwnPropertyNamesRecursively(o2, {onlyE, !skip}) must be ${stringify(x2)}`);

  t.end();
});

test('getPropertyValueByCompoundName', t => {
  t.equal(Objects.getPropertyValueByCompoundName(undefined, 'a.b.c'), undefined, `undefined.a.b.c must be undefined`);
  t.equal(Objects.getPropertyValueByCompoundName(null, 'a.b.c'), undefined, `null.a.b.c must be undefined`);
  t.equal(Objects.getPropertyValueByCompoundName({}, 'a.b.c'), undefined, `{}.a.b.c must be undefined`);
  t.equal(Objects.getPropertyValueByCompoundName([], 'a.b.c'), undefined, `[].a.b.c must be undefined`);

  const o = {a: 1, b: {c: 'c', d: {e: 'e'}}};
  t.deepEqual(Objects.getPropertyValueByCompoundName(o, 'a'), 1, 'o.a must be 1');
  t.deepEqual(Objects.getPropertyValueByCompoundName(o, 'b'), {c: 'c', d: {e: 'e'}}, `o.b must be {c: 'c', d: {e: 'e'}}`);
  t.deepEqual(Objects.getPropertyValueByCompoundName(o, 'b.c'), 'c', `o.b.c must be 'c'`);
  t.deepEqual(Objects.getPropertyValueByCompoundName(o, 'b.d'), {e: 'e'}, `o.b.d must be {e: 'e'}`);
  t.deepEqual(Objects.getPropertyValueByCompoundName(o, 'b.d.e'), 'e', `o.b.d.e must be 'e'`);
  t.deepEqual(Objects.getPropertyValueByCompoundName(o, 'x.y.z'), undefined, `o.x.y.z must be undefined`);
  t.end();
});

