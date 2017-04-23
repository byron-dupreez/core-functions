'use strict';

/**
 * Module containing a WeakMap subclass to be used for creating "copies" of existing WeakMaps.
 * @module core-functions/weak-map-copy
 * @author Byron du Preez
 */

class Deleted {}

const DELETED = new Deleted();

/**
 * An extension of WeakMap, which emulates a "copy" of another WeakMap.
 * Mutating the "copy" will NOT mutate the original. However, since the "copy" is also a view on top of the original,
 * mutations to the original after the "copy" is made can unfortunately reflect in the "copy".
 */
class WeakMapCopy extends WeakMap {

  /**
   * @param {WeakMap} original - the original WeakMap for which this is copy
   */
  constructor(original) {
    super();
    if (!(original instanceof WeakMap)) {
      throw new TypeError('original must be a WeakMap');
    }
    this.original = original;
  }

  has(key) {
    if (WeakMap.prototype.has.call(this, key)) {
      return !(WeakMap.prototype.get.call(this, key) instanceof Deleted);
    }
    // Cache original value in this copy for consistency of later possible re-get of same value
    const originalHasValue = this.original.has(key);
    this.set(key, originalHasValue ? this.original.get(key) : DELETED);
    return originalHasValue;
  }

  get(key) {
    if (WeakMap.prototype.has.call(this, key)) {
      const value = WeakMap.prototype.get.call(this, key);
      return !(value instanceof Deleted) ? value : undefined;
    }
    // Cache original value in this copy for consistency of later possible re-get of same value
    const origValue = this.original.get(key);
    this.set(key, this.original.has(key) ? origValue : DELETED);
    return origValue;
  }

  //noinspection ReservedWordAsName
  delete(key) {
    if (WeakMap.prototype.has.call(this, key)) {
      const value = WeakMap.prototype.get.call(this, key);
      if (!(value instanceof Deleted)) {
        WeakMap.prototype.delete.call(this, key);
        // Simulate deletion by caching DELETED, which will avoid a later `get` pulling a value from original
        this.set(key, DELETED);
        return true;
      }
      return false;
    }
    // No value cached in copy ...
    // Simulate deletion by caching DELETED, which will avoid a later `get` pulling a value from original
    this.set(key, DELETED);
    return this.original.has(key);
  }
}

module.exports = WeakMapCopy;
