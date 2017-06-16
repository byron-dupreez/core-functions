'use strict';

const any = require('./any');
const notDefined = any.notDefined;

const Strings = require('./strings');
const Numbers = require('./numbers');
const Dates = require('./dates');

/**
 * An enum for the types of sorting currently identified & supported
 * @enum {string}
 * @readonly
 */
const SortType = {
  UNDEFINED_OR_NULL: 'UNDEFINED_OR_NULL',
  NUMBER: 'NUMBER',
  INTEGER_LIKE: 'INTEGER-LIKE',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  DATE_TIME: 'DATE-TIME',
  STRING: 'STRING',
  UNKNOWN: 'UNKNOWN'
};
Object.freeze(SortType);

/**
 * Module containing utilities for sorting.
 * @module core-functions/sorting
 * @author Byron du Preez
 */
module.exports = {
  SortType: SortType,

  /** @deprecated - use {@linkcode core-functions/any#notDefined} instead */
  isUndefinedOrNull: any.notDefined,

  compareUndefinedOrNull: compareUndefinedOrNull,
  compareNumbers: compareNumbers,
  compareStrings: compareStrings,
  compareBooleans: compareBooleans,
  compareDates: compareDates,
  compareIntegerLikes: compareIntegerLikes,
  toSortable: toSortable,
  sortSortable: sortSortable,

  sortKeyValuePairsByKey: sortKeyValuePairsByKey
};

/**
 * Compares two undefined or null values for sorting of a useless array consisting entirely of undefined or null values.
 * Also used by the other compare functions to force null to the front of the sorted result. When used with Array sort,
 * bubbles all nulls to the front and all undefined values to the back. Note that Array sort currently bubbles undefined
 * to the back regardless of the comparator, hence undefined must be considered largest here.
 * @param {undefined|null|*} a - the first undefined or null value to compare
 * @param {undefined|null|*} b - the first undefined or null value to compare
 * @returns {number} a negative number if a < b; a positive number if a > b; otherwise zero
 */
function compareUndefinedOrNull(a, b) {
  return a === b ? 0 : a === null ? -1 : b === null ? +1 : a === undefined ? +1 : b === undefined ? -1 : 0;
}

/**
 * Compares two numbers for sorting purposes.
 * @param {number|undefined} a - the first number to compare
 * @param {number|undefined} b - the first number to compare
 * @returns {number} a negative number if a < b; a positive number if a > b; otherwise zero
 */
function compareNumbers(a, b) {
  if (a === b) return 0;
  if (notDefined(a) || notDefined(b)) return compareUndefinedOrNull(a, b);

  // For sorting stability, compare NaNs as "equal" to each other and "less" than any other number
  const aIsNaN = Numbers.isNaN(a);
  const bIsNaN = Numbers.isNaN(b);
  if (aIsNaN || bIsNaN) return aIsNaN && bIsNaN ? 0 : aIsNaN ? -1 : +1;

  return a - b;
}

/**
 * Compares two strings for sorting purposes.
 * @param {string|undefined} a - the first string to compare
 * @param {string|undefined} b - the second string to compare
 * @param {CompareOpts|undefined} [opts] - optional compare options to use when comparing the two strings
 * @returns {number} -1 if a < b; +1 if a > b; otherwise 0
 */
function compareStrings(a, b, opts) {
  if (a === b) return 0;
  if (notDefined(a) || notDefined(b)) return compareUndefinedOrNull(a, b);

  const ignoreCase = !!opts && opts.ignoreCase === true;
  const a1 = ignoreCase ? a.toLowerCase() : a;
  const b1 = ignoreCase ? b.toLowerCase() : b;
  const compared = a1 < b1 ? -1 : a1 > b1 ? +1 : 0;
  // If ignoring case and compared is zero then compare original strings to ensure consistent ordering for the corner
  // case where the two strings differ ONLY in case
  return !ignoreCase || compared !== 0 ? compared : a < b ? -1 : a > b ? +1 : 0;
}

/**
 * Compares two booleans for sorting purposes.
 * @param {boolean|undefined} a - the first boolean to compare
 * @param {boolean|undefined} b - the first boolean to compare
 * @returns {number} -1 if a < b; +1 if a > b; otherwise 0
 */
function compareBooleans(a, b) {
  if (a === b) return 0;
  if (notDefined(a) || notDefined(b)) return compareUndefinedOrNull(a, b);
  return a < b ? -1 : a > b ? +1 : 0;
}

