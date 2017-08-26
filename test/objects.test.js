'use strict';

/**
 * Unit tests for core-functions/strings.js
 * @author Byron du Preez
 */

const test = require('tape');

const Objects = require('../objects');
const toKeyValuePairs = Objects.toKeyValuePairs;
const getOwnPropertyNamesRecursively = Objects.getOwnPropertyNamesRecursively;
const getPropertyValueByCompoundName = Objects.getPropertyValueByCompoundName;
const hasOwnPropertyWithCompoundName = Objects.hasOwnPropertyWithCompoundName;

const strings = require('../strings');
const stringify = strings.stringify;

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
  // const skip = true;

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

// =====================================================================================================================
// getPropertyValueByCompoundName
// =====================================================================================================================

test('getPropertyValueByCompoundName', t => {
  t.equal(getPropertyValueByCompoundName(undefined, 'a.b.c'), undefined, `undefined.a.b.c must be undefined`);
  t.equal(getPropertyValueByCompoundName(null, 'a.b.c'), undefined, `null.a.b.c must be undefined`);
  t.equal(getPropertyValueByCompoundName({}, 'a.b.c'), undefined, `{}.a.b.c must be undefined`);
  t.equal(getPropertyValueByCompoundName([], 'a.b.c'), undefined, `[].a.b.c must be undefined`);

  const o = {a: 1, b: {c: 'c', d: {e: 'e'}}};
  t.deepEqual(getPropertyValueByCompoundName(o, 'a'), 1, 'o.a must be 1');
  t.deepEqual(getPropertyValueByCompoundName(o, 'b'), {c: 'c', d: {e: 'e'}}, `o.b must be {c: 'c', d: {e: 'e'}}`);
  t.deepEqual(getPropertyValueByCompoundName(o, 'b.c'), 'c', `o.b.c must be 'c'`);
  t.deepEqual(getPropertyValueByCompoundName(o, 'b.d'), {e: 'e'}, `o.b.d must be {e: 'e'}`);
  t.deepEqual(getPropertyValueByCompoundName(o, 'b.d.e'), 'e', `o.b.d.e must be 'e'`);
  t.deepEqual(getPropertyValueByCompoundName(o, 'x.y.z'), undefined, `o.x.y.z must be undefined`);
  t.end();
});

// =====================================================================================================================
// hasOwnPropertyWithCompoundName
// =====================================================================================================================

test('hasOwnPropertyWithCompoundName', t => {
  t.equal(hasOwnPropertyWithCompoundName(undefined, 'a.b.c'), false, `undefined.a.b.c must not exist`);
  t.equal(hasOwnPropertyWithCompoundName(null, 'a.b.c'), false, `null.a.b.c must not exist`);
  t.equal(hasOwnPropertyWithCompoundName({}, 'a.b.c'), false, `{}.a.b.c must not exist`);
  t.equal(hasOwnPropertyWithCompoundName([], 'a.b.c'), false, `[].a.b.c must not exist`);

  const o = {a: 1, b: {c: 'c', d: {e: 'e', n: null}, u: undefined}, u: undefined, n: null};
  t.equal(hasOwnPropertyWithCompoundName(o, 'a'), true, 'o.a must exist');
  t.equal(hasOwnPropertyWithCompoundName(o, 'b'), true, `o.b must exist`);
  t.equal(hasOwnPropertyWithCompoundName(o, 'b.c'), true, `o.b.c must exist`);
  t.equal(hasOwnPropertyWithCompoundName(o, 'b.d'), true, `o.b.d must exist`);
  t.equal(hasOwnPropertyWithCompoundName(o, 'b.d.e'), true, `o.b.d.e must exist`);
  t.equal(hasOwnPropertyWithCompoundName(o, 'x.y.z'), false, `o.x.y.z must not exist`);

  // properties containing undefined or null must still exist
  t.equal(hasOwnPropertyWithCompoundName(o, 'u'), true, 'o.u must exist');
  t.equal(hasOwnPropertyWithCompoundName(o, 'n'), true, 'o.n must exist');
  t.equal(hasOwnPropertyWithCompoundName(o, 'b.u'), true, 'o.b.u must exist');
  t.equal(hasOwnPropertyWithCompoundName(o, 'b.d.n'), true, 'o.b.d.n must exist');

  const p = Object.create(o);
  t.equal(hasOwnPropertyWithCompoundName(p, 'a'), false, 'p.a must not exist');
  t.equals(p.a, o.a, 'p.a must be o.a');

  t.end();
});
