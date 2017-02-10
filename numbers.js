'use strict';


/** The smallest positive normal value of type number, 2-1022. It is equal to the hexadecimal floating-point literal 0x1.0p-1022. */
// const MIN_NORMAL = 2.2250738585072014E-308;

// const MAX_FIXED_DECIMAL_PLACES = 20;

const integerRegex = /^[+-]?\d+(\.0*)?$/;
const numberRegex = /^[+-]?(\d+\.?|\d*\.\d+)([eE][+-]?\d+)?$/;
const zeroRegex = /^[+-]?0+(\.0*)?([eE][+-]?\d+)?$/;
const leadingZeroesRegex = /^([+-]?)0+([1-9].*|0(\..*)?$)/;
const trailingZeroesRegex = /^([^.]*\.(?:\d+?))0+(([eE][+-]?\d+)?)$/;

/**
 * Module containing utilities for working with numbers.
 * @module core-functions/numbers
 * @author Byron du Preez
 */
module.exports = {
  /** Returns true if the given value is a number; false otherwise. */
  isNumber: isNumber,
  /** Returns true if the given value is a number and finite; false otherwise. */
  isFiniteNumber: isFiniteNumber,
  /** Returns true if the value is Infinity, -Infinity or NaN; false otherwise. */
  isSpecialNumber: isSpecialNumber,
  /** Returns true if the number is NaN or if it is an instance of Number and its value is NaN; false otherwise. */
  isNaN: isNaN,
  isInteger: isInteger,
  isSafeInteger: isSafeInteger,

  integerRegex: integerRegex,
  numberRegex: numberRegex,

  isNumberLike: isNumberLike,
  isIntegerLike: isIntegerLike,
  isZeroLike: isZeroLike,

  toNumberLike: toNumberLike,

  toDecimalLike: toDecimalLike,
  toDecimalLikeOrNaN: toDecimalLikeOrNaN,

  toIntegerLike: toIntegerLike,
  toIntegerLikeOrNaN: toIntegerLikeOrNaN,

  toNumberOrIntegerLike: toNumberOrIntegerLike,

  removeLeadingZeroes: removeLeadingZeroes,
  removeTrailingZeroes: removeTrailingZeroes,
  zeroPadLeft: zeroPadLeft,
  removeSignIfZero: removeSignIfZeroLike,

  nearlyEqual: nearlyEqual
};

/**
 * Returns true if the given value is a number; false otherwise.
 * Note that this also returns true for the non-finite numbers (NaN, Infinity, -Infinity) - to exclude these instead use
 * {@link isFiniteNumber} or do an extra check against {@link Number.isFinite}, but beware that the latter returns false
 * for instances of Number, e.g. Number.isFinite(new Number(1)) === false.
 * @param {*} value the value to check
 * @return {boolean} true if its a number; false otherwise
 */
function isNumber(value) {
  return typeof value === 'number' || value instanceof Number;
}

/**
 * Returns true if the given value is a number and finite; false otherwise.
 * Note that this also returns true for the non-finite numbers (NaN, Infinity, -Infinity) - to exclude these add an
 * extra check against {@link Number.isFinite}.
 * @param {*} value the value to check
 * @return {boolean} true if its a number; false otherwise
 */
function isFiniteNumber(value) {
  return (typeof value === 'number' && Number.isFinite(value)) ||
    (value instanceof Number && Number.isFinite(value.valueOf()));
}

/**
 * Returns true if the value is Infinity, -Infinity or NaN; false otherwise.
 * @param {*} value the value to check
 * @returns {boolean} true if special number; false otherwise
 */
function isSpecialNumber(value) {
  if (value instanceof Number) value = value.valueOf();
  return value === +Infinity || value === -Infinity || (typeof value === 'number' && Number.isNaN(value));
}

/**
 * Returns true if the number is NaN or if it is an instance of Number and its value is NaN (unlike
 * {@linkcode Number#isNaN}); false otherwise.
 * @param {*} value the value to check
 * @returns {boolean} true if NaN; false otherwise
 */
function isNaN(value) {
  return (typeof value === 'number' && Number.isNaN(value)) ||
    (value instanceof Number && Number.isNaN(value.valueOf()));
}

