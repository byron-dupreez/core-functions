'use strict';

/**
 * Unit tests for core-functions/strings.js
 * @author Byron du Preez
 */

const test = require('tape');

const Objects = require('../objects');
const valueOf = Objects.valueOf;

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
  t.deepEqual(merge2, {a: 1, b: '2', c: {d: 3, e: '4'}, z: 'ZZZ'}, 'shallow merge with replace must have all of from + only top-level extra original to2 properties');

  // deep must preserve inner extras
  const to3 = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}, z: 'ZZZ'};
  t.deepEqual(Objects.merge(from, to3, true, true), {a: 1, b: '2', c: {d: 3, e: '4', f: 6}, z: 'ZZZ'}, 'deep merge with replace must have all of from + all extra original to2 properties');

  // deep without replace must NOT replace any matching properties
  const to4 = {a: 2, c: {e: '5', f: 6, y: 'Y'}, x: 'X', z: 'ZZZ'};
  const to4Orig = {a: 2, b: '2', c: {d: 3, e: '5', f: 6, y: 'Y'}, x: 'X', z: 'ZZZ'};
  t.deepEqual(Objects.merge(from, to4, false, true), to4Orig, 'deep merge without replace must have all of to4 and only extras of from');

  // check that functions get merged in too
  function a1() {}
  function a2() {}
  function b() {}
  function c() {}
  const from5 = {a: a2, b: b, c: c, z: 'Z2'};
  const to5 = {a: a1, z: 'Z1'};
  const expected5 = {a: a1, b: b, c: c, z: 'Z1'};
  t.deepEqual(Objects.merge(from5, to5, false, false), expected5, 'deep merge without replace must have all functions of to5 and only extra functions of from5');
  t.equal(to5.a, a1, 'to5.a must be function a1');
  t.equal(to5.b, b, 'to5.b must be function b');
  t.equal(to5.c, c, 'to5.c must be function c');
  t.equal(to5.z, 'Z1', 'to5.z must be Z1');

  function x() {}
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

  function d() {}
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
  function a() {}
  function b() {}
  function c() {}
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
