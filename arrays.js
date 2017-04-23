/**
 * Utilities for working with arrays.
 * @module core-functions/arrays
 * @author Byron du Preez
 */
module.exports = {
  distinct: distinct,
  isDistinct: isDistinct,
  isArrayOfType: isArrayOfType
};

/**
 * Returns an array containing only the distinct, unique elements of the given array.
 * @typedef {*} T
 * @param {T[]} array - an array of any type of element
 * @returns {T[]} an array containing only distinct, unique elements
 */
function distinct(array) {
  return array.filter((elem, pos) => array.indexOf(elem) === pos);
}

/**
 * Returns true if every element in the given array is distinct, i.e. if there are no duplicates in the array; false
 * otherwise.
 * @typedef {*} T
 * @param {T[]} array - an array of any type of element
 * @returns {boolean} true if array contains no duplicates; false otherwise
 */
function isDistinct(array) {
  return array.every((elem, pos) => array.indexOf(elem) === pos);
}

/**
 * Returns true if the given value is an array and all of its elements are of the given type; otherwise false.
 * The given type should either be a string (to check against typeof) or a constructor function (to check against
 * instanceof). Anything else passed as type will always return false.
 *
 * The optional strict argument determines whether non-strict (default) or strict matching will be used. Non-strict
 * matching will allow wrapper types to match against their corresponding primitive types and vice-versa, whereas strict
 * matching will not. For example, if the array contains a primitive string and a String object, strict matching will
 * return false, regardless of whether the given type is "string" or String, while non-strict matching would return true
 * in either case.
 *
 * @param {*} value - the value to check
 * @param {Function|string} type - the type of element expected to be in the array
 * @param {boolean|undefined} [strict] - determines whether non-strict (default) or strict matching will be used
 * @returns {boolean} true if array with elements of the given type; otherwise false
 */
function isArrayOfType(value, type, strict) {
  const typeOfType = typeof type;
  if (Array.isArray(value) && (typeOfType === 'function' || typeOfType === 'string')) {
    if (!strict) {
      // Use non-strict matching
      const nonStrictType = type === String ? "string" : type === Number ? "number" : type === Boolean ? "boolean" : type;
      return typeof nonStrictType === 'function' ? value.every(elem => elem instanceof nonStrictType) :
        nonStrictType === 'string' ? value.every(elem => typeof elem === 'string' || elem instanceof String) :
          nonStrictType === 'number' ? value.every(elem => typeof elem === 'number' || elem instanceof Number) :
            nonStrictType === 'boolean' ? value.every(elem => typeof elem === 'boolean' || elem instanceof Boolean) :
              value.every(elem => typeof elem === nonStrictType);
    } else {
      // Use strict matching
      return typeOfType === 'function' ? value.every(elem => elem instanceof type) :
        value.every(elem => typeof elem === type);
    }
  }
  // value is not an array or type is not a function or string
  return false;
}
