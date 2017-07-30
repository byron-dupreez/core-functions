'use strict';

/**
 * Unit tests for core-functions/errors.js
 * @author Byron du Preez
 */

const test = require('tape');

const errors = require('../errors');
const FatalError = errors.FatalError;
const TransientError = errors.TransientError;
const TimeoutError = errors.TimeoutError;
const prefixMessage = errors.prefixMessage;

test('FatalError must be initialized ', t => {
  function check(err, message, name) {
    t.equal(err.message, message, `${err} message must be ${message}`);
    t.equal(err.name, name, `${err} name must be ${name}`);
    t.notOk(err.hasOwnProperty('name'), `${err} must NOT have own property 'name'`);

    // t.equal(err.fatal, true, `${err} fatal must be ${true}`);
    // t.equal(err.hasOwnProperty('fatal'), true, `${err} must have own property 'fatal'`);

    const errPrototype = Object.getPrototypeOf(err);
    t.ok(errPrototype.hasOwnProperty('name'), `prototype ${errPrototype} must have own property 'name'`);
    // t.notOk(errPrototype.hasOwnProperty('fatal'), `prototype ${errPrototype} must NOT have own property 'fatal'`);

    // err.fatal = false;
    // t.equal(err.fatal, false, `${err} fatal must NOW be ${false}`);
    // t.equal(errPrototype.fatal, undefined, `prototype ${errPrototype} fatal must be ${undefined}`);
  }

  const fatalError1 = new FatalError('FE msg 1');
  const fatalError2 = new FatalError('FE msg 2');
  const fatalError3 = new FatalError('FATAL - FE msg 3');

  check(fatalError1, 'FE msg 1', 'FatalError');
  check(fatalError2, 'FE msg 2', 'FatalError');
  check(fatalError3, 'FATAL - FE msg 3', 'FatalError');

  const fatalError1Prototype = Object.getPrototypeOf(fatalError1);
  const fatalError2Prototype = Object.getPrototypeOf(fatalError2);
  const fatalError3Prototype = Object.getPrototypeOf(fatalError3);

  t.equal(fatalError1Prototype, FatalError.prototype, `fatalError1 prototype must be FatalError.prototype`);
  t.equal(fatalError2Prototype, FatalError.prototype, `fatalError2 prototype must be FatalError.prototype`);
  t.equal(fatalError3Prototype, FatalError.prototype, `fatalError3 prototype must be FatalError.prototype`);

  t.notEqual(fatalError1Prototype, Error.prototype, `fatalError1 prototype must NOT be Error.prototype`);

  t.equal(fatalError1Prototype.__proto__, Error.prototype, `fatalError1 prototype prototype must be Error.prototype`);
  t.equal(fatalError2Prototype.__proto__, Error.prototype, `fatalError2 prototype prototype must be Error.prototype`);
  t.equal(fatalError3Prototype.__proto__, Error.prototype, `fatalError3 prototype prototype must be Error.prototype`);

  t.equal(fatalError1Prototype, fatalError2Prototype, `fatalError1 prototype must be fatalError2 prototype`);
  t.equal(fatalError1Prototype, fatalError3Prototype, `fatalError1 prototype must be fatalError3 prototype`);
  t.equal(fatalError2Prototype, fatalError3Prototype, `fatalError2 prototype must be fatalError3 prototype`);

  fatalError1.a = 1;
  fatalError2.b = 2;
  // fatalError3.c = 3;

  let json1 = {name: fatalError1.name, message: fatalError1.message, a: 1};
  let json2 = {name: fatalError2.name, message: fatalError2.message, b: 2};
  let json3 = {name: fatalError3.name, message: fatalError3.message};

  t.deepEqual(JSON.parse(JSON.stringify(errors.toJSON(fatalError1))),  json1, `JSON.parse(errors.toJSON(fatalError1)) must be ${JSON.stringify(json1)}`);
  t.deepEqual(JSON.parse(JSON.stringify(fatalError1.toJSON())),  json1, `JSON.parse(fatalError1.toJSON()) must be ${JSON.stringify(json1)}`);
  t.deepEqual(JSON.parse(JSON.stringify(fatalError1)),  json1, `JSON.parse(JSON.stringify(fatalError1)) must be ${JSON.stringify(json1)}`);

  t.deepEqual(JSON.parse(JSON.stringify(errors.toJSON(fatalError2))),  json2, `JSON.parse(errors.toJSON(fatalError2)) must be ${JSON.stringify(json2)}`);
  t.deepEqual(JSON.parse(JSON.stringify(fatalError2.toJSON())),  json2, `JSON.parse(fatalError2.toJSON()) must be ${JSON.stringify(json2)}`);
  t.deepEqual(JSON.parse(JSON.stringify(fatalError2)),  json2, `JSON.parse(JSON.stringify(fatalError2)) must be ${JSON.stringify(json2)}`);

  t.deepEqual(JSON.parse(JSON.stringify(errors.toJSON(fatalError3))),  json3, `JSON.parse(errors.toJSON(fatalError3)) must be ${JSON.stringify(json3)}`);
  t.deepEqual(JSON.parse(JSON.stringify(fatalError3.toJSON())),  json3, `JSON.parse(fatalError3.toJSON()) must be ${JSON.stringify(json3)}`);
  t.deepEqual(JSON.parse(JSON.stringify(fatalError3)),  json3, `JSON.parse(JSON.stringify(fatalError3)) must be ${JSON.stringify(json3)}`);

  t.end();
});

