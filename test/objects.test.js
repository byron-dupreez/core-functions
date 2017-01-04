'use strict';

/**
 * Unit tests for core-functions/strings.js
 * @author Byron du Preez
 */

const test = require('tape');

const Objects = require('../objects');
const valueOf = Objects.valueOf;

const strings = require('../strings');
const stringify = strings.stringify;

const testing = require('./testing');
// const okNotOk = testing.okNotOk;
// const checkOkNotOk = testing.checkOkNotOk;
// const checkMethodOkNotOk = testing.checkMethodOkNotOk;
// const equal = testing.equal;
const checkEqual = testing.checkEqual;
// const checkMethodEqual = testing.checkMethodEqual;

test('valueOf', t => {
  function check(value, expected) {
    return checkEqual(t, Objects.valueOf, [value], expected, false);
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

test('merge', t => {
  // merge into empty object
  const from = {a: 1, b: '2', c: {d: 3, e: '4'}};
  t.deepEqual(Objects.merge(from, {}), from, 'merge({}) must have all of from');

  // merge from empty object
  const to0 = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}};
  const to0Orig = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}};
  t.deepEqual(Objects.merge({}, to0), to0Orig, 'merge with from empty must have all of original to0');

  // shallow merge without replace (all same properties)
  const to1 = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}};
  const to1Orig = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}};
  t.deepEqual(Objects.merge(from, to1), to1Orig, 'shallow merge without replace must still be original to');

  // shallow merge with replace (all same properties)
  const merge1 = Objects.merge(from, to1, true);
  t.notDeepEqual(merge1, {a: 2, b: '3', c: {d: 4, e: '5', f: 6}}, 'shallow merge with replace must not be original to');
  t.deepEqual(merge1, from, 'shallow merge with replace must have all of from');

  // shallow merge without replace (with to properties not in from)
  const to2 = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}, z: 'ZZZ'};
  const to2Orig = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}, z: 'ZZZ'};
  t.deepEqual(Objects.merge(from, to2), to2Orig, 'shallow merge without replace must still be original to2');

  // shallow merge with replace (with to properties not in from)
  const merge2 = Objects.merge(from, to2, true);
  t.notDeepEqual(merge2, to2Orig, 'shallow merge with replace must not be original to2');
  t.notDeepEqual(merge2, from, 'shallow merge with replace must not be from');
  t.deepEqual(merge2, {
    a: 1,
    b: '2',
    c: {d: 3, e: '4'},
    z: 'ZZZ'
  }, 'shallow merge with replace must have all of from + only top-level extra original to2 properties');

  // deep must preserve inner extras
  const to3 = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}, z: 'ZZZ'};
  t.deepEqual(Objects.merge(from, to3, true, true), {
    a: 1,
    b: '2',
    c: {d: 3, e: '4', f: 6},
    z: 'ZZZ'
  }, 'deep merge with replace must have all of from + all extra original to2 properties');

  // deep without replace must NOT replace any matching properties
  const to4 = {a: 2, c: {e: '5', f: 6, y: 'Y'}, x: 'X', z: 'ZZZ'};
  const to4Orig = {a: 2, b: '2', c: {d: 3, e: '5', f: 6, y: 'Y'}, x: 'X', z: 'ZZZ'};
  t.deepEqual(Objects.merge(from, to4, false, true), to4Orig, 'deep merge without replace must have all of to4 and only extras of from');

  // check that functions get merged in too
  function a1() {
  }

  function a2() {
  }

  function b() {
  }

  function c() {
  }

  const from5 = {a: a2, b: b, c: c, z: 'Z2'};
  const to5 = {a: a1, z: 'Z1'};
  const expected5 = {a: a1, b: b, c: c, z: 'Z1'};
  t.deepEqual(Objects.merge(from5, to5, false, false), expected5, 'deep merge without replace must have all functions of to5 and only extra functions of from5');
  t.equal(to5.a, a1, 'to5.a must be function a1');
  t.equal(to5.b, b, 'to5.b must be function b');
  t.equal(to5.c, c, 'to5.c must be function c');
  t.equal(to5.z, 'Z1', 'to5.z must be Z1');

  function x() {
  }

  const to6 = {a: a1, x: x, y: 'y1', z: 'Z1'};
  const expected6 = {a: a2, b: b, c: c, x: x, y: 'y1', z: 'Z2'};
  t.deepEqual(Objects.merge(from5, to6, true, false), expected6, 'deep merge with replace must have all functions of from5 and only extra functions of to6');
  t.equal(to6.a, a2, 'to6.a must be function a2');
  t.equal(to6.x, x, 'to6.x must be function x');
  t.equal(to6.z, 'Z2', 'to5.z must be Z2');

  const from7 = {a: a2, b: b, c: c, z: 'Z2'};
  const to7 = {a: a1, x: x, y: 'y1', z: 'Z1'};
  const expected7 = {a: a2, b: b, c: c, x: x, y: 'y1', z: 'Z2'};
  t.deepEqual(Objects.merge(from7, to7, true, true), expected7, 'deep merge with replace must have all functions of from7 and only extra functions of to7');

  function d() {
  }

  const from8 = {o: {a: a2, b: b}, c: c, z: 'Z2'};
  const to8 = {o: {a: a1, x: x, y: 'y1'}, d: d, z: 'Z1'};
  const expected8 = {o: {a: a1, b: b, x: x, y: 'y1'}, c: c, d: d, z: 'Z1'};
  t.deepEqual(Objects.merge(from8, to8, false, true), expected8, 'deep merge without replace must have all functions of to8 and only extra functions of from8');

  const from9 = {o: {a: a2, b: b}, c: c, z: 'Z2'};
  const to9 = {o: {a: a1, x: x, y: 'y1'}, d: d, z: 'Z1'};
  const expected9 = {o: {a: a2, b: b, x: x, y: 'y1'}, c: c, d: d, z: 'Z2'};
  t.deepEqual(Objects.merge(from9, to9, true, true), expected9, 'deep merge with replace must have all functions of from9 and only extra functions of to9');

  const from10 = {o: {a: a2, b: b}, c: c, z: 'Z2'};
  const to10 = {o: {a: a1, x: x, y: 'y1'}, d: d, z: 'Z1'};
  const expected10 = {o: {a: a2, b: b}, c: c, d: d, z: 'Z2'};
  t.deepEqual(Objects.merge(from10, to10, true, false), expected10, 'shallow merge with replace must have all of from10 and only extra top-level properties of to10');

  const from11 = {o: {a: a2, b: b}, c: c, z: 'Z2'};
  const to11 = {o: {a: a1, x: x, y: 'y1'}, d: d, z: 'Z1'};
  const expected11 = {o: {a: a1, x: x, y: 'y1'}, c: c, d: d, z: 'Z1'};
  t.deepEqual(Objects.merge(from11, to11, false, false), expected11, 'shallow merge with replace must have all of to11 and only extra top-level properties of from11');

  // Create infinite loops (non-DAGs)
  const o3 = {o: {a: a1, x: 'X', p: {b: b, y: 'Y'}}, c: c, z: 'Z'};
  o3.o.o3Again = o3;
  o3.o.p.o3Again = o3;

  const c3 = {o: {a: a2, x: 'X2', p: {b: b, y: 'Y2'}}, c: c, z: 'Z2'};
  c3.o.o3Again = c3;
  c3.o.p.o3Again = c3;

  Objects.merge(o3, c3, false, true);
  //EEK t.deepEqual fails with "Maximum call stack size exceeded"
  //t.deepEqual(c3, o3, 'deep copy must be deep equal to o3');
  t.deepEqual(Object.getOwnPropertyNames(c3).sort(), Object.getOwnPropertyNames(o3).sort(), 'deep merge circular - c3 must have same names as o3');
  t.deepEqual(Object.getOwnPropertyNames(c3.o).sort(), Object.getOwnPropertyNames(o3.o).sort(), 'deep merge circular - c3.o must have same names as o3.o');
  t.deepEqual(Object.getOwnPropertyNames(c3.o.p).sort(), Object.getOwnPropertyNames(o3.o.p).sort(), 'deep merge circular - c3.o.p must have same names as o3.o.p');
  t.notEqual(c3, o3, 'deep merge circular - c3 must not be o3');
  t.notEqual(c3.o, o3.o, 'deep merge circular - c3.o must not be o3.o');
  t.notEqual(c3.o.p, o3.o.p, 'deep merge circular - c3.o.p must not be o3.o.p');
  t.equal(c3, c3.o.o3Again, 'deep merge circular - c3 must be c3.o.o3Again');
  t.equal(c3, c3.o.p.o3Again, 'deep merge circular - c3 must be c3.o.p.o3Again');

  t.end();
});

