'use strict';

// An approximation of a simplified version of the ISO 8601 date-time format without the preceding +/- and extra 2 year digits
const simpleISODateTimeRegex = /^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[0-1])(Z|T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d([.,]\d+)?)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)?)?)?$/;
const simpleISODateRegex = /^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[0-1]))?Z?$/;

// An approximation of the full (extended) ISO 8601 date-time format
const extendedISODateTimeRegex = /^([+-]\d{0,2})?\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[0-1])(Z|T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d([.,]\d+)?)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)?)?)?$/;
const extendedISODateRegex = /^([+-]\d{0,2})?\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[0-1]))?Z?$/;

// JavaScript Date oddities:
// 1. Extended seems to have a max of '+275760-09-13' and min of '-271821-04-20'
// 2. Extended with 0 or 00 or +/- with zero or 1 leading zeroes and without Z seem to be local date-times, but with +/-00 OR without +/- and without Z are UTC date-times

/**
 * Module containing utilities for working with Dates.
 * @module core-functions/dates
 * @author Byron du Preez
 */
// Regular expressions
exports.simpleISODateTimeRegex = simpleISODateTimeRegex;
exports.simpleISODateRegex = simpleISODateRegex;
exports.extendedISODateTimeRegex = extendedISODateTimeRegex;
exports.extendedISODateRegex = extendedISODateRegex;

// Date string matching
exports.isSimpleISODateTimeLike = isSimpleISODateTimeLike;
exports.isSimpleISODateLike = isSimpleISODateLike;
exports.isExtendedISODateTimeLike = isExtendedISODateTimeLike;
exports.isExtendedISODateLike = isExtendedISODateLike;

// Date matching
exports.isSimpleISODateTime = isSimpleISODateTime;
exports.isSimpleISODate = isSimpleISODate;
exports.isExtendedISODateTime = isExtendedISODateTime;
exports.isExtendedISODate = isExtendedISODate;

// Conversion to Date
exports.toSimpleISODateTime = toSimpleISODateTime;
exports.toSimpleISODate = toSimpleISODate;
exports.toDateTime = toDateTime;
exports.toExtendedISODate = toExtendedISODate;
exports.isValidDate = isValidDate;

/**
 * Returns true if the given date string matches the simple ISO-8601 date-time format; false otherwise.
 * @param {string} dateString - the date string to test
 * @returns {boolean} true if the date string matches the simple ISO-8601 date-time format; false otherwise
 */
function isSimpleISODateTimeLike(dateString) {
  return typeof dateString === 'string' && simpleISODateTimeRegex.test(dateString);
}

/**
 * Returns true if the given date string matches the simple ISO-8601 date format; false otherwise.
 * @param {string} dateString - the date string to test
 * @returns {boolean} true if the date string matches the simple ISO-8601 date format; false otherwise
 */
function isSimpleISODateLike(dateString) {
  return typeof dateString === 'string' && simpleISODateRegex.test(dateString.replace('T00:00:00.000Z', 'Z'));
}

/**
 * Returns true if the given date string matches the full/extended ISO-8601 date-time format; false otherwise.
 * @param {string} dateString - the date string to test
 * @returns {boolean} true if the date string matches the full/extended ISO-8601 date-time format; false otherwise
 */
function isExtendedISODateTimeLike(dateString) {
  return typeof dateString === 'string' && extendedISODateTimeRegex.test(dateString);
}

/**
 * Returns true if the given date string matches an extended ISO-8601 date format; false otherwise.
 * @param {string} dateString - the date string to test
 * @returns {boolean} true if the date string matches an extended ISO-8601 date format; false otherwise
 */
function isExtendedISODateLike(dateString) {
  return typeof dateString === 'string' && extendedISODateRegex.test(dateString.replace('T00:00:00.000Z', 'Z'));
}

/**
 * Returns true if the given date is a simple ISO date-time compatible Date; false otherwise.
 * @param {Date} date - the date to check
 * @returns {boolean} true if date is a simple ISO date-time compatible Date; false otherwise
 */
function isSimpleISODateTime(date) {
  return isValidDate(date) && isSimpleISODateTimeLike(date.toISOString());
}

/**
 * Returns true if the given date is a simple ISO date compatible Date; false otherwise.
 * @param {Date} date - the date to check
 * @returns {boolean} true if date is a simple ISO date compatible Date; false otherwise
 */
