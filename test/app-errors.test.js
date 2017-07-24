'use strict';

/**
 * Unit tests for core-functions/app-errors.js
 * @author Byron du Preez
 */

const test = require('tape');

const appErrors = require('../app-errors');
const AppError = appErrors.AppError;

// 400-series
const BadRequest = appErrors.BadRequest;
const Unauthorized = appErrors.Unauthorized;
const Forbidden = appErrors.Forbidden;
const NotFound = appErrors.NotFound;
const RequestTimeout = appErrors.RequestTimeout;
const TooManyRequests = appErrors.TooManyRequests;

// 500-series
const InternalServerError = appErrors.InternalServerError;
const BadGateway = appErrors.BadGateway;
const ServiceUnavailable = appErrors.ServiceUnavailable;
const GatewayTimeout = appErrors.GatewayTimeout;

/** HTTP status codes with explicit class support and allowed to pass through to API Gateway by default */
const supportedHttpStatusCodes = appErrors.supportedHttpStatusCodes;

// Error conversion functions
const toAppError = appErrors.toAppError;
const toAppErrorForApiGateway = appErrors.toAppErrorForApiGateway;


const Strings = require('../strings');
const isNotBlank = Strings.isNotBlank;
const isBlank = Strings.isBlank;
//const trim = Strings.trim;
const trimOrEmpty = Strings.trimOrEmpty;
const stringify = Strings.stringify;

function immutable(t, obj, propertyName, prefix) {
  const now = new Date().toISOString();
  const opts = {quoteStrings: true};
  try {
    obj[propertyName] = now;
    t.fail(`${prefix ? prefix : ''}${stringify(obj, opts)} ${propertyName} is supposed to be immutable`);
  } catch (err) {
    // Expect an error on attempted mutation of immutable property
    t.pass(`${prefix ? prefix : ''}${stringify(obj, opts)} ${propertyName} is immutable`);
    //console.log(`Expected error ${err}`);
  }
}

function mutable(t, obj, propertyName, prefix) {
  const now = new Date().toISOString();
  const opts = {quoteStrings: true};
  try {
    obj[propertyName] = now;
    // Expect NO error on attempted mutation of mutable property
    t.pass(`${prefix ? prefix : ''}${stringify(obj, opts)} ${propertyName} is mutable`);
  } catch (err) {
    t.fail(`${prefix ? prefix : ''}${stringify(obj, opts)} ${propertyName} is supposed to be mutable`);
    //console.log(`Expected error ${err}`);
  }
}

test('AppError must be initialized ', t => {
  function check(appError, message, code, httpStatus, cause, causeStatus) {
    t.equal(appError.message, message, `${appError} message must be ${message}`);
    t.equal(appError.code, code, `${appError} code must be ${appError}`);
    t.equal(appError.httpStatus, httpStatus, `${appError} httpStatus must be ${httpStatus}`);
    t.equal(appError.cause, cause, `${appError} cause must be ${cause}`);
    t.equal(appError.causeStatus, causeStatus, `${appError} causeStatus must be ${causeStatus}`);
  }

  check(new AppError('AE msg', 'AE code', 417, new Error('AE cause')), 'AE msg', 'AE code', 417, 'Error: AE cause', undefined);
  check(new BadRequest('BR msg', 'BR code', new Error('BR cause')), 'BR msg', 'BR code', 400, 'Error: BR cause', undefined);
  check(new Unauthorized('U msg', 'U code', new Error('U cause')), 'U msg', 'U code', 401, 'Error: U cause', undefined);
  check(new Forbidden('F msg', 'F code', new Error('F cause')), 'F msg', 'F code', 403, 'Error: F cause', undefined);
  check(new NotFound('NF msg', 'NF code', new Error('NF cause')), 'NF msg', 'NF code', 404, 'Error: NF cause', undefined);
  check(new RequestTimeout('RT msg', 'RT code', new Error('RT cause')), 'RT msg', 'RT code', 408, 'Error: RT cause', undefined);
  check(new TooManyRequests('TMR msg', 'TMR code', new Error('TMR cause')), 'TMR msg', 'TMR code', 429, 'Error: TMR cause', undefined);
  check(new InternalServerError('ISE msg', 'ISE code', new TypeError('ISE cause')), 'ISE msg', 'ISE code', 500, 'TypeError: ISE cause', undefined);
  check(new BadGateway('BG msg', 'BG code', new AppError('BG cause msg', 'BG cause code', 617)), 'BG msg', 'BG code', 502, 'AppError: BG cause msg', 617);
  check(new ServiceUnavailable('SU msg', 'SU code', new AppError('SU cause msg', 'SU cause code', 619, new TypeError('SU underlying cause msg'))), 'SU msg', 'SU code', 503, 'TypeError: SU underlying cause msg', 619);
  check(new GatewayTimeout('GT msg', 'GT code', new AppError('GT cause msg', 'GT cause code', 620, new AppError('GT cause msg0', 'GT cause code0', 621, new TypeError('GT underlying cause msg')))), 'GT msg', 'GT code', 504, 'TypeError: GT underlying cause msg', 620);

  t.end();
});

