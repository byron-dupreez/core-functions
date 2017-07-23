'use strict';

/**
 * Unit tests for core-functions/errors.js
 * @author Byron du Preez
 */

const test = require('tape');

const errors = require('../errors');
const FatalError = errors.FatalError;

test('FatalError must be initialized ', t => {
  function check(err, message, name) {
    t.equal(err.message, message, `${err} message must be ${message}`);
    t.equal(err.name, name, `${err} name must be ${name}`);
    t.notOk(err.hasOwnProperty('name'), `${err} must NOT have own property 'name'`);

    t.equal(err.blocking, true, `${err} blocking must be ${true}`);
    t.notOk(err.hasOwnProperty('blocking'), `${err} must NOT have own property 'blocking'`);

    const errPrototype = Object.getPrototypeOf(err);
    t.ok(errPrototype.hasOwnProperty('name'), `prototype ${errPrototype} must have own property 'name'`);
    t.ok(errPrototype.hasOwnProperty('blocking'), `prototype ${errPrototype} must have own property 'blocking'`);

    err.blocking = false;
    t.equal(err.blocking, false, `${err} blocking must NOW be ${false}`);
    t.equal(errPrototype.blocking, true, `prototype ${errPrototype} blocking must STILL be ${true}`);
  }

  const fatalError1 = new FatalError('FE msg 1');
  const fatalError2 = new FatalError('FE msg 2', false);
  const fatalError3 = new FatalError('FE msg 3', true);

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

  t.end();
});