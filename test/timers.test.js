'use strict';

/**
 * Unit tests for core-functions/timers.js
 * @author Byron du Preez
 */

const test = require('tape');

const timers = require('../timers');

const Strings = require('../strings');

const testing = require('./testing');
// const okNotOk = testing.okNotOk;
const checkOkNotOk = testing.checkOkNotOk;
// const checkMethodOkNotOk = testing.checkMethodOkNotOk;
// const equal = testing.equal;
const checkEqual = testing.checkEqual;
// const checkMethodEqual = testing.checkMethodEqual;

test('Cancel normal timeout with cancelTimeout', t => {
  const timeout = setTimeout(() => {
    t.fail('Timeout should have been cancelled');
  }, 500);

  const triggered = timers.cancelTimeout(timeout);
  t.notOk(triggered, 'Timeout must not be triggered');

  t.end();
});

test('Cancel normal timeout with cancelInterval too', t => {
  const timeout = setTimeout(() => {
    t.fail('Timeout should have been detected as normal and cancelled as such');
  }, 500);

  const triggered = timers.cancelInterval(timeout);
  t.notOk(triggered, 'Timeout must not be triggered');

  t.end();
});

test('Cancel interval timeout with cancelInterval', t => {
  const timeout = setInterval(() => {
    t.fail('Interval timeout should have been cancelled');
  }, 500);

  const triggered = timers.cancelInterval(timeout);
  t.notOk(triggered, 'Interval timeout must not be triggered');

  t.end();
});

test('Cancel interval timeout with cancelTimeout too', t => {
  const timeout = setInterval(() => {
    t.fail('Timeout should have been detected as interval and cancelled as such');
  }, 500);

  const triggered = timers.cancelTimeout(timeout);
  t.notOk(triggered, 'Interval timeout must not be triggered');

  t.end();
});
