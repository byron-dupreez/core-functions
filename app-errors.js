"use strict";

/**
 * Module containing a collection of standard application AppError subclasses for more commonly used error-related HTTP
 * status codes, which should be thrown in services in place of other errors in order to provide additional information
 * about the HTTP statuses that the errors should trigger.
 *
 * @module core-functions/app-errors
 * @author Byron du Preez
 */

/** A list of all of the 400-series HTTP status codes currently directly supported (and to be mapped on API Gateway). */
const supported400Codes = [400, 401, 403, 404, 408, 429];

/** A list of all of the 500-series HTTP status codes currently directly supported (and to be mapped on API Gateway). */
const supported500Codes = [500, 502, 503, 504];

/** A list of all of the HTTP status codes currently directly supported (and to be mapped on API Gateway). */
const supportedCodes = supported400Codes.concat(supported500Codes);

const Strings = require('./strings');
const isNotBlank = Strings.isNotBlank;
const trim = Strings.trim;
const trimOrEmpty = Strings.trimOrEmpty;
const stringify = Strings.stringify;
const isString = Strings.isString;

/**
 * A "base class" for standard app errors, which can also be used to create a new AppError with an HTTP status code
 * other than the handful currently supported and defined in the "subclasses" of AppError (e.g. BadRequest).
 */
class AppError extends Error {
  /**
   * Constructs a new AppError.
   * @param {string|undefined} [message] - an "optional" message for this error. If not specified, attempts to derive a message from
   * the cause if provided; otherwise defaults to undefined.
   * @param {string|undefined} [code] - an "optional" code for this error. If not specified, attempts to derive a code from the cause
   * if provided; otherwise defaults to this error's constructor name.
   * @param {number|string} httpStatus - the HTTP status code
   * @param {Error|Object|undefined} cause - the optional underlying error that caused this error
   * {@linkcode toAppErrorForApiGateway})
   */
  constructor(message, code, httpStatus, cause) {
    super(toMessage(message, cause));
    Object.defineProperty(this, 'message', {writable: false, enumerable: true, configurable: false});

    // Set the name to the class name
    Object.defineProperty(this, 'name', {value: this.constructor.name});

    // Attempt to derive a usable code (or default to the name)
    Object.defineProperty(this, 'code', {value: toCode(code, cause, this.name), enumerable: true});

    // Attempt to convert the given HTTP status code into an integer, but if the conversion fails, then stringify it
    const status = toHttpStatus(httpStatus);
    Object.defineProperty(this, 'httpStatus', {value: status, enumerable: true});

    // If given both a message and a cause (with a different message) then include the cause's message as a cause
    // property on this object
    const causeMessage = toCauseMessage(cause, this.message);
    Object.defineProperty(this, 'cause', {value: causeMessage, enumerable: true});

    const causeStatus = getHttpStatus(cause);
    Object.defineProperty(this, 'causeStatus', {value: causeStatus, enumerable: true});

    // Use the given error's stack instead of this object's own stack
    if (cause instanceof Error) {
      this.stack = cause.stack;
    }
  }
}

// "Subclasses" of AppError for the handful of specific HTTP status codes expected to be more commonly used.

/** A BadRequest error (HTTP status 400) */
class BadRequest extends AppError {
  constructor(message, code, cause) {
    super(message, code, 400, cause);
  }
}

/** An Unauthorized error (HTTP status 401) */
class Unauthorized extends AppError {
  constructor(message, code, cause) {
    super(message, code, 401, cause);
  }
}

/** A Forbidden error (HTTP status 403) */
class Forbidden extends AppError {
  constructor(message, code, cause) {
    super(message, code, 403, cause);
  }
}

/** A NotFound error (HTTP status 404) */
class NotFound extends AppError {
  constructor(message, code, cause) {
    super(message, code, 404, cause);
  }
}

/** A RequestTimeout error (HTTP status 408) */
class RequestTimeout extends AppError {
  constructor(message, code, cause) {
    super(message, code, 408, cause);
  }
}