/**
 * Returns true if the given value is an integer.
 * @see Number.isInteger
 * @param {number|Number} value - the value to test
 * @returns {boolean} true if the given value is an integer; false otherwise
 */
function isInteger(value) {
  return (typeof value === 'number' && Number.isInteger(value)) ||
    (value instanceof Number && Number.isInteger(value.valueOf()));
}

/**
 * Returns true if the given value is a safe integer.
 * @see Number.isSafeInteger
 * @param {number|Number} value - the value to test
 * @returns {boolean} true if the given value is a safe integer; false otherwise
 */
function isSafeInteger(value) {
  return (typeof value === 'number' && Number.isSafeInteger(value)) ||
    (value instanceof Number && Number.isSafeInteger(value.valueOf()));
}

/**
 * Returns true if the given value is a number-like string containing a number of any precision.
 * @param {string} value - the value to test
 * @returns {boolean} true if the given value is a number string; false otherwise
 */
function isNumberLike(value) {
  return typeof value === 'string' && numberRegex.test(value);
}

/**
 * Returns true if the given value is a integer-like string containing an integer of any precision.
 * @param {string} value - the value to test
 * @returns {boolean} true if the given value is an integer string; false otherwise
 */
function isIntegerLike(value) {
  return typeof value === 'string' && (integerRegex.test(value) ||
    (numberRegex.test(value) && integerRegex.test(toDecimalLike(value))));
}

/**
 * Returns true if the given value is a zero number-like string; false otherwise.
 * @param {string} value - the value to test
 * @returns {boolean} true if the given value is a zero number-like string; false otherwise
 */
function isZeroLike(value) {
  return typeof value === 'string' && zeroRegex.test(value);
}

/**
 * Converts the given number into a number-like string.
 * @param {number|Number} number - the number to convert
 * @returns {string} a number-like string
 */
function toNumberLike(number) {
  // Unbox if Number object
  if (number instanceof Number) {
    number = number.valueOf()
  }
  return Number.isInteger(number) ? number.toFixed(0) : number.toPrecision(); //removeTrailingZeroes(number.toFixed(MAX_FIXED_DECIMAL_PLACES));
}

/**
 * Converts the given number-like into a decimal-like string by replacing any exponent part with its decimal equivalent.
 * Precondition: number or isNumberLike(numberLike)
 * @param {string|number|Number} numberLike - a number-like string or number
 * @returns {string|undefined} a decimal-like string (if number-like); otherwise undefined
 */
function toDecimalLike(numberLike) {
  if (typeof numberLike === 'number' || numberLike instanceof Number) {
    numberLike = toNumberLike(numberLike); // Convert any number into a number-like
  } else if (numberLike instanceof String) {
    numberLike = numberLike.valueOf(); // unbox String object
  }

  // Ensure that the given numberLike is actually number-like
  if (!isNumberLike(numberLike)) return undefined;

  // Convert number-like string into decimal-like string
  const signed = numberLike.length > 0 && (numberLike[0] === '-' || numberLike[0] === '+');
  const sign = signed ? numberLike.substring(0, 1) : '';
  let n = signed ? numberLike.substring(1) : numberLike;
  const decPos = n.indexOf('.');
  const hasDecPoint = decPos !== -1;

  const ePos = n.indexOf('e');
  const hasExponent = ePos !== -1;

  const intPart = removeLeadingZeroes(hasDecPoint || hasExponent ? n.substring(0, hasDecPoint ? decPos : ePos) : n);
  const fractionalPart = hasDecPoint ? n.substring(decPos + 1, hasExponent ? ePos : n.length) : '';
  const decPlaces = fractionalPart.length;

  if (hasExponent) {
    // Convert exponent into decimal format
    let e = Number.parseInt(n.substring(ePos + 1));
    if (e >= 0) {
      if (hasDecPoint) {
        if (e < decPlaces) {
          n = `${intPart}${fractionalPart.substring(0, e)}.${fractionalPart.substring(e)}`;
        } else if (e === decPlaces) {
          n = `${intPart}${fractionalPart}`;
        } else { // e > decPlaces
          n = `${intPart}${fractionalPart}${'0'.repeat(e - decPlaces)}`;
        }
        n = removeLeadingZeroes(n);
      } else {
        // has no decimal point
        n = `${e > 0 ? removeLeadingZeroes(`${intPart}${'0'.repeat(e)}`) : intPart}`;
      }
    } else {
      // e < 0
      const intLen = intPart.length;
      e = -e;
      if (e < intLen) {
        n = `${intPart.substring(0, e)}.${intPart.substring(e)}${fractionalPart}`;
      } else if (e === intLen) {
        n = `0.${intPart}${fractionalPart}`;
      } else { // e > intLen
        n = `0.${'0'.repeat(e - intLen)}${intPart}${fractionalPart}`;
      }
    }
  } else {
    // has no exponent
    n = `${intPart}${decPlaces > 0 ? `.${fractionalPart}` : ''}`;
  }
  return !isZeroLike(n) ? `${sign}${n}` : n;
}

