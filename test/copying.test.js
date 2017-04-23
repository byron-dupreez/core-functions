'use strict';

/**
 * Unit tests for core-functions/copying.js
 * @author Byron du Preez
 */

const test = require('tape');

const copying = require('../copying');
const copy = copying.copy;
const copyNamedProperties = copying.copyNamedProperties;
// const copyDescriptor = Objects.copyDescriptor;

const strings = require('../strings');
const stringify = strings.stringify;

// =====================================================================================================================
// copy
// =====================================================================================================================

test('copy with non-objects & empty object & empty array & Promise', t => {
  // Non-objects
  t.deepEqual(copy(undefined, {deep: false}), undefined, 'shallow copy of undefined is undefined');
  t.deepEqual(copy(undefined, {deep: true}), undefined, 'deep copy of undefined is undefined');

  t.deepEqual(copy(null, {deep: false}), null, 'shallow copy of null is null');
  t.deepEqual(copy(null, {deep: true}), null, 'deep copy of null is null');

  t.deepEqual(copy('', {deep: false}), '', `shallow copy of '' is ''`);
  t.deepEqual(copy('', {deep: true}), '', `deep copy of '' is ''`);

  t.deepEqual(copy('abc', {deep: false}), 'abc', `shallow copy of 'abc' is 'abc'`);
  t.deepEqual(copy('abc', {deep: true}), 'abc', `deep copy of 'abc' is 'abc'`);

  t.deepEqual(copy(123, {deep: false}), 123, 'shallow copy of 123 is 123');
  t.deepEqual(copy(123, {deep: true}), 123, 'deep copy of 123 is 123');

  t.deepEqual(copy(123.456, {deep: false}), 123.456, 'shallow copy of 123.456 is 123.456');
  t.deepEqual(copy(123.456, {deep: true}), 123.456, 'deep copy of 123.456 is 123.456');

  t.deepEqual(copy(true, {deep: false}), true, 'shallow copy of true is true');
  t.deepEqual(copy(true, {deep: true}), true, 'deep copy of true is true');

  t.deepEqual(copy(false, {deep: false}), false, 'shallow copy of false is false');
  t.deepEqual(copy(false, {deep: false}), false, 'deep copy of false is false');

  // Empty object
  t.deepEqual(copy({}, {deep: false}), {}, 'shallow copy of {} is {}');
  t.deepEqual(copy({}, {deep: true}), {}, 'deep copy of {} is {}');

  // Empty array
  t.deepEqual(copy([], {deep: false}), [], 'shallow copy of [] is []');
  t.deepEqual(copy([], {deep: true}), [], 'deep copy of [] is []');

  // Replicate "TypeError: Object prototype may only be an Object or null: undefined" defect
  const objectSansPrototype = Object.create(null);
  t.deepEqual(copy(objectSansPrototype, {deep: false}), objectSansPrototype, 'shallow copy of Object.create(null) must be deep equal to same object');

  // Function
  const fn = () => {};
  t.equal(copy(fn, {deep: false}), fn, 'shallow copy of function is the same function');
  t.equal(copy(fn, {deep: true}), fn, 'deep copy of function is the same function');

  // Promise
  const promiseValue = {a:1};
  const promise = Promise.resolve(promiseValue);
  t.equal(copy(promise, {deep: false}), promise, 'shallow copy of Promise.resolve({}) is the same Promise');
  t.equal(copy(promise, {deep: true}), promise, 'deep copy of Promise.resolve({}) is the same Promise');

  const p = copy(promise, {deep: true});
  p.then(
    v => {
      t.equal(v, promiseValue, `Copied promise's value must be the original promise's value`);
      t.end();
    },
    err => {
      t.end(err);
    }
  );
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
  const c1 = copy(o1, {deep: false});
  t.deepEqual(c1, o1, 'shallow copy circular - c1 must be deep equal to o1');
  t.notEqual(c1, o1, 'shallow copy circular - c1 must not be o1');
  t.equal(c1.o, o1.o, 'shallow copy circular - c1.o must be o1.o');
  t.equal(c1.o.p, o1.o.p, 'shallow copy circular - c1.o.p must be o1.o.p');

  const o2 = {o: {a: a, x: 'X', p: {b: b, y: 'Y'}}, c: c, z: 'Z'};
  const c2 = copy(o2, {deep: true});
  t.deepEqual(c2, o2, 'deep copy circular - c2 must be deep equal to o2');
  t.notEqual(c2, o2, 'deep copy circular - c2 must not be o2');
  t.notEqual(c2.o, o2.o, 'deep copy circular - c2.o must not be o2.o');
  t.notEqual(c2.o.p, o2.o.p, 'deep copy circular - c2.o.p must not be o2.o.p');

  // Create infinite loops (non-DAGs)
  const o3 = {o: {a: a, x: 'X', p: {b: b, y: 'Y'}}, c: c, z: 'Z'};
  o3.o.o3Again = o3;
  o3.o.p.o3Again = o3;
  const c3 = copy(o3, {deep: true});
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
  const c0 = copy(a0, {deep: false});
  t.ok(Array.isArray(c0), `shallow copy ${stringify(c0)} must be an array`);
  t.notEqual(c0, a0, `shallow copy ${stringify(c0)} must not be same instance`);
  t.deepEqual(c0, a0, `shallow copy ${stringify(c0)} must be deep equal`);

  // Deep copy of empty array
  const a1 = [];
  const c1 = copy(a1, {deep: true});
  t.ok(Array.isArray(c1), `deep copy ${stringify(c1)} must be an array`);
  t.notEqual(c1, a1, `deep copy ${stringify(c1)} must NOT be same instance`);
  t.deepEqual(c1, a1, `deep copy ${stringify(c1)} must be deep equal`);

  // Shallow copy of complex array
  const a2 = [1, 2, "3", undefined, null, {a: 1}, [4, 5, "6", null, undefined, {b: 2, c: [7]}]];
  const c2 = copy(a2, {deep: false});

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
  const c3 = copy(a3, {deep: true});

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
  const c0 = copy(a0, {deep: false});
  t.ok(!Array.isArray(c0), `shallow copy ${stringify(c0)} must NOT be an array`);
  t.notEqual(c0, a0, `shallow copy ${stringify(c0)} must not be same instance`);
  t.deepEqual(c0, a0, `shallow copy ${stringify(c0)} must be deep equal`);

  // Deep copy of empty array
  const a1 = {a: []};
  const c1 = copy(a1, {deep: true});
  t.ok(!Array.isArray(c1), `deep copy ${stringify(c1)} must NOT be an array`);
  t.notEqual(c1, a1, `deep copy ${stringify(c1)} must NOT be same instance`);
  t.deepEqual(c1, a1, `deep copy ${stringify(c1)} must be deep equal`);

  // Shallow copy of complex array
  const a2 = {a: [1, 2, "3", undefined, null, {a: 1}, [4, 5, "6", null, undefined, {b: 2, c: [7]}]]};
  const c2 = copy(a2, {deep: false});

  t.ok(!Array.isArray(c2), `shallow copy ${stringify(c2)} must NOT be an array`);
  t.notEqual(c2, a2, `shallow copy ${stringify(c2)} must NOT be same instance`);
  t.deepEqual(c2, a2, `shallow copy ${stringify(c2)} must be deep equal`);
  for (let i = 0; i < a2.length; ++i) {
    t.equal(c2[i], a2[i], `shallow copy [${i}] ${stringify(c2[i])} must be equal`);
    t.deepEqual(c2[i], a2[i], `shallow copy [${i}] ${stringify(c2[i])} must be deep equal`);
  }

  // Deep copy of complex array
  const a3 = {a: [1, 2, "3", undefined, null, {a: 1}, [4, 5, "6", null, undefined, {b: 2, c: [7]}]]};
  const c3 = copy(a3, {deep: true});

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
// copyNamedProperties
// =====================================================================================================================

test('copyNamedProperties - compact', t => {
  const compact = true;
  const deep = true;
  const omit = true;
  t.deepEqual(copyNamedProperties(undefined, ['a.b.c'], {compact: compact, deep: deep, omitIfUndefined: omit}), undefined, `(undefined, ['a.b.c'], {compact: compact, deep: deep, omitIfUndefined: omit}) must be undefined`);
  t.deepEqual(copyNamedProperties(null, ['a.b.c'], {compact: compact, deep: deep, omitIfUndefined: omit}), null, `(null, ['a.b.c'], {compact: compact, deep: deep, omitIfUndefined: omit}) must be null`);
  t.deepEqual(copyNamedProperties({}, ['a.b.c'], {compact: compact, deep: deep, omitIfUndefined: omit}), {}, `({}, ['a.b.c'], {compact: compact, deep: deep, omitIfUndefined: omit}) must be {}`);
  t.deepEqual(copyNamedProperties({}, ['a.b.c'], {compact: compact, deep: deep, omitIfUndefined: !omit}), {'a.b.c': undefined}, `({}, ['a.b.c'], {compact: compact, deep: deep, omitIfUndefined: !omit}) must be {'a.b.c': undefined}`);
  t.deepEqual(copyNamedProperties([], ['a.b.c'], {compact: compact, deep: deep, omitIfUndefined: omit}), {}, `([] ['a.b.c'], {compact: compact, deep: deep, omitIfUndefined: omit}) must be {}`);
  t.deepEqual(copyNamedProperties([], ['a.b.c'], {compact: compact, deep: deep, omitIfUndefined: !omit}), {'a.b.c': undefined}, `([], ['a.b.c'], {compact: compact, deep: deep, omitIfUndefined: !omit}) must be {'a.b.c': undefined}`);

  const o = {a: 1, b: {c: 'c', d: {e: 'e'}}};
  t.deepEqual(copyNamedProperties(o, ['a'], {compact: compact, deep: deep, omitIfUndefined: !omit}), {a: 1}, `(o, [a], {compact: compact, deep: deep, omitIfUndefined: !omit}) must be {a: 1}`);
  t.deepEqual(copyNamedProperties(o, ['b'], {compact: compact, deep: deep, omitIfUndefined: !omit}), {b: {c: 'c', d: {e: 'e'}}}, `(o, [b], {compact: compact, deep: deep, omitIfUndefined: !omit}) must be {b: {c: 'c', d: {e: 'e'}}}`);

  t.notEqual(copyNamedProperties(o, ['b'], {compact: compact, deep: deep, omitIfUndefined: !omit}).b, o.b, `(o, [b], {compact: compact, deep: deep, omitIfUndefined: !omit}).b must NOT be o.b`);
  t.equal(copyNamedProperties(o, ['b'], {deep: !deep, omitIfUndefined: !omit}).b, o.b, `(o, [b], {deep: !deep, omitIfUndefined: !omit}).b must be o.b`);
  t.notEqual(copyNamedProperties(o, ['b'], {deep: deep, omitIfUndefined: !omit}).b, o.b, `(o, [b], {deep: deep, omitIfUndefined: !omit}).b must NOT be o.b`);

  t.equal(copyNamedProperties(o, ['b'], {compact: compact, deep: deep, omitIfUndefined: !omit}).b.c, o.b.c, `(o, [b], {compact: compact, deep: deep, omitIfUndefined: !omit}).b.c must equal o.b.c`);
  t.equal(copyNamedProperties(o, ['b'], {deep: !deep, omitIfUndefined: !omit}).b.c, o.b.c, `(o, [b], {deep: !deep, omitIfUndefined: !omit}).b.c must equal o.b.c`);

  t.notEqual(copyNamedProperties(o, ['b'], {compact: compact, deep: deep, omitIfUndefined: !omit}).b.d, o.b.d, `(o, [b], {compact: compact, deep: deep, omitIfUndefined: !omit}).b.d must NOT be o.b.d`);
  t.equal(copyNamedProperties(o, ['b'], {deep: !deep, omitIfUndefined: !omit}).b.d, o.b.d, `(o, [b], {deep: !deep, omitIfUndefined: !omit}).b.d must be o.b.d`);

  t.deepEqual(copyNamedProperties(o, ['b.c'], {compact: compact, deep: deep, omitIfUndefined: !omit}), {'b.c': 'c'}, `(o, [b.c], {compact: compact, deep: deep, omitIfUndefined: !omit}) must be {'b.c': 'c'}`);
  t.deepEqual(copyNamedProperties(o, ['b.d'], {compact: compact, deep: deep, omitIfUndefined: !omit}), {'b.d': {e: 'e'}}, `(o, [b.d], {compact: compact, deep: deep, omitIfUndefined: !omit}) must be {'b.d': {e: 'e'}}`);
  t.deepEqual(copyNamedProperties(o, ['b.d.e'], {compact: compact, deep: deep, omitIfUndefined: !omit}), {'b.d.e': 'e'}, `(o, [b.d.e], {compact: compact, deep: deep, omitIfUndefined: !omit}) must be {'b.d.e': 'e'}`);
  t.deepEqual(copyNamedProperties(o, ['x.y.z'], {compact: compact, deep: deep, omitIfUndefined: !omit}), {'x.y.z': undefined}, `(o, [x.y.z], {compact: compact, deep: deep, omitIfUndefined: !omit}) must be {'x.y.z': undefined}`);
  t.deepEqual(copyNamedProperties(o, ['x.y.z'], {compact: compact, deep: deep, omitIfUndefined: omit}), {}, `(o, [x.y.z], {compact: compact, deep: deep, omitIfUndefined: omit}) must be {}`);

  t.deepEqual(copyNamedProperties(o, ['a', 'b'], {compact: compact, deep: deep, omitIfUndefined: !omit}), o, `(o, [a,b], {compact: compact, deep: deep, omitIfUndefined: !omit}) must equal o`);
  t.deepEqual(copyNamedProperties(o, ['a', 'b.c', 'b.d'], {compact: compact, deep: deep, omitIfUndefined: !omit}), {a: 1, 'b.c': 'c', 'b.d': {e: 'e'}}, `(o, [a,b], {compact: compact, deep: deep, omitIfUndefined: !omit}) must equal {a: 1, 'b.c': 'c', 'b.d': {e: 'e'}}`);
  t.deepEqual(copyNamedProperties(o, ['a', 'b.c', 'b.d.e'], {compact: compact, deep: deep, omitIfUndefined: !omit}), {a: 1, 'b.c': 'c', 'b.d.e': 'e'}, `(o, [a,b], {compact: compact, deep: deep, omitIfUndefined: !omit}) must equal {a: 1, 'b.c': 'c', 'b.d.e': 'e'}`);

  t.end();
});

test('copyNamedProperties - non-compact & deep', t => {
  const compact = true;
  const deep = true;
  const omit = true;
  t.deepEqual(copyNamedProperties(undefined, ['a.b.c'], {compact: !compact, deep: deep, omitIfUndefined: omit}), undefined, `(undefined, ['a.b.c'], {compact: !compact, deep: deep, omitIfUndefined: omit}) must be undefined`);
  t.deepEqual(copyNamedProperties(null, ['a.b.c'], {compact: !compact, deep: deep, omitIfUndefined: omit}), null, `(null, ['a.b.c'], {compact: !compact, deep: deep, omitIfUndefined: omit}) must be null`);
  t.deepEqual(copyNamedProperties({}, ['a.b.c'], {compact: !compact, deep: deep, omitIfUndefined: omit}), {}, `({}, ['a.b.c'], {compact: !compact, deep: deep, omitIfUndefined: omit}) must be {}`);
  t.deepEqual(copyNamedProperties({}, ['a.b.c'], {compact: !compact, deep: deep, omitIfUndefined: !omit}), {a: {b: {c: undefined}}}, `({}, ['a.b.c'], {compact: !compact, deep: deep, omitIfUndefined: !omit}) must be {a: {b: {c: undefined}}}`);
  t.deepEqual(copyNamedProperties([], ['a.b.c'], {compact: !compact, deep: deep, omitIfUndefined: omit}), {}, `([] ['a.b.c'], {compact: !compact, deep: deep, omitIfUndefined: omit}) must be {}`);
  t.deepEqual(copyNamedProperties([], ['a.b.c'], {compact: !compact, deep: deep, omitIfUndefined: !omit}), {a: {b: {c: undefined}}}, `([], ['a.b.c'], {compact: !compact, deep: deep, omitIfUndefined: !omit}) must be {a: {b: {c: undefined}}}`);

  const o = {a: 1, b: {c: 'c', d: {e: 'e'}}};
  t.deepEqual(copyNamedProperties(o, ['a'], {compact: !compact, deep: deep, omitIfUndefined: !omit}), {a: 1}, `(o, [a], {compact: !compact, deep: deep, omitIfUndefined: !omit}) must be {a: 1}`);
  t.deepEqual(copyNamedProperties(o, ['b'], {compact: !compact, deep: deep, omitIfUndefined: !omit}), {b: {c: 'c', d: {e: 'e'}}}, `(o, [b], {compact: !compact, deep: deep, omitIfUndefined: !omit}) must be {b: {c: 'c', d: {e: 'e'}}}`);

  t.notEqual(copyNamedProperties(o, ['b'], {compact: !compact, deep: deep, omitIfUndefined: !omit}).b, o.b, `(o, [b], {compact: !compact, deep: deep, omitIfUndefined: !omit}).b must NOT be o.b`);
  t.notEqual(copyNamedProperties(o, ['b'], {deep: deep, omitIfUndefined: !omit}).b, o.b, `(o, [b], {deep: deep, omitIfUndefined: !omit}).b must NOT be o.b`);

  t.equal(copyNamedProperties(o, ['b'], {compact: !compact, deep: deep, omitIfUndefined: !omit}).b.c, o.b.c, `(o, [b], {compact: !compact, deep: deep, omitIfUndefined: !omit}).b.c must equal o.b.c`);
  t.equal(copyNamedProperties(o, ['b'], {deep: deep, omitIfUndefined: !omit}).b.c, o.b.c, `(o, [b], {deep: deep, omitIfUndefined: !omit}).b.c must equal o.b.c`);

  t.notEqual(copyNamedProperties(o, ['b'], {compact: !compact, deep: deep, omitIfUndefined: !omit}).b.d, o.b.d, `(o, [b], {compact: !compact, deep: deep, omitIfUndefined: !omit}).b.d must NOT be o.b.d`);
  t.notEqual(copyNamedProperties(o, ['b'], {deep: deep, omitIfUndefined: !omit}).b.d, o.b.d, `(o, [b], {deep: deep, omitIfUndefined: !omit}).b.d must NOT be o.b.d`);

  t.deepEqual(copyNamedProperties(o, ['b.c'], {compact: !compact, deep: deep, omitIfUndefined: !omit}), {b: {c: 'c'}}, `(o, [b.c], {compact: !compact, deep: deep, omitIfUndefined: !omit}) must be {b: {c: 'c'}}`);
  t.deepEqual(copyNamedProperties(o, ['b.d'], {compact: !compact, deep: deep, omitIfUndefined: !omit}), {b: {d: {e: 'e'}}}, `(o, [b.d], {compact: !compact, deep: deep, omitIfUndefined: !omit}) must be {b: {d: {e: 'e'}}}`);
  t.deepEqual(copyNamedProperties(o, ['b.d.e'], {compact: !compact, deep: deep, omitIfUndefined: !omit}), {b: {d: {e: 'e'}}}, `(o, [b.d.e], {compact: !compact, deep: deep, omitIfUndefined: !omit}) must be {b: {d: {e: 'e'}}}`);
  t.deepEqual(copyNamedProperties(o, ['x.y.z'], {compact: !compact, deep: deep, omitIfUndefined: !omit}), {x: {y: {z: undefined}}}, `(o, [x.y.z], {compact: !compact, deep: deep, omitIfUndefined: !omit}) must be {x: {y: {z: undefined}}}`);
  t.deepEqual(copyNamedProperties(o, ['x.y.z'], {compact: !compact, deep: deep, omitIfUndefined: omit}), {}, `(o, [x.y.z], {compact: !compact, deep: deep, omitIfUndefined: omit}) must be {}`);

  t.deepEqual(copyNamedProperties(o, ['a', 'b'], {compact: !compact, deep: deep, omitIfUndefined: !omit}), o, `(o, [a,b], {compact: !compact, deep: deep, omitIfUndefined: !omit}) must equal o`);
  t.deepEqual(copyNamedProperties(o, ['a', 'b.c', 'b.d'], {compact: !compact, deep: deep, omitIfUndefined: !omit}), {a: 1, b: {c: 'c', d: {e: 'e'}}}, `(o, [a,b], {compact: !compact, deep: deep, omitIfUndefined: !omit}) must equal {a: 1, b: {c: 'c', d: {e: 'e'}}}`);
  t.deepEqual(copyNamedProperties(o, ['a', 'b.c', 'b.d.e'], {compact: !compact, deep: deep, omitIfUndefined: !omit}), {a: 1, b: {c: 'c', d: {e: 'e'}}}, `(o, [a,b], {compact: !compact, deep: deep, omitIfUndefined: !omit}) must equal {a: 1, b: {c: 'c', d: {e: 'e'}}}`);

  t.end();
});

test('copyNamedProperties - non-compact & shallow', t => {
  const compact = true;
  const deep = true;
  const omit = true;
  t.deepEqual(copyNamedProperties(undefined, ['a.b.c'], {compact: !compact, deep: !deep, omitIfUndefined: omit}), undefined, `(undefined, ['a.b.c'], {compact: !compact, deep: !deep, omitIfUndefined: omit}) must be undefined`);
  t.deepEqual(copyNamedProperties(null, ['a.b.c'], {compact: !compact, deep: !deep, omitIfUndefined: omit}), null, `(null, ['a.b.c'], {compact: !compact, deep: !deep, omitIfUndefined: omit}) must be null`);
  t.deepEqual(copyNamedProperties({}, ['a.b.c'], {compact: !compact, deep: !deep, omitIfUndefined: omit}), {}, `({}, ['a.b.c'], {compact: !compact, deep: !deep, omitIfUndefined: omit}) must be {}`);
  t.deepEqual(copyNamedProperties({}, ['a.b.c'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}), {a: {b: {c: undefined}}}, `({}, ['a.b.c'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}) must be {a: {b: {c: undefined}}}`);
  t.deepEqual(copyNamedProperties([], ['a.b.c'], {compact: !compact, deep: !deep, omitIfUndefined: omit}), {}, `([] ['a.b.c'], {compact: !compact, deep: !deep, omitIfUndefined: omit}) must be {}`);
  t.deepEqual(copyNamedProperties([], ['a.b.c'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}), {a: {b: {c: undefined}}}, `([], ['a.b.c'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}) must be {a: {b: {c: undefined}}}`);

  const o = {a: 1, b: {c: 'c', d: {e: 'e'}}};
  t.deepEqual(copyNamedProperties(o, ['a'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}), {a: 1}, `(o, [a], {compact: !compact, deep: !deep, omitIfUndefined: !omit}) must be {a: 1}`);
  t.deepEqual(copyNamedProperties(o, ['b'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}), {b: {c: 'c', d: {e: 'e'}}}, `(o, [b], {compact: !compact, deep: !deep, omitIfUndefined: !omit}) must be {b: {c: 'c', d: {e: 'e'}}}`);

  t.equal(copyNamedProperties(o, ['b'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}).b, o.b, `(o, [b], {compact: !compact, deep: !deep, omitIfUndefined: !omit}).b must be o.b`);
  t.equal(copyNamedProperties(o, ['b'], {deep: !deep, omitIfUndefined: !omit}).b, o.b, `(o, [b], {deep: !deep, omitIfUndefined: !omit}).b must be o.b`);

  t.equal(copyNamedProperties(o, ['b'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}).b.c, o.b.c, `(o, [b], {compact: !compact, deep: !deep, omitIfUndefined: !omit}).b.c must equal o.b.c`);
  t.equal(copyNamedProperties(o, ['b'], {deep: !deep, omitIfUndefined: !omit}).b.c, o.b.c, `(o, [b], {deep: !deep, omitIfUndefined: !omit}).b.c must equal o.b.c`);

  t.equal(copyNamedProperties(o, ['b'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}).b.d, o.b.d, `(o, [b], {compact: !compact, deep: !deep, omitIfUndefined: !omit}).b.d must be o.b.d`);
  t.equal(copyNamedProperties(o, ['b'], {deep: !deep, omitIfUndefined: !omit}).b.d, o.b.d, `(o, [b], {deep: !deep, omitIfUndefined: !omit}).b.d must be o.b.d`);

  t.deepEqual(copyNamedProperties(o, ['b.c'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}), {b: {c: 'c'}}, `(o, [b.c], {compact: !compact, deep: !deep, omitIfUndefined: !omit}) must be {b: {c: 'c'}}`);
  t.deepEqual(copyNamedProperties(o, ['b.d'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}), {b: {d: {e: 'e'}}}, `(o, [b.d], {compact: !compact, deep: !deep, omitIfUndefined: !omit}) must be {b: {d: {e: 'e'}}}`);
  t.deepEqual(copyNamedProperties(o, ['b.d.e'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}), {b: {d: {e: 'e'}}}, `(o, [b.d.e], {compact: !compact, deep: !deep, omitIfUndefined: !omit}) must be {b: {d: {e: 'e'}}}`);
  t.deepEqual(copyNamedProperties(o, ['x.y.z'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}), {x: {y: {z: undefined}}}, `(o, [x.y.z], {compact: !compact, deep: !deep, omitIfUndefined: !omit}) must be {x: {y: {z: undefined}}}`);
  t.deepEqual(copyNamedProperties(o, ['x.y.z'], {compact: !compact, deep: !deep, omitIfUndefined: omit}), {}, `(o, [x.y.z], {compact: !compact, deep: !deep, omitIfUndefined: omit}) must be {}`);

  t.deepEqual(copyNamedProperties(o, ['a', 'b'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}), o, `(o, [a,b], {compact: !compact, deep: !deep, omitIfUndefined: !omit}) must equal o`);
  t.deepEqual(copyNamedProperties(o, ['a', 'b.c', 'b.d'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}), {a: 1, b: {c: 'c', d: {e: 'e'}}}, `(o, [a,b], {compact: !compact, deep: !deep, omitIfUndefined: !omit}) must equal {a: 1, b: {c: 'c', d: {e: 'e'}}}`);
  t.deepEqual(copyNamedProperties(o, ['a', 'b.c', 'b.d.e'], {compact: !compact, deep: !deep, omitIfUndefined: !omit}), {a: 1, b: {c: 'c', d: {e: 'e'}}}, `(o, [a,b], {compact: !compact, deep: !deep, omitIfUndefined: !omit}) must equal {a: 1, b: {c: 'c', d: {e: 'e'}}}`);

  t.end();
});

// =====================================================================================================================
// copy with Dates
// =====================================================================================================================

test(`copy with Dates`, t => {
  const deep = true;
  let d1 = new Date(1490870891647);
  let d2 = new Date(1490870891647); // same date, different instance

  let o1 = {d: d1};
  let o2 = {d: d2};

  // Shallow Date ONLY copies
  t.deepEqual(copy(d1, {deep: !deep}), d1, `copy(d1, {deep: !deep}) must be equal to d1`);
  t.deepEqual(copy(d1, {deep: !deep}), d2, `copy(d1, {deep: !deep}) must be equal to d2`);
  t.notEqual(copy(d1, {deep: !deep}), d1, `copy(d1, {deep: !deep}) must be d1`);
  t.notEqual(copy(d1, {deep: !deep}), d2, `copy(d1, {deep: !deep}) must NOT be d2`);

  t.deepEqual(copy(d2, {deep: !deep}), d2, `copy(d2, {deep: !deep}) must be equal to d2`);
  t.deepEqual(copy(d2, {deep: !deep}), d1, `copy(d2, {deep: !deep}) must be equal to d1`);
  t.notEqual(copy(d2, {deep: !deep}), d2, `copy(d2, {deep: !deep}) must be d2`);
  t.notEqual(copy(d2, {deep: !deep}), d1, `copy(d2, {deep: !deep}) must NOT be d1`);

  // Deep Date ONLY copies
  t.deepEqual(copy(d1, {deep: deep}), d1, `copy(d1, {deep: deep}) must be equal to d1`);
  t.deepEqual(copy(d1, {deep: deep}), d2, `copy(d1, {deep: deep}) must be equal to d2`);
  t.notEqual(copy(d1, {deep: deep}), d1, `copy(d1, {deep: deep}) must NOT be d1`);
  t.notEqual(copy(d1, {deep: deep}), d2, `copy(d1, {deep: deep}) must NOT be d2`);

  t.deepEqual(copy(d2, {deep: deep}), d2, `copy(d2, {deep: deep}) must be equal to d2`);
  t.deepEqual(copy(d2, {deep: deep}), d1, `copy(d2, {deep: deep}) must be equal to d1`);
  t.notEqual(copy(d2, {deep: deep}), d2, `copy(d2, {deep: deep}) must NOT be d2`);
  t.notEqual(copy(d2, {deep: deep}), d1, `copy(d2, {deep: deep}) must NOT be d1`);

  // Shallow Date property copies
  let c1 = copy(o1, {deep: !deep});
  t.deepEqual(c1, o1, `copy(o1, {deep: !deep}) must be equal to o1`);
  t.deepEqual(c1, o2, `copy(o1, {deep: !deep}) must be equal to o2`);
  t.deepEqual(c1.d, d1, `c1.d must be equal to d1`);
  t.deepEqual(c1.d, d2, `c1.d must be equal to d2`);
  t.equal(c1.d, d1, `c1.d must be d1`);
  t.notEqual(c1.d, d2, `c1.d must NOT be d2`);

  let c2 = copy(o2, {deep: !deep});
  t.deepEqual(c2, o1, `copy(o2, {deep: !deep}) must be equal to o1`);
  t.deepEqual(c2, o2, `copy(o2, {deep: !deep}) must be equal to o2`);
  t.deepEqual(c2.d, d1, `c2.d must be equal to d1`);
  t.deepEqual(c2.d, d2, `c2.d must be equal to d2`);
  t.notEqual(c2.d, d1, `c2.d must NOT be d1`);
  t.equal(c2.d, d2, `c2.d must be d2`);

  // Deep Date property copies
  c1 = copy(o1, {deep: deep});
  t.deepEqual(c1, o1, `copy(o1, {deep: deep}) must be equal to o1`);
  t.deepEqual(c1, o2, `copy(o1, {deep: deep}) must be equal to o2`);
  t.deepEqual(c1.d, d1, `c1.d must be equal to d1`);
  t.deepEqual(c1.d, d2, `c1.d must be equal to d2`);
  t.notEqual(c1.d, d1, `c1.d must NOT be d1`);
  t.notEqual(c1.d, d2, `c1.d must NOT be d2`);

  c2 = copy(o2, {deep: deep});
  t.deepEqual(c2, o1, `copy(o2, {deep: deep}) must be equal to o1`);
  t.deepEqual(c2, o2, `copy(o2, {deep: deep}) must be equal to o2`);
  t.deepEqual(c2.d, d1, `c2.d must be equal to d1`);
  t.deepEqual(c2.d, d2, `c2.d must be equal to d2`);
  t.notEqual(c2.d, d1, `c2.d must NOT be d1`);
  t.notEqual(c2.d, d2, `c2.d must NOT be d2`);

  t.end();
});

// =====================================================================================================================
// copy with onlyEnumerable & onlyValues
// =====================================================================================================================

test(`copy with onlyEnumerable & onlyValues`, t => {
  const deep = true;
  const onlyE = true;
  const onlyV = true;

  const o1 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  Object.defineProperty(o1, 'b', {enumerable: false});
  Object.defineProperty(o1.c, 'd', {enumerable: false});
  Object.defineProperty(o1.c.e, 'f', {enumerable: false});
  Object.defineProperty(o1.c.e, 'h', {enumerable: false});
  Object.defineProperty(o1, 'i', {enumerable: false});
  Object.defineProperty(o1.i, 'k', {enumerable: false});

  let x1 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  t.deepEqual(copy(o1, {deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x1, `copy(o1, {deep, !onlyE, onlyV}) must be ${stringify(x1)}`);

  Object.defineProperty(x1, 'b', {enumerable: false});
  Object.defineProperty(x1.c, 'd', {enumerable: false});
  Object.defineProperty(x1.c.e, 'f', {enumerable: false});
  Object.defineProperty(x1.c.e, 'h', {enumerable: false});
  Object.defineProperty(x1, 'i', {enumerable: false});
  Object.defineProperty(x1.i, 'k', {enumerable: false});

  t.deepEqual(copy(o1, {deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x1, `copy(o1, {deep, !onlyE, !onlyV}) must be ${stringify(x1)}`);

  x1 = {a: 1, c: {e: {}}};
  t.deepEqual(copy(o1, {deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x1, `copy(o1, {deep, onlyE, onlyV}) must be ${stringify(x1)}`);
  t.deepEqual(copy(o1, {deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x1, `copy(o1, {deep, onlyE, !onlyV}) must be ${stringify(x1)}`);

  const o2 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  Object.defineProperty(o2, 'a', {enumerable: false});
  Object.defineProperty(o2, 'c', {enumerable: false});
  Object.defineProperty(o2.c, 'e', {enumerable: false});
  Object.defineProperty(o2.c.e.f, 'g', {enumerable: false});
  Object.defineProperty(o2.i, 'j', {enumerable: false});

  let x2 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  t.deepEqual(copy(o2, {deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x2, `copy(o2, {deep, !onlyE, onlyV}) must be ${stringify(x2)}`);

  Object.defineProperty(x2, 'a', {enumerable: false});
  Object.defineProperty(x2, 'c', {enumerable: false});
  Object.defineProperty(x2.c, 'e', {enumerable: false});
  Object.defineProperty(x2.c.e.f, 'g', {enumerable: false});
  Object.defineProperty(x2.i, 'j', {enumerable: false});

  t.deepEqual(copy(o2, {deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x2, `copy(o2, {deep, !onlyE, !onlyV}) must be ${stringify(x2)}`);

  x2 = {b: 2, i: {k: 11}};
  t.deepEqual(copy(o2, {deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x2, `copy(o2, {deep, onlyE, onlyV}) must be ${stringify(x2)}`);
  t.deepEqual(copy(o2, {deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x2, `copy(o2, {deep, onlyE, !onlyV}) must be ${stringify(x2)}`);

  t.end();
});


test(`copyNamedProperties with onlyEnumerable`, t => {
  const deep = true;
  const onlyE = true;
  const onlyV = true;

  const o1 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  Object.defineProperty(o1, 'b', {enumerable: false});
  Object.defineProperty(o1.c, 'd', {enumerable: false});
  Object.defineProperty(o1.c.e, 'f', {enumerable: false});
  Object.defineProperty(o1.c.e, 'h', {enumerable: false});
  Object.defineProperty(o1, 'i', {enumerable: false});
  Object.defineProperty(o1.i, 'k', {enumerable: false});

  let x1 = {a: 1, b: 2, c: {e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  t.deepEqual(copyNamedProperties(o1, ['a', 'b', 'c.e', 'i'], {deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x1, `copyNamedProperties(o1, ['a', 'b', 'c.e', 'i'], {deep, !onlyE, onlyV}) must be ${stringify(x1)}`);

  x1 = {a: 1, b: 2, c: {e: {}}, i: {j: 10}};
  t.deepEqual(copyNamedProperties(o1, ['a', 'b', 'c.e', 'i'], {deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x1, `copyNamedProperties(o1, ['a', 'b', 'c.e', 'i'], {deep, onlyE, onlyV}) must be ${stringify(x1)}`);

  const o2 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  Object.defineProperty(o2, 'a', {enumerable: false});
  Object.defineProperty(o2, 'c', {enumerable: false});
  Object.defineProperty(o2.c, 'e', {enumerable: false});
  Object.defineProperty(o2.c.e.f, 'g', {enumerable: false});
  Object.defineProperty(o2.i, 'j', {enumerable: false});

  // console.log(`########################## descriptors of o2 = ${stringify(getPropertyDescriptors(o2))}`);

  let x2 = {a: 1, b: 2, c: {e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  t.deepEqual(copyNamedProperties(o2, ['a', 'b', 'c.e', 'i'], {deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x2, `copyNamedProperties(o2, ['a', 'b', 'c.e', 'i'], {deep, !onlyE, onlyV}) must be ${stringify(x2)}`);

  x2 = {a: 1, b: 2, c: {e: {f: {}, h: 8}}, i: {k: 11}};
  t.deepEqual(copyNamedProperties(o2, ['a', 'b', 'c.e', 'i'], {deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x2, `copyNamedProperties(o2, ['a', 'b', 'c.e', 'i'], {deep, onlyE, onlyV}) must be ${stringify(x2)}`);

  x2 = {a: 1, b: 2, c: {e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  Object.defineProperty(x2, 'a', {enumerable: false});
  Object.defineProperty(x2, 'c', {enumerable: false});
  Object.defineProperty(x2.c, 'e', {enumerable: false});
  Object.defineProperty(x2.c.e.f, 'g', {enumerable: false});
  Object.defineProperty(x2.i, 'j', {enumerable: false});
  t.deepEqual(copyNamedProperties(o2, ['a', 'b', 'c.e', 'i'], {deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x2, `copyNamedProperties(o2, ['a', 'b', 'c.e', 'i'], {deep, !onlyE, !onlyV}) must be ${stringify(x2)}`);

  // console.log(`########################## descriptors of copyNamedProperties = ${stringify(getPropertyDescriptors(copyNamedProperties(o2, ['a', 'b', 'c.e', 'i'], {deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV})))}`);

  x2 = {a: 1, b: 2, c: {e: {f: {}, h: 8}}, i: {k: 11}};
  Object.defineProperty(x2, 'a', {enumerable: false});
  Object.defineProperty(x2, 'c', {enumerable: false});
  Object.defineProperty(x2.c, 'e', {enumerable: false});
  Object.defineProperty(x2.c.e.f, 'g', {enumerable: false});
  Object.defineProperty(x2.i, 'j', {enumerable: false});
  t.deepEqual(copyNamedProperties(o2, ['a', 'b', 'c.e', 'i'], {deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x2, `copyNamedProperties(o2, ['a', 'b', 'c.e', 'i'], {deep, onlyE, !onlyV}) must be ${stringify(x2)}`);

  t.end();
});

test(`copy with Buffer`, t => {
  const deep = true;
  let b1 = new Buffer(7);
  for (let i = 0; i < 7; ++i) { b1[i] = (i + 1) * 2; }
  let b2 = new Buffer(7);
  b1.copy(b2); // same buffer contents, different instance
  t.equal(b1, b1, `b1 must be b1`);
  t.equal(b2, b2, `b2 must be b2`);
  t.notEqual(b1, b2, `b1 must NOT be b2`);
  t.deepEqual(b1, b2, `b1 must be equal to b2`);

  // Shallow Buffer ONLY copies
  t.deepEqual(copy(b1, {deep: !deep}), b1, `copy(b1, {deep: !deep}) must be equal to b1`);
  t.deepEqual(copy(b1, {deep: !deep}), b2, `copy(b1, {deep: !deep}) must be equal to b2`);
  t.notEqual(copy(b1, {deep: !deep}), b1, `copy(b1, {deep: !deep}) must NOT be b1`);
  t.notEqual(copy(b1, {deep: !deep}), b2, `copy(b1, {deep: !deep}) must NOT be b2`);

  t.deepEqual(copy(b2, {deep: !deep}), b2, `copy(b2, {deep: !deep}) must be equal to b2`);
  t.deepEqual(copy(b2, {deep: !deep}), b1, `copy(b2, {deep: !deep}) must be equal to b1`);
  t.notEqual(copy(b2, {deep: !deep}), b2, `copy(b2, {deep: !deep}) must NOT be b2`);
  t.notEqual(copy(b2, {deep: !deep}), b1, `copy(b2, {deep: !deep}) must NOT be b1`);

  // Deep Buffer ONLY copies
  t.deepEqual(copy(b1, {deep: deep}), b1, `copy(b1, {deep: deep}) must be equal to b1`);
  t.deepEqual(copy(b1, {deep: deep}), b2, `copy(b1, {deep: deep}) must be equal to b2`);
  t.notEqual(copy(b1, {deep: deep}), b1, `copy(b1, {deep: deep}) must NOT be b1`);
  t.notEqual(copy(b1, {deep: deep}), b2, `copy(b1, {deep: deep}) must NOT be b2`);

  t.deepEqual(copy(b2, {deep: deep}), b2, `copy(b2, {deep: deep}) must be equal to b2`);
  t.deepEqual(copy(b2, {deep: deep}), b1, `copy(b2, {deep: deep}) must be equal to b1`);
  t.notEqual(copy(b2, {deep: deep}), b2, `copy(b2, {deep: deep}) must NOT be b2`);
  t.notEqual(copy(b2, {deep: deep}), b1, `copy(b2, {deep: deep}) must NOT be b1`);

  // Buffers as properties on other objects
  let o1 = {b: b1};
  let o2 = {b: b2};

  // Shallow Buffer property copies
  let c1 = copy(o1, {deep: !deep});
  t.deepEqual(c1, o1, `copy(o1, {deep: !deep}) must be equal to o1`);
  t.deepEqual(c1, o2, `copy(o1, {deep: !deep}) must be equal to o2`);
  t.deepEqual(c1.b, b1, `c1.b must be equal to b1`);
  t.deepEqual(c1.b, b2, `c1.b must be equal to b2`);
  t.equal(c1.b, b1, `c1.b must be b1`);
  t.notEqual(c1.b, b2, `c1.b must NOT be b2`);

  let c2 = copy(o2, {deep: !deep});
  t.deepEqual(c2, o1, `copy(o2, {deep: !deep}) must be equal to o1`);
  t.deepEqual(c2, o2, `copy(o2, {deep: !deep}) must be equal to o2`);
  t.deepEqual(c2.b, b1, `c2.b must be equal to b1`);
  t.deepEqual(c2.b, b2, `c2.b must be equal to b2`);
  t.notEqual(c2.b, b1, `c2.b must NOT be b1`);
  t.equal(c2.b, b2, `c2.b must be b2`);

  // Deep Buffer property copies
  c1 = copy(o1, {deep: deep});
  t.deepEqual(c1, o1, `copy(o1, {deep: deep}) must be equal to o1`);
  t.deepEqual(c1, o2, `copy(o1, {deep: deep}) must be equal to o2`);
  t.deepEqual(c1.b, b1, `c1.b must be equal to b1`);
  t.deepEqual(c1.b, b2, `c1.b must be equal to b2`);
  t.notEqual(c1.b, b1, `c1.b must NOT be b1`);
  t.notEqual(c1.b, b2, `c1.b must NOT be b2`);

  c2 = copy(o2, {deep: deep});
  t.deepEqual(c2, o1, `copy(o2, {deep: deep}) must be equal to o1`);
  t.deepEqual(c2, o2, `copy(o2, {deep: deep}) must be equal to o2`);
  t.deepEqual(c2.b, b1, `c2.b must be equal to b1`);
  t.deepEqual(c2.b, b2, `c2.b must be equal to b2`);
  t.notEqual(c2.b, b1, `c2.b must NOT be b1`);
  t.notEqual(c2.b, b2, `c2.b must NOT be b2`);

  t.end();
});