test('TransientError must be initialized ', t => {
  function check(err, message, name) {
    t.equal(err.message, message, `${err} message must be ${message}`);
    t.equal(err.name, name, `${err} name must be ${name}`);
    t.notOk(err.hasOwnProperty('name'), `${err} must NOT have own property 'name'`);

    // t.equal(err.transient, true, `${err} transient must be ${true}`);
    // t.equal(err.hasOwnProperty('transient'), true, `${err} must have own property 'transient'`);

    const errPrototype = Object.getPrototypeOf(err);
    t.ok(errPrototype.hasOwnProperty('name'), `prototype ${errPrototype} must have own property 'name'`);
    // t.notOk(errPrototype.hasOwnProperty('transient'), `prototype ${errPrototype} must NOT have own property 'transient'`);

    // err.transient = false;
    // t.equal(err.transient, false, `${err} transient must NOW be ${false}`);
    // t.equal(errPrototype.transient, undefined, `prototype ${errPrototype} transient must be ${undefined}`);
  }

  const transientError1 = new TransientError('FE msg 1');
  const transientError2 = new TransientError('FE msg 2');
  const transientError3 = new TransientError('TRANSIENT - FE msg 3');

  check(transientError1, 'FE msg 1', 'TransientError');
  check(transientError2, 'FE msg 2', 'TransientError');
  check(transientError3, 'TRANSIENT - FE msg 3', 'TransientError');

  const transientError1Prototype = Object.getPrototypeOf(transientError1);
  const transientError2Prototype = Object.getPrototypeOf(transientError2);
  const transientError3Prototype = Object.getPrototypeOf(transientError3);

  t.equal(transientError1Prototype, TransientError.prototype, `transientError1 prototype must be TransientError.prototype`);
  t.equal(transientError2Prototype, TransientError.prototype, `transientError2 prototype must be TransientError.prototype`);
  t.equal(transientError3Prototype, TransientError.prototype, `transientError3 prototype must be TransientError.prototype`);

  t.notEqual(transientError1Prototype, Error.prototype, `transientError1 prototype must NOT be Error.prototype`);

  t.equal(transientError1Prototype.__proto__, Error.prototype, `transientError1 prototype prototype must be Error.prototype`);
  t.equal(transientError2Prototype.__proto__, Error.prototype, `transientError2 prototype prototype must be Error.prototype`);
  t.equal(transientError3Prototype.__proto__, Error.prototype, `transientError3 prototype prototype must be Error.prototype`);

  t.equal(transientError1Prototype, transientError2Prototype, `transientError1 prototype must be transientError2 prototype`);
  t.equal(transientError1Prototype, transientError3Prototype, `transientError1 prototype must be transientError3 prototype`);
  t.equal(transientError2Prototype, transientError3Prototype, `transientError2 prototype must be transientError3 prototype`);

  // transientError1.a = 1;
  transientError2.b = 2;
  transientError3.c = 3;

  let json1 = {name: transientError1.name, message: transientError1.message};
  let json2 = {name: transientError2.name, message: transientError2.message, b: 2};
  let json3 = {name: transientError3.name, message: transientError3.message, c: 3};

  t.deepEqual(JSON.parse(JSON.stringify(errors.toJSON(transientError1))),  json1, `JSON.parse(errors.toJSON(transientError1)) must be ${JSON.stringify(json1)}`);
  t.deepEqual(JSON.parse(JSON.stringify(transientError1.toJSON())),  json1, `JSON.parse(transientError1.toJSON()) must be ${JSON.stringify(json1)}`);
  t.deepEqual(JSON.parse(JSON.stringify(transientError1)),  json1, `JSON.parse(JSON.stringify(transientError1)) must be ${JSON.stringify(json1)}`);

  t.deepEqual(JSON.parse(JSON.stringify(errors.toJSON(transientError2))),  json2, `JSON.parse(errors.toJSON(transientError2)) must be ${JSON.stringify(json2)}`);
  t.deepEqual(JSON.parse(JSON.stringify(transientError2.toJSON())),  json2, `JSON.parse(transientError2.toJSON()) must be ${JSON.stringify(json2)}`);
  t.deepEqual(JSON.parse(JSON.stringify(transientError2)),  json2, `JSON.parse(JSON.stringify(transientError2)) must be ${JSON.stringify(json2)}`);

  t.deepEqual(JSON.parse(JSON.stringify(errors.toJSON(transientError3))),  json3, `JSON.parse(errors.toJSON(transientError3)) must be ${JSON.stringify(json3)}`);
  t.deepEqual(JSON.parse(JSON.stringify(transientError3.toJSON())),  json3, `JSON.parse(transientError3.toJSON()) must be ${JSON.stringify(json3)}`);
  t.deepEqual(JSON.parse(JSON.stringify(transientError3)),  json3, `JSON.parse(JSON.stringify(transientError3)) must be ${JSON.stringify(json3)}`);

  t.end();
});