/**
 * A convenience version of {@linkcode toDecimalLike} function that returns NaN instead of undefined.
 * Precondition: number or isNumberLike(numberLike)
 * @param {number|string|Number|String} numberLike - the number or number-like string to convert
 * @returns {string|NaN} a decimal-like string (if number-like); otherwise NaN
 */
function toDecimalLikeOrNaN(numberLike) {
  const decimalLike = toDecimalLike(numberLike);
  return decimalLike ? decimalLike : NaN;
}

/**
 * Converts the given number or number-like string into an integer-like string by first converting it into a decimal-
 * like string and then removing any fractional part.
 * Precondition: number or isNumberLike(numberLike) (or IDEALLY isIntegerLike(numberLike))
 * @param {number|string|Number|String} numberLike - the number or number-like string to convert
 * @returns {string|undefined} an integer-like string (if number-like); otherwise undefined
 */
function toIntegerLike(numberLike) {
  // First convert number or number-like string into a decimal-like string
  const decimalLike = toDecimalLike(numberLike);
  if (!decimalLike) return undefined;
  // and then remove any fractional part by truncating the number at the decimal point
  const decPos = decimalLike.indexOf('.');
  return decPos !== -1 ? removeSignIfZeroLike(decimalLike.substring(0, decPos)) : decimalLike;
}

/**
 * A convenience version of {@linkcode toIntegerLike} function that returns NaN instead of undefined.
 * Precondition: number or isNumberLike(numberLike) (or IDEALLY isIntegerLike(numberLike))
 * @param {number|string|Number|String} numberLike - the number or number-like string to convert
 * @returns {string|NaN} an integer-like string (if number-like); otherwise NaN
 */
function toIntegerLikeOrNaN(numberLike) {
  const integerLike = toIntegerLike(numberLike);
  return integerLike ? integerLike : NaN;
}

/**
 * Converts the given value into a number (if its a number or a Number or a safe integer-like string or a number-like
 * string); or returns the given value (if its a big integer-like string that cannot be safely converted to an integer
 * without losing precision); otherwise returns NaN.
 * @param {string|String|number|Number} value - the value to convert
 * @returns {number|string|NaN} a number or big integer-like string or NaN
 */
function toNumberOrIntegerLike(value) {
  // Unbox the given value if it is a Number or String object
  if (value instanceof Number || value instanceof String) {
    value = value.valueOf();
  }
  const type = typeof value;
  if (type === 'number') {
    return value;
  } else if (type === 'string') {
    // Check if the string contains an integer
    if (isIntegerLike(value)) {
      // Integer-like string, so attempt to parse to an integer
      const n = Number.parseInt(value);
      // Check if have enough precision to hold the given integer value ... otherwise return the given value excluding
      // its fractional part (if any)
      return Number.isSafeInteger(n) ? n : Number.isNaN(n) ? NaN : toIntegerLikeOrNaN(value);
    }
    // Check if the string contains a number
    else if (isNumberLike(value)) {
      // Number-like string, so attempt to parse to a number
      return Number.parseFloat(value);
    }
  }
  return NaN;
}

/**
 * Returns the given number string without superfluous leading zeroes.
 * @param {string} numberString - the number string
 * @returns {string} the number string without superfluous leading zeroes
 */