test('AppError must be immutable', t => {
  function check(appError) {
    mutable(t, appError, 'message');
    mutable(t, appError, 'code');
    immutable(t, appError, 'httpStatus');
    mutable(t, appError, 'cause');
    mutable(t, appError, 'causeStatus');
  }

  check(new AppError('AE msg', 'AE code', 417, new Error('AE cause')));
  check(new BadRequest('BR msg', 'BR code', new Error('BR cause')));
  check(new Unauthorized('U msg', 'U code', new Error('U cause')));
  check(new Forbidden('F msg', 'F code', new Error('F cause')));
  check(new NotFound('NF msg', 'NF code', new Error('NF cause')));
  check(new RequestTimeout('RT msg', 'RT code', new Error('RT cause')));
  check(new TooManyRequests('TMR msg', 'TMR code', new Error('TMR cause')));
  check(new InternalServerError('ISE msg', 'ISE code', new Error('ISE cause')));
  check(new BadGateway('BG msg', 'BG code', new Error('BG cause')));
  check(new ServiceUnavailable('SU msg', 'SU code', new Error('SU cause')));
  check(new GatewayTimeout('GT msg', 'GT code', new Error('GT cause')));

  t.end();
});

test('AppError constructor permutations', t => {
  function check(appError, message, code, httpStatus, cause, causeStatus) {
    t.equal(appError.message, message, `${appError} message must be ${message}`);
    t.equal(appError.code, code, `${appError} code must be ${code}`);
    t.equal(appError.httpStatus, httpStatus, `${appError} httpStatus must be ${httpStatus}`);
    t.equal(appError.cause, cause, `${appError} cause must be ${cause}`);
    t.equal(appError.causeStatus, causeStatus, `${appError} causeStatus must be ${causeStatus}`);
  }

  // No data gives empties and name as code
  check(new NotFound('', '', ''), '', 'NotFound', 404, '', undefined);
  check(new NotFound(' ', '', '   '), ' ', 'NotFound', 404, '   ', undefined); // spaces give spaces
  check(new NotFound(' ', '  ', '   '), ' ', '  ', 404, '   ', undefined); // spaces give spaces

  // No cause, gives '' cause [message]
  check(new AppError('AE msg', 'AE code', 417), 'AE msg', 'AE code', 417, '', undefined);
  check(new AppError('AE msg', undefined, 418), 'AE msg', 'AppError', 418, '', undefined);
  check(new AppError('AE msg', '', 419), 'AE msg', 'AppError', 419, '', undefined);
  check(new BadRequest('BR msg', undefined), 'BR msg', 'BadRequest', 400, '', undefined);
  check(new BadRequest('BR msg', ''), 'BR msg', 'BadRequest', 400, '', undefined);

  // No message should take string cause (and leave cause empty)
  check(new AppError(undefined, 'AE code', 417, 'AE cause msg'), 'AE cause msg', 'AE code', 417, '', undefined);
  check(new AppError(null, 'AE code', 417, 'AE cause msg'), 'AE cause msg', 'AE code', 417, '', undefined);
  check(new AppError('', 'AE code', 417, 'AE cause msg'), 'AE cause msg', 'AE code', 417, '', undefined);

  // No message, but code (and no cause code or name) should take cause message, but not cause code (and leave cause empty)
  check(new AppError(undefined, 'AE code', 417, {message: 'AE cause msg'}), 'AE cause msg', 'AE code', 417, stringify({message: 'AE cause msg'}), undefined);
  check(new AppError(null, 'AE code', 417, {message: 'AE cause msg'}), 'AE cause msg', 'AE code', 417, stringify({message: 'AE cause msg'}), undefined);
  check(new AppError('', 'AE code', 417, {message: 'AE cause msg'}), 'AE cause msg', 'AE code', 417, stringify({message: 'AE cause msg'}), undefined);

  // No message, but code (and error cause), should take cause message, but not cause code and have cause with underlying error name and message
  check(new AppError(undefined, 'AE code', 417, new ReferenceError('AE cause msg')),
    'AE cause msg', 'AE code', 417, 'ReferenceError: AE cause msg', undefined);
  check(new AppError(null, 'AE code', 418, new InternalServerError('AE cause msg', 'AE cause code', undefined)),
    'AE cause msg', 'AE code', 418, 'InternalServerError: AE cause msg', 500);
  check(new AppError(null, 'AE code', 419, new BadRequest('AE cause msg', 'AE cause code', new ReferenceError('AE underlying cause msg'))),
    'AE cause msg', 'AE code', 419, 'ReferenceError: AE underlying cause msg', 400);
  check(new AppError('', 'AE code', 420, new ServiceUnavailable('AE cause msg', 'AE cause code', new BadRequest('AE cause msg0', 'AE cause code0', new ReferenceError('AE underlying cause msg')))),
    'AE cause msg', 'AE code', 420, 'ReferenceError: AE underlying cause msg', 503);

  // No message, but code (and no cause code or name), should take cause message, but not cause code (and leave cause empty)
  check(new AppError(undefined, 'AE code', 417, {message: 'AE cause msg', code: 'AE cause code'}),
    'AE cause msg', 'AE code', 417, stringify({message: 'AE cause msg', code: 'AE cause code'}), undefined);

  // No message and no code, should take cause message and code (and leave cause empty)
  check(new AppError(undefined, undefined, 417, {message: 'AE cause msg', code: 'AE cause code'}),
    'AE cause msg', 'AE cause code', 417, stringify({message: 'AE cause msg', code: 'AE cause code'}), undefined);

  // No message and no code (and error cause), should take cause message and cause code or error name and have cause with underlying error name and message
  check(new AppError(undefined, undefined, 413, new ReferenceError('AE cause msg')),
    'AE cause msg', 'ReferenceError', 413, 'ReferenceError: AE cause msg', undefined);
  check(new AppError(null, undefined, 414, new BadGateway('AE cause msg', 'AE cause code', undefined)),
    'AE cause msg', 'AE cause code', 414, 'BadGateway: AE cause msg', 502);
  check(new AppError(undefined, null, 415, new BadRequest('AE cause msg', 'AE cause code', new ReferenceError('AE underlying cause msg'))),
    'AE cause msg', 'AE cause code', 415, 'ReferenceError: AE underlying cause msg', 400);
  check(new AppError('', '', 416, new ServiceUnavailable('AE cause msg', 'AE cause code', new BadRequest('AE cause msg0', 'AE cause code0', new ReferenceError('AE underlying cause msg')))),
    'AE cause msg', 'AE cause code', 416, 'ReferenceError: AE underlying cause msg', 503);

  // No message and no code (and no cause code or name), should take cause message and own name as code (and leave cause empty)
  check(new InternalServerError(undefined, undefined, {message: 'AE cause msg'}),
    'AE cause msg', 'InternalServerError', 500, stringify({message: 'AE cause msg'}), undefined);

  t.end();
});

