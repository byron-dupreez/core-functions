'use strict';

/**
 * Unit tests for core-functions/merging.js
 * @author Byron du Preez
 */

const test = require('tape');

const merging = require('../merging');
const merge = merging.merge;

const copying = require('../copying');
const copy = copying.copy;

const strings = require('../strings');
const stringify = strings.stringify;

// const Objects = require('../objects');


// =====================================================================================================================
// merge
// =====================================================================================================================

test('merge', t => {
  // merge into empty object
  const from = {a: 1, b: '2', c: {d: 3, e: '4'}};
  t.deepEqual(merge(from, {}), from, 'merge({}) must have all of from');

  // merge from empty object
  const to0 = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}};
  const to0Orig = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}};
  t.deepEqual(merge({}, to0), to0Orig, 'merge with from empty must have all of original to0');

  // shallow merge without replace (all same properties)
  const to1 = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}};
  const to1Orig = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}};
  t.deepEqual(merge(from, to1), to1Orig, 'shallow merge without replace must still be original to');

  // shallow merge with replace (all same properties)
  const merge1 = merge(from, to1, {replace: true});
  t.notDeepEqual(merge1, {a: 2, b: '3', c: {d: 4, e: '5', f: 6}}, 'shallow merge with replace must not be original to');
  t.deepEqual(merge1, from, 'shallow merge with replace must have all of from');

  // shallow merge without replace (with to properties not in from)
  const to2 = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}, z: 'ZZZ'};
  const to2Orig = {a: 2, b: '3', c: {d: 4, e: '5', f: 6}, z: 'ZZZ'};
  t.deepEqual(merge(from, to2), to2Orig, 'shallow merge without replace must still be original to2');

  // shallow merge with replace (with to properties not in from)
  const merge2 = merge(from, to2, {replace: true});
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
  t.deepEqual(merge(from, to3, {replace: true, deep: true}), {
    a: 1,
    b: '2',
    c: {d: 3, e: '4', f: 6},
    z: 'ZZZ'
  }, 'deep merge with replace must have all of from + all extra original to2 properties');

  // deep without replace must NOT replace any matching properties
  const to4 = {a: 2, c: {e: '5', f: 6, y: 'Y'}, x: 'X', z: 'ZZZ'};
  const to4Orig = {a: 2, b: '2', c: {d: 3, e: '5', f: 6, y: 'Y'}, x: 'X', z: 'ZZZ'};
  t.deepEqual(merge(from, to4, {replace: false, deep: true}), to4Orig, 'deep merge without replace must have all of to4 and only extras of from');

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
  t.deepEqual(merge(from5, to5, {replace: false, deep: false}), expected5, 'deep merge without replace must have all functions of to5 and only extra functions of from5');
  t.equal(to5.a, a1, 'to5.a must be function a1');
  t.equal(to5.b, b, 'to5.b must be function b');
  t.equal(to5.c, c, 'to5.c must be function c');
  t.equal(to5.z, 'Z1', 'to5.z must be Z1');

  function x() {
  }

  const to6 = {a: a1, x: x, y: 'y1', z: 'Z1'};
  const expected6 = {a: a2, b: b, c: c, x: x, y: 'y1', z: 'Z2'};
  t.deepEqual(merge(from5, to6, {replace: true, deep: false}), expected6, 'deep merge with replace must have all functions of from5 and only extra functions of to6');
  t.equal(to6.a, a2, 'to6.a must be function a2');
  t.equal(to6.x, x, 'to6.x must be function x');
  t.equal(to6.z, 'Z2', 'to5.z must be Z2');

  const from7 = {a: a2, b: b, c: c, z: 'Z2'};
  const to7 = {a: a1, x: x, y: 'y1', z: 'Z1'};
  const expected7 = {a: a2, b: b, c: c, x: x, y: 'y1', z: 'Z2'};
  t.deepEqual(merge(from7, to7, {replace: true, deep: true}), expected7, 'deep merge with replace must have all functions of from7 and only extra functions of to7');

  function d() {
  }

  const from8 = {o: {a: a2, b: b}, c: c, z: 'Z2'};
  const to8 = {o: {a: a1, x: x, y: 'y1'}, d: d, z: 'Z1'};
  const expected8 = {o: {a: a1, b: b, x: x, y: 'y1'}, c: c, d: d, z: 'Z1'};
  t.deepEqual(merge(from8, to8, {replace: false, deep: true}), expected8, 'deep merge without replace must have all functions of to8 and only extra functions of from8');

  const from9 = {o: {a: a2, b: b}, c: c, z: 'Z2'};
  const to9 = {o: {a: a1, x: x, y: 'y1'}, d: d, z: 'Z1'};
  const expected9 = {o: {a: a2, b: b, x: x, y: 'y1'}, c: c, d: d, z: 'Z2'};
  t.deepEqual(merge(from9, to9, {replace: true, deep: true}), expected9, 'deep merge with replace must have all functions of from9 and only extra functions of to9');

  const from10 = {o: {a: a2, b: b}, c: c, z: 'Z2'};
  const to10 = {o: {a: a1, x: x, y: 'y1'}, d: d, z: 'Z1'};
  const expected10 = {o: {a: a2, b: b}, c: c, d: d, z: 'Z2'};
  t.deepEqual(merge(from10, to10, {replace: true, deep: false}), expected10, 'shallow merge with replace must have all of from10 and only extra top-level properties of to10');

  const from11 = {o: {a: a2, b: b}, c: c, z: 'Z2'};
  const to11 = {o: {a: a1, x: x, y: 'y1'}, d: d, z: 'Z1'};
  const expected11 = {o: {a: a1, x: x, y: 'y1'}, c: c, d: d, z: 'Z1'};
  t.deepEqual(merge(from11, to11, {replace: false, deep: false}), expected11, 'shallow merge with replace must have all of to11 and only extra top-level properties of from11');

  // Create infinite loops (non-DAGs)
  const o3 = {o: {a: a1, x: 'X', p: {b: b, y: 'Y'}}, c: c, z: 'Z'};
  o3.o.o3Again = o3;
  o3.o.p.o3Again = o3;

  const c3 = {o: {a: a2, x: 'X2', p: {b: b, y: 'Y2'}}, c: c, z: 'Z2'};
  c3.o.o3Again = c3;
  c3.o.p.o3Again = c3;

  merge(o3, c3, {replace: false, deep: true});
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

  const s1 = {
    loggingOptions: {
      logLevel: "INFO",
      useLevelPrefixes: true,
      envLogLevelName: "LOG_LEVEL"
    }
  };
  const s2 = {
    loggingOptions: {
      logLevel: "TRACE",
      useConsoleTrace: false
    }
  };
  const s2c = copy(s2, {deep: true});
  merge(s1, s2c, {deep: false, replace: false});
  t.deepEqual(s2c, s2, `shallow merge no replace - s2c must still be original ${stringify(s2)}`);

  const sX = {
    loggingOptions: {
      logLevel: "TRACE",
      useConsoleTrace: false,
      useLevelPrefixes: true,
      envLogLevelName: "LOG_LEVEL"
    }
  };
  const s2c2 = copy(s2, {deep: true});
  merge(s1, s2c2, {deep: true, replace: false});
  t.deepEqual(s2c2, sX, `deep merge no replace - s2c must be ${stringify(sX)}`);

  t.end();
});