test('TimeoutError must be initialized ', t => {
  function check(err, message, name) {
    t.equal(err.message, message, `${err} message must be ${message}`);
    t.equal(err.name, name, `${err} name must be ${name}`);
    t.notOk(err.hasOwnProperty('name'), `${err} must NOT have own property 'name'`);

    // t.equal(err.timeout, true, `${err} timeout must be ${true}`);
    // t.equal(err.hasOwnProperty('timeout'), true, `${err} must have own property 'timeout'`);

    const errPrototype = Object.getPrototypeOf(err);
    t.ok(errPrototype.hasOwnProperty('name'), `prototype ${errPrototype} must have own property 'name'`);
    // t.notOk(errPrototype.hasOwnProperty('timeout'), `prototype ${errPrototype} must NOT have own property 'timeout'`);

    // err.timeout = false;
    // t.equal(err.timeout, false, `${err} timeout must NOW be ${false}`);
    // t.equal(errPrototype.timeout, undefined, `prototype ${errPrototype} timeout must be ${undefined}`);
  }

  const timeoutError1 = new TimeoutError('Timeout msg 1');
  const timeoutError2 = new TimeoutError('Timeout msg 2');
  const timeoutError3 = new TimeoutError('TIMEOUT - Timeout msg 3');

  check(timeoutError1, 'Timeout msg 1', 'TimeoutError');
  check(timeoutError2, 'Timeout msg 2', 'TimeoutError');
  check(timeoutError3, 'TIMEOUT - Timeout msg 3', 'TimeoutError');

  const timeoutError1Prototype = Object.getPrototypeOf(timeoutError1);
  const timeoutError2Prototype = Object.getPrototypeOf(timeoutError2);
  const timeoutError3Prototype = Object.getPrototypeOf(timeoutError3);

  t.equal(timeoutError1Prototype, TimeoutError.prototype, `timeoutError1 prototype must be TimeoutError.prototype`);
  t.equal(timeoutError2Prototype, TimeoutError.prototype, `timeoutError2 prototype must be TimeoutError.prototype`);
  t.equal(timeoutError3Prototype, TimeoutError.prototype, `timeoutError3 prototype must be TimeoutError.prototype`);

  t.notEqual(timeoutError1Prototype, Error.prototype, `timeoutError1 prototype must NOT be Error.prototype`);

  t.equal(timeoutError1Prototype.__proto__, Error.prototype, `timeoutError1 prototype prototype must be Error.prototype`);
  t.equal(timeoutError2Prototype.__proto__, Error.prototype, `timeoutError2 prototype prototype must be Error.prototype`);
  t.equal(timeoutError3Prototype.__proto__, Error.prototype, `timeoutError3 prototype prototype must be Error.prototype`);

  t.equal(timeoutError1Prototype, timeoutError2Prototype, `timeoutError1 prototype must be timeoutError2 prototype`);
  t.equal(timeoutError1Prototype, timeoutError3Prototype, `timeoutError1 prototype must be timeoutError3 prototype`);
  t.equal(timeoutError2Prototype, timeoutError3Prototype, `timeoutError2 prototype must be timeoutError3 prototype`);

  timeoutError1.a = 1;
  // timeoutError2.b = 2;
  timeoutError3.c = 3;

  let json1 = {name: timeoutError1.name, message: timeoutError1.message, a: 1};
  let json2 = {name: timeoutError2.name, message: timeoutError2.message};
  let json3 = {name: timeoutError3.name, message: timeoutError3.message, c: 3};

  t.deepEqual(JSON.parse(JSON.stringify(errors.toJSON(timeoutError1))),  json1, `JSON.parse(errors.toJSON(timeoutError1)) must be ${JSON.stringify(json1)}`);
  t.deepEqual(JSON.parse(JSON.stringify(timeoutError1.toJSON())),  json1, `JSON.parse(timeoutError1.toJSON()) must be ${JSON.stringify(json1)}`);
  t.deepEqual(JSON.parse(JSON.stringify(timeoutError1)),  json1, `JSON.parse(JSON.stringify(timeoutError1)) must be ${JSON.stringify(json1)}`);

  t.deepEqual(JSON.parse(JSON.stringify(errors.toJSON(timeoutError2))),  json2, `JSON.parse(errors.toJSON(timeoutError2)) must be ${JSON.stringify(json2)}`);
  t.deepEqual(JSON.parse(JSON.stringify(timeoutError2.toJSON())),  json2, `JSON.parse(timeoutError2.toJSON()) must be ${JSON.stringify(json2)}`);
  t.deepEqual(JSON.parse(JSON.stringify(timeoutError2)),  json2, `JSON.parse(JSON.stringify(timeoutError2)) must be ${JSON.stringify(json2)}`);

  t.deepEqual(JSON.parse(JSON.stringify(errors.toJSON(timeoutError3))),  json3, `JSON.parse(errors.toJSON(timeoutError3)) must be ${JSON.stringify(json3)}`);
  t.deepEqual(JSON.parse(JSON.stringify(timeoutError3.toJSON())),  json3, `JSON.parse(timeoutError3.toJSON()) must be ${JSON.stringify(json3)}`);
  t.deepEqual(JSON.parse(JSON.stringify(timeoutError3)),  json3, `JSON.parse(JSON.stringify(timeoutError3)) must be ${JSON.stringify(json3)}`);

  t.end();
});

