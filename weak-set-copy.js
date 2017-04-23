'use strict';

/**
 * Module containing a WeakSet subclass to be used for creating "copies" of existing WeakSets.
 * @module core-functions/weak-set-copy
 * @author Byron du Preez
 */

/**
 * An extension of WeakSet, which emulates a "copy" of another WeakSet.
 * Mutating the "copy" will NOT mutate the original. However, since the "copy" is also a view on top of the original,
 * mutations to the original after the "copy" is made can unfortunately reflect in the "copy".
 */
class WeakSetCopy extends WeakSet {

  /**
   * @param {WeakSet} original - the original WeakSet for which this is copy
   */
  constructor(original) {
    super();
    if (!(original instanceof WeakSet)) {
      throw new TypeError('original must be a WeakSet');
    }
    this.original = original;
    this.deletions = new WeakSet();
  }

  has(value) {
    if (WeakSet.prototype.has.call(this, value)) {
      return true;
    }
    if (this.deletions.has(value)) {
      return false;
    }
    const originalHasValue = this.original.has(value);
    // Cache value in this copy for consistency of later possible re-check of same value
    if (originalHasValue) {
      this.add(value);
    } else {
      this.deletions.add(value);
    }
    return originalHasValue;
  }

  //noinspection ReservedWordAsName
  delete(value) {
    if (WeakSet.prototype.has.call(this, value)) {
      WeakSet.prototype.delete.call(this, value);
      // Simulate deletion by remembering the deletion of the value, which will avoid a later `has` consulting original
      this.deletions.add(value);
      return true;
    }
    if (this.deletions.has(value)) {
      return false;
    }
    // No value cached in deletions ...
    // Simulate deletion by remembering the deletion of the value, which will avoid a later `has` consulting original
    this.deletions.add(value);
    return this.original.has(value);
  }
}

module.exports = WeakSetCopy;