/** A TooManyRequests error (HTTP status 429) */
class TooManyRequests extends AppError {
  constructor(message, code, cause) {
    super(message, code, 429, cause);
  }
}

/** An InternalServerError error (HTTP status 500) */
class InternalServerError extends AppError {
  constructor(message, code, cause) {
    super(message, code, 500, cause);
  }
}

/** An BadGateway error (HTTP status 502) */
class BadGateway extends AppError {
  constructor(message, code, cause) {
    super(message, code, 502, cause);
  }
}

/** An ServiceUnavailable error (HTTP status 503) */
class ServiceUnavailable extends AppError {
  constructor(message, code, cause) {
    super(message, code, 503, cause);
  }
}

/** An GatewayTimeout error (HTTP status 503) */
class GatewayTimeout extends AppError {
  constructor(message, code, cause) {
    super(message, code, 504, cause);
  }
}

/**
 * Transforms the given error into one of the standard AppError errors based on the given error's [HTTP] status code (if
 * any). The given error can be any error, which ideally has an httpStatusCode, http_status_code, httpStatus,
 * http_status, statusCode or status_code property. For example, an AWS SDK error has a statusCode property, which
 * contains an HTTP status code. If the given error does NOT have any of the properties listed above, it will simply be
 * wrapped as an InternalServerError.
 *
 * Note that if the given error is already an instance of AppError then it is simply returned as is, unless a different
 * message and/or code were specified, in which case a new similar AppError will be created with the new message and/or
 * code and the given error as a cause.
 *
 * @param {Error} error - an error to transform into an appropriate AppError instance
 * @param {string|undefined} [message] - an optional message (will use the given error's message if not specified)
 * @param {string|undefined} [code] - an optional code (will use the given error's code if not specified)
 * @return {AppError} an appropriate AppError instance
 */
function toAppError(error, message, code) {
  // Special case - error is already an AppError and no message and code were provided or they are the same values
  if (error instanceof AppError && (!message || error.message === message) && (!code || error.code === code)) {
    return error;
  }
  const httpStatus = error instanceof AppError ? error.httpStatus : getHttpStatus(error);
  if (isNotBlank(httpStatus)) {
    switch (httpStatus) {
      case 400:
        return new BadRequest(message, code, error);
      case 401:
        return new Unauthorized(message, code, error);
      case 403:
        return new Forbidden(message, code, error);
      case 404:
        return new NotFound(message, code, error);
      case 408:
        return new RequestTimeout(message, code, error);
      case 429:
        return new TooManyRequests(message, code, error);
      case 500:
        return new InternalServerError(message, code, error);
      case 502:
        return new BadGateway(message, code, error);
      case 503:
        return new ServiceUnavailable(message, code, error);
      case 504:
        return new GatewayTimeout(message, code, error);
      default:
        return new AppError(message, code, httpStatus, error);
    }
  } else {
    // Any blank HTTP status code is treated as an InternalServerError, e.g. an Error or TypeError would become an ISE
    return new InternalServerError(message, code, error);
  }
}

/**
 * First invokes toAppError on the given error to convert it to an appropriate AppError and then, if the new AppError
 * does NOT have one of the HTTP status codes that are allowed to pass through to API Gateway, the new AppError will
 * instead be converted into either a BadRequest (400) or InternalServerError (500) with the non-allowed HTTP status
 * code appended to its cause.
 *
 * The list of HTTP status codes that are allowed to pass through to API Gateway is determined as follows:
 * 1. If allowedHttpStatusCodes is defined and an Array then it, together with a MANDATORY 400 and 500 code, will be used.
 * 2. Otherwise this module's currently supported 400-series and 500-series HTTP status codes will be used.
 *
 * @param {Error} error an error
 * @param {string|undefined} [message] - an optional message (will use error's message if not specified)
 * @param {string|undefined} [code] - an optional code (will use error's code if not specified)
 * @param {number[]|undefined} [allowedHttpStatusCodes] - an optional array of HTTP status codes that are allowed to be
 * returned directly from this function (without conversion to either 400 or 500). NB: 400 and 500 CANNOT be excluded
 * and are assumed to be present if omitted! If not defined, this module's lists of supported 400 and 500 codes will be
 * used as the allowed HTTP status codes
 * @return {AppError} an appropriate instance of AppError
 */