test('prefixMessage', t => {
  let msg = '    ';
  let prefix = 'FATAL ';
  let both = 'FATAL     ';
  let expected = 'FATAL';
  t.equal(prefixMessage(prefix, msg), expected, `prefixMessage('${prefix}', '${msg}') must be '${expected}'`);
  t.equal(prefixMessage(prefix, both), expected, `prefixMessage('${prefix}', '${both}') must be '${expected}'`);

  msg = '  MSG  ';
  prefix = '    ';
  both = '      MSG  ';
  expected = 'MSG';
  t.equal(prefixMessage(prefix, msg), expected, `prefixMessage('${prefix}', '${msg}') must be '${expected}'`);
  t.equal(prefixMessage(prefix, both), expected, `prefixMessage('${prefix}', '${both}') must be '${expected}'`);

  msg = ' Abc xyz  ';
  prefix = '  FATAL - ';
  both = '  FATAL - Abc xyz  ';
  expected = 'FATAL - Abc xyz';
  t.equal(prefixMessage(prefix, msg), expected, `prefixMessage('${prefix}', '${msg}') must be '${expected}'`);
  t.equal(prefixMessage(prefix, both), expected, `prefixMessage('${prefix}', '${both}') must be '${expected}'`);

  msg = '  [Abc xyz]  ';
  prefix = '  TRANSIENT';
  both = '  TRANSIENT[Abc xyz]  ';
  expected = 'TRANSIENT[Abc xyz]';
  t.equal(prefixMessage(prefix, msg), expected, `prefixMessage('${prefix}, '${msg}') must be '${expected}'`);
  t.equal(prefixMessage(prefix, both), expected, `prefixMessage('${prefix}', '${both} ') must be '${expected}'`);

  t.end();
});