test('toAppError', t => {
  function check(error, type, message, code) {
    const appError = toAppError(error, message, code);

    if (error instanceof Error) {
      t.equal(appError.stack, error.stack, 'toAppError stack of appError must be stack of original error');
    }

    // AppErrors must pass through as is unless their message and/or code don't match specified ones
    const originalAppError = error instanceof AppError && (!message || error.message === message) && (!code || error.code === code);
    if (originalAppError) {
      t.ok(appError === error, `toAppError(${stringify(error)}) -> (${appError}) must be same instance`);
    }

    t.ok(appError instanceof type, `toAppError(${stringify(error)}) -> (${appError}) must be instanceof ${type.name}`);
    t.equal(appError.name, type.name, `toAppError(${stringify(error)}) -> (${appError}) name must be ${type.name}`);

    if (isBlank(message)) {
      t.equal(appError.message, trimOrEmpty(error.message), `toAppError(${stringify(error)}, ${message}, ${code}) -> (${appError}) message must be ${trimOrEmpty(error.message)}`);
    } else if (isNotBlank(message)) {
      t.equal(appError.message, stringify(trimOrEmpty(message)), `toAppError(${stringify(error)}, ${message}, ${code}) -> (${appError}) message must be ${stringify(trimOrEmpty(message))}`);
    }

    //console.log(`******************* error     (${error instanceof Error ? error.name : ''}) ${error instanceof AppError ? JSON.stringify(appError) : stringify(error)}`);
    //console.log(`******************* appError  (${appError ? appError.name : ''})${JSON.stringify(appError)}`);

    if (isBlank(code)) {
      const expectedCode = error.code ?
        error.code :
        error.cause ?
          error.cause.code ? error.cause.code : error.cause.name ? error.cause.name :
            error.name ? error.name : appError.name :
          error.name ? error.name : appError.name;
      t.equal(appError.code, expectedCode, `toAppError(${stringify(error)}, ${message}, ${code}) -> (${appError}) code must be ${expectedCode}`);
    } else if (isNotBlank(code)) {
      t.equal(appError.code, stringify(trimOrEmpty(code)), `toAppError(${stringify(error)}, ${message}, ${code}) -> (${appError}) code must be ${stringify(trimOrEmpty(code))}`);
    }

    return appError;
  }

  // Check AppErrors pass through as is
  check(new AppError('AE msg', 'AE code', 417, new Error('AE cause')), AppError, 'OverrideMsg', 'OverrideCode');
  check(new BadRequest('BR msg', 'BR code', new Error('BR cause')), BadRequest, 'OverrideMsg', 'OverrideCode');
  check(new Unauthorized('U msg', 'U code', new Error('U cause')), Unauthorized, 'OverrideMsg', 'OverrideCode');
  check(new Forbidden('F msg', 'F code', new Error('F cause')), Forbidden, 'OverrideMsg', 'OverrideCode');
  check(new NotFound('NF msg', 'NF code', new Error('NF cause')), NotFound, 'OverrideMsg', 'OverrideCode');
  check(new RequestTimeout('RT msg', 'RT code', new Error('RT cause')), RequestTimeout, 'OverrideMsg', 'OverrideCode');
  check(new TooManyRequests('TMR msg', 'TMR code', new Error('TMR cause')), TooManyRequests, 'OverrideMsg', 'OverrideCode');
  check(new InternalServerError('ISE msg', 'ISE code', new Error('ISE cause')), InternalServerError, 'OverrideMsg', 'OverrideCode');
  check(new BadGateway('BG msg', 'BG code', new Error('BG cause')), BadGateway, 'OverrideMsg', 'OverrideCode');
  check(new ServiceUnavailable('SU msg', 'SU code', new Error('SU cause')), ServiceUnavailable, 'OverrideMsg', 'OverrideCode');
  check(new GatewayTimeout('GT msg', 'GT code', new Error('GT cause')), GatewayTimeout, 'OverrideMsg', 'OverrideCode');

  // Check basic errors become internal server errors
  check(new Error(), InternalServerError, undefined, undefined);
  check(new TypeError(), InternalServerError, undefined, undefined);
  check(new Error('ErrMsg'), InternalServerError, undefined, undefined);
  check(new TypeError('TypeErrMsg'), InternalServerError, undefined, undefined);

  // Check override messages and codes take effect
  check(new Error('ErrMsg'), InternalServerError, 'OverrideMsg', undefined);
  check(new Error('ErrMsg'), InternalServerError, undefined, 'OverrideCode');
  check(new Error('ErrMsg'), InternalServerError, 'OverrideMsg', 'OverrideCode');

  // Check errors with httpStatusCode become appropriate errors
  const names = ['httpStatusCode', 'http_status_code', 'httpStatus', 'http_status', 'statusCode', 'status_code'];
  names.forEach(name => {
    check({[name]: undefined}, InternalServerError);
    check({[name]: null}, InternalServerError);
    check({[name]: ' '}, InternalServerError);
    check({[name]: " 999 "}, AppError);
    check({[name]: " Bob "}, AppError);
    check({[name]: 908}, AppError);

    check({[name]: 300}, AppError);
    check({[name]: 400}, BadRequest);
    check({[name]: 401}, Unauthorized);
    check({[name]: 403}, Forbidden);
    check({[name]: 404}, NotFound);
    check({[name]: 408}, RequestTimeout);
    check({[name]: 429}, TooManyRequests);
    check({[name]: 500}, InternalServerError);
    check({[name]: 502}, BadGateway);
    check({[name]: 503}, ServiceUnavailable);
    check({[name]: 504}, GatewayTimeout);

    check({[name]: " 300 "}, AppError);
    check({[name]: " 400 "}, BadRequest);
    check({[name]: " 401 "}, Unauthorized);
    check({[name]: " 403 "}, Forbidden);
    check({[name]: " 404 "}, NotFound);
    check({[name]: " 408 "}, RequestTimeout);
    check({[name]: " 429 "}, TooManyRequests);
    check({[name]: " 500 "}, InternalServerError);
    check({[name]: " 502 "}, BadGateway);
    check({[name]: " 503 "}, ServiceUnavailable);
    check({[name]: " 504 "}, GatewayTimeout);
  });

  // Check errors with httpStatusCode, httpStatus & statusCode become appropriate errors
  check({httpStatusCode: " 400 ", httpStatus: " 401 ", statusCode: " 404 "}, BadRequest);
  check({httpStatusCode: "MY 400 ", httpStatus: " 401 ", statusCode: " 404 "}, Unauthorized);
  check({httpStatusCode: "MY 400 ", httpStatus: "MY 401 ", statusCode: " 404 "}, NotFound);
  check({httpStatusCode: "MY 400 ", httpStatus: "MY 401 ", statusCode: "MY 404 "}, AppError);

  t.end();
});