function toAppErrorForApiGateway(error, message, code, allowedHttpStatusCodes) {
  // First convert the error to one of the standard errors
  const appError = toAppError(error, message, code);

  // Determine which HTTP status codes are allowed to pass through
  const allowedStatusCodes = Array.isArray(allowedHttpStatusCodes) ? allowedHttpStatusCodes.map(toHttpStatus) : undefined;

  // Force inclusion of mandatory 400 and 500
  if (allowedStatusCodes) {
    if (allowedStatusCodes.indexOf(400) === -1) {
      allowedStatusCodes.push(400);
    }
    if (allowedStatusCodes.indexOf(500) === -1) {
      allowedStatusCodes.push(500);
    }
  }
  const allowedCodes = allowedStatusCodes ? allowedStatusCodes : supportedCodes;

  const httpStatus = appError.httpStatus;

  // Check whether allowed to pass this app error through to API Gateway directly or not
  if (allowedCodes.indexOf(httpStatus) === -1) {
    if (httpStatus >= 400 && httpStatus < 500) {
      // Convert an AppError with a disallowed 400-series HTTP status into a BadRequest with 400 status for API Gateway
      return new BadRequest(message, code, appError);
    }
    else if (httpStatus >= 500) {
      // Convert an AppError with a disallowed HTTP status >= 500 into an InternalServerError with 500 status for API Gateway
      return new InternalServerError(message, code, appError);
    }
    // TODO perhaps add explicit support for HTTP status >= 300 & < 400 ... redirects?
    // else if (httpStatus >= 300 && httpStatus < 400) {
    // }
    // TODO perhaps add explicit add support for HTTP status < 300? ... successes?
    // else if (httpStatus < 300) {
    // }
    else {
      // Convert an AppError with any other disallowed HTTP status into an InternalServerError with 500 status for API Gateway
      return new InternalServerError(message, code, appError);
    }
  }
  return appError;
}

/**
 * Attempts to find an HTTP status code on the given error. First takes an integer httpStatusCode, httpStatus or
 * statusCode property; otherwise takes the first non-blank httpStatusCode, httpStatus or statusCode property; otherwise
 * returns undefined.
 * @param {Error} error an error
 */
function getHttpStatus(error) {
  if (!error) return undefined;
  // Prefer the one with an integer status code first
  const httpStatusCode = toHttpStatusStrict(error.httpStatusCode);
  if (httpStatusCode !== -1) return httpStatusCode;
  // underscore variant of above
  const http_status_code = toHttpStatusStrict(error.http_status_code);
  if (http_status_code !== -1) return http_status_code;

  const httpStatus = toHttpStatusStrict(error.httpStatus);
  if (httpStatus !== -1) return httpStatus;
  // underscore variant of above
  const http_status = toHttpStatusStrict(error.http_status);
  if (http_status !== -1) return http_status;

  const statusCode = toHttpStatusStrict(error.statusCode);
  if (statusCode !== -1) return statusCode;
  // underscore variant of above
  const status_code = toHttpStatusStrict(error.status_code);
  if (status_code !== -1) return status_code;

  // If none were integers, then prefer the first non-blank one
  return isNotBlank(error.httpStatusCode) ? trim(error.httpStatusCode) :
    isNotBlank(error.http_status_code) ? trim(error.http_status_code) :
      isNotBlank(error.httpStatus) ? trim(error.httpStatus) :
        isNotBlank(error.http_status) ? trim(error.http_status) :
          isNotBlank(error.statusCode) ? trim(error.statusCode) :
            isNotBlank(error.status_code) ? trim(error.status_code) :
              undefined;
}