/**
 * Compares two Date instances for sorting purposes.
 * @param {Date|undefined|null} a - the first Date instance to compare
 * @param {Date|undefined|null} b - the first Date instance to compare
 * @returns {number} a negative number if a < b; a positive number if a > b; otherwise zero
 */
function compareDates(a, b) {
  if (a === b) return 0;
  if (notDefined(a) || notDefined(b)) return compareUndefinedOrNull(a, b);
  return compareNumbers(a.getTime(), b.getTime());
}

/**
 * Compares two integer-like strings for sorting purposes.
 * @param {string|undefined} i1 - first integer-like string to compare
 * @param {string|undefined} i2 - second integer-like string to compare
 * @returns {number} -1 if i1 < i2; +1 if i1 > i2; otherwise 0
 */
function compareIntegerLikes(i1, i2) {
  if (i1 === i2) return 0;
  if (notDefined(i1) || notDefined(i2)) return compareUndefinedOrNull(i1, i2);

  if (!i1 || i1.length <= 0) return -1;
  if (!i2 || i2.length <= 0) return +1;
  const neg1 = i1[0] === '-';
  const neg2 = i2[0] === '-';
  const ui1 = neg1 || i1[0] === '+' ? i1.substring(1) : i1;
  const ui2 = neg2 || i2[0] === '+' ? i2.substring(1) : i2;
  if (ui1 === '0' && ui2 === '0') return 0; // zero is zero regardless of signs
  const len1 = ui1.length;
  const len2 = ui2.length;
  if (!neg1) {
    // i1 is positive
    if (neg2) return +1;
    // i2 is positive
    if (len1 < len2) return -1;
    if (len2 < len1) return +1;
    return ui1 < ui2 ? -1 : ui2 < ui1 ? +1 : 0;
  } else {
    // i1 is negative
    if (!neg2) return -1;
    // i2 is negative
    if (len1 < len2) return +1;
    if (len2 < len1) return -1;
    return ui1 > ui2 ? -1 : ui2 > ui1 ? +1 : 0;
  }
}

/**
 * Resolves the sort type and compare function to use for sorting and converts all of the given values (where necessary)
 * into consistent, sortable types of values.
 * @param {Array.<*>} values - the values from which to resolve the sort type; compare function and sortable values to be used
 * @returns {Sortable} an object containing: the sort type; compare function to use in sorting; and an array of sortable values
 */