test('toAppErrorForApiGateway', t => {
  function check(error, type, message, code, allowedHttpStatusCodes) {
    const appError0 = toAppError(error, message, code);
    const appError = toAppErrorForApiGateway(error, message, code, allowedHttpStatusCodes);

    // AppErrors must pass through as is
    //console.log(`allowedHttpStatusCodes = ${allowedHttpStatusCodes}`);
    //console.log(`supportedHttpStatusCodes = ${supportedHttpStatusCodes}`);
    const allowedCodes = Array.isArray(allowedHttpStatusCodes) ? allowedHttpStatusCodes.concat(400, 500) : supportedHttpStatusCodes;

    const originalAppError = error instanceof AppError && (!message || error.message === message) &&
      (!code || error.code === code);

    if (originalAppError && allowedCodes.indexOf(error.httpStatus) !== -1) {
      t.ok(appError === error, `toAppErrorForApiGateway(${stringify(error)}) -> (${appError}) must be same instance`);
    }

    t.ok(appError instanceof type, `toAppErrorForApiGateway(${stringify(error)}) -> (${appError}) must be instanceof ${type.name}`);
    t.equal(appError.name, type.name, `toAppErrorForApiGateway(${stringify(error)}) -> (${appError}) name must be ${type.name}`);

    if (isBlank(message)) {
      t.equal(appError.message, trimOrEmpty(error.message), `toAppErrorForApiGateway(${stringify(error)}, ${message}, ${code}) -> (${appError}) message must be ${trimOrEmpty(error.message)}`);
    } else if (isNotBlank(message)) {
      t.equal(appError.message, stringify(trimOrEmpty(message)), `toAppErrorForApiGateway(${stringify(error)}, ${message}, ${code}) -> (${appError}) message must be ${stringify(trimOrEmpty(message))}`);
    }

    // console.log(`******************* error     (${error instanceof Error ? error.name : ''}) ${error instanceof AppError ? JSON.stringify(appError) : stringify(error)}`);
    // console.log(`******************* appError0 (${appError0 ? appError0.name : ''})${JSON.stringify(appError0)}`);
    // console.log(`******************* appError  (${appError ? appError.name : ''})${JSON.stringify(appError)}`);

    if (isBlank(code)) {
      const expectedCode = appError0.code ?
        appError0.code :
        appError0.cause ?
          appError0.cause.code ? appError0.cause.code : appError0.cause.name ? appError0.cause.name : appError0.name :
          appError0.name;
      t.equal(appError.code, trimOrEmpty(expectedCode), `toAppErrorForApiGateway(${stringify(error)}, ${message}, ${code}) -> (${appError}) code must be ${trimOrEmpty(expectedCode)}`);
    } else if (isNotBlank(code)) {
      t.equal(appError.code, stringify(trimOrEmpty(code)), `toAppErrorForApiGateway(${stringify(error)}, ${message}, ${code}) -> (${appError}) code must be ${stringify(trimOrEmpty(code))}`);
    }

    return appError;
  }

  // Check AppErrors pass through as is
  check(new AppError('AE msg', 'AE code', 417, new Error('AE cause')), BadRequest, 'OverrideMsg', 'OverrideCode');
  check(new BadRequest('BR msg', 'BR code', new Error('BR cause')), BadRequest, 'OverrideMsg', 'OverrideCode');
  check(new Unauthorized('U msg', 'U code', new Error('U cause')), Unauthorized, 'OverrideMsg', 'OverrideCode');
  check(new Forbidden('F msg', 'F code', new Error('F cause')), Forbidden, 'OverrideMsg', 'OverrideCode');
  check(new NotFound('NF msg', 'NF code', new Error('NF cause')), NotFound, 'OverrideMsg', 'OverrideCode');
  check(new RequestTimeout('RT msg', 'RT code', new Error('RT cause')), RequestTimeout, 'OverrideMsg', 'OverrideCode');
  check(new TooManyRequests('TMR msg', 'TMR code', new Error('TMR cause')), TooManyRequests, 'OverrideMsg', 'OverrideCode');
  check(new InternalServerError('ISE msg', 'ISE code', new Error('ISE cause')), InternalServerError, 'OverrideMsg', 'OverrideCode');
  check(new BadGateway('BG msg', 'BG code', new Error('BG cause')), BadGateway, 'OverrideMsg', 'OverrideCode');
  check(new ServiceUnavailable('SU msg', 'SU code', new Error('SU cause')), ServiceUnavailable, 'OverrideMsg', 'OverrideCode');
  check(new GatewayTimeout('GT msg', 'GT code', new Error('GT cause')), GatewayTimeout, 'OverrideMsg', 'OverrideCode');

  // Check basic errors become internal server errors
  check(new Error(), InternalServerError, undefined, undefined);
  check(new TypeError(), InternalServerError, undefined, undefined);
  check(new Error('ErrMsg'), InternalServerError, undefined, undefined);
  check(new TypeError('TypeErrMsg'), InternalServerError, undefined, undefined);

  // Check override messages and codes take effect
  check(new Error('ErrMsg'), InternalServerError, 'OverrideMsg', undefined);
  check(new Error('ErrMsg'), InternalServerError, undefined, 'OverrideCode');
  check(new Error('ErrMsg'), InternalServerError, 'OverrideMsg', 'OverrideCode');

  // Check errors with httpStatusCode become appropriate errors
  const names = ['httpStatusCode', 'http_status_code', 'httpStatus', 'http_status', 'statusCode', 'status_code'];
  names.forEach(name => {
    check({[name]: undefined}, InternalServerError);
    check({[name]: null}, InternalServerError);
    check({[name]: ' '}, InternalServerError);
    check({[name]: " 999 "}, InternalServerError);
    check({[name]: " Bob "}, InternalServerError);
    check({[name]: 908}, InternalServerError);

    check({[name]: 300}, InternalServerError);
    check({[name]: 400}, BadRequest);
    check({[name]: 401}, Unauthorized);
    check({[name]: 403}, Forbidden);
    check({[name]: 404}, NotFound);
    check({[name]: 408}, RequestTimeout);
    check({[name]: 429}, TooManyRequests);
    check({[name]: 500}, InternalServerError);
    check({[name]: 502}, BadGateway);
    check({[name]: 503}, ServiceUnavailable);
    check({[name]: 504}, GatewayTimeout);

    check({[name]: " 300 "}, InternalServerError);
    check({[name]: " 400 "}, BadRequest);
    check({[name]: " 401 "}, Unauthorized);
    check({[name]: " 403 "}, Forbidden);
    check({[name]: " 404 "}, NotFound);
    check({[name]: " 408 "}, RequestTimeout);
    check({[name]: " 429 "}, TooManyRequests);
    check({[name]: " 500 "}, InternalServerError);
    check({[name]: " 502 "}, BadGateway);
    check({[name]: " 503 "}, ServiceUnavailable);
    check({[name]: " 504 "}, GatewayTimeout);
  });

  // Check errors with httpStatusCode, httpStatus & statusCode become appropriate errors
  check({httpStatusCode: " 400 ", httpStatus: " 401 ", statusCode: " 404 "}, BadRequest);
  check({httpStatusCode: "MY 400 ", httpStatus: " 401 ", statusCode: " 404 "}, Unauthorized);
  check({httpStatusCode: "MY 400 ", httpStatus: "MY 401 ", statusCode: " 404 "}, NotFound);
  check({httpStatusCode: "MY 400 ", httpStatus: "MY 401 ", statusCode: "MY 404 "}, InternalServerError);

  // Check default unsupported AppErrors get changed
  check(new AppError('AE msg', 'AE code', 199, new Error('AE cause')), InternalServerError, 'OverrideMsg', 'OverrideCode');
  check(new AppError('AE msg', 'AE code', 299, new Error('AE cause')), InternalServerError, 'OverrideMsg', 'OverrideCode');
  check(new AppError('AE msg', 'AE code', 399, new Error('AE cause')), InternalServerError, 'OverrideMsg', 'OverrideCode');
  check(new AppError('AE msg', 'AE code', 499, new Error('AE cause')), BadRequest, 'OverrideMsg', 'OverrideCode');
  check(new AppError('AE msg', 'AE code', 599, new Error('AE cause')), InternalServerError, 'OverrideMsg', 'OverrideCode');
  check(new AppError('AE msg', 'AE code', 699, new Error('AE cause')), InternalServerError, 'OverrideMsg', 'OverrideCode');

  // Check manually disallowed AppErrors get changed
  const allowedStatusCodes = []; // MOST extreme (will only allow 400 and 500 through (because they are forced to be included)
  check(new BadRequest('BR msg', 'BR code', new Error('BR cause')), BadRequest, 'OverrideMsg', 'OverrideCode', allowedStatusCodes);
  check(new Unauthorized('U msg', 'U code', new Error('U cause')), BadRequest, 'OverrideMsg', 'OverrideCode', allowedStatusCodes);
  check(new Forbidden('F msg', 'F code', new Error('F cause')), BadRequest, 'OverrideMsg', 'OverrideCode', allowedStatusCodes);
  check(new NotFound('NF msg', 'NF code', new Error('NF cause')), BadRequest, 'OverrideMsg', 'OverrideCode', allowedStatusCodes);
  check(new RequestTimeout('RT msg', 'RT code', new Error('RT cause')), BadRequest, 'OverrideMsg', 'OverrideCode', allowedStatusCodes);
  check(new TooManyRequests('TMR msg', 'TMR code', new Error('TMR cause')), BadRequest, 'OverrideMsg', 'OverrideCode', allowedStatusCodes);
  check(new InternalServerError('ISE msg', 'ISE code', new Error('ISE cause')), InternalServerError, 'OverrideMsg', 'OverrideCode', allowedStatusCodes);
  check(new BadGateway('BG msg', 'BG code', new Error('BG cause')), InternalServerError, 'OverrideMsg', 'OverrideCode', allowedStatusCodes);
  check(new ServiceUnavailable('SU msg', 'SU code', new Error('SU cause')), InternalServerError, 'OverrideMsg', 'OverrideCode', allowedStatusCodes);
  check(new GatewayTimeout('GT msg', 'GT code', new Error('GT cause')), InternalServerError, 'OverrideMsg', 'OverrideCode', allowedStatusCodes);

  t.end();
});