test('copy', t => {
  function a() {
  }

  function b() {
  }

  function c() {
  }

  //function d() {}

  const o1 = {o: {a: a, x: 'X', p: {b: b, y: 'Y'}}, c: c, z: 'Z'};
  const c1 = Objects.copy(o1, false);
  t.deepEqual(c1, o1, 'shallow copy circular - c1 must be deep equal to o1');
  t.notEqual(c1, o1, 'shallow copy circular - c1 must not be o1');
  t.equal(c1.o, o1.o, 'shallow copy circular - c1.o must be o1.o');
  t.equal(c1.o.p, o1.o.p, 'shallow copy circular - c1.o.p must be o1.o.p');

  const o2 = {o: {a: a, x: 'X', p: {b: b, y: 'Y'}}, c: c, z: 'Z'};
  const c2 = Objects.copy(o2, true);
  t.deepEqual(c2, o2, 'deep copy circular - c2 must be deep equal to o2');
  t.notEqual(c2, o2, 'deep copy circular - c2 must not be o2');
  t.notEqual(c2.o, o2.o, 'deep copy circular - c2.o must not be o2.o');
  t.notEqual(c2.o.p, o2.o.p, 'deep copy circular - c2.o.p must not be o2.o.p');

  // Create infinite loops (non-DAGs)
  const o3 = {o: {a: a, x: 'X', p: {b: b, y: 'Y'}}, c: c, z: 'Z'};
  o3.o.o3Again = o3;
  o3.o.p.o3Again = o3;
  const c3 = Objects.copy(o3, true);
  //EEK t.deepEqual fails with "Maximum call stack size exceeded"
  //t.deepEqual(c3, o3, 'deep copy must be deep equal to o3');
  t.deepEqual(Object.getOwnPropertyNames(c3), Object.getOwnPropertyNames(o3), 'deep copy circular - c3 must have same names as o3');
  t.deepEqual(Object.getOwnPropertyNames(c3.o), Object.getOwnPropertyNames(o3.o), 'deep copy circular - c3.o must have same names as o3.o');
  t.deepEqual(Object.getOwnPropertyNames(c3.o.p), Object.getOwnPropertyNames(o3.o.p), 'deep copy circular - c3.o.p must have same names as o3.o.p');
  t.notEqual(c3, o3, 'deep copy circular - c3 must not be o3');
  t.notEqual(c3.o, o3.o, 'deep copy circular - c3.o must not be o3.o');
  t.notEqual(c3.o.p, o3.o.p, 'deep copy circular - c3.o.p must not be o3.o.p');
  t.equal(c3, c3.o.o3Again, 'deep copy circular - c3 must be c3.o.o3Again');
  t.equal(c3, c3.o.p.o3Again, 'deep copy circular - c3 must be c3.o.p.o3Again');

  t.end();
});

