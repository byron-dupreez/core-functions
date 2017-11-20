'use strict';

/**
 * Utilities for unit testing with tape
 * @author Byron du Preez
 */
exports._$_ = '_$_'; //IDE workaround
exports.okNotOk = okNotOk;
exports.checkOkNotOk = checkOkNotOk;
exports.checkMethodOkNotOk = checkMethodOkNotOk;
exports.equal = equal;
exports.checkEqual = checkEqual;
exports.checkMethodEqual = checkMethodEqual;
exports.immutable = immutable;

const Strings = require('../strings');
const stringify = Strings.stringify;

const Numbers = require('../numbers');

const prefixFnArgs = require('./config.json').prefixFnArgs;

function toPrefix(prefix) {
  return prefix ? prefix.endsWith(' ') ? prefix : prefix + ' ' : '';
}

function toFnArgsPrefix(fn, args) {
  const opts = {quoteStrings: true};
  return prefixFnArgs ? `${fn.name ? fn.name : '' }${stringify(args, opts)} -> ` : '';
}

function toMethodArgsPrefix(obj, method, args) {
  const opts = {quoteStrings: true};
  return prefixFnArgs ? `${obj.name ? obj.name : stringify(obj, opts)}.${method.name ? method.name : '<anon>' }${stringify(args, opts)} -> ` : '';
}

function equal(t, actual, expected, prefix) {
  const opts = {quoteStrings: true};
  const msg = `${toPrefix(prefix)}${stringify(actual, opts)} must be ${stringify(expected, opts)}`;

  if (Numbers.isNaN(actual)) {
    if (Numbers.isNaN(expected)) {
      t.pass(msg); //`${prefix} must be NaN`);
    } else {
      t.fail(msg); //`${prefix} must NOT be NaN`)
    }
  } else if (actual instanceof Object) {
    t.deepEqual(actual, expected, msg);
  } else {
    t.equal(actual, expected, msg);
  }
}

function checkEqual(t, fn, args, expected, prefix) {
  // Apply the function
  const actual = fn.apply(null, args);
  // check if actual equals expected
  equal(t, actual, expected, `${toFnArgsPrefix(fn, args)}${toPrefix(prefix)}`);
}

function checkMethodEqual(t, obj, method, args, expected, prefix) {
  // Apply the method
  const actual = method.apply(obj, args);
  // check if actual equals expected
  equal(t, actual, expected, `${toMethodArgsPrefix(obj, method, args)}${toPrefix(prefix)}`);
}

function okNotOk(t, actual, expected, okSuffix, notOkSuffix, prefix) {
  if (expected) {
    t.ok(actual, `${toPrefix(prefix)} ${okSuffix}`);
  } else {
    t.notOk(actual, `${toPrefix(prefix)} ${notOkSuffix}`);
  }
}

function checkOkNotOk(t, fn, args, expected, okSuffix, notOkSuffix, prefix) {
  // Apply the function
  const actual = fn.apply(null, args);
  // check if actual equals expected
  okNotOk(t, actual, expected, okSuffix, notOkSuffix, `${toFnArgsPrefix(fn, args)}${toPrefix(prefix)}`);
}

function checkMethodOkNotOk(t, obj, method, args, expected, okSuffix, notOkSuffix, prefix) {
  // Apply the method
  const actual = method.apply(obj, args);
  // check if actual equals expected
  okNotOk(t, actual, expected, okSuffix, notOkSuffix, `${toMethodArgsPrefix(obj, method, args)}${toPrefix(prefix)}`);
}

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