function removeLeadingZeroes(numberString) {
  return typeof numberString === 'string' ? numberString.replace(leadingZeroesRegex, '$1$2') :
    !numberString ? numberString : undefined;
}
/**
 * Returns the given number string without superfluous trailing zeroes.
 * @param {string} numberString - the number string
 * @returns {string} the number string without superfluous trailing zeroes
 */
function removeTrailingZeroes(numberString) {
  return typeof numberString === 'string' ? numberString.replace(trailingZeroesRegex, '$1$2') :
    !numberString ? numberString : undefined;
}

/**
 * Pads the given number string with leading zeroes to create a number string with a number of digits equal to the given
 * number of digits (excluding any +/- sign). NB: If the given number string is signed then it must have a leading plus
 * or minus sign.
 * @param {string} numberString - the number string to pad
 * @param {number|undefined} [digits] - the optional number of digits up to which to pad the given number with leading
 * zeroes if necessary (if digits > 0); otherwise (if digits <= 0 or undefined) then returns the given number (without
 * any zero-padding)
 * @returns {string} the zero-padded number string
 * @throws an Error if the given number has more digits than the given number of digits
 */
function zeroPadLeft(numberString, digits) {
  if (digits && digits > 0) {
    const signed = numberString.length > 0 && (numberString[0] === '-' || numberString[0] === '+');
    const unsignedNumber = signed ? numberString.substring(1) : numberString;
    const len = unsignedNumber.length;
    if (len < digits) {
      return (signed ? numberString[0] : '') + '0'.repeat(digits - len) + unsignedNumber;
    } else if (len > digits) {
      throw new Error(`${numberString} has more than ${digits} digits`);
    }
  }
  return numberString;
}

/**
 * Returns the given number-like string either with its sign (if non-zero) or without its sign (if zero).
 * @param {string} numberLike - a number-like string
 * @returns {*} the given number-like string either with its sign (if non-zero) or without its sign (if zero)
 */
function removeSignIfZeroLike(numberLike) {
  if (isZeroLike(numberLike)) {
    const signed = numberLike.length > 0 && (numberLike[0] === '-' || numberLike[0] === '+');
    return signed ? numberLike.substring(1) : numberLike;
  }
  return numberLike;
}

/**
 * Compares two given floating-point numbers for approximate equality.
 * Algorithm below was inspired by http://floating-point-gui.de/errors/comparison/
 * with an extra case personally added for comparing safe integers
 * @param {number} a - the first number to compare
 * @param {number} b - the second number to compare
 * @returns {boolean} true if x is approximately equal to y
 */
function nearlyEqual(a, b) {
  if (a === b) { // shortcut that also handles case if both Infinity, MAX_VALUE or MIN_VALUE
    return true;
  }
  // Use an absolute epsilon check for safe integer comparisons
  if (Number.isSafeInteger(a) && Number.isSafeInteger(b)) {
    return Math.abs(a - b) < Number.EPSILON;
  }
  // Use a relative epsilon check for floating-point comparisons
  //let m = Math.abs(a) + Math.abs(b);
  //let m = Math.max(Math.abs(a), Math.abs(b));
  let m = Math.abs(a)/2 + Math.abs(b)/2; // average magnitude, seems to work better than sum
  // Constrain m to be within the range MIN_VALUE to MAX_VALUE to avoid divide/times by zero & +/- infinities
  m = Math.min(Math.max(m, Number.MIN_VALUE), Number.MAX_VALUE);
  //return Math.abs((a - b) / m) < Number.EPSILON;
  return Math.abs(a - b) < Number.EPSILON * m;
}
// // Algorithm translated from http://floating-point-gui.de/errors/comparison/
// function nearlyEqual_0(a, b) {
//   const absA = Math.abs(a);
//   const absB = Math.abs(b);
//   const diff = Math.abs(a - b);
//
//   if (a === b) { // shortcut, handles infinities
//     return true;
//   } else if (a === 0 || b === 0 || diff < MIN_NORMAL) {
//     // a or b is zero or both are extremely close to it
//     // relative error is less meaningful here
//     return diff < Number.EPSILON * MIN_NORMAL;
//   } else { // use relative error
//     return diff / Math.min(absA + absB, Number.MAX_VALUE) < Number.EPSILON;
//   }
// }