// =====================================================================================================================
// copy arrays
// =====================================================================================================================

test('copy arrays', t => {
  // Shallow copy of empty array
  const a0 = [];
  const c0 = Objects.copy(a0, false);
  t.ok(Array.isArray(c0), `shallow copy ${stringify(c0)} must be an array`);
  t.notEqual(c0, a0, `shallow copy ${stringify(c0)} must not be same instance`);
  t.deepEqual(c0, a0, `shallow copy ${stringify(c0)} must be deep equal`);

  // Deep copy of empty array
  const a1 = [];
  const c1 = Objects.copy(a1, true);
  t.ok(Array.isArray(c1), `deep copy ${stringify(c1)} must be an array`);
  t.notEqual(c1, a1, `deep copy ${stringify(c1)} must NOT be same instance`);
  t.deepEqual(c1, a1, `deep copy ${stringify(c1)} must be deep equal`);

  // Shallow copy of complex array
  const a2 = [1, 2, "3", undefined, null, {a: 1}, [4, 5, "6", null, undefined, {b: 2, c: [7]}]];
  const c2 = Objects.copy(a2, false);

  t.ok(Array.isArray(c2), `shallow copy ${stringify(c2)} must be an array`);
  t.equal(c2.length, a2.length, `shallow copy ${stringify(c2)} lengths must be same`);
  t.notEqual(c2, a2, `shallow copy ${stringify(c2)} must NOT be same instance`);
  t.deepEqual(c2, a2, `shallow copy ${stringify(c2)} must be deep equal`);
  for (let i = 0; i < a2.length; ++i) {
    t.equal(c2[i], a2[i], `shallow copy [${i}] ${stringify(c2[i])} must be equal`);
    t.deepEqual(c2[i], a2[i], `shallow copy [${i}] ${stringify(c2[i])} must be deep equal`);
  }

  // Deep copy of complex array
  const a3 = [1, 2, "3", undefined, null, {a: 1}, [4, 5, "6", null, undefined, {b: 2, c: [7]}]];
  const c3 = Objects.copy(a3, true);

  t.ok(Array.isArray(c3), `deep copy ${stringify(c3)} must be an array`);
  t.equal(c3.length, a3.length, `deep copy ${stringify(c3)} lengths must be same`);
  t.notEqual(c3, a3, `deep copy ${stringify(c3)} must NOT be same instance`);
  t.deepEqual(c3, a3, `deep copy ${stringify(c3)} must be deep equal`);
  for (let i = 0; i < a3.length; ++i) {
    if (a3[i] && typeof a3[i] === 'object')
      t.notEqual(c3[i], a3[i], `deep copy [${i}] ${stringify(c3[i])} must NOT be same instance`);
    else
      t.equal(c3[i], a3[i], `deep copy [${i}] ${stringify(c3[i])} must be equal`);

    t.deepEqual(c3[i], a3[i], `deep copy [${i}] ${stringify(c3[i])} must be deep equal`);
  }

  t.end();
});

// =====================================================================================================================
// copy objects with arrays
// =====================================================================================================================

