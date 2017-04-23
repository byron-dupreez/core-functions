'use strict';

/**
 * Unit tests for core-functions/weak-map-copy.js
 * @author Byron du Preez
 */

const test = require('tape');

const WeakMapCopy = require('../weak-map-copy');

test('WeakMapCopy', t => {
  const k1 = {k:1};
  const k2 = {k:2};
  const k3 = {k:3};
  const k4 = {k:4};

  const w = new WeakMap([[k2, 2]]);
  const c = new WeakMapCopy(w);

  // LIMITATION - late k1 set is visible in c!
  t.equal(w.set(k1, 11), w, 'w.set(k1, 11) must be w');
  t.equal(w.get(k1), 11, 'w.get(k1) must be 11');
  t.equal(c.has(k1), true, 'c.has(k1) is true! - LIMITATION - late k1 set is visible in c!');
  t.equal(c.get(k1), 11, 'c.get(k1) must be 11');

  // LIMITATION - late k2 delete is visible in c!
  t.equal(w.has(k2), true, 'w.has(k2) must be true');
  t.equal(w.delete(k2), true, 'w.delete(k2) must be true');
  t.equal(w.has(k2), false, 'w.has(k2) must be false');
  t.equal(w.delete(k2), false, 'w.delete(k2) must be false');
  t.equal(w.has(k2), false, 'w.has(k2) must be false');
  t.equal(c.has(k2), false, 'c.has(k2) is false! - LIMITATION - late k2 delete is visible in c!');

  t.equal(w.set(k2, 20), w, 'w.set(k2, 20) must be w');
  t.equal(w.get(k2), 20, 'w.get(k2) must be 20');
  t.equal(c.has(k2), false, 'c.has(k2) is still false - cached consistency');

  t.equal(w.set(k2, 22), w, 'w.set(k2, 21) must be w');
  t.equal(w.get(k2), 22, 'w.get(k2) must be 22');
  t.equal(c.has(k2), false, 'c.has(k2) is still false - cached consistency');

  t.equal(w.get(k3), undefined, 'w.get(k3) must be undefined');
  t.equal(w.get(k4), undefined, 'w.get(k4) must be undefined');

  // -------------------------------------------------------------------------------------------------------------------
  // Test has cases
  // -------------------------------------------------------------------------------------------------------------------

  t.equal(c.has(k1), true, 'c.has(k1) must be true');
  t.equal(c.has(k2), false, 'c.has(k2) must be false');
  t.equal(c.has(k3), false, 'c.has(k3) must be false');
  t.equal(c.has(k4), false, 'c.has(k4) must be false');

  // -------------------------------------------------------------------------------------------------------------------
  // Test get cases
  // -------------------------------------------------------------------------------------------------------------------

  t.equal(c.get(k1), 11, 'c.get(k1) must be 11');
  t.equal(c.get(k2), undefined, 'c.get(k2) must be undefined');
  t.equal(c.get(k3), undefined, 'c.get(k3) must be undefined');
  t.equal(c.get(k4), undefined, 'c.get(k4) must be undefined');

  // -------------------------------------------------------------------------------------------------------------------
  // Test set cases
  // -------------------------------------------------------------------------------------------------------------------

  //  w   c
  t.equal(c.set(k1, 123), c, 'c.set(k1, 123) must be c');
  t.equal(c.has(k1), true, 'c.has(k1) must be true');
  t.equal(w.has(k1), true, 'w.has(k1) must be true');
  t.equal(c.get(k1), 123, 'c.get(k1) must be 123');
  t.equal(w.get(k1), 11, 'w.get(k1) must still be 11');

  //  w  !c
  t.equal(c.has(k2), false, 'c.has(k2) must be false');
  t.equal(w.has(k2), true, 'w.has(k2) must be true');
  t.equal(c.get(k2), undefined, 'c.get(k2) must be undefined');
  t.equal(w.get(k2), 22, 'w.get(k2) must be 22');

  // !w   c
  t.equal(c.set(k3, 345), c, 'c.set(k3, 345) must be c');
  t.equal(c.has(k3), true, 'c.has(k3) must be true');
  t.equal(w.has(k3), false, 'w.has(k3) must still be false');
  t.equal(c.get(k3), 345, 'c.get(k3) must be 345');
  t.equal(w.get(k3), undefined, 'w.get(k3) must be undefined');

  // !w  !c
  t.equal(c.has(k4), false, 'c.has(k4) must be false');
  t.equal(w.has(k4), false, 'w.has(k4) must be false');
  t.equal(c.get(k4), undefined, 'c.get(k4) must be undefined');
  t.equal(w.get(k4), undefined, 'w.get(k4) must be undefined');

  // -------------------------------------------------------------------------------------------------------------------
  // Test delete cases
  // -------------------------------------------------------------------------------------------------------------------

  // Delete k1 from c
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(w.has(k1), true, 'w.has(k1) must be true');
  t.equal(c.has(k1), true, 'c.has(k1) must be true');
  t.equal(w.get(k1), 11, 'w.get(k1) must be 11');
  t.equal(c.get(k1), 123, 'c.get(k1) must be 123');

  t.equal(c.delete(k1), true, 'c.delete(k1) must be true');

  t.equal(c.has(k1), false, 'c.has(k1) must be false');
  t.equal(c.get(k1), undefined, 'c.get(k1) must be undefined');

  t.equal(c.delete(k1), false, 'c.delete(k1) must be false');

  t.equal(c.has(k1), false, 'c.has(k1) must be false');
  t.equal(w.has(k1), true, 'w.has(k1) must still exist');
  t.equal(c.get(k1), undefined, 'c.get(k1) must be undefined');
  t.equal(w.get(k1), 11, 'w.get(k1) must still be 11');

  // Delete k2 from c
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(c.delete(k2), false, 'c.delete(k2) must still be false');
  t.equal(c.set(k2, 2222), c, 'c.set(k2, 2222) must be c');
  t.equal(c.delete(k2), true, 'c.delete(k2) must be true');

  // k2 must be gone from c
  t.equal(c.has(k2), false, 'c.has(k2) must be false');
  t.equal(c.get(k2), undefined, 'c.get(k2) must be undefined');

  t.equal(c.delete(k2), false, 'c.delete(k2) must be false');
  t.equal(c.has(k2), false, 'c.has(k2) must be false');
  t.equal(c.get(k2), undefined, 'c.get(k2) must be undefined');

  // k2 must NOT be gone from w
  t.equal(w.has(k2), true, 'w.has(k2) must still exist');
  t.equal(w.get(k2), 22, 'w.get(k2) must still be 22');

  // re-set to different value
  t.equal(w.set(k2, 222), w, 'w.set(k2, 222) must be w');
  t.equal(w.has(k2), true, 'w.has(k2) must still exist');
  t.equal(w.get(k2), 222, 'w.get(k2) must be 222');

  // k2 must STILL be gone from c
  t.equal(c.has(k2), false, 'c.has(k2) must still be false');
  t.equal(c.get(k2), undefined, 'c.get(k2) must be undefined');

  // Delete k3 from c
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(c.delete(k3), true, 'c.delete(k3) must be true');

  // k3 must be gone from c
  t.equal(c.has(k3), false, 'c.has(k3) must exist');
  t.equal(c.get(k3), undefined, 'c.get(k3) must be undefined');

  // Delete k4 when none
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(c.delete(k4), false, 'c.delete(k4) must be false');
  t.equal(w.delete(k4), false, 'w.delete(k4) must be false');

  t.equal(w.set(k4, 456), w, 'w.set(k4, 456) must be w');
  t.equal(w.get(k4), 456, 'w.get(k4) must be 456');

  t.equal(c.has(k4), false, 'c.has(k4) must NOT exist (after previous delete)');
  t.equal(c.get(k4), undefined, 'c.get(k4) must be undefined (after previous delete)');

  // Delete k4 from w
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(w.delete(k4), true, 'w.delete(k4) must be true');

  // k4 must be gone from w
  t.equal(w.has(k4), false, 'w.has(k4) must NOT exist');
  t.equal(w.get(k4), undefined, 'w.get(k4) must be undefined');

  // k4 must still be deleted from c (after previous delete)
  t.equal(c.has(k4), false, 'c.has(k4) must still NOT exist (after previous delete)');
  t.equal(c.get(k4), undefined, 'c.get(k4) must still be undefined (after previous delete)');

  t.equal(c.delete(k4), false, 'c.delete(k4) must be false');

  // Late set k4 on w
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(w.set(k4, 555), w, 'w.set(k4, 555) must be w');

  // k4 must be set on w
  t.equal(w.has(k4), true, 'w.has(k4) must exist');
  t.equal(w.get(k4), 555, 'w.get(k4) must be 555');

  // k4 must still be deleted from c (after previous delete)
  t.equal(c.has(k4), false, 'c.has(k4) must still NOT exist (after previous delete regardless of w set)');
  t.equal(c.get(k4), undefined, 'c.get(k4) must still be undefined (after previous delete regardless of w set)');

  // Delete k4 from c
  // -------------------------------------------------------------------------------------------------------------------
  t.equal(c.delete(k4), false, 'c.delete(k4) must still be false');

  // k4 must be gone from c
  t.equal(c.has(k4), false, 'c.has(k4) must exist');
  t.equal(c.get(k4), undefined, 'c.get(k4) must be undefined');

  // k4 must NOT be gone from w
  t.equal(w.has(k4), true, 'w.has(k4) must exist');
  t.equal(w.get(k4), 555, 'w.get(k4) must still be 555');

  t.equal(c.delete(k4), false, 'c.delete(k4) must be false');

  t.end();
});