// =====================================================================================================================
// merge arrays
// =====================================================================================================================
test('merge empty arrays', t => {
  // Shallow merge of empty array
  const a0 = [];
  const b0 = [];
  const c0 = merge(a0, b0, {replace: false, deep: false});
  t.ok(Array.isArray(c0), `shallow merge ${stringify(c0)} must be an array`);
  t.notEqual(c0, a0, `shallow merge ${stringify(c0)} must not be same instance`);
  t.deepEqual(c0, a0, `shallow merge ${stringify(c0)} must be deep equal`);

  // Deep merge of empty array
  const a1 = [];
  const b1 = [];
  const c1 = merge(a1, b1, {replace: false, deep: true});
  t.ok(Array.isArray(c1), `deep merge ${stringify(c1)} must be an array`);
  t.notEqual(c1, a1, `deep merge ${stringify(c1)} must NOT be same instance`);
  t.deepEqual(c1, a1, `deep merge ${stringify(c1)} must be deep equal`);

  t.end();
});

test('merge simple arrays to empty arrays', t => {
  // Shallow merge of simple array to empty
  const a0 = [1, 2, 3];
  const b0 = [];
  const c0 = merge(a0, b0, {replace: false, deep: false});
  t.ok(Array.isArray(c0), `shallow merge ${stringify(c0)} must be an array`);
  t.notEqual(c0, a0, `shallow merge ${stringify(c0)} must not be same instance`);
  t.deepEqual(c0, a0, `shallow merge ${stringify(c0)} must be deep equal`);

  // Deep merge of empty array
  const a1 = [1, 2, 3];
  const b1 = [];
  const c1 = merge(a1, b1, {replace: false, deep: true});
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
  merge(a0, b0, {replace: false, deep: false});
  t.ok(Array.isArray(b0), `shallow merge ${stringify(b0)} must be an array`);
  t.notEqual(b0, a0, `shallow merge ${stringify(b0)} must not be same instance`);
  t.deepEqual(b0, x0, `shallow merge ${stringify(b0)} must be deep equal`);

  // Deep merge of empty array
  const a1 = [];
  const b1 = ["1", 2, "3"];
  const x1 = ["1", 2, "3"];
  const c1 = merge(a1, b1, {replace: false, deep: true});
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
  merge(a0, b0, {replace: false, deep: false});
  t.ok(Array.isArray(b0), `shallow merge ${stringify(b0)} must be an array`);
  t.notEqual(b0, a0, `shallow merge ${stringify(b0)} must not be same instance`);
  t.deepEqual(b0, x0, `shallow merge ${stringify(b0)} must be deep equal`);

  // Shallow merge with replace
  const a1 = ["1", 2, "3", 4.0];
  const b1 = [9, "8"];
  const x1 = ["1", 2, "3", 4.0];
  merge(a1, b1, {replace: true, deep: false});
  t.ok(Array.isArray(b1), `deep merge ${stringify(b1)} must be an array`);
  t.notEqual(b1, a1, `deep merge ${stringify(b1)} must NOT be same instance`);
  t.deepEqual(b1, x1, `deep merge ${stringify(b1)} must be deep equal`);

  // Deep merge without replace
  const a2 = [1, 2, 3, 4.0];
  const b2 = ["9", 8];
  const x2 = ["9", 8, 3, 4.0];
  merge(a2, b2, {replace: false, deep: true});
  t.ok(Array.isArray(b2), `deep merge ${stringify(b2)} must be an array`);
  t.notEqual(b2, a2, `deep merge ${stringify(b2)} must not be same instance`);
  t.deepEqual(b2, x2, `deep merge ${stringify(b2)} must be deep equal`);

  // Deep merge with replace
  const a4 = ["1", 2, "3", 4.0];
  const b4 = [9, 8];
  const x4 = ["1", 2, "3", 4.0];
  merge(a4, b4, {replace: true, deep: true});
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
  merge(a0, b0, {replace: false, deep: false});
  t.ok(Array.isArray(b0), `shallow merge ${stringify(b0)} must be an array`);
  t.notEqual(b0, a0, `shallow merge ${stringify(b0)} must not be same instance`);
  t.deepEqual(b0, x0, `shallow merge ${stringify(b0)} must be deep equal`);

  // Shallow merge with replace
  const a1 = [9, "8"];
  const b1 = ["1", 2, "3", 4.0, [5]];
  const x1 = [9, "8", "3", 4.0, [5]];
  merge(a1, b1, {replace: true, deep: false});
  t.ok(Array.isArray(b1), `deep merge ${stringify(b1)} must be an array`);
  t.notEqual(b1, a1, `deep merge ${stringify(b1)} must NOT be same instance`);
  t.deepEqual(b1, x1, `deep merge ${stringify(b1)} must be deep equal`);

  // Deep merge without replace
  const a2 = ["9", 8];
  const b2 = [1, 2, 3, 4.0, [5]];
  const x2 = [1, 2, 3, 4.0, [5]];
  merge(a2, b2, {replace: false, deep: true});
  t.ok(Array.isArray(b2), `deep merge ${stringify(b2)} must be an array`);
  t.notEqual(b2, a2, `deep merge ${stringify(b2)} must not be same instance`);
  t.deepEqual(b2, x2, `deep merge ${stringify(b2)} must be deep equal`);

  // Deep merge with replace
  const a4 = [9, 8];
  const b4 = ["1", 2, "3", 4.0, [5]];
  const x4 = [9, 8, "3", 4.0, [5]];
  merge(a4, b4, {replace: true, deep: true});
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

  merge(a1, b1, {replace: false, deep: false});

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

  merge(a2, b2, {replace: true, deep: false});

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
  merge(a3, b3, {replace: false, deep: true});

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
  merge(a4, b4, {replace: true, deep: true});

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
  merge(a0, b0, {replace: false, deep: false});
  t.ok(!Array.isArray(b0), `shallow merge ${stringify(b0)} must NOT be an array`);
  t.ok(Array.isArray(b0.a), `shallow merge ${stringify(b0.a)} must be an array`);
  t.notEqual(b0, a0, `shallow merge ${stringify(b0)} must not be same instance`);
  t.deepEqual(b0, x0, `shallow merge ${stringify(b0)} must be deep equal`);

  // Shallow merge with replace
  const a1 = {a: [3], b: {c: [4, 5]}};
  const b1 = {a: [1, 2], b: {c: [6]}};
  const x1 = {a: [3], b: {c: [4, 5]}};
  merge(a1, b1, {replace: true, deep: false});
  t.ok(!Array.isArray(b1), `shallow merge ${stringify(b1)} must NOT be an array`);
  t.ok(Array.isArray(b1.a), `shallow merge ${stringify(b1.a)} must be an array`);
  t.notEqual(b1, a1, `shallow merge ${stringify(b1)} must NOT be same instance`);
  t.deepEqual(b1, x1, `shallow merge ${stringify(b1)} must be deep equal`);

  // Deep merge without replace
  const a2 = {a: [3], b: {c: [4, 5]}};
  const b2 = {a: [1, 2], b: {c: [6]}};
  const x2 = {a: [1, 2], b: {c: [6, 5]}};
  merge(a2, b2, {replace: false, deep: true});
  t.ok(!Array.isArray(b2), `deep merge ${stringify(b2)} must NOT be an array`);
  t.ok(Array.isArray(b2.a), `deep merge ${stringify(b2.a)} must be an array`);
  t.notEqual(b2, a2, `deep merge ${stringify(b2)} must NOT be same instance`);
  t.deepEqual(b2, x2, `deep merge ${stringify(b2)} must be deep equal`);

  // Deep merge with replace
  const a3 = {a: [3], b: {c: [4, 5]}};
  const b3 = {a: [1, 2], b: {c: [6]}};
  const x3 = {a: [3, 2], b: {c: [4, 5]}};
  merge(a3, b3, {replace: true, deep: true});
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

  merge(a0, b0, {replace: false, deep: false});

  t.ok(Array.isArray(b0), `shallow merge ${stringify(b0)} must be an array`);
  t.deepEqual(b0, x0, `shallow merge ${stringify(b0)} must be deep equal`);
  t.deepEqual(b0.a, x0.a, `shallow merge a ${stringify(b0.a)} must be deep equal`);
  t.deepEqual(b0.b, x0.b, `shallow merge b ${stringify(b0.b)} must be deep equal`);

  // Shallow merge with replace
  const a1 = {a: [3], b: {c: [4, 5]}};
  const b1 = ["9", "8"]; b1.a = [1, 2]; b1.b = {c: [6]};
  const x1 = ["9", "8"]; x1.a = [3]; x1.b = {c: [4, 5]};

  merge(a1, b1, {replace: true, deep: false});

  t.ok(Array.isArray(b1), `shallow merge ${stringify(b1)} must be an array`);
  t.deepEqual(b1, x1, `shallow merge ${stringify(b1)} must be deep equal`);
  t.deepEqual(b1.a, x1.a, `shallow merge a ${stringify(b1.a)} must be deep equal`);
  t.deepEqual(b1.b, x1.b, `shallow merge b ${stringify(b1.b)} must be deep equal`);

  // Deep merge without replace
  const a2 = {a: [3], b: {c: [4,5]}};
  const b2 = [9,7]; b2.a = [1,2]; b2.b = {c: [6]};
  const x2 = [9,7]; x2.a = [1,2]; x2.b = {c: [6,5]};

  merge(a2, b2, {replace: false, deep: true});

  t.ok(Array.isArray(b2), `deep merge ${stringify(b2)} must be an array`);
  t.deepEqual(b2, x2, `deep merge ${stringify(b2)} must be deep equal`);
  t.deepEqual(b2.a, x2.a, `deep merge a ${stringify(b2.a)} must be deep equal`);
  t.deepEqual(b2.b, x2.b, `deep merge b ${stringify(b2.b)} must be deep equal`);

  // Deep merge with replace
  const a3 = {a: [3], b: {c: [4,5]}};
  const b3 = [9,7]; b3.a = [1,2]; b3.b = {c: [6]};
  const x3 = [9,7]; x3.a = [3,2]; x3.b = {c: [4,5]};
  merge(a3, b3, {replace: true, deep: true});
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
  const replace = true;
  const deep = true;
  const onlyV = true;

  // Shallow merge without replace
  const a0 = ["9", "8"]; a0.a = [3]; a0.b = {c: [4, 5]};

  let b0 = {a: [1, 2], b: {c: [6]}};
  let x0 = {"0": "9", "1": "8", a: [1, 2], b: {c: [6]}};
  merge(a0, b0, {replace: !replace, deep: !deep, onlyValues: !onlyV});

  t.ok(!Array.isArray(b0), `shallow merge(${stringify(b0)}, !replace, !deep, !onlyV) must not be an array`);
  t.deepEqual(b0, x0, `shallow merge(${stringify(b0)}, !replace, !deep, !onlyV) must be deep equal`);
  t.deepEqual(b0.a, x0.a, `shallow merge a ${stringify(b0.a)} must be deep equal`);
  t.deepEqual(b0.b, x0.b, `shallow merge b ${stringify(b0.b)} must be deep equal`);

  b0 = {a: [1, 2], b: {c: [6]}};
  x0 = {"0": "9", "1": "8", "length": 2, a: [1, 2], b: {c: [6]}};
  merge(a0, b0, {replace: !replace, deep: !deep, onlyValues: onlyV});

  t.ok(!Array.isArray(b0), `shallow merge(${stringify(b0)}, !replace, !deep, onlyV) must not be an array`);
  t.deepEqual(b0, x0, `shallow merge(${stringify(b0)}, !replace, !deep, onlyV) must be deep equal`);
  t.deepEqual(b0.a, x0.a, `shallow merge a ${stringify(b0.a)} must be deep equal`);
  t.deepEqual(b0.b, x0.b, `shallow merge b ${stringify(b0.b)} must be deep equal`);

  // Shallow merge with replace
  const a1 = ["9", "8"]; a1.a = [3]; a1.b = {c: [4, 5]};
  let b1 = {a: [1, 2], b: {c: [6]}};
  let x1 = {"0": "9", "1": "8", a: [3], b: {c: [4,5]}};

  merge(a1, b1, {replace: replace, deep: !deep, onlyValues: !onlyV});

  t.ok(!Array.isArray(b1), `shallow merge(${stringify(b1)}, replace, !deep, !onlyV) must not be an array`);
  t.deepEqual(b1, x1, `shallow merge(${stringify(b1)}, replace, !deep, !onlyV) must be deep equal`);
  t.deepEqual(b1.a, x1.a, `shallow merge a ${stringify(b1.a)} must be deep equal`);
  t.deepEqual(b1.b, x1.b, `shallow merge b ${stringify(b1.b)} must be deep equal`);

  b1 = {a: [1, 2], b: {c: [6]}};
  x1 = {"0": "9", "1": "8", "length": 2, a: [3], b: {c: [4,5]}};

  merge(a1, b1, {replace: replace, deep: !deep, onlyValues: onlyV});

  t.ok(!Array.isArray(b1), `shallow merge(${stringify(b1)}, replace, !deep, onlyV) must not be an array`);
  t.deepEqual(b1, x1, `shallow merge(${stringify(b1)}, replace, !deep, onlyV) must be deep equal`);
  t.deepEqual(b1.a, x1.a, `shallow merge a ${stringify(b1.a)} must be deep equal`);
  t.deepEqual(b1.b, x1.b, `shallow merge b ${stringify(b1.b)} must be deep equal`);

  // Deep merge without replace
  const a2 = ["9", "8"]; a2.a = [3]; a2.b = {c: [4, 5]};
  let b2 = {a: [1, 2], b: {c: [6]}};
  let x2 = {"0": "9", "1": "8", a: [1,2], b: {c: [6,5]}};

  merge(a2, b2, {replace: !replace, deep: deep, onlyValues: !onlyV});

  t.ok(!Array.isArray(b2), `deep merge(${stringify(b2)}, !replace, deep, !onlyV) must not be an array`);
  t.deepEqual(b2, x2, `deep merge(${stringify(b2)}, !replace, deep, !onlyV) must be deep equal`);
  t.deepEqual(b2.a, x2.a, `deep merge a ${stringify(b2.a)} must be deep equal`);
  t.deepEqual(b2.b, x2.b, `deep merge b ${stringify(b2.b)} must be deep equal`);

  b2 = {a: [1, 2], b: {c: [6]}};
  x2 = {"0": "9", "1": "8", "length": 2, a: [1,2], b: {c: [6,5]}};

  merge(a2, b2, {replace: !replace, deep: deep, onlyValues: onlyV});

  t.ok(!Array.isArray(b2), `deep merge(${stringify(b2)}, !replace, deep, onlyV) must not be an array`);
  t.deepEqual(b2, x2, `deep merge(${stringify(b2)}, !replace, deep, onlyV) must be deep equal`);
  t.deepEqual(b2.a, x2.a, `deep merge a ${stringify(b2.a)} must be deep equal`);
  t.deepEqual(b2.b, x2.b, `deep merge b ${stringify(b2.b)} must be deep equal`);

  // Deep merge with replace
  const a3 = ["9", "8"]; a3.a = [3]; a3.b = {c: [4, 5]};
  let b3 = {a: [1, 2], b: {c: [6]}};
  let x3 = {"0": "9", "1": "8", a: [3,2], b: {c: [4,5]}};

  merge(a3, b3, {replace: replace, deep: deep, onlyValues: !onlyV});

  t.ok(!Array.isArray(b3), `deep merge(${stringify(b3)}, replace, deep, !onlyV) must not be an array`);
  t.deepEqual(b3, x3, `deep merge(${stringify(b3)}, replace, deep, !onlyV) must be deep equal`);
  t.deepEqual(b3.a, x3.a, `deep merge a ${stringify(b3.a)} must be deep equal`);
  t.deepEqual(b3.b, x3.b, `deep merge b ${stringify(b3.b)} must be deep equal`);

  b3 = {a: [1, 2], b: {c: [6]}};
  x3 = {"0": "9", "1": "8", "length": 2, a: [3,2], b: {c: [4,5]}};

  merge(a3, b3, {replace: replace, deep: deep, onlyValues: onlyV});

  t.ok(!Array.isArray(b3), `deep merge(${stringify(b3)}, replace, deep, onlyV) must not be an array`);
  t.deepEqual(b3, x3, `deep merge(${stringify(b3)}, replace, deep, onlyV) must be deep equal`);
  t.deepEqual(b3.a, x3.a, `deep merge a ${stringify(b3.a)} must be deep equal`);
  t.deepEqual(b3.b, x3.b, `deep merge b ${stringify(b3.b)} must be deep equal`);

  t.end();
});