test('copy objects with arrays', t => {
  // Shallow copy of object with empty array
  const a0 = {a: []};
  const c0 = Objects.copy(a0, false);
  t.ok(!Array.isArray(c0), `shallow copy ${stringify(c0)} must NOT be an array`);
  t.notEqual(c0, a0, `shallow copy ${stringify(c0)} must not be same instance`);
  t.deepEqual(c0, a0, `shallow copy ${stringify(c0)} must be deep equal`);

  // Deep copy of empty array
  const a1 = {a: []};
  const c1 = Objects.copy(a1, true);
  t.ok(!Array.isArray(c1), `deep copy ${stringify(c1)} must NOT be an array`);
  t.notEqual(c1, a1, `deep copy ${stringify(c1)} must NOT be same instance`);
  t.deepEqual(c1, a1, `deep copy ${stringify(c1)} must be deep equal`);

  // Shallow copy of complex array
  const a2 = {a: [1, 2, "3", undefined, null, {a: 1}, [4, 5, "6", null, undefined, {b: 2, c: [7]}]]};
  const c2 = Objects.copy(a2, false);

  t.ok(!Array.isArray(c2), `shallow copy ${stringify(c2)} must NOT be an array`);
  t.notEqual(c2, a2, `shallow copy ${stringify(c2)} must NOT be same instance`);
  t.deepEqual(c2, a2, `shallow copy ${stringify(c2)} must be deep equal`);
  for (let i = 0; i < a2.length; ++i) {
    t.equal(c2[i], a2[i], `shallow copy [${i}] ${stringify(c2[i])} must be equal`);
    t.deepEqual(c2[i], a2[i], `shallow copy [${i}] ${stringify(c2[i])} must be deep equal`);
  }

  // Deep copy of complex array
  const a3 = {a: [1, 2, "3", undefined, null, {a: 1}, [4, 5, "6", null, undefined, {b: 2, c: [7]}]]};
  const c3 = Objects.copy(a3, true);

  t.ok(!Array.isArray(c3), `deep copy ${stringify(c3)} must NOT be an array`);
  t.notEqual(c3, a3, `deep copy ${stringify(c3)} must NOT be same instance`);
  t.deepEqual(c3, a3, `deep copy ${stringify(c3)} must be deep equal`);
  for (let n of Object.getOwnPropertyNames(a3)) {
    if (a3[n] && typeof a3[n] === 'object')
      t.notEqual(c3[n], a3[n], `deep copy [${n}] ${stringify(c3[n])} must NOT be same instance`);
    else
      t.equal(c3[n], a3[n], `deep copy [${n}] ${stringify(c3[n])} must be equal`);

    t.deepEqual(c3[n], a3[n], `deep copy [${n}] ${stringify(c3[n])} must be deep equal`);
  }

  t.end();
});

// =====================================================================================================================
// merge arrays
// =====================================================================================================================
test('merge empty arrays', t => {
  // Shallow merge of empty array
  const a0 = [];
  const b0 = [];
  const c0 = Objects.merge(a0, b0, false, false);
  t.ok(Array.isArray(c0), `shallow merge ${stringify(c0)} must be an array`);
  t.notEqual(c0, a0, `shallow merge ${stringify(c0)} must not be same instance`);
  t.deepEqual(c0, a0, `shallow merge ${stringify(c0)} must be deep equal`);

  // Deep merge of empty array
  const a1 = [];
  const b1 = [];
  const c1 = Objects.merge(a1, b1, false, true);
  t.ok(Array.isArray(c1), `deep merge ${stringify(c1)} must be an array`);
  t.notEqual(c1, a1, `deep merge ${stringify(c1)} must NOT be same instance`);
  t.deepEqual(c1, a1, `deep merge ${stringify(c1)} must be deep equal`);

  t.end();
});

test('merge simple arrays to empty arrays', t => {
  // Shallow merge of simple array to empty
  const a0 = [1, 2, 3];
  const b0 = [];
  const c0 = Objects.merge(a0, b0, false, false);
  t.ok(Array.isArray(c0), `shallow merge ${stringify(c0)} must be an array`);
  t.notEqual(c0, a0, `shallow merge ${stringify(c0)} must not be same instance`);
  t.deepEqual(c0, a0, `shallow merge ${stringify(c0)} must be deep equal`);

  // Deep merge of empty array
  const a1 = [1, 2, 3];
  const b1 = [];
  const c1 = Objects.merge(a1, b1, false, true);
  t.ok(Array.isArray(c1), `deep merge ${stringify(c1)} must be an array`);
  t.notEqual(c1, a1, `deep merge ${stringify(c1)} must NOT be same instance`);
  t.deepEqual(c1, a1, `deep merge ${stringify(c1)} must be deep equal`);

  t.end();
});

test('merge empty arrays to simple arrays', t => {
  // Shallow merge of simple array to empty
  const a0 = [];
  const b0 = [1, 2, 3];
  const x0 = [1, 2, 3];
  Objects.merge(a0, b0, false, false);
  t.ok(Array.isArray(b0), `shallow merge ${stringify(b0)} must be an array`);
  t.notEqual(b0, a0, `shallow merge ${stringify(b0)} must not be same instance`);
  t.deepEqual(b0, x0, `shallow merge ${stringify(b0)} must be deep equal`);

  // Deep merge of empty array
  const a1 = [];
  const b1 = ["1", 2, "3"];
  const x1 = ["1", 2, "3"];
  const c1 = Objects.merge(a1, b1, false, true);
  t.ok(Array.isArray(c1), `deep merge ${stringify(c1)} must be an array`);
  t.notEqual(c1, a1, `deep merge ${stringify(c1)} must NOT be same instance`);
  t.deepEqual(c1, x1, `deep merge ${stringify(c1)} must be deep equal`);

  t.end();
});