/**
 * Attempts to derive a code from the given code (if defined); otherwise from the given cause's code (if it is defined
 * and has a code); otherwise from the given cause's name (if it is defined and has a name); otherwise returns the
 * given default code.
 *
 * @param {string|undefined} code - the optional code
 * @param {Error|string|*} [cause] - the optional cause of the error
 * @param {string} [defaultCode] - a default code to use
 * @returns {string} the derived code
 */
function toCode(code, cause, defaultCode) {
  return code ? stringify(code) :
    cause ? cause.code ? stringify(cause.code) : cause.name ? cause.name : defaultCode :
      defaultCode;
}

/**
 * Attempts to convert the given HTTP status code into an integer, but if the conversion fails, then simply stringifies
 * whatever was passed in.
 * @see {@linkcode core-functions/strings.stringify}
 * @param {number|*} httpStatus the given HTTP status code
 * @returns {number|string}
 */
function toHttpStatus(httpStatus) {
  const httpStatusCode = Number.parseInt(trim(httpStatus));
  return Number.isNaN(httpStatusCode) ? stringify(trimOrEmpty(httpStatus)) : httpStatusCode;
}

/**
 * Attempts to convert the given HTTP status code into an integer, but if the conversion fails, then returns -1.
 * @see {@linkcode core-functions/strings.stringify}
 * @param {number|*} httpStatus the given HTTP status code
 * @returns {number} the HTTP status code (if it was parsable as a number); otherwise -1
 */
function toHttpStatusStrict(httpStatus) {
  const httpStatusCode = Number.parseInt(trim(httpStatus));
  return Number.isNaN(httpStatusCode) ? -1 : httpStatusCode;
}
/**
 * Returns the given message trimmed and stringified (if defined); or attempts to derive a message from the given cause
 * (if defined) (see {@linkcode toCauseMessage}); otherwise returns an empty string.
 *
 * @param {string|*} [message] - the optional error message provided
 * @param {Error|string|*} [cause] - the optional, original cause of the error
 * @returns {string} the derived error message
 */
function toMessage(message, cause) {
  return message ? stringify(message) :
    cause && cause.message ? stringify(cause.message) :
      isString(cause) ? cause : '';
}

/**
 * Attempts to derive a cause message from the given cause (if defined) and then returns the derived cause message
 * (if defined and NOT the same as the given finalised error message); otherwise returns an empty string.
 *
 * @param {Error|string|*} [cause] - the optional, original cause of the error
 * @param {string} [finalisedMessage] - the optional finalised message, which was either provided or also derived
 * from the cause
 * @returns {string} the derived cause message
 */
function toCauseMessage(cause, finalisedMessage) {
  const causeMessage =
    cause instanceof AppError && cause.cause ?
      cause.cause : // if AppError, use underlying cause if any
      cause instanceof Error ?
        cause.toString() : // if Error, use error.toString()
        isString(cause) ?
          cause : // if string, use it
          cause ?
            stringify(cause) : // otherwise just stringify whatever it is
            '';
  return causeMessage && causeMessage !== finalisedMessage ? causeMessage : '';
}

// Exports for each of the AppError "classes" and other related utility functions.

module.exports = {
  /** A "base class" for standard app errors, which can also be used to create a new AppError with an unsupported HTTP status code */
  AppError: AppError,

  // 400-series
  BadRequest: BadRequest,
  Unauthorized: Unauthorized,
  Forbidden: Forbidden,
  NotFound: NotFound,
  RequestTimeout: RequestTimeout,
  TooManyRequests: TooManyRequests,

  // 500-series
  InternalServerError: InternalServerError,
  BadGateway: BadGateway,
  ServiceUnavailable: ServiceUnavailable,
  GatewayTimeout: GatewayTimeout,

  /** HTTP status codes with explicit class support and allowed to pass through to API Gateway by default */
  supportedHttpStatusCodes: Object.freeze(supportedCodes),

  // Error conversion functions
  toAppError: toAppError,
  toAppErrorForApiGateway: toAppErrorForApiGateway,
  getHttpStatus: getHttpStatus
};
