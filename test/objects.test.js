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

  t.end();
});