test('merge simple arrays to shorter arrays', t => {
  // Shallow merge without replace
  const a0 = ["1", 2, "3", 4.0];
  const b0 = [9, "8"];
  const x0 = [9, "8", "3", 4.0];
  Objects.merge(a0, b0, false, false);
  t.ok(Array.isArray(b0), `shallow merge ${stringify(b0)} must be an array`);
  t.notEqual(b0, a0, `shallow merge ${stringify(b0)} must not be same instance`);
  t.deepEqual(b0, x0, `shallow merge ${stringify(b0)} must be deep equal`);

  // Shallow merge with replace
  const a1 = ["1", 2, "3", 4.0];
  const b1 = [9, "8"];
  const x1 = ["1", 2, "3", 4.0];
  Objects.merge(a1, b1, true, false);
  t.ok(Array.isArray(b1), `deep merge ${stringify(b1)} must be an array`);
  t.notEqual(b1, a1, `deep merge ${stringify(b1)} must NOT be same instance`);
  t.deepEqual(b1, x1, `deep merge ${stringify(b1)} must be deep equal`);

  // Deep merge without replace
  const a2 = [1, 2, 3, 4.0];
  const b2 = ["9", 8];
  const x2 = ["9", 8, 3, 4.0];
  Objects.merge(a2, b2, false, true);
  t.ok(Array.isArray(b2), `deep merge ${stringify(b2)} must be an array`);
  t.notEqual(b2, a2, `deep merge ${stringify(b2)} must not be same instance`);
  t.deepEqual(b2, x2, `deep merge ${stringify(b2)} must be deep equal`);

  // Deep merge with replace
  const a4 = ["1", 2, "3", 4.0];
  const b4 = [9, 8];
  const x4 = ["1", 2, "3", 4.0];
  Objects.merge(a4, b4, true, true);
  t.ok(Array.isArray(b4), `deep merge ${stringify(b4)} must be an array`);
  t.notEqual(b4, a4, `deep merge ${stringify(b4)} must NOT be same instance`);
  t.deepEqual(b4, x4, `deep merge ${stringify(b4)} must be deep equal`);

  t.end();
});

test('merge simple arrays to longer arrays', t => {
  // Shallow merge without replace
  const a0 = [9, "8"];
  const b0 = ["1", 2, "3", 4.0, [5]];
  const x0 = ["1", 2, "3", 4.0, [5]];
  Objects.merge(a0, b0, false, false);
  t.ok(Array.isArray(b0), `shallow merge ${stringify(b0)} must be an array`);
  t.notEqual(b0, a0, `shallow merge ${stringify(b0)} must not be same instance`);
  t.deepEqual(b0, x0, `shallow merge ${stringify(b0)} must be deep equal`);

  // Shallow merge with replace
  const a1 = [9, "8"];
  const b1 = ["1", 2, "3", 4.0, [5]];
  const x1 = [9, "8", "3", 4.0, [5]];
  Objects.merge(a1, b1, true, false);
  t.ok(Array.isArray(b1), `deep merge ${stringify(b1)} must be an array`);
  t.notEqual(b1, a1, `deep merge ${stringify(b1)} must NOT be same instance`);
  t.deepEqual(b1, x1, `deep merge ${stringify(b1)} must be deep equal`);

  // Deep merge without replace
  const a2 = ["9", 8];
  const b2 = [1, 2, 3, 4.0, [5]];
  const x2 = [1, 2, 3, 4.0, [5]];
  Objects.merge(a2, b2, false, true);
  t.ok(Array.isArray(b2), `deep merge ${stringify(b2)} must be an array`);
  t.notEqual(b2, a2, `deep merge ${stringify(b2)} must not be same instance`);
  t.deepEqual(b2, x2, `deep merge ${stringify(b2)} must be deep equal`);

  // Deep merge with replace
  const a4 = [9, 8];
  const b4 = ["1", 2, "3", 4.0, [5]];
  const x4 = [9, 8, "3", 4.0, [5]];
  Objects.merge(a4, b4, true, true);
  t.ok(Array.isArray(b4), `deep merge ${stringify(b4)} must be an array`);
  t.notEqual(b4, a4, `deep merge ${stringify(b4)} must NOT be same instance`);
  t.deepEqual(b4, x4, `deep merge ${stringify(b4)} must be deep equal`);

  t.end();
});