// =====================================================================================================================
// merge with onlyEnumerable (& onlyValues?)
// =====================================================================================================================

test(`merge with onlyEnumerable - with 1st set of enumerables`, t => {
  const deep = true;
  const replace = true;
  const onlyE = true;
  const onlyV = true;

  function flag1stSetNonEnumerable(o) {
    if (o.hasOwnProperty('b')) Object.defineProperty(o, 'b', {enumerable: false});
    if (o.c && o.c.hasOwnProperty('d')) Object.defineProperty(o.c, 'd', {enumerable: false});
    if (o.c && o.c.e && o.c.e.hasOwnProperty('f')) Object.defineProperty(o.c.e, 'f', {enumerable: false});
    if (o.c && o.c.e && o.c.e.hasOwnProperty('h')) Object.defineProperty(o.c.e, 'h', {enumerable: false});
    if (o.hasOwnProperty('i')) Object.defineProperty(o, 'i', {enumerable: false});
    if (o.i && o.i.hasOwnProperty('k')) Object.defineProperty(o.i, 'k', {enumerable: false});
  }

  const f1 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  flag1stSetNonEnumerable(f1);

  // t0 - deep, no replace, not only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  let t0 = {};
  let x0 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  flag1stSetNonEnumerable(x0);
  t.deepEqual(merge(f1, t0, {replace: !replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x0, `merge(f1, t0, {!replace, deep, !onlyE, !onlyV}) must be ${stringify(x0)}`);

  t0 = {};
  x0 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  // flag1stSetNonEnumerable(x0);
  t.deepEqual(merge(f1, t0, {replace: !replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x0, `merge(f1, t0, {!replace, deep, !onlyE, onlyV}) must be ${stringify(x0)}`);

  // t0 - deep, no replace, only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t0 = {};
  x0 = {a: 1, c: {e: {}}};
  // flag1stSetNonEnumerable(x0);
  t.deepEqual(merge(f1, t0, {replace: !replace, deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x0, `merge(f1, t0, {!replace, deep, onlyE, !onlyV}) must be ${stringify(x0)}`);

  t0 = {};
  x0 = {a: 1, c: {e: {}}};
  // flag1stSetNonEnumerable(x0);
  t.deepEqual(merge(f1, t0, {replace: !replace, deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x0, `merge(f1, t0, {!replace, deep, onlyE, onlyV}) must be ${stringify(x0)}`);

  // t0 - deep, replace, not only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t0 = {};
  x0 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  flag1stSetNonEnumerable(x0);
  t.deepEqual(merge(f1, t0, {replace: replace,  deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x0, `merge(f1, t0, {replace, deep, !onlyE, !onlyV}) must be ${stringify(x0)}`);

  t0 = {};
  x0 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  // flag1stSetNonEnumerable(x0);
  t.deepEqual(merge(f1, t0, {replace: replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x0, `merge(f1, t0, {replace, deep, !onlyE, onlyV}) must be ${stringify(x0)}`);

  // t0 - deep, replace, only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t0 = {};
  x0 = {a: 1, c: {e: {}}};
  // flag1stSetNonEnumerable(x0);
  t.deepEqual(merge(f1, t0, {replace: replace, deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x0, `merge(f1, t0, {replace, deep, onlyE, !onlyV}) must be ${stringify(x0)}`);

  t0 = {};
  x0 = {a: 1, c: {e: {}}};
  // flag1stSetNonEnumerable(x0);
  t.deepEqual(merge(f1, t0, {replace: replace, deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x0, `merge(f1, t0, {replace, deep, onlyE, onlyV}) must be ${stringify(x0)}`);

  // t1 has ONLY enumerable values
  // -------------------------------------------------------------------------------------------------------------------

  // t1 - deep, no replace, not only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  let t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  let x1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  // flag1stSetNonEnumerable(x1);
  t.deepEqual(merge(f1, t1, {replace: !replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x1, `merge(f1, t1, {!replace, deep, !onlyE, !onlyV}) must be ${stringify(x1)}`);

  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  x1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  // flag1stSetNonEnumerable(x1);
  t.deepEqual(merge(f1, t1, {replace: !replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x1, `merge(f1, t1, {!replace, deep, !onlyE, onlyV}) must be ${stringify(x1)}`);

  // t1 - deep, no replace, only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  x1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  // flag1stSetNonEnumerable(x1);
  t.deepEqual(merge(f1, t1, {replace: !replace, deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x1, `merge(f1, t1, {!replace, deep, onlyE, !onlyV}) must be ${stringify(x1)}`);

  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  x1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  // flag1stSetNonEnumerable(x1);
  t.deepEqual(merge(f1, t1, {replace: !replace, deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x1, `merge(f1, t1, {!replace, deep, onlyE, onlyV}) must be ${stringify(x1)}`);

  // t1 - deep, replace, not only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  //flag1stSetNonEnumerable(t1);
  x1 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  flag1stSetNonEnumerable(x1);
  t.notOk(f1.propertyIsEnumerable('i'), `f1.i must NOT be enumerable`);
  t.notOk(x1.propertyIsEnumerable('i'), `x1.i must NOT be enumerable`);
  t.deepEqual(merge(f1, t1, {replace: replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x1, `merge(f1, t1, {replace, deep, !onlyE, !onlyV}) must be ${stringify(x1)}`);
  t.notOk(t1.propertyIsEnumerable('i'), `t1.i must NOT be enumerable`);

  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  x1 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  t.deepEqual(merge(f1, t1, {replace: replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x1, `merge(f1, t1, {replace, deep, !onlyE, onlyV}) must be ${stringify(x1)}`);

  // t1 - deep, replace, only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  x1 = {a: 1, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  // flag1stSetNonEnumerable(x1);
  t.deepEqual(merge(f1, t1, {replace: replace, deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x1, `merge(f1, t1, {replace, deep: onlyE, !onlyV}) must be ${stringify(x1)}`);

  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  x1 = {a: 1, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  t.deepEqual(merge(f1, t1, {replace: replace, deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x1, `merge(f1, t1, {replace, deep: onlyE, onlyV}) must be ${stringify(x1)}`);

  // t1 has SAME non-enumerable values
  // -------------------------------------------------------------------------------------------------------------------

  // t1 - deep, no replace, not only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(t1);
  x1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(x1);
  t.deepEqual(merge(f1, t1, {replace: !replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x1, `merge(f1, t1, {!replace, deep, !onlyE, !onlyV}) must be ${stringify(x1)}`);

  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(t1);
  x1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(x1);
  t.deepEqual(merge(f1, t1, {replace: !replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x1, `merge(f1, t1, {!replace, deep, !onlyE, onlyV}) must be ${stringify(x1)}`);

  // t1 - deep, no replace, only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(t1);
  x1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(x1);
  t.deepEqual(merge(f1, t1, {replace: !replace, deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x1, `merge(f1, t1, {!replace, deep, onlyE, !onlyV}) must be ${stringify(x1)}`);

  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(t1);
  x1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(x1);
  t.deepEqual(merge(f1, t1, {replace: !replace, deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x1, `merge(f1, t1, {!replace, deep, onlyE, onlyV}) must be ${stringify(x1)}`);

  // t1 - deep, replace, not only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(t1);
  x1 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  flag1stSetNonEnumerable(x1);
  t.notOk(f1.propertyIsEnumerable('i'), `f1.i must NOT be enumerable`);
  t.notOk(x1.propertyIsEnumerable('i'), `x1.i must NOT be enumerable`);
  t.deepEqual(merge(f1, t1, {replace: replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x1, `merge(f1, t1, {replace, deep, !onlyE, !onlyV}) must be ${stringify(x1)}`);
  t.notOk(t1.propertyIsEnumerable('i'), `t1.i must NOT be enumerable`);

  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(t1);
  x1 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  flag1stSetNonEnumerable(x1);
  t.deepEqual(merge(f1, t1, {replace: replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x1, `merge(f1, t1, {replace, deep, !onlyE, onlyV}) must be ${stringify(x1)}`);

  // t1 - deep, replace, only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(t1);
  x1 = {a: 1, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(x1);
  t.deepEqual(merge(f1, t1, {replace: replace, deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x1, `merge(f1, t1, {replace, deep: onlyE, !onlyV}) must be ${stringify(x1)}`);

  t1 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(t1);
  x1 = {a: 1, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag1stSetNonEnumerable(x1);
  t.deepEqual(merge(f1, t1, {replace: replace, deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x1, `merge(f1, t1, {replace, deep: onlyE, onlyV}) must be ${stringify(x1)}`);

  t.end();
});

test(`merge with onlyEnumerable - with 2nd set of enumerables`, t => {
  const deep = true;
  const replace = true;
  const onlyE = true;
  const onlyV = true;

  function flag2ndSetNonEnumerable(o) {
    if (o.hasOwnProperty('a')) Object.defineProperty(o, 'a', {enumerable: false});
    if (o.hasOwnProperty('c')) Object.defineProperty(o, 'c', {enumerable: false});
    if (o.c && o.c.hasOwnProperty('e')) Object.defineProperty(o.c, 'e', {enumerable: false});
    if (o.c && o.c.e && o.c.e.f && o.c.e.f.hasOwnProperty('g')) Object.defineProperty(o.c.e.f, 'g', {enumerable: false});
    if (o.i && o.i.hasOwnProperty('j')) Object.defineProperty(o.i, 'j', {enumerable: false});
  }

  const f2 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  flag2ndSetNonEnumerable(f2);

  // t0 - deep, no replace, not only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  let t0 = {};
  let x0 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  flag2ndSetNonEnumerable(x0);
  t.deepEqual(merge(f2, t0, {replace: !replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x0, `merge(f2, t0, {!replace, deep, !onlyE, !onlyV}) must be ${stringify(x0)}`);

  t0 = {};
  x0 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  // flag2ndSetNonEnumerable(x0);
  t.deepEqual(merge(f2, t0, {replace: !replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x0, `merge(f2, t0, {!replace, deep, !onlyE, onlyV}) must be ${stringify(x0)}`);

  // t0 - deep, no replace, only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t0 = {};
  x0 = {b: 2, i: {k: 11}};
  // flag2ndSetNonEnumerable(x0);
  t.deepEqual(merge(f2, t0, {replace: !replace, deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x0, `merge(f2, t0, {!replace, deep, onlyE, !onlyV}) must be ${stringify(x0)}`);

  t0 = {};
  x0 = {b: 2, i: {k: 11}};
  // flag2ndSetNonEnumerable(x0);
  t.deepEqual(merge(f2, t0, {replace: !replace, deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x0, `merge(f2, t0, {!replace, deep, onlyE, onlyV}) must be ${stringify(x0)}`);

  // t0 - deep, replace, not only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t0 = {};
  x0 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  flag2ndSetNonEnumerable(x0);
  t.deepEqual(merge(f2, t0, {replace: replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x0, `merge(f2, t0, {replace, deep, !onlyE, !onlyV}) must be ${stringify(x0)}`);

  t0 = {};
  x0 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  // flag2ndSetNonEnumerable(x0);
  t.deepEqual(merge(f2, t0, {replace: replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x0, `merge(f2, t0, {replace, deep, !onlyE, onlyV}) must be ${stringify(x0)}`);

  // t0 - deep, replace, only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t0 = {};
  x0 = {b: 2, i: {k: 11}};
  // flag2ndSetNonEnumerable(x0);
  t.deepEqual(merge(f2, t0, {replace: replace, deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x0, `merge(f2, t0, {replace, deep, onlyE, !onlyV}) must be ${stringify(x0)}`);

  t0 = {};
  x0 = {b: 2, i: {k: 11}};
  // flag2ndSetNonEnumerable(x0);
  t.deepEqual(merge(f2, t0, {replace: replace, deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x0, `merge(f2, t0, {replace, deep, onlyE, onlyV}) must be ${stringify(x0)}`);

  // -------------------------------------------------------------------------------------------------------------------
  // t2 has ONLY enumerable values
  // -------------------------------------------------------------------------------------------------------------------

  // t2 - deep, no replace, not only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  let t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  let x2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  // flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: !replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x2, `merge(f2, t2, {!replace, deep, !onlyE, !onlyV}) must be ${stringify(x2)}`);

  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  x2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  // flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: !replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x2, `merge(f2, t2, {!replace, deep, !onlyE, onlyV}) must be ${stringify(x2)}`);

  // t2 - deep, no replace, only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  x2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  // flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: !replace, deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x2, `merge(f2, t2, {!replace, deep, onlyE, !onlyV}) must be ${stringify(x2)}`);

  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  x2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  // flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: !replace, deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x2, `merge(f2, t2, {!replace, deep, onlyE, onlyV}) must be ${stringify(x2)}`);

  // t2 - deep, replace, not only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  x2 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x2, `merge(f2, t2, {replace, deep, !onlyE, !onlyV}) must be ${stringify(x2)}`);

  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  x2 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  // flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x2, `merge(f2, t2, {replace, deep, !onlyE, onlyV}) must be ${stringify(x2)}`);

  // t2 - deep, replace, only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  x2 = {a: 21, b: 2, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 11}};
  // flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: replace, deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x2, `merge(f2, t2, {replace, deep, onlyE, !onlyV}) must be ${stringify(x2)}`);

  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  x2 = {a: 21, b: 2, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 11}};
  // flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: replace, deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x2, `merge(f2, t2, {replace, deep, onlyE, onlyV}) must be ${stringify(x2)}`);

  // -------------------------------------------------------------------------------------------------------------------
  // t2 has SAME non-enumerable values
  // -------------------------------------------------------------------------------------------------------------------

  // t2 - deep, no replace, not only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag2ndSetNonEnumerable(t2);
  x2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: !replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x2, `merge(f2, t2, {!replace, deep, !onlyE, !onlyV}) must be ${stringify(x2)}`);

  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag2ndSetNonEnumerable(t2);
  x2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: !replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x2, `merge(f2, t2, {!replace, deep, !onlyE, onlyV}) must be ${stringify(x2)}`);

  // t2 - deep, no replace, only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag2ndSetNonEnumerable(t2);
  x2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: !replace, deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x2, `merge(f2, t2, {!replace, deep, onlyE, !onlyV}) must be ${stringify(x2)}`);

  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag2ndSetNonEnumerable(t2);
  x2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: !replace, deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x2, `merge(f2, t2, {!replace, deep, onlyE, onlyV}) must be ${stringify(x2)}`);

  // t2 - deep, replace, not only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag2ndSetNonEnumerable(t2);
  x2 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: !onlyV}), x2, `merge(f2, t2, {replace, deep, !onlyE, !onlyV}) must be ${stringify(x2)}`);

  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag2ndSetNonEnumerable(t2);
  x2 = {a: 1, b: 2, c: {d: 4, e: {f: {g: 7}, h: 8}}, i: {j: 10, k: 11}};
  flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: replace, deep: deep, onlyEnumerable: !onlyE, onlyValues: onlyV}), x2, `merge(f2, t2, {replace, deep, !onlyE, onlyV}) must be ${stringify(x2)}`);

  // t2 - deep, replace, only enumerable
  // -------------------------------------------------------------------------------------------------------------------
  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag2ndSetNonEnumerable(t2);
  x2 = {a: 21, b: 2, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 11}};
  flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: replace, deep: deep, onlyEnumerable: onlyE, onlyValues: !onlyV}), x2, `merge(f2, t2, {replace, deep, onlyE, !onlyV}) must be ${stringify(x2)}`);

  t2 = {a: 21, b: 22, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 211}};
  flag2ndSetNonEnumerable(t2);
  x2 = {a: 21, b: 2, c: {d: 24, e: {f: {g: 27}, h: 28}}, i: {j: 210, k: 11}};
  flag2ndSetNonEnumerable(x2);
  t.deepEqual(merge(f2, t2, {replace: replace, deep: deep, onlyEnumerable: onlyE, onlyValues: onlyV}), x2, `merge(f2, t2, {replace, deep, onlyE, onlyV}) must be ${stringify(x2)}`);

  t.end();
});

// =====================================================================================================================
// merge with Dates
// =====================================================================================================================

test(`merge with Dates`, t => {
  const deep = true;
  let d1 = new Date(1490870891647);
  let d2 = new Date(1490870891647); // same date, different instance

  // Shallow Date merges "(NOT) into new Date"
  let d = new Date();
  let m1 = merge(d1, d, {deep: !deep});
  t.deepEqual(m1, d1, `merge(d1, d, {deep: !deep}) must be equal to d1`);
  t.deepEqual(m1, d2, `merge(d1, d, {deep: !deep}) must be equal to d2`);
  t.equal(m1, d1, `merge(d1, d, {deep: !deep}) must be d1`);
  t.notEqual(m1, d2, `merge(d1, d, {deep: !deep}) must NOT be d2`);

  t.deepEqual(merge(d2, d, {deep: !deep}), d1, `merge(d2, d, {deep: !deep}) must be equal to d1`);
  t.deepEqual(merge(d2, d, {deep: !deep}), d2, `merge(d2, d, {deep: !deep}) must be equal to d2`);
  t.notEqual(merge(d2, d, {deep: !deep}), d1, `merge(d2, d, {deep: !deep}) must NOT be d1`);
  t.equal(merge(d2, d, {deep: !deep}), d2, `merge(d2, d, {deep: !deep}) must be d2`);

  // Shallow Date merges "(NOT) into d1"
  // d1 = new Date(1490870891647);
  m1 = merge(d1, d1, {deep: !deep});
  t.deepEqual(m1, d1, `merge(d1, d1, {!deep}) must be equal to d1`);
  t.deepEqual(m1, d2, `merge(d1, d1, {!deep}) must be equal to d2`);
  t.equal(m1, d1, `merge(d1, d1, {!deep}) must be d1`);
  t.notEqual(m1, d2, `merge(d1, d1, {!deep}) must NOT be d2`);

  d1 = new Date(1490870891647);
  m1 = merge(d2, d1, {deep: !deep});
  t.deepEqual(m1, d1, `merge(d2, d1, {!deep}) must be equal to d1`);
  t.deepEqual(m1, d2, `merge(d2, d1, {!deep}) must be equal to d2`);
  t.notEqual(m1, d1, `merge(d2, d1, {!deep}) must NOT be d1`);
  t.equal(m1, d2, `merge(d2, d1, {!deep}) must be d2`);

  // Shallow Date merges "(NOT) into d2"
  d2 = new Date(1490870891647);
  m1 = merge(d1, d2, {deep: !deep});
  t.deepEqual(m1, d1, `merge(d1, d2, {!deep}) must be equal to d1`);
  t.deepEqual(m1, d2, `merge(d1, d2, {!deep}) must be equal to d2`);
  t.equal(m1, d1, `merge(d1, d2, {!deep}) must be d1`);
  t.notEqual(m1, d2, `merge(d1, d2, {!deep}) must NOT be d2`);

  d2 = new Date(1490870891647);
  m1 = merge(d2, d2, {deep: !deep});
  t.deepEqual(m1, d1, `merge(d2, d2, {!deep}) must be equal to d1`);
  t.deepEqual(m1, d2, `merge(d2, d2, {!deep}) must be equal to d2`);
  t.notEqual(m1, d1, `merge(d2, d2, {!deep}) must NOT be d1`);
  t.equal(m1, d2, `merge(d2, d2, {!deep}) must be d2`);

  // Deep Date merges into new Date
  d = new Date();
  m1 = merge(d1, d, {deep: deep});
  // t.deepEqual(m1, d, `merge(d1, d, {deep}) must be equal to d`);
  t.deepEqual(m1, d1, `merge(d1, d, {deep}) must be equal to d1`);
  t.deepEqual(m1, d2, `merge(d1, d, {deep}) must be equal to d2`);
  // t.equal(m1, d, `merge(d1, d, {deep}) must be d`);
  t.notEqual(m1, d, `merge(d1, d, {deep}) must NOT be d`);
  t.notEqual(m1, d1, `merge(d1, d, {deep}) must NOT be d1`);
  t.notEqual(m1, d2, `merge(d1, d, {deep}) must NOT be d2`);

  d = new Date();
  m1 = merge(d2, d, {deep: deep});
  // t.deepEqual(m1, d, `merge(d2, d, {deep}) must be equal to d`);
  t.notDeepEqual(m1, d, `merge(d2, d, {deep}) must NOT be equal to d`);
  t.deepEqual(m1, d1, `merge(d2, d, {deep}) must be equal to d1`);
  t.deepEqual(m1, d2, `merge(d2, d, {deep}) must be equal to d2`);
  // t.equal(m1, d, `merge(d2, d, {deep}) must be d`);
  t.notEqual(m1, d, `merge(d2, d, {deep}) must NOT be d`);
  t.notEqual(m1, d1, `merge(d2, d, {deep}) must NOT be d1`);
  t.notEqual(m1, d2, `merge(d2, d, {deep}) must NOT be d2`);

  // Deep Date merges into d1
  d1 = new Date(1490870891647);
  m1 = merge(d1, d1, {deep: deep});
  t.deepEqual(m1, d1, `merge(d1, d1, {deep}) must be equal to d1`);
  t.deepEqual(m1, d2, `merge(d1, d1, {deep}) must be equal to d2`);
  t.notEqual(m1, d1, `merge(d1, d1, {deep}) must NOT be d1`); // deep into self must create new
  t.notEqual(m1, d2, `merge(d1, d1, {deep}) must NOT be d2`);

  d1 = new Date(1490870891647);
  m1 = merge(d2, d1, {deep: deep});
  t.deepEqual(m1, d1, `merge(d2, d1, {deep}) must be equal to d1`);
  t.deepEqual(m1, d2, `merge(d2, d1, {deep}) must be equal to d2`);
  t.notEqual(m1, d2, `merge(d2, d1, {deep}) must NOT be d1`);
  // t.equal(m1, d1, `merge(d2, d1, {deep}) must be d2`);
  t.notEqual(m1, d1, `merge(d2, d1, {deep}) must NOT be d2`);

  // Deep Date merges into d2
  d2 = new Date(1490870891647);
  m1 = merge(d1, d2, {deep: deep});
  t.deepEqual(m1, d1, `merge(d1, d2, {deep}) must be equal to d1`);
  t.deepEqual(m1, d2, `merge(d1, d2, {deep}) must be equal to d2`);
  t.notEqual(m1, d1, `merge(d1, d2, {deep}) must NOT be d1`);
  // t.equal(m1, d2, `merge(d1, d2, {deep}) must be d2`);
  t.notEqual(m1, d2, `merge(d1, d2, {deep}) must NOT be d2`);

  d2 = new Date(1490870891647);
  m1 = merge(d2, d2, {deep: deep});
  t.deepEqual(m1, d1, `merge(d2, d2, {deep}) must be equal to d1`);
  t.deepEqual(m1, d2, `merge(d2, d2, {deep}) must be equal to d2`);
  t.notEqual(m1, d1, `merge(d2, d2, {deep}) must NOT be d1`);
  t.notEqual(m1, d2, `merge(d2, d2, {deep}) must NOT be d2`); // deep into self must create new

  t.end();
});