test('toAppError attempt to recreate NOT instanceof BadRequest bug', t => {
  const cause = new TypeError('TE1');
  const br1 = new BadRequest('BR1', undefined, cause);
  t.ok(br1 instanceof BadRequest, `br1 must be instanceof BadRequest`);
  t.ok(br1 instanceof Error, `br1 must be instanceof Error`);
  t.equals(br1.cause, cause.toString(), `br1.cause must be ${cause.toString()}`);

  const br2 = toAppError(br1);
  t.equals(br2, br1, `br2 must be same instance as br1`);
  t.ok(br2 instanceof BadRequest, `br2 must be instanceof BadRequest`);

  const br3 = toAppError(br1, 'BR1');
  t.equals(br3, br1, `br3 must be same instance as br1`);
  t.ok(br3 instanceof BadRequest, `br3 must be instanceof BadRequest`);

  const br4 = toAppError(br1, 'BR4');
  t.notEquals(br4, br1, `br4 must NOT be same instance as br1`);
  t.ok(br4 instanceof BadRequest, `br4 must be instanceof BadRequest`);
  t.equals(br4.cause, cause.toString(), `br4.cause must be ${cause.toString()}`);

  t.end();
});

test('AppError toJSON', t => {
  const e = new AppError('AE msg', 'AE code', 417, new ReferenceError('AE cause'));

  let json = {message: e.message, code: e.code, httpStatus: e.httpStatus, cause: e.cause};
  let jsonText = JSON.stringify(json);
  t.deepEqual(e.toJSON(), json, `${e} toJSON must be ${jsonText}`);
  t.deepEqual(JSON.parse(JSON.stringify(e)), json, `JSON.parse(JSON.stringify(${e})) must be ${jsonText}`);

  // Add additional enumerable properties
  e.awsRequestId = 'e72617f3-4cb2-40ba-9a16-e75b3e4226cf';
  e.nowYouSeeMe = "Now you don't";

  json = {
    message: e.message, code: e.code, httpStatus: e.httpStatus, cause: e.cause, awsRequestId: e.awsRequestId,
    nowYouSeeMe: e.nowYouSeeMe
  };
  jsonText = JSON.stringify(json);
  t.deepEqual(e.toJSON(), json, `${e} toJSON must be ${jsonText}`);
  t.deepEqual(JSON.parse(JSON.stringify(e)), json, `JSON.parse(JSON.stringify(${e})) must be ${jsonText}`);

  // Change nowYouSeeMe to non-enumerable
  Object.defineProperty(e, 'nowYouSeeMe', {enumerable: false});

  json = {
    message: e.message, code: e.code, httpStatus: e.httpStatus, cause: e.cause, awsRequestId: e.awsRequestId
  };
  jsonText = JSON.stringify(json);
  t.deepEqual(e.toJSON(), json, `${e} toJSON must be ${jsonText}`);
  t.deepEqual(JSON.parse(JSON.stringify(e)), json, `JSON.parse(JSON.stringify(${e})) must be ${jsonText}`);

  t.end();
});