test('merge complex arrays', t => {
  // Shallow merge without replace
  const a1 = [1, 2, "3", undefined, null, {a: 1}, [4, 5, "6", null, undefined, {b: 2, c: [7]}]];
  const b1 = [2, 3, "4", null, undefined, {b: 2}, [9, 8, "7", undefined, null, {d: 3, e: [8, 9.0]}]];
  const x1 = [2, 3, "4", null, undefined, b1[5], b1[6]];

  Objects.merge(a1, b1, false, false);

  t.ok(Array.isArray(b1), `shallow merge ${stringify(b1)} must be an array`);
  t.equal(b1.length, a1.length, `shallow merge ${stringify(b1)} lengths must be same`);

  t.notEqual(b1, a1, `shallow merge ${stringify(b1)} must NOT be same instance`);
  t.deepEqual(b1, x1, `shallow merge ${stringify(b1)} must be deep equal`);

  t.equal(b1[5], x1[5], `shallow merge ${stringify(b1[5])} must be same instance`);
  t.deepEqual(b1[5], x1[5], `shallow merge ${stringify(b1[5])} must be deep equal`);


  // Shallow merge with replace
  const a2 = [1, 2, "3", undefined, null, {a: 1}, [4, 5, "6", null, undefined, {b: 2, c: [7]}]];
  const b2 = [2, 3, "4", null, undefined, {b: 2}, [9, 8, "7", undefined, null, {d: 3, e: [8, 9.0]}]];
  const x2 = [1, 2, "3", undefined, null, a2[5], a2[6]];

  Objects.merge(a2, b2, true, false);

  t.ok(Array.isArray(b2), `shallow merge ${stringify(b2)} must be an array`);
  t.equal(b2.length, a2.length, `shallow merge ${stringify(b2)} lengths must be same`);

  t.notEqual(b2, a2, `shallow merge ${stringify(b2)} must NOT be same instance`);
  t.deepEqual(b2, a2, `shallow merge ${stringify(b2)} must be deep equal a2`);
  t.deepEqual(b2, x2, `shallow merge ${stringify(b2)} must be deep equal`);

  t.notEqual(b2[5], a2[5], `shallow merge ${stringify(b2[5])} must NOT be same instance`);
  t.deepEqual(b2[5], a2[5], `shallow merge ${stringify(b2[5])} must be deep equal`);

  t.notEqual(b2[6], a2[6], `shallow merge ${stringify(b2[6])} must NOT be same instance`);
  t.deepEqual(b2[6], a2[6], `shallow merge ${stringify(b2[6])} must be deep equal`);

  t.notEqual(b2[6][5], a2[6][5], `shallow merge ${stringify(b2[6][5])} must NOT be same instance`);
  t.deepEqual(b2[6][5], a2[6][5], `shallow merge ${stringify(b2[6][5])} must be deep equal`);


  // Deep merge without replace
  const a3 = [1, 2, "3", undefined, null, {a: 1}, [4, 5, "6", null, undefined, {b: 2, c: [7], e: [8, 9]}]];
  const b3 = [9, 8, "7", null, undefined, {b: 2}, [1, 2, "3", undefined, null, {d: 3, c: [6, 5], e: [4]}]];
  const x3 = [9, 8, "7", null, undefined, {b: 2, a: 1}, [1, 2, "3", undefined, null, {
    d: 3,
    c: [6, 5],
    b: 2,
    e: [4, 9]
  }]];
  Objects.merge(a3, b3, false, true);

  t.ok(Array.isArray(b3), `deep merge ${stringify(b3)} must be an array`);
  t.equal(b3.length, a3.length, `deep merge ${stringify(b3)} lengths must be same`);

  t.notEqual(b3, a3, `deep merge ${stringify(b3)} must NOT be same instance`);
  t.deepEqual(b3, x3, `deep merge ${stringify(b3)} must be deep equal`);

  // Deep merge with replace
  const a4 = [1, 2, "3", undefined, null, {a: 1}, [4, 5, "6", null, undefined, {b: 2, c: [7], e: [8, 9]}]];
  const b4 = [9, 8, "7", null, undefined, {b: 2}, [1, 2, "3", undefined, null, {d: 3, c: [6, 5], e: [4]}]];
  const x4 = [1, 2, "3", undefined, null, {b: 2, a: 1}, [4, 5, "6", null, undefined, {
    d: 3,
    c: [7, 5],
    e: [8, 9],
    b: 2
  }]];
  Objects.merge(a4, b4, true, true);

  t.ok(Array.isArray(b4), `deep merge ${stringify(b4)} must be an array`);
  t.equal(b4.length, a4.length, `deep merge ${stringify(b4)} lengths must be same`);

  t.notEqual(b4, a4, `deep merge ${stringify(b4)} must NOT be same instance`);
  t.deepEqual(b4, x4, `deep merge ${stringify(b4)} must be deep equal`);

  t.end();
});

// =====================================================================================================================
// merge objects with arrays
// =====================================================================================================================

