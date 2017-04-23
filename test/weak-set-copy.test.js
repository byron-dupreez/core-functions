'use strict';

/**
 * Unit tests for core-functions/weak-set-copy.js
 * @author Byron du Preez
 */

const test = require('tape');

const WeakSetCopy = require('../weak-set-copy');

test('WeakSetCopy', t => {
  const v1 = {v: 1};
  const v2 = {v: 2};
  const v3 = {v: 3};
  const v4 = {v: 4};

  const w = new WeakSet([v2]);
  const c = new WeakSetCopy(w);

  // LIMITATION - late v1 add is visible in c!
  t.equal(w.add(v1), w, 'w.add(v1) must be w');
  t.equal(w.has(v1), true, 'w.has(v1) must be true');
  t.equal(c.has(v1), true, 'c.has(v1) is true! - LIMITATION - late v1 add after copy is visible in c!');

  // LIMITATION - late v2 delete is visible in c!
  t.equal(w.has(v2), true, 'w.has(v2) must be true');
  t.equal(w.delete(v2), true, 'w.delete(v2) must be true');
  t.equal(w.has(v2), false, 'w.has(v2) must be false');
  t.equal(w.delete(v2), false, 'w.delete(v2) must be false');
  t.equal(c.has(v2), false, 'c.has(v2) is false! - LIMITATION - late v2 delete after copy is visible in c!');

  t.equal(w.add(v2), w, 'w.add(v2) must be w');
  t.equal(w.has(v2), true, 'w.has(v2) must be true');
  t.equal(c.has(v2), false, 'c.has(v2) is still false - consistent due to caching');

  t.equal(w.has(v3), false, 'w.has(v3) must be false');
  t.equal(w.has(v4), false, 'w.has(v4) must be false');

  // -------------------------------------------------------------------------------------------------------------------
  // Test has cases
  // -------------------------------------------------------------------------------------------------------------------

  t.equal(c.has(v1), true, 'c.has(v1) must be true');
  t.equal(c.has(v2), false, 'c.has(v2) must be false');
  t.equal(c.has(v3), false, 'c.has(v3) must be false');
  t.equal(c.has(v4), false, 'c.has(v4) must be false');

  // -------------------------------------------------------------------------------------------------------------------
  // Test add cases
  // -------------------------------------------------------------------------------------------------------------------

  //  w   c
  t.equal(c.add(v1), c, 'c.add(v1) must be c');
  t.equal(c.has(v1), true, 'c.has(v1) must be true');
  t.equal(w.has(v1), true, 'w.has(v1) must still be true');

  //  w  !c
  t.equal(c.has(v2), false, 'c.has(v2) must be false');
  t.equal(w.has(v2), true, 'w.has(v2) must be true');

  // !w   c
  t.equal(c.add(v3), c, 'c.add(v3) must be c');
  t.equal(c.has(v3), true, 'c.has(v3) must be true');
  t.equal(w.has(v3), false, 'w.has(v3) must still be false');

  // !w  !c
  t.equal(c.has(v4), false, 'c.has(v4) must be false');
  t.equal(w.has(v4), false, 'w.has(v4) must be false');

  // -------------------------------------------------------------------------------------------------------------------
  // Test delete cases
  // -------------------------------------------------------------------------------------------------------------------

  // Delete v1 from c
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(w.has(v1), true, 'w.has(v1) must be true');
  t.equal(c.has(v1), true, 'c.has(v1) must be true');

  t.equal(c.delete(v1), true, 'c.delete(v1) must be true');

  t.equal(c.has(v1), false, 'c.has(v1) must be false');

  t.equal(c.delete(v1), false, 'c.delete(v1) must be false');

  t.equal(c.has(v1), false, 'c.has(v1) must be false');
  t.equal(w.has(v1), true, 'w.has(v1) must still exist');

  // Delete v2 from c
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(c.delete(v2), false, 'c.delete(v2) must still be false');
  t.equal(c.add(v2), c, 'c.add(v2) must be c');
  t.equal(c.delete(v2), true, 'c.delete(v2) must be true');

  // v2 must be gone from c
  t.equal(c.has(v2), false, 'c.has(v2) must be false');

  t.equal(c.delete(v2), false, 'c.delete(v2) must be false');
  t.equal(c.has(v2), false, 'c.has(v2) must be false');

  // v2 must NOT be gone from w
  t.equal(w.has(v2), true, 'w.has(v2) must still be true');

  // re-add same value
  t.equal(w.add(v2), w, 'w.add(v2) must be w');
  t.equal(w.has(v2), true, 'w.has(v2) must be true');

  // v2 must STILL be gone from c
  t.equal(c.has(v2), false, 'c.has(v2) must still be false');

  // Delete v3 from c
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(c.delete(v3), true, 'c.delete(v3) must be true');

  // v3 must be gone from c
  t.equal(c.has(v3), false, 'c.has(v3) must be false');

  // Delete v4 when none
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(c.delete(v4), false, 'c.delete(v4) must be false');
  t.equal(w.delete(v4), false, 'w.delete(v4) must be false');

  t.equal(w.add(v4), w, 'w.add(v4) must be w');
  t.equal(w.has(v4), true, 'w.has(v4) must be true');

  t.equal(c.has(v4), false, 'c.has(v4) must be false (cached consistency & after previous delete)');

  // Delete v4 from w
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(w.delete(v4), true, 'w.delete(v4) must be true');

  // v4 must be gone from w
  t.equal(w.has(v4), false, 'w.has(v4) must be false');

  // v4 must still be deleted from c (after previous delete)
  t.equal(c.has(v4), false, 'c.has(v4) must still be false (after previous delete)');

  t.equal(c.delete(v4), false, 'c.delete(v4) must be false');

  // Late add v4 on w
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(w.add(v4), w, 'w.add(v4) must be w');

  // v4 must be add on w
  t.equal(w.has(v4), true, 'w.has(v4) must be true');

  // v4 must still be deleted from c (after previous delete)
  t.equal(c.has(v4), false, 'c.has(v4) must still be false (after previous delete regardless of w add)');

  // Delete v4 from c
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(c.delete(v4), false, 'c.delete(v4) must still be false');

  // v4 must be gone from c
  t.equal(c.has(v4), false, 'c.has(v4) must be false');

  // v4 must NOT be gone from w
  t.equal(w.has(v4), true, 'w.has(v4) must be true');

  t.equal(c.delete(v4), false, 'c.delete(v4) must be false');

  t.end();
});