function isSimpleISODate(date) {
  return isValidDate(date) && isSimpleISODateLike(date.toISOString());
}

/**
 * Returns true if the given date is an extended ISO date-time compatible Date; false otherwise.
 * @param {Date} date - the date to check
 * @returns {boolean} true if date is an extended ISO date-time compatible Date; false otherwise
 */
function isExtendedISODateTime(date) {
  return isValidDate(date) && isExtendedISODateTimeLike(date.toISOString());
}

/**
 * Returns true if the given date is an extended ISO date compatible Date; false otherwise.
 * @param {Date} date - the date to check
 * @returns {boolean} true if date is an extended ISO date compatible Date; false otherwise
 */
function isExtendedISODate(date) {
  return isValidDate(date) && isExtendedISODateLike(date.toISOString());
}

/**
 * Converts the given value into a Date if it's either a simple ISO date-time-like string or a simple ISO date-time
 * compatible Date; otherwise returns null (if neither) or undefined (if value undefined).
 * @param {string|Date} value - the value to convert into a simple ISO date-time compatible Date
 * @returns {Date|null|undefined} a simple ISO date-time compatible Date or null (if not a valid ISO date-time) or undefined (if value undefined)
 */
function toSimpleISODateTime(value) {
  if (value === null) return null;
  if (value === undefined) return undefined;
  return isSimpleISODateTimeLike(value) ? toValidDate(value) : isSimpleISODateTime(value) ? value : null;
}

/**
 * Converts the given value into a Date if it's either a simple ISO date-like string or a simple ISO date compatible
 * Date; otherwise returns null (if neither) or undefined (if value undefined).
 * @param {string|Date} value - the value to convert into a simple ISO date compatible Date
 * @returns {Date|undefined} a simple ISO date compatible Date or undefined
 * @returns {Date|null|undefined} a simple ISO date compatible Date or null (if not a valid ISO date) or undefined (if value undefined)
 */
function toSimpleISODate(value) {
  if (value === null) return null;
  if (value === undefined) return undefined;
  return isSimpleISODateLike(value) ? toValidDate(value) : isSimpleISODate(value) ? value : null;
}

/**
 * Converts the given value into a Date if it's either an extended ISO date-time-like string or already a Date;
 * otherwise returns null (if neither) or undefined (if value undefined).
 * @param {string|Date} value - the value to convert into a Date
 * @returns {Date|null|undefined} a valid Date or null (if not a valid date-time) or undefined (if value undefined)
 */
function toDateTime(value) {
  if (value === null) return null;
  if (value === undefined) return undefined;
  return isExtendedISODateTimeLike(value) ? toValidDate(value) : isValidDate(value) ? value : null;
}

/**
 * Converts the given value into a Date if it's either an extended ISO date-like string or an extended ISO date
 * compatible Date; otherwise returns or null (if neither) or undefined (if value undefined).
 * @param {string|Date} value - the value to convert into a Date
 * @returns {Date|null|undefined} a valid Date or null (if not a valid date) or undefined (if value undefined)
 */
function toExtendedISODate(value) {
  if (value === null) return null;
  if (value === undefined) return undefined;
  return isExtendedISODateLike(value) ? toValidDate(value) : isExtendedISODate(value) ? value : null;
}

/**
 * Attempts to construct a new Date from the given dateString and either returns a valid Date or null (if any error
 * is thrown or if the new Date is an invalid Date) or undefined (if dateString is undefined). Invalid dates are
 * identified by checking if date.toJSON() returns null or date.toString() returns 'Invalid Date'.
 * @param {string} dateString - the date string
 * @returns {Date|null|undefined} a valid Date or null (if not a valid Date) or undefined (if dateString undefined)
 */
function toValidDate(dateString) {
  if (dateString === null) return null;
  if (dateString === undefined) return undefined;
  try {
    const date = new Date(dateString);
    return isValidDate(date) ? date : null;
  } catch (err) {
    return null;
  }
}

/**
 * Returns true if the given date is a valid Date; false otherwise.
 * @param {Date} date - the date to check
 * @returns {boolean} true if date is a valid Date; false otherwise
 */
function isValidDate(date) {
  return date instanceof Date && (!!(date.toJSON()) || date.toString() !== 'Invalid Date');
}