test('merge objects with arrays', t => {
  // Shallow merge without replace
  const a0 = {a: [3], b: {c: [4, 5]}};
  const b0 = {a: [1, 2], b: {c: [6]}};
  const x0 = {a: [1, 2], b: {c: [6]}};
  Objects.merge(a0, b0, false, false);
  t.ok(!Array.isArray(b0), `shallow merge ${stringify(b0)} must NOT be an array`);
  t.ok(Array.isArray(b0.a), `shallow merge ${stringify(b0.a)} must be an array`);
  t.notEqual(b0, a0, `shallow merge ${stringify(b0)} must not be same instance`);
  t.deepEqual(b0, x0, `shallow merge ${stringify(b0)} must be deep equal`);

  // Shallow merge with replace
  const a1 = {a: [3], b: {c: [4, 5]}};
  const b1 = {a: [1, 2], b: {c: [6]}};
  const x1 = {a: [3], b: {c: [4, 5]}};
  Objects.merge(a1, b1, true, false);
  t.ok(!Array.isArray(b1), `shallow merge ${stringify(b1)} must NOT be an array`);
  t.ok(Array.isArray(b1.a), `shallow merge ${stringify(b1.a)} must be an array`);
  t.notEqual(b1, a1, `shallow merge ${stringify(b1)} must NOT be same instance`);
  t.deepEqual(b1, x1, `shallow merge ${stringify(b1)} must be deep equal`);

  // Deep merge without replace
  const a2 = {a: [3], b: {c: [4, 5]}};
  const b2 = {a: [1, 2], b: {c: [6]}};
  const x2 = {a: [1, 2], b: {c: [6, 5]}};
  Objects.merge(a2, b2, false, true);
  t.ok(!Array.isArray(b2), `deep merge ${stringify(b2)} must NOT be an array`);
  t.ok(Array.isArray(b2.a), `deep merge ${stringify(b2.a)} must be an array`);
  t.notEqual(b2, a2, `deep merge ${stringify(b2)} must NOT be same instance`);
  t.deepEqual(b2, x2, `deep merge ${stringify(b2)} must be deep equal`);

  // Deep merge with replace
  const a3 = {a: [3], b: {c: [4, 5]}};
  const b3 = {a: [1, 2], b: {c: [6]}};
  const x3 = {a: [3, 2], b: {c: [4, 5]}};
  Objects.merge(a3, b3, true, true);
  t.ok(!Array.isArray(b3), `deep merge ${stringify(b3)} must NOT be an array`);
  t.ok(Array.isArray(b3.a), `deep merge ${stringify(b3.a)} must be an array`);
  t.notEqual(b3, a3, `deep merge ${stringify(b3)} must NOT be same instance`);
  t.deepEqual(b3, x3, `deep merge ${stringify(b3)} must be deep equal`);

  t.end();
});

// =====================================================================================================================
// merge object with array
// =====================================================================================================================

test('merge objects with arrays', t => {
  // Shallow merge without replace
  const a0 = {a: [3], b: {c: [4, 5]}};
  const b0 = ["9", "8"]; b0.a = [1, 2]; b0.b = {c: [6]};
  const x0 = ["9", "8"]; x0.a = [1, 2]; x0.b = {c: [6]};

  Objects.merge(a0, b0, false, false);

  t.ok(Array.isArray(b0), `shallow merge ${stringify(b0)} must be an array`);
  t.deepEqual(b0, x0, `shallow merge ${stringify(b0)} must be deep equal`);
  t.deepEqual(b0.a, x0.a, `shallow merge a ${stringify(b0.a)} must be deep equal`);
  t.deepEqual(b0.b, x0.b, `shallow merge b ${stringify(b0.b)} must be deep equal`);

  // Shallow merge with replace
  const a1 = {a: [3], b: {c: [4, 5]}};
  const b1 = ["9", "8"]; b1.a = [1, 2]; b1.b = {c: [6]};
  const x1 = ["9", "8"]; x1.a = [3]; x1.b = {c: [4, 5]};

  Objects.merge(a1, b1, true, false);

  t.ok(Array.isArray(b1), `shallow merge ${stringify(b1)} must be an array`);
  t.deepEqual(b1, x1, `shallow merge ${stringify(b1)} must be deep equal`);
  t.deepEqual(b1.a, x1.a, `shallow merge a ${stringify(b1.a)} must be deep equal`);
  t.deepEqual(b1.b, x1.b, `shallow merge b ${stringify(b1.b)} must be deep equal`);

  // Deep merge without replace
  const a2 = {a: [3], b: {c: [4,5]}};
  const b2 = [9,7]; b2.a = [1,2]; b2.b = {c: [6]};
  const x2 = [9,7]; x2.a = [1,2]; x2.b = {c: [6,5]};

  Objects.merge(a2, b2, false, true);

  t.ok(Array.isArray(b2), `deep merge ${stringify(b2)} must be an array`);
  t.deepEqual(b2, x2, `deep merge ${stringify(b2)} must be deep equal`);
  t.deepEqual(b2.a, x2.a, `deep merge a ${stringify(b2.a)} must be deep equal`);
  t.deepEqual(b2.b, x2.b, `deep merge b ${stringify(b2.b)} must be deep equal`);

  // Deep merge with replace
  const a3 = {a: [3], b: {c: [4,5]}};
  const b3 = [9,7]; b3.a = [1,2]; b3.b = {c: [6]};
  const x3 = [9,7]; x3.a = [3,2]; x3.b = {c: [4,5]};
  Objects.merge(a3, b3, true, true);
  t.ok(Array.isArray(b3), `deep merge ${stringify(b3)} must be an array`);
  t.deepEqual(b3, x3, `deep merge ${stringify(b3)} must be deep equal`);
  t.deepEqual(b3.a, x3.a, `deep merge a ${stringify(b3.a)} must be deep equal`);
  t.deepEqual(b3.b, x3.b, `deep merge b ${stringify(b3.b)} must be deep equal`);

  t.end();
});