function toSortable(values) {
  // First copy values into sortableValues unboxing any and all Number, String & Boolean objects
  let sortableValues = values.map(v =>
    v instanceof Number || v instanceof String || v instanceof Boolean ? v.valueOf() : v
  );

  // Next determine the types of each of the values and the summarized types for the collection of values
  let allUndefinedOrNull = true;

  let allStrings = true;
  let allBooleans = true;

  let allNumbers = true;
  let allNumbersOrNumberLike = true;

  let allIntegers = true;
  let allIntegersOrIntegerLikes = true;

  let allDates = true;
  let allDatesOrDateLikes = true;

  let allDateTimes = true;
  let allDateTimesOrDateTimeLikes = true;

  for (let i = 0; i < sortableValues.length; ++i) {
    let v = sortableValues[i];

    const isUndefinedOrNull = v === undefined || v === null;
    allUndefinedOrNull &= isUndefinedOrNull;

    const typeOfValue = typeof v;

    const isString = typeOfValue === 'string';
    allStrings &= isString || isUndefinedOrNull;

    allBooleans &= typeOfValue === 'boolean' || isUndefinedOrNull;

    const isNumber = typeOfValue === 'number';
    allNumbers &= isNumber || isUndefinedOrNull;
    allNumbersOrNumberLike &= isNumber || isUndefinedOrNull || (isString && Numbers.isNumberLike(v));

    const isInteger = isNumber && Number.isInteger(v);
    allIntegers &= isInteger || isUndefinedOrNull;
    allIntegersOrIntegerLikes &= isInteger || isUndefinedOrNull || (isString && Numbers.isIntegerLike(v));

    const isDate = Dates.isSimpleISODate(v);
    allDates &= isDate || isUndefinedOrNull;
    allDatesOrDateLikes &= isDate || isUndefinedOrNull || (isString && Dates.isSimpleISODateLike(v));

    const isDateTime = Dates.isSimpleISODateTime(v);
    allDateTimes &= isDateTime || isUndefinedOrNull;
    allDateTimesOrDateTimeLikes &= isDateTime || isUndefinedOrNull || (isString && Dates.isSimpleISODateTimeLike(v));
  }

  // Resolve the sort type based on the values types
  const sortType = allUndefinedOrNull ? SortType.UNDEFINED_OR_NULL :
    allNumbers ? SortType.NUMBER : allIntegersOrIntegerLikes ? SortType.INTEGER_LIKE :
        allNumbersOrNumberLike ? SortType.NUMBER : allBooleans ? SortType.BOOLEAN :
            allDatesOrDateLikes ? SortType.DATE : allDateTimesOrDateTimeLikes ? SortType.DATE_TIME :
                allStrings ? SortType.STRING : SortType.UNKNOWN;

  // Finally normalize mixed types of values all to the same sortable type based on the resolved sort type
  let compare = null;

  switch (sortType) {
    case SortType.STRING:
      compare = compareStrings;
      break;

    case SortType.BOOLEAN:
      compare = compareBooleans;
      break;

    case SortType.NUMBER:
      // If all of the values are numbers or number-like strings, but NOT all are numbers, then "normalize" all
      // number-like strings to numbers
      if (allNumbersOrNumberLike && !allNumbers) {
        sortableValues = sortableValues.map(v => typeof v === 'string' ? Number.parseFloat(v) : v);
      }
      compare = compareNumbers;
      break;

    case SortType.INTEGER_LIKE:
      // If all of the values are integers or integer-like strings, but NOT all are integers, then "normalize" all of
      // them to integer-like strings
      if (allIntegersOrIntegerLikes && !allIntegers) {
        sortableValues = sortableValues.map(v => v ? Numbers.toIntegerLike(v) : v);
      }
      compare = compareIntegerLikes;
      break;

    case SortType.DATE:
      // If all of the values are ISO dates or date-like strings, but NOT all are dates, then "normalize" all date-like
      // strings to ISO dates
      if (allDatesOrDateLikes && !allDates) {
        sortableValues = sortableValues.map(v => typeof v === 'string' ? Dates.toSimpleISODate(v) : v);
      }
      compare = compareDates;
      break;

    case SortType.DATE_TIME:
      // If all of the values are ISO date-times or date-time-like strings, but NOT all are date-times, then "normalize"
      // all date-time-like strings to ISO date-times
      if (allDateTimesOrDateTimeLikes && !allDateTimes) {
        sortableValues = sortableValues.map(v => typeof v === 'string' ? Dates.toSimpleISODateTime(v) : v);
      }
      compare = compareDates;
      break;

    case SortType.UNKNOWN:
      // Last resort, convert all of the values (other than strings, undefined or null) to strings
      sortableValues = sortableValues.map(v => typeof v === 'string' || notDefined(v) ? v : Strings.stringify(v));
      compare = compareStrings;
      break;

    case SortType.UNDEFINED_OR_NULL:
      compare = compareUndefinedOrNull; // has no influence on sort, since its not invoked for undefined
      break;

    default:
      throw new Error(`Unexpected sort type (${sortType})`);
  }

  return {sortType: sortType, compare: compare, sortableValues: sortableValues};
}

/**
 * Sorts the given Sortable object's sortable values using its compare function.
 * @param {Sortable} sortable
 * @param {CompareOpts|undefined} [opts] - optional compare options to use when comparing two values
 * @returns {SortableArray} the sortable's sortable values sorted using its compare function
 */
function sortSortable(sortable, opts) {
  return sortable.sortableValues.sort((a, b) => sortable.compare(a, b, opts));
}

/**
 * Sorts the given array of key value pairs by their keys into ascending alphabetical key sequence, ignoring case if
 * ignoreCase is true (i.e. does a case-sensitive sort if ignoreCase is true; otherwise does a case-insensitive sort).
 * The primary purpose of this function is to ensure that a list of key value pairs will always have its pairs in a
 * consistent sequence, which simplifies equality comparisons between 2 lists of key value pairs.
 * @param {KeyValuePair[]} keyValuePairs - an array of key value pairs
 * @param {CompareOpts|undefined} [opts] - optional compare options to use when comparing two values
 * @returns {KeyValuePair[]} the given key value pairs sorted by their keys
 */
function sortKeyValuePairsByKey(keyValuePairs, opts) {
  if (Array.isArray(keyValuePairs)) {
    keyValuePairs.sort((kv1, kv2) => {
      const key1 = kv1.length > 0 ? kv1[0] : undefined;
      const key2 = kv2.length > 0 ? kv2[0] : undefined;
      return compareStrings(key1, key2, opts);
    });
    return keyValuePairs;
  }
  return [];
}