// =====================================================================================================================
// merge array with object
// =====================================================================================================================

test('merge array with object', t => {
  // Shallow merge without replace
  const a0 = ["9", "8"]; a0.a = [3]; a0.b = {c: [4, 5]};
  const b0 = {a: [1, 2], b: {c: [6]}};
  const x0 = {"0": "9", "1": "8", "length": 2, a: [1, 2], b: {c: [6]}};

  Objects.merge(a0, b0, false, false);

  t.ok(!Array.isArray(b0), `shallow merge ${stringify(b0)} must not be an array`);
  t.deepEqual(b0, x0, `shallow merge ${stringify(b0)} must be deep equal`);
  t.deepEqual(b0.a, x0.a, `shallow merge a ${stringify(b0.a)} must be deep equal`);
  t.deepEqual(b0.b, x0.b, `shallow merge b ${stringify(b0.b)} must be deep equal`);

  // Shallow merge with replace
  const a1 = ["9", "8"]; a1.a = [3]; a1.b = {c: [4, 5]};
  const b1 = {a: [1, 2], b: {c: [6]}};
  const x1 = {"0": "9", "1": "8", "length": 2, a: [3], b: {c: [4,5]}};

  Objects.merge(a1, b1, true, false);

  t.ok(!Array.isArray(b1), `shallow merge ${stringify(b1)} must not be an array`);
  t.deepEqual(b1, x1, `shallow merge ${stringify(b1)} must be deep equal`);
  t.deepEqual(b1.a, x1.a, `shallow merge a ${stringify(b1.a)} must be deep equal`);
  t.deepEqual(b1.b, x1.b, `shallow merge b ${stringify(b1.b)} must be deep equal`);

  // Deep merge without replace
  const a2 = ["9", "8"]; a2.a = [3]; a2.b = {c: [4, 5]};
  const b2 = {a: [1, 2], b: {c: [6]}};
  const x2 = {"0": "9", "1": "8", "length": 2, a: [1,2], b: {c: [6,5]}};

  Objects.merge(a2, b2, false, true);

  t.ok(!Array.isArray(b2), `deep merge ${stringify(b2)} must not be an array`);
  t.deepEqual(b2, x2, `deep merge ${stringify(b2)} must be deep equal`);
  t.deepEqual(b2.a, x2.a, `deep merge a ${stringify(b2.a)} must be deep equal`);
  t.deepEqual(b2.b, x2.b, `deep merge b ${stringify(b2.b)} must be deep equal`);

  // Deep merge with replace
  const a3 = ["9", "8"]; a3.a = [3]; a3.b = {c: [4, 5]};
  const b3 = {a: [1, 2], b: {c: [6]}};
  const x3 = {"0": "9", "1": "8", "length": 2, a: [3,2], b: {c: [4,5]}};

  Objects.merge(a3, b3, true, true);

  t.ok(!Array.isArray(b3), `deep merge ${stringify(b3)} must not be an array`);
  t.deepEqual(b3, x3, `deep merge ${stringify(b3)} must be deep equal`);
  t.deepEqual(b3.a, x3.a, `deep merge a ${stringify(b3.a)} must be deep equal`);
  t.deepEqual(b3.b, x3.b, `deep merge b ${stringify(b3.b)} must be deep equal`);

  t.end();
});

test('getPropertyValue', t => {
  t.equal(Objects.getPropertyValue(undefined, 'a.b.c'), undefined, `undefined.a.b.c must be undefined`);
  t.equal(Objects.getPropertyValue(null, 'a.b.c'), undefined, `null.a.b.c must be undefined`);
  t.equal(Objects.getPropertyValue({}, 'a.b.c'), undefined, `{}.a.b.c must be undefined`);

  const o = {a: 1, b: {c: 'c', d: {e: 'e'}}};
  t.deepEqual(Objects.getPropertyValue(o, 'a'), 1, 'o.a must be 1');
  t.deepEqual(Objects.getPropertyValue(o, 'b'), {c: 'c', d: {e: 'e'}}, `o.b must be {c: 'c', d: {e: 'e'}}`);
  t.deepEqual(Objects.getPropertyValue(o, 'b.c'), 'c', `o.b.c must be 'c'`);
  t.deepEqual(Objects.getPropertyValue(o, 'b.d'), {e: 'e'}, `o.b.d must be {e: 'e'}`);
  t.deepEqual(Objects.getPropertyValue(o, 'b.d.e'), 'e', `o.b.d.e must be 'e'`);
  t.deepEqual(Objects.getPropertyValue(o, 'x.y.z'), undefined, `o.x.y.z must be undefined`);
  t.end();
});