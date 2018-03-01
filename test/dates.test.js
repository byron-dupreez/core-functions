'use strict';

/**
 * Unit tests for core-functions/dates.js
 * @author Byron du Preez
 */

const test = require('tape');

const Dates = require('../dates');

const isSimpleISODateTimeLike = Dates.isSimpleISODateTimeLike;
const isSimpleISODateLike = Dates.isSimpleISODateLike;

const isExtendedISODateTimeLike = Dates.isExtendedISODateTimeLike;
const isExtendedISODateLike = Dates.isExtendedISODateLike;

const isSimpleISODateTime = Dates.isSimpleISODateTime;
const isSimpleISODate = Dates.isSimpleISODate;

// const isExtendedISODateTime = Dates.isExtendedISODateTime;
// const isExtendedISODate = Dates.isExtendedISODate;

const toSimpleISODateTime = Dates.toSimpleISODateTime;
const toSimpleISODate = Dates.toSimpleISODate;
const toDateTime = Dates.toDateTime;

const toExtendedISODate = Dates.toExtendedISODate;
//const toDateOrUndefined = Dates.toDateOrUndefined;

const isValidDate = Dates.isValidDate;


//const Strings = require('../strings');

// =====================================================================================================================
// Date string matching
// =====================================================================================================================

test(`isSimpleISODateTimeLike`, t => {
  // Others
  t.notOk(isSimpleISODateTimeLike(undefined), `undefined is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike(null), `null is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike({}), `{} is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike([]), `[] is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike(''), `'' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('abc'), `'abc' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike(123), `123 is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike(true), `true is NOT a simple ISO date-time-like`);

  // Date objects
  t.notOk(isSimpleISODateTimeLike(new Date()), `new Date() is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike(new Date('2017-12-31Z')), `new Date('2017-12-31Z') is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike(new Date('2017-12-31T00:00:00.000Z')), `new Date('2017-12-31T00:00:00.000Z') is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike(new Date('2017-12-31T23:59:59.999Z')), `new Date('2017-12-31T23:59:59.999Z') is NOT a simple ISO date-time-like`);

  // Dates
  t.notOk(isSimpleISODateTimeLike('2017'), `'2017' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-'), `'2017-' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-00'), `'2017-00' is NOT a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-01'), `'2017-01' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12'), `'2017-12' is a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-13'), `'2017-13' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-01-'), `'2017-01-' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-01-1'), `'2017-01-1' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-'), `'2017-12-' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-1'), `'2017-12-1' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-01-00'), `'2017-01-00' is NOT a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-01-01'), `'2017-01-01' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-01-31'), `'2017-01-31' is a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-01-32'), `'2017-01-32' is NOT a simple ISO date-time-like`);

  // Dates with time zones
  t.ok(isSimpleISODateTimeLike('2017-12-31Z'), `'2017-12-31Z' is a simple ISO date-time-like`);
  // None of the following attempts at adding any time-zone other than 'Z' seem to be valid
  t.notOk(isSimpleISODateTimeLike('2017-12-31-'), `'2017-12-31-' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31-0'), `'2017-12-31-0' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31-00'), `'2017-12-31-00' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31-00:'), `'2017-12-31-00:' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31-00:0'), `'2017-12-31-00:0' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31-00:00'), `'2017-12-31-00:00' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31-00:01'), `'2017-12-31-00:01' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31-01:00'), `'2017-12-31-01:00' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31-23:00'), `'2017-12-31-23:00' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31-23:59'), `'2017-12-31-23:59' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31-24:00'), `'2017-12-31-24:00' is NOT a simple ISO date-time-like`);

  t.notOk(isSimpleISODateTimeLike('2017-12-31+'), `'2017-12-31+' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31+0'), `'2017-12-31+0' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31+00'), `'2017-12-31+00' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31+00:'), `'2017-12-31+00:' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31+00:0'), `'2017-12-31+00:0' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31+00:00'), `'2017-12-31+00:00' is a NOT simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31+00:01'), `'2017-12-31+00:01' is a NOT simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31+01:00'), `'2017-12-31+01:00' is a NOT simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31+23:00'), `'2017-12-31+23:00' is a NOT simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31+23:59'), `'2017-12-31+23:59' is a NOT simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31+24:00'), `'2017-12-31+24:00' is NOT a simple ISO date-time-like`);

  // Dates & times
  t.notOk(isSimpleISODateTimeLike('2017-12-31T'), `'2017-12-31T' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T2'), `'2017-12-31T2' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23'), `'2017-12-31T23' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:'), `'2017-12-31T23:' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:5'), `'2017-12-31T23:5' is NOT a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59'), `'2017-12-31T23:59' is a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:'), `'2017-12-31T23:59:' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:5'), `'2017-12-31T23:59:5' is NOT a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59'), `'2017-12-31T23:59:59' is a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:59.'), `'2017-12-31T23:59:59.' is NOT a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.0'), `'2017-12-31T23:59:59.0' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.1'), `'2017-12-31T23:59:59.1' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.01'), `'2017-12-31T23:59:59.01' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.001'), `'2017-12-31T23:59:59.001' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.999'), `'2017-12-31T23:59:59.999' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T00:00:00.000'), `'2017-12-31T00:00:00.000' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.9999'), `'2017-12-31T23:59:59.9999' is a simple ISO date-time-like`);

  // Dates & times with time-zones
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.999Z'), `'2017-12-31T23:59:59.999Z' is a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:59.999-'), `'2017-12-31T23:59:59.999-' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:59.999-0'), `'2017-12-31T23:59:59.999-0' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:59.999-00'), `'2017-12-31T23:59:59.999-00' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:59.999-00:'), `'2017-12-31T23:59:59.999-00:' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:59.999-00:0'), `'2017-12-31T23:59:59.999-00:0' is NOT a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.999-00:00'), `'2017-12-31T23:59:59.999-00:00' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.999-00:01'), `'2017-12-31T23:59:59.999-00:01' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.999-01:00'), `'2017-12-31T23:59:59.999-01:00' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.999-23:00'), `'2017-12-31T23:59:59.999-23:00' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.999-23:59'), `'2017-12-31T23:59:59.999-23:59' is a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:59.999-24:00'), `'2017-12-31T23:59:59.999-24:00' is NOT a simple ISO date-time-like`);

  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:59.999+'), `'2017-12-31T23:59:59.999+' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:59.999+0'), `'2017-12-31T23:59:59.999+0' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:59.999+00'), `'2017-12-31T23:59:59.999+00' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:59.999+00:'), `'2017-12-31T23:59:59.999+00:' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:59.999+00:0'), `'2017-12-31T23:59:59.999+00:0' is NOT a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.999+00:00'), `'2017-12-31T23:59:59.999+00:00' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.999+00:01'), `'2017-12-31T23:59:59.999+00:01' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.999+01:00'), `'2017-12-31T23:59:59.999+01:00' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.999+23:00'), `'2017-12-31T23:59:59.999+23:00' is a simple ISO date-time-like`);
  t.ok(isSimpleISODateTimeLike('2017-12-31T23:59:59.999+23:59'), `'2017-12-31T23:59:59.999+23:59' is a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('2017-12-31T23:59:59.999+24:00'), `'2017-12-31T23:59:59.999+24:00' is NOT a simple ISO date-time-like`);

  // Extended year formats
  t.notOk(isSimpleISODateTimeLike('2017-01-32'), `'2017-01-32' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('-2017-12-31'), `'-2017-12-31' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('-02017-12-31'), `'-02017-12-31' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('-12017-12-31'), `'-12017-12-31' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('-92017-12-31'), `'-92017-12-31' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('-002017-12-31'), `'-002017-12-31' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('-012017-12-31'), `'-012017-12-31' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('-992017-12-31'), `'-992017-12-31' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('+2017-12-31'), `'+2017-12-31' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('+02017-12-31'), `'+02017-12-31' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('+12017-12-31'), `'+12017-12-31' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('+92017-12-31'), `'+92017-12-31' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('+002017-12-31'), `'+002017-12-31' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('+012017-12-31'), `'+012017-12-31' is NOT a simple ISO date-time-like`);
  t.notOk(isSimpleISODateTimeLike('+992017-12-31'), `'+992017-12-31' is NOT a simple ISO date-time-like`);
  t.end();
});

test(`isSimpleISODateLike`, t => {
  // Others
  t.notOk(isSimpleISODateLike(undefined), `undefined is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike(null), `null is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike({}), `{} is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike([]), `[] is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike(''), `'' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('abc'), `'abc' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike(123), `123 is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike(true), `true is NOT a simple ISO date-like`);

  // Date objects
  t.notOk(isSimpleISODateLike(new Date('2017-12-31Z')), `new Date('2017-12-31Z') is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike(new Date('2017-12-31T00:00:00.000Z')), `new Date('2017-12-31T00:00:00.000Z') is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike(new Date('2017-12-31T23:59:59.999Z')), `new Date('2017-12-31T23:59:59.999Z') is NOT a simple ISO date-like`);

  // Dates
  t.notOk(isSimpleISODateLike('2017'), `'2017' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-'), `'2017-' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-00'), `'2017-00' is NOT a simple ISO date-like`);
  t.ok(isSimpleISODateLike('2017-01'), `'2017-01' is a simple ISO date-like`);
  t.ok(isSimpleISODateLike('2017-12'), `'2017-12' is a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-13'), `'2017-13' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-01-'), `'2017-01-' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-01-1'), `'2017-01-1' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-'), `'2017-12-' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-1'), `'2017-12-1' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-01-00'), `'2017-01-00' is NOT a simple ISO date-like`);
  t.ok(isSimpleISODateLike('2017-01-01'), `'2017-01-01' is a simple ISO date-like`);
  t.ok(isSimpleISODateLike('2017-01-31'), `'2017-01-31' is a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-01-32'), `'2017-01-32' is NOT a simple ISO date-like`);

  // Dates with time zones
  t.ok(isSimpleISODateLike('2017-12-31Z'), `'2017-12-31Z' is a simple ISO date-like`);
  // None of the following attempts at adding any time-zone other than 'Z' seem to be valid
  t.notOk(isSimpleISODateLike('2017-12-31-'), `'2017-12-31-' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31-0'), `'2017-12-31-0' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31-00'), `'2017-12-31-00' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31-00:'), `'2017-12-31-00:' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31-00:0'), `'2017-12-31-00:0' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31-00:00'), `'2017-12-31-00:00' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31-00:01'), `'2017-12-31-00:01' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31-01:00'), `'2017-12-31-01:00' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31-23:00'), `'2017-12-31-23:00' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31-23:59'), `'2017-12-31-23:59' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31-24:00'), `'2017-12-31-24:00' is NOT a simple ISO date-like`);

  t.notOk(isSimpleISODateLike('2017-12-31+'), `'2017-12-31+' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31+0'), `'2017-12-31+0' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31+00'), `'2017-12-31+00' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31+00:'), `'2017-12-31+00:' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31+00:0'), `'2017-12-31+00:0' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31+00:00'), `'2017-12-31+00:00' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31+00:01'), `'2017-12-31+00:01' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31+01:00'), `'2017-12-31+01:00' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31+23:00'), `'2017-12-31+23:00' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31+23:59'), `'2017-12-31+23:59' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31+24:00'), `'2017-12-31+24:00' is NOT a simple ISO date-like`);

  // Dates & times
  t.notOk(isSimpleISODateLike('2017-12-31T00:00:00.000'), `'2017-12-31T00:00:00.000' is NOT a simple ISO date-like`);
  t.ok(isSimpleISODateLike('2017-12-31T00:00:00.000Z'), `'2017-12-31T00:00:00.000Z' is a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31T00:00:00.001Z'), `'2017-12-31T00:00:00.001Z' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('2017-12-31T23:59:59.999Z'), `'2017-12-31T23:59:59.999Z' is NOT a simple ISO date-like`);

  // Extended year formats
  t.notOk(isSimpleISODateLike('-2017-12-31'), `'-2017-12-31' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('-02017-12-31'), `'-02017-12-31' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('-12017-12-31'), `'-12017-12-31' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('-92017-12-31'), `'-92017-12-31' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('-002017-12-31'), `'-002017-12-31' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('-012017-12-31'), `'-012017-12-31' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('-992017-12-31'), `'-992017-12-31' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('+2017-12-31'), `'+2017-12-31' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('+02017-12-31'), `'+02017-12-31' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('+12017-12-31'), `'+12017-12-31' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('+92017-12-31'), `'+92017-12-31' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('+002017-12-31'), `'+002017-12-31' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('+012017-12-31'), `'+012017-12-31' is NOT a simple ISO date-like`);
  t.notOk(isSimpleISODateLike('+992017-12-31'), `'+992017-12-31' is NOT a simple ISO date-like`);
  t.end();
});

test(`isExtendedISODateTimeLike`, t => {
  // Others
  t.notOk(isExtendedISODateTimeLike(undefined), `undefined is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike(null), `null is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike({}), `{} is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike([]), `[] is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike(''), `'' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('abc'), `'abc' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike(123), `123 is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike(true), `true is NOT an extended ISO date-time-like`);

  // Date objects
  t.notOk(isExtendedISODateTimeLike(new Date()), `new Date() is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike(new Date('2017-12-31Z')), `new Date('2017-12-31Z') is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike(new Date('2017-12-31T00:00:00.000Z')), `new Date('2017-12-31T00:00:00.000Z') is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike(new Date('2017-12-31T23:59:59.999Z')), `new Date('2017-12-31T23:59:59.999Z') is NOT an extended ISO date-time-like`);

  // Dates
  t.notOk(isExtendedISODateTimeLike('2017'), `'2017' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-'), `'2017-' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-00'), `'2017-00' is NOT an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-01'), `'2017-01' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12'), `'2017-12' is an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-13'), `'2017-13' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-01-'), `'2017-01-' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-01-1'), `'2017-01-1' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-'), `'2017-12-' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-1'), `'2017-12-1' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-01-00'), `'2017-01-00' is NOT an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-01-01'), `'2017-01-01' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-01-31'), `'2017-01-31' is an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-01-32'), `'2017-01-32' is NOT an extended ISO date-time-like`);

  // Dates with time zones
  t.ok(isExtendedISODateTimeLike('2017-12-31Z'), `'2017-12-31Z' is an extended ISO date-time-like`);
  // None of the following attempts at adding any time-zone other than 'Z' seem to be valid
  t.notOk(isExtendedISODateTimeLike('2017-12-31-'), `'2017-12-31-' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31-0'), `'2017-12-31-0' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31-00'), `'2017-12-31-00' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31-00:'), `'2017-12-31-00:' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31-00:0'), `'2017-12-31-00:0' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31-00:00'), `'2017-12-31-00:00' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31-00:01'), `'2017-12-31-00:01' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31-01:00'), `'2017-12-31-01:00' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31-23:00'), `'2017-12-31-23:00' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31-23:59'), `'2017-12-31-23:59' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31-24:00'), `'2017-12-31-24:00' is NOT an extended ISO date-time-like`);

  t.notOk(isExtendedISODateTimeLike('2017-12-31+'), `'2017-12-31+' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31+0'), `'2017-12-31+0' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31+00'), `'2017-12-31+00' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31+00:'), `'2017-12-31+00:' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31+00:0'), `'2017-12-31+00:0' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31+00:00'), `'2017-12-31+00:00' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31+00:01'), `'2017-12-31+00:01' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31+01:00'), `'2017-12-31+01:00' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31+23:00'), `'2017-12-31+23:00' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31+23:59'), `'2017-12-31+23:59' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31+24:00'), `'2017-12-31+24:00' is NOT an extended ISO date-time-like`);

  // Dates & times
  t.notOk(isExtendedISODateTimeLike('2017-12-31T'), `'2017-12-31T' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T2'), `'2017-12-31T2' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23'), `'2017-12-31T23' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:'), `'2017-12-31T23:' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:5'), `'2017-12-31T23:5' is NOT an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59'), `'2017-12-31T23:59' is an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:'), `'2017-12-31T23:59:' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:5'), `'2017-12-31T23:59:5' is NOT an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59'), `'2017-12-31T23:59:59' is an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:59.'), `'2017-12-31T23:59:59.' is NOT an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.0'), `'2017-12-31T23:59:59.0' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.1'), `'2017-12-31T23:59:59.1' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.01'), `'2017-12-31T23:59:59.01' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.001'), `'2017-12-31T23:59:59.001' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.999'), `'2017-12-31T23:59:59.999' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T00:00:00.000'), `'2017-12-31T00:00:00.000' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.9999'), `'2017-12-31T23:59:59.9999' is an extended ISO date-time-like`);

  // Dates & times with time-zones
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.999Z'), `'2017-12-31T23:59:59.999Z' is an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:59.999-'), `'2017-12-31T23:59:59.999-' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:59.999-0'), `'2017-12-31T23:59:59.999-0' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:59.999-00'), `'2017-12-31T23:59:59.999-00' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:59.999-00:'), `'2017-12-31T23:59:59.999-00:' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:59.999-00:0'), `'2017-12-31T23:59:59.999-00:0' is NOT an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.999-00:00'), `'2017-12-31T23:59:59.999-00:00' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.999-00:01'), `'2017-12-31T23:59:59.999-00:01' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.999-01:00'), `'2017-12-31T23:59:59.999-01:00' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.999-23:00'), `'2017-12-31T23:59:59.999-23:00' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.999-23:59'), `'2017-12-31T23:59:59.999-23:59' is an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:59.999-24:00'), `'2017-12-31T23:59:59.999-24:00' is NOT an extended ISO date-time-like`);

  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:59.999+'), `'2017-12-31T23:59:59.999+' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:59.999+0'), `'2017-12-31T23:59:59.999+0' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:59.999+00'), `'2017-12-31T23:59:59.999+00' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:59.999+00:'), `'2017-12-31T23:59:59.999+00:' is NOT an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:59.999+00:0'), `'2017-12-31T23:59:59.999+00:0' is NOT an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.999+00:00'), `'2017-12-31T23:59:59.999+00:00' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.999+00:01'), `'2017-12-31T23:59:59.999+00:01' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.999+01:00'), `'2017-12-31T23:59:59.999+01:00' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.999+23:00'), `'2017-12-31T23:59:59.999+23:00' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('2017-12-31T23:59:59.999+23:59'), `'2017-12-31T23:59:59.999+23:59' is an extended ISO date-time-like`);
  t.notOk(isExtendedISODateTimeLike('2017-12-31T23:59:59.999+24:00'), `'2017-12-31T23:59:59.999+24:00' is NOT an extended ISO date-time-like`);

  // Extended year formats
  t.ok(isExtendedISODateTimeLike('-2017-12-31'), `'-2017-12-31' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('-02017-12-31'), `'-02017-12-31' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('-12017-12-31'), `'-12017-12-31' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('-92017-12-31'), `'-92017-12-31' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('-002017-12-31'), `'-002017-12-31' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('-012017-12-31'), `'-012017-12-31' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('-992017-12-31'), `'-992017-12-31' is an extended ISO date-time-like`);

  t.ok(isExtendedISODateTimeLike('+2017-12-31'), `'+2017-12-31' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('+02017-12-31'), `'+02017-12-31' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('+12017-12-31'), `'+12017-12-31' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('+92017-12-31'), `'+92017-12-31' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('+002017-12-31'), `'+002017-12-31' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('+012017-12-31'), `'+012017-12-31' is an extended ISO date-time-like`);
  t.ok(isExtendedISODateTimeLike('+992017-12-31'), `'+992017-12-31' is an extended ISO date-time-like`);

  t.end();
});

test(`isExtendedISODateLike`, t => {
  t.notOk(isExtendedISODateLike(undefined), `undefined is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike(null), `null is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike({}), `{} is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike([]), `[] is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike(''), `'' is NOT an extended ISO date-like`);

  // Date objects
  t.notOk(isExtendedISODateLike(new Date('2017-12-31Z')), `new Date('2017-12-31Z') is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike(new Date('2017-12-31T00:00:00.000Z')), `new Date('2017-12-31T00:00:00.000Z') is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike(new Date('2017-12-31T23:59:59.999Z')), `new Date('2017-12-31T23:59:59.999Z') is NOT an extended ISO date-like`);

  // Dates
  t.notOk(isExtendedISODateLike('2017'), `'2017' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-'), `'2017-' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-00'), `'2017-00' is NOT an extended ISO date-like`);
  t.ok(isExtendedISODateLike('2017-01'), `'2017-01' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('2017-12'), `'2017-12' is an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-13'), `'2017-13' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-01-'), `'2017-01-' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-01-1'), `'2017-01-1' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-'), `'2017-12-' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-1'), `'2017-12-1' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-01-00'), `'2017-01-00' is NOT an extended ISO date-like`);
  t.ok(isExtendedISODateLike('2017-01-01'), `'2017-01-01' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('2017-01-31'), `'2017-01-31' is an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-01-32'), `'2017-01-32' is NOT an extended ISO date-like`);

  // Dates with time zones
  t.ok(isExtendedISODateLike('2017-12-31Z'), `'2017-12-31Z' is an extended ISO date-like`);
  // None of the following attempts at adding any time-zone other than 'Z' seem to be valid
  t.notOk(isExtendedISODateLike('2017-12-31-'), `'2017-12-31-' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31-0'), `'2017-12-31-0' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31-00'), `'2017-12-31-00' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31-00:'), `'2017-12-31-00:' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31-00:0'), `'2017-12-31-00:0' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31-00:00'), `'2017-12-31-00:00' is an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31-00:01'), `'2017-12-31-00:01' is an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31-01:00'), `'2017-12-31-01:00' is an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31-23:00'), `'2017-12-31-23:00' is an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31-23:59'), `'2017-12-31-23:59' is an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31-24:00'), `'2017-12-31-24:00' is NOT an extended ISO date-like`);

  t.notOk(isExtendedISODateLike('2017-12-31+'), `'2017-12-31+' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31+0'), `'2017-12-31+0' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31+00'), `'2017-12-31+00' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31+00:'), `'2017-12-31+00:' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31+00:0'), `'2017-12-31+00:0' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31+00:00'), `'2017-12-31+00:00' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31+00:01'), `'2017-12-31+00:01' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31+01:00'), `'2017-12-31+01:00' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31+23:00'), `'2017-12-31+23:00' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31+23:59'), `'2017-12-31+23:59' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31+24:00'), `'2017-12-31+24:00' is NOT an extended ISO date-like`);

  // Dates & times
  t.notOk(isExtendedISODateLike('2017-12-31T00:00:00.000'), `'2017-12-31T00:00:00.000' is NOT an extended ISO date-like`);
  t.ok(isExtendedISODateLike('2017-12-31T00:00:00.000Z'), `'2017-12-31T00:00:00.000Z' is an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31T00:00:00.001Z'), `'2017-12-31T00:00:00.001Z' is NOT an extended ISO date-like`);
  t.notOk(isExtendedISODateLike('2017-12-31T23:59:59.999Z'), `'2017-12-31T23:59:59.999Z' is NOT an extended ISO date-like`);

  // Extended year formats
  t.ok(isExtendedISODateLike('-2017-12-31'), `'-2017-12-31' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('-02017-12-31'), `'-02017-12-31' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('-12017-12-31'), `'-12017-12-31' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('-92017-12-31'), `'-92017-12-31' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('-002017-12-31'), `'-002017-12-31' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('-012017-12-31'), `'-012017-12-31' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('-992017-12-31'), `'-992017-12-31' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('+2017-12-31'), `'+2017-12-31' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('+02017-12-31'), `'+02017-12-31' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('+12017-12-31'), `'+12017-12-31' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('+92017-12-31'), `'+92017-12-31' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('+002017-12-31'), `'+002017-12-31' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('+012017-12-31'), `'+012017-12-31' is an extended ISO date-like`);
  t.ok(isExtendedISODateLike('+992017-12-31'), `'+992017-12-31' is an extended ISO date-like`);
  t.end();
});

// =====================================================================================================================
// Date matching
// =====================================================================================================================

test(`isSimpleISODateTime`, t => {
  // Others
  t.notOk(isSimpleISODateTime(undefined), `undefined is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(null), `null is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime({}), `{} is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime([]), `[] is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(''), `'' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime('abc'), `'abc' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(123), `123 is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(true), `true is NOT a simple ISO date-time`);

  // Date objects
  t.ok(isSimpleISODateTime(new Date()), `new Date() is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31Z')), `new Date('2017-12-31Z') is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T00:00:00.000Z')), `new Date('2017-12-31T00:00:00.000Z') is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999Z')), `new Date('2017-12-31T23:59:59.999Z') is a simple ISO date-time`);

  // Dates
  t.ok(isSimpleISODateTime(new Date('2017-01')), `'2017-01' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12')), `'2017-12' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-01-01')), `'2017-01-01' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-01-31')), `'2017-01-31' is a simple ISO date-time`);

  // Dates with time zones (only Z appears to be valid with just a date
  t.ok(isSimpleISODateTime(new Date('2017-12-31Z')), `'2017-12-31Z' is a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31-00:00')), `'2017-12-31-00:00' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31-00:01')), `'2017-12-31-00:01' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31-01:00')), `'2017-12-31-01:00' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31-23:00')), `'2017-12-31-23:00' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31-23:59')), `'2017-12-31-23:59' is NOT a simple ISO date-time`);

  t.notOk(isSimpleISODateTime(new Date('2017-12-31+')), `'2017-12-31+' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31+0')), `'2017-12-31+0' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31+00')), `'2017-12-31+00' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31+00:')), `'2017-12-31+00:' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31+00:0')), `'2017-12-31+00:0' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31+00:00')), `'2017-12-31+00:00' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31+00:01')), `'2017-12-31+00:01' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31+01:00')), `'2017-12-31+01:00' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31+23:00')), `'2017-12-31+23:00' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31+23:59')), `'2017-12-31+23:59' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31+24:00')), `'2017-12-31+24:00' is NOT a simple ISO date-time`);

  // Dates & times
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T')), `'2017-12-31T' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T2')), `'2017-12-31T2' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23')), `'2017-12-31T23' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:')), `'2017-12-31T23:' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:5')), `'2017-12-31T23:5' is NOT a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59')), `'2017-12-31T23:59' is a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:')), `'2017-12-31T23:59:' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:5')), `'2017-12-31T23:59:5' is NOT a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59')), `'2017-12-31T23:59:59' is a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:59.')), `'2017-12-31T23:59:59.' is NOT a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.0')), `'2017-12-31T23:59:59.0' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.1')), `'2017-12-31T23:59:59.1' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.01')), `'2017-12-31T23:59:59.01' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.001')), `'2017-12-31T23:59:59.001' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999')), `'2017-12-31T23:59:59.999' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T00:00:00.000')), `'2017-12-31T00:00:00.000' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.9999')), `'2017-12-31T23:59:59.9999' is a simple ISO date-time`);

  // Dates & times with time-zones
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999Z')), `'2017-12-31T23:59:59.999Z' is a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999-')), `'2017-12-31T23:59:59.999-' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999-0')), `'2017-12-31T23:59:59.999-0' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999-00')), `'2017-12-31T23:59:59.999-00' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999-00:')), `'2017-12-31T23:59:59.999-00:' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999-00:0')), `'2017-12-31T23:59:59.999-00:0' is NOT a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999-00:00')), `'2017-12-31T23:59:59.999-00:00' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999-00:01')), `'2017-12-31T23:59:59.999-00:01' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999-01:00')), `'2017-12-31T23:59:59.999-01:00' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999-23:00')), `'2017-12-31T23:59:59.999-23:00' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999-23:59')), `'2017-12-31T23:59:59.999-23:59' is a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999-24:00')), `'2017-12-31T23:59:59.999-24:00' is NOT a simple ISO date-time`);

  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999+')), `'2017-12-31T23:59:59.999+' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999+0')), `'2017-12-31T23:59:59.999+0' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999+00')), `'2017-12-31T23:59:59.999+00' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999+00:')), `'2017-12-31T23:59:59.999+00:' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999+00:0')), `'2017-12-31T23:59:59.999+00:0' is NOT a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999+00:00')), `'2017-12-31T23:59:59.999+00:00' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999+00:01')), `'2017-12-31T23:59:59.999+00:01' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999+01:00')), `'2017-12-31T23:59:59.999+01:00' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999+23:00')), `'2017-12-31T23:59:59.999+23:00' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999+23:59')), `'2017-12-31T23:59:59.999+23:59' is a simple ISO date-time`);
  // t.notOk(isSimpleISODateTime(new Date('2017-12-31T23:59:59.999+24:00')), `'2017-12-31T23:59:59.999+24:00' is NOT a simple ISO date-time`);

  // Extended year formats
  t.notOk(isSimpleISODateTime(new Date('2017-01-32')), `'2017-01-32' is NOT a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('-2017-12-31')), `'-2017-12-31' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('-02017-12-31')), `'-02017-12-31' is a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('-12017-12-31')), `'-12017-12-31' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('-92017-12-31')), `'-92017-12-31' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('-002017-12-31')), `'-002017-12-31' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('-012017-12-31')), `'-012017-12-31' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('-992017-12-31')), `'-992017-12-31' is NOT a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('+2017-12-31')), `'+2017-12-31' is a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('+02017-12-31')), `'+02017-12-31' is a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('+12017-12-31')), `'+12017-12-31' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('+92017-12-31')), `'+92017-12-31' is NOT a simple ISO date-time`);
  t.ok(isSimpleISODateTime(new Date('+002017-12-31')), `'+002017-12-31' is a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('+012017-12-31')), `'+012017-12-31' is NOT a simple ISO date-time`);
  t.notOk(isSimpleISODateTime(new Date('+992017-12-31')), `'+992017-12-31' is NOT a simple ISO date-time`);
  t.end();
});


test(`isSimpleISODate`, t => {
  // Others
  t.notOk(isSimpleISODate(undefined), `undefined is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(null), `null is NOT a simple ISO date`);
  t.notOk(isSimpleISODate({}), `{} is NOT a simple ISO date`);
  t.notOk(isSimpleISODate([]), `[] is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(''), `'' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate('abc'), `'abc' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(123), `123 is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(true), `true is NOT a simple ISO date`);

  // Date objects
  t.ok(isSimpleISODate(new Date('2017-12-31Z')), `2017-12-31Z is a simple ISO date`);
  t.ok(isSimpleISODate(new Date('2017-12-31T00:00:00.000Z')), `2017-12-31T00:00:00.000Z is a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('2017-12-31T23:59:59.999Z')), `2017-12-31T23:59:59.999Z is NOT a simple ISO date`);

  // Dates
  t.ok(isSimpleISODate(new Date('2017')), `'2017' is a simple ISO date (Date constructor assumes 2017-01-01T00:00:00.000Z)`);
  t.notOk(isSimpleISODate(new Date('2017-')), `'2017-' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('2017-00')), `'2017-00' is NOT a simple ISO date`);
  t.ok(isSimpleISODate(new Date('2017-01')), `'2017-01' is a simple ISO date`);
  t.ok(isSimpleISODate(new Date('2017-12')), `'2017-12' is a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('2017-13')), `'2017-13' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('2017-01-')), `'2017-01-' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('2017-01-1')), `'2017-01-1' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('2017-12-')), `'2017-12-' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('2017-12-1')), `'2017-12-1' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('2017-01-00')), `'2017-01-00' is NOT a simple ISO date`);
  t.ok(isSimpleISODate(new Date('2017-01-01')), `'2017-01-01' is a simple ISO date`);
  t.ok(isSimpleISODate(new Date('2017-01-31')), `'2017-01-31' is a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('2017-01-32')), `'2017-01-32' is NOT a simple ISO date`);

  // Dates with time zones
  t.ok(isSimpleISODate(new Date('2017-12-31Z')), `'2017-12-31Z' is a simple ISO date`);

  // Dates & times
  t.ok(isSimpleISODate(new Date('2017-12-31T00:00:00.000Z')), `'2017-12-31T00:00:00.000Z' is a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('2017-12-31T23:59:59.999Z')), `'2017-12-31T23:59:59.999Z' is NOT a simple ISO date`);

  // Extended year formats
  t.notOk(isSimpleISODate(new Date('-2017-12-31')), `'-2017-12-31' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('-02017-12-31')), `'-02017-12-31' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('-12017-12-31')), `'-12017-12-31' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('-92017-12-31')), `'-92017-12-31' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('-002017-12-31')), `'-002017-12-31' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('-012017-12-31')), `'-012017-12-31' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('-992017-12-31')), `'-992017-12-31' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('+2017-12-31')), `'+2017-12-31' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('+02017-12-31')), `'+02017-12-31' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('+12017-12-31')), `'+12017-12-31' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('+92017-12-31')), `'+92017-12-31' is NOT a simple ISO date`);
  t.ok(isSimpleISODate(new Date('+002017-12-31')), `'+002017-12-31' is a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('+012017-12-31')), `'+012017-12-31' is NOT a simple ISO date`);
  t.notOk(isSimpleISODate(new Date('+992017-12-31')), `'+992017-12-31' is NOT a simple ISO date`);
  t.end();
});

test('toSimpleISODateTime', t => {
  t.deepEqual(toSimpleISODateTime(new Date('2017-02-31')), new Date('2017-02-31'), `2017-02-31 becomes a simple ISO date-time ${new Date('2017-02-31').toISOString()}`);
  t.deepEqual(toSimpleISODateTime(new Date('2017-12-31')), new Date('2017-12-31'), `2017-12-31 becomes a simple ISO date-time ${new Date('2017-12-31').toISOString()}`);
  t.deepEqual(toSimpleISODateTime(new Date('2017-02-31Z')), new Date('2017-02-31Z'), `2017-02-31Z becomes a simple ISO date-time ${new Date('2017-02-31Z').toISOString()}`);
  t.deepEqual(toSimpleISODateTime(new Date('2017-12-31Z')), new Date('2017-12-31Z'), `2017-12-31Z becomes a simple ISO date-time ${new Date('2017-12-31Z').toISOString()}`);

  t.deepEqual(toSimpleISODateTime(new Date('2017-12-31T00:00:00.000')), new Date('2017-12-31T00:00:00.000'), `2017-12-31T00:00:00.000 becomes a simple ISO date-time ${new Date('2017-12-31T00:00:00.000').toISOString()}`);
  t.deepEqual(toSimpleISODateTime(new Date('2017-12-31T00:00:00.001')), new Date('2017-12-31T00:00:00.001'), `2017-12-31T00:00:00.001 becomes a simple ISO date-time ${new Date('2017-12-31T00:00:00.001').toISOString()}`);
  t.deepEqual(toSimpleISODateTime(new Date('2017-12-31T23:59:59.999')), new Date('2017-12-31T23:59:59.999'), `2017-12-31T23:59:59.999 becomes a simple ISO date-time ${new Date('2017-12-31T23:59:59.999').toISOString()}`);

  t.deepEqual(toSimpleISODateTime(new Date('2017-12-31T00:00:00.000Z')), new Date('2017-12-31T00:00:00.000Z'), `2017-12-31T00:00:00.000Z becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODateTime(new Date('2017-12-31T00:00:00.001Z')), new Date('2017-12-31T00:00:00.001Z'), `2017-12-31T00:00:00.001Z becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODateTime(new Date('2017-12-31T23:59:59.999Z')), new Date('2017-12-31T23:59:59.999Z'), `2017-12-31T23:59:59.999Z becomes a simple ISO date-time`);

  t.deepEqual(toSimpleISODateTime('2017-02-31'), new Date('2017-02-31'), `2017-02-31 becomes a simple ISO date-time ${new Date('2017-02-31').toISOString()}`);
  t.deepEqual(toSimpleISODateTime('2017-12-31'), new Date('2017-12-31'), `2017-12-31 becomes a simple ISO date-time ${new Date('2017-12-31').toISOString()}`);
  t.deepEqual(toSimpleISODateTime('2017-02-31Z'), new Date('2017-02-31Z'), `2017-02-31Z becomes a simple ISO date-time ${new Date('2017-02-31Z').toISOString()}`);
  t.deepEqual(toSimpleISODateTime('2017-12-31Z'), new Date('2017-12-31Z'), `2017-12-31Z becomes a simple ISO date-time`);

  t.deepEqual(toSimpleISODateTime('2017-00-01T00:00:00.000Z'), null, `2017-00-01T00:00:00.000Z becomes null`);
  t.deepEqual(toSimpleISODateTime('2017-13-01T00:00:00.000Z'), null, `2017-13-01T00:00:00.000Z becomes null`);
  t.deepEqual(toSimpleISODateTime('2017-01-00T00:00:00.000Z'), null, `2017-01-00T00:00:00.000Z becomes null`);
  t.deepEqual(toSimpleISODateTime('2017-01-32T00:00:00.000Z'), null, `2017-01-32T00:00:00.000Z becomes null`);

  t.deepEqual(toSimpleISODateTime('2017-01-01T00:00:00.000Z'), new Date('2017-01-01T00:00:00.000Z'), `2017-01-01T00:00:00.000Z becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODateTime('2017-12-31T00:00:00.000Z'), new Date('2017-12-31T00:00:00.000Z'), `2017-12-31T00:00:00.000Z becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODateTime('2017-12-31T00:00:00.001Z'), new Date('2017-12-31T00:00:00.001Z'), `2017-12-31T00:00:00.001Z becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODateTime('2017-12-31T23:59:59.999Z'), new Date('2017-12-31T23:59:59.999Z'), `2017-12-31T23:59:59.999Z becomes a simple ISO date-time`);

  t.deepEqual(toSimpleISODateTime('2017-01-01T00:00:00.000+02:00'), new Date('2017-01-01T00:00:00.000+02:00'), `2017-01-01T00:00:00.000+02:00 becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODateTime('2017-12-31T00:00:00.000+02:00'), new Date('2017-12-31T00:00:00.000+02:00'), `2017-12-31T00:00:00.000+02:00 becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODateTime('2017-12-31T00:00:00.001+02:00'), new Date('2017-12-31T00:00:00.001+02:00'), `2017-12-31T00:00:00.001+02:00 becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODateTime('2017-12-31T23:59:59.999+02:00'), new Date('2017-12-31T23:59:59.999+02:00'), `2017-12-31T23:59:59.999+02:00 becomes a simple ISO date-time`);

  t.deepEqual(toSimpleISODateTime('2017-01-01T00:00:00.000-02:00'), new Date('2017-01-01T00:00:00.000-02:00'), `2017-01-01T00:00:00.000-02:00 becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODateTime('2017-12-31T00:00:00.000-02:00'), new Date('2017-12-31T00:00:00.000-02:00'), `2017-12-31T00:00:00.000-02:00 becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODateTime('2017-12-31T00:00:00.001-02:00'), new Date('2017-12-31T00:00:00.001-02:00'), `2017-12-31T00:00:00.001-02:00 becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODateTime('2017-12-31T23:59:59.999-02:00'), new Date('2017-12-31T23:59:59.999-02:00'), `2017-12-31T23:59:59.999-02:00 becomes a simple ISO date-time`);

  t.end();
});

test('toSimpleISODate', t => {
  t.deepEqual(toSimpleISODate(new Date('2017-02-31')), new Date('2017-02-31'), `2017-02-31 becomes a simple ISO date-time ${new Date('2017-02-31').toISOString()}`);
  t.deepEqual(toSimpleISODate(new Date('2017-12-31')), new Date('2017-12-31'), `2017-12-31 becomes a simple ISO date-time ${new Date('2017-12-31').toISOString()}`);
  t.deepEqual(toSimpleISODate(new Date('2017-02-31Z')), new Date('2017-02-31Z'), `2017-02-31Z becomes a simple ISO date-time ${new Date('2017-02-31Z').toISOString()}`);
  t.deepEqual(toSimpleISODate(new Date('2017-12-31Z')), new Date('2017-12-31Z'), `2017-12-31Z becomes a simple ISO date-time ${new Date('2017-12-31Z').toISOString()}`);

  // null in Node 8.9.4 - t.deepEqual(toSimpleISODate(new Date('2017-12-31T00:00:00.000')), new Date('2017-12-31T00:00:00.000'), `2017-12-31T00:00:00.000 becomes a simple ISO date-time ${new Date('2017-12-31T00:00:00.000').toISOString()}`);
  t.deepEqual(toSimpleISODate(new Date('2017-12-31T00:00:00.001')), null, `2017-12-31T00:00:00.001 becomes null`);
  t.deepEqual(toSimpleISODate(new Date('2017-12-31T23:59:59.999')), null, `2017-12-31T23:59:59.999 becomes null`);

  t.deepEqual(toSimpleISODate(new Date('2017-12-31T00:00:00.000Z')), new Date('2017-12-31T00:00:00.000Z'), `2017-12-31T00:00:00.000Z becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODate(new Date('2017-12-31T00:00:00.001Z')), null, `2017-12-31T00:00:00.001Z becomes null`);
  t.deepEqual(toSimpleISODate(new Date('2017-12-31T23:59:59.999Z')), null, `2017-12-31T23:59:59.999Z becomes null`);

  t.deepEqual(toSimpleISODate('2017-02-31'), new Date('2017-02-31'), `2017-02-31 becomes a simple ISO date-time ${new Date('2017-02-31').toISOString()}`);
  t.deepEqual(toSimpleISODate('2017-12-31'), new Date('2017-12-31'), `2017-12-31 becomes a simple ISO date-time ${new Date('2017-12-31').toISOString()}`);
  t.deepEqual(toSimpleISODate('2017-02-31Z'), new Date('2017-02-31Z'), `2017-02-31Z becomes a simple ISO date-time ${new Date('2017-02-31Z').toISOString()}`);
  t.deepEqual(toSimpleISODate('2017-12-31Z'), new Date('2017-12-31Z'), `2017-12-31Z becomes a simple ISO date-time`);

  t.deepEqual(toSimpleISODate('2017-00-01T00:00:00.000Z'), null, `2017-00-01T00:00:00.000Z becomes null`);
  t.deepEqual(toSimpleISODate('2017-13-01T00:00:00.000Z'), null, `2017-13-01T00:00:00.000Z becomes null`);
  t.deepEqual(toSimpleISODate('2017-01-00T00:00:00.000Z'), null, `2017-01-00T00:00:00.000Z becomes null`);
  t.deepEqual(toSimpleISODate('2017-01-32T00:00:00.000Z'), null, `2017-01-32T00:00:00.000Z becomes null`);

  t.deepEqual(toSimpleISODate('2017-01-01T00:00:00.000Z'), new Date('2017-01-01T00:00:00.000Z'), `2017-01-01T00:00:00.000Z becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODate('2017-12-31T00:00:00.000Z'), new Date('2017-12-31T00:00:00.000Z'), `2017-12-31T00:00:00.000Z becomes a simple ISO date-time`);
  t.deepEqual(toSimpleISODate('2017-12-31T00:00:00.001Z'), null, `2017-12-31T00:00:00.001Z becomes null`);
  t.deepEqual(toSimpleISODate('2017-12-31T23:59:59.999Z'), null, `2017-12-31T23:59:59.999Z becomes null`);

  t.deepEqual(toSimpleISODate('2017-01-01T00:00:00.000+02:00'), null, `2017-01-01T00:00:00.000+02:00 becomes null`);
  t.deepEqual(toSimpleISODate('2017-12-31T00:00:00.000+02:00'), null, `2017-12-31T00:00:00.000+02:00 becomes null`);
  t.deepEqual(toSimpleISODate('2017-12-31T00:00:00.001+02:00'), null, `2017-12-31T00:00:00.001+02:00 becomes null`);
  t.deepEqual(toSimpleISODate('2017-12-31T23:59:59.999+02:00'), null, `2017-12-31T23:59:59.999+02:00 becomes null`);

  t.deepEqual(toSimpleISODate('2017-01-01T00:00:00.000-02:00'), null, `2017-01-01T00:00:00.000-02:00 becomes null`);
  t.deepEqual(toSimpleISODate('2017-12-31T00:00:00.000-02:00'), null, `2017-12-31T00:00:00.000-02:00 becomes null`);
  t.deepEqual(toSimpleISODate('2017-12-31T00:00:00.001-02:00'), null, `2017-12-31T00:00:00.001-02:00 becomes null`);
  t.deepEqual(toSimpleISODate('2017-12-31T23:59:59.999-02:00'), null, `2017-12-31T23:59:59.999-02:00 becomes null`);

  // Extended variants
  t.deepEqual(toSimpleISODate(new Date('+2017-12-31Z')), new Date('+2017-12-31Z'), `+2017-12-31Z becomes a simple ISO date-time ${new Date('+2017-12-31Z').toISOString()}`);
  t.deepEqual(toSimpleISODate(new Date('+02017-12-31Z')), new Date('+02017-12-31Z'), `+02017-12-31Z becomes a simple ISO date-time ${new Date('+02017-12-31Z').toISOString()}`);
  t.deepEqual(toSimpleISODate(new Date('+002017-12-31Z')), new Date('+002017-12-31Z'), `+002017-12-31Z becomes a simple ISO date-time ${new Date('+002017-12-31Z').toISOString()}`);
  t.deepEqual(toSimpleISODate(new Date('+212017-12-31Z')), null, `+212017-12-31Z becomes null`);

  t.deepEqual(toSimpleISODate(new Date('-2017-12-31Z')), new Date('-2017-12-31Z'), `-2017-12-31Z becomes a simple ISO date-time ${new Date('-2017-12-31Z').toISOString()}`);
  t.deepEqual(toSimpleISODate(new Date('-02017-12-31Z')), new Date('-02017-12-31Z'), `-02017-12-31Z becomes a simple ISO date-time ${new Date('-02017-12-31Z').toISOString()}`);
  t.deepEqual(toSimpleISODate(new Date('-002017-12-31Z')), null, `-002017-12-31Z becomes null`);
  t.deepEqual(toSimpleISODate(new Date('-212017-12-31Z')), null, `-212017-12-31Z becomes null`);

  t.deepEqual(toSimpleISODate(new Date('+2017-12-31')), null, `+2017-12-31 becomes null`);
  t.deepEqual(toSimpleISODate(new Date('+02017-12-31')), null, `+02017-12-31 becomes null`);
  t.deepEqual(toSimpleISODate(new Date('+002017-12-31')), new Date('+002017-12-31'), `+002017-12-31 becomes a simple ISO date-time ${new Date('+002017-12-31').toISOString()}`);
  t.deepEqual(toSimpleISODate(new Date('+212017-12-31')), null, `+212017-12-31 becomes null`);

  t.deepEqual(toSimpleISODate(new Date('-2017-12-31')), null, `-2017-12-31 becomes null`);
  t.deepEqual(toSimpleISODate(new Date('-02017-12-31')), null, `-02017-12-31 becomes null`);
  t.deepEqual(toSimpleISODate(new Date('-002017-12-31')), null, `-002017-12-31 becomes null`);
  t.deepEqual(toSimpleISODate(new Date('-212017-12-31')), null, `-212017-12-31 becomes null`);

  t.end();
});

test('toExtendedISODate', t => {
  t.deepEqual(toExtendedISODate(new Date('2017-02-31')), new Date('2017-02-31'), `2017-02-31 becomes an extended ISO date-time ${new Date('2017-02-31').toISOString()}`);
  t.deepEqual(toExtendedISODate(new Date('2017-12-31')), new Date('2017-12-31'), `2017-12-31 becomes an extended ISO date-time ${new Date('2017-12-31').toISOString()}`);
  t.deepEqual(toExtendedISODate(new Date('2017-02-31Z')), new Date('2017-02-31Z'), `2017-02-31Z becomes an extended ISO date-time ${new Date('2017-02-31Z').toISOString()}`);
  t.deepEqual(toExtendedISODate(new Date('2017-12-31Z')), new Date('2017-12-31Z'), `2017-12-31Z becomes an extended ISO date-time ${new Date('2017-12-31Z').toISOString()}`);

  // null in Node 8.9.4 - t.deepEqual(toExtendedISODate(new Date('2017-12-31T00:00:00.000')), new Date('2017-12-31T00:00:00.000'), `2017-12-31T00:00:00.000 becomes an extended ISO date-time ${new Date('2017-12-31T00:00:00.000').toISOString()}`);
  t.deepEqual(toExtendedISODate(new Date('2017-12-31T00:00:00.001')), null, `2017-12-31T00:00:00.001 becomes null`);
  t.deepEqual(toExtendedISODate(new Date('2017-12-31T23:59:59.999')), null, `2017-12-31T23:59:59.999 becomes null`);

  t.deepEqual(toExtendedISODate(new Date('2017-12-31T00:00:00.000Z')), new Date('2017-12-31T00:00:00.000Z'), `2017-12-31T00:00:00.000Z becomes an extended ISO date-time`);
  t.deepEqual(toExtendedISODate(new Date('2017-12-31T00:00:00.001Z')), null, `2017-12-31T00:00:00.001Z becomes null`);
  t.deepEqual(toExtendedISODate(new Date('2017-12-31T23:59:59.999Z')), null, `2017-12-31T23:59:59.999Z becomes null`);

  t.deepEqual(toExtendedISODate('2017-02-31'), new Date('2017-02-31'), `2017-02-31 becomes an extended ISO date-time ${new Date('2017-02-31').toISOString()}`);
  t.deepEqual(toExtendedISODate('2017-12-31'), new Date('2017-12-31'), `2017-12-31 becomes an extended ISO date-time ${new Date('2017-12-31').toISOString()}`);
  t.deepEqual(toExtendedISODate('2017-02-31Z'), new Date('2017-02-31Z'), `2017-02-31Z becomes an extended ISO date-time ${new Date('2017-02-31Z').toISOString()}`);
  t.deepEqual(toExtendedISODate('2017-12-31Z'), new Date('2017-12-31Z'), `2017-12-31Z becomes an extended ISO date-time`);

  t.deepEqual(toExtendedISODate('2017-00-01T00:00:00.000Z'), null, `2017-00-01T00:00:00.000Z becomes null`);
  t.deepEqual(toExtendedISODate('2017-13-01T00:00:00.000Z'), null, `2017-13-01T00:00:00.000Z becomes null`);
  t.deepEqual(toExtendedISODate('2017-01-00T00:00:00.000Z'), null, `2017-01-00T00:00:00.000Z becomes null`);
  t.deepEqual(toExtendedISODate('2017-01-32T00:00:00.000Z'), null, `2017-01-32T00:00:00.000Z becomes null`);

  t.deepEqual(toExtendedISODate('2017-01-01T00:00:00.000Z'), new Date('2017-01-01T00:00:00.000Z'), `2017-01-01T00:00:00.000Z becomes an extended ISO date-time`);
  t.deepEqual(toExtendedISODate('2017-12-31T00:00:00.000Z'), new Date('2017-12-31T00:00:00.000Z'), `2017-12-31T00:00:00.000Z becomes an extended ISO date-time`);
  t.deepEqual(toExtendedISODate('2017-12-31T00:00:00.001Z'), null, `2017-12-31T00:00:00.001Z becomes null`);
  t.deepEqual(toExtendedISODate('2017-12-31T23:59:59.999Z'), null, `2017-12-31T23:59:59.999Z becomes null`);

  t.deepEqual(toExtendedISODate('2017-01-01T00:00:00.000+02:00'), null, `2017-01-01T00:00:00.000+02:00 becomes null`);
  t.deepEqual(toExtendedISODate('2017-12-31T00:00:00.000+02:00'), null, `2017-12-31T00:00:00.000+02:00 becomes null`);
  t.deepEqual(toExtendedISODate('2017-12-31T00:00:00.001+02:00'), null, `2017-12-31T00:00:00.001+02:00 becomes null`);
  t.deepEqual(toExtendedISODate('2017-12-31T23:59:59.999+02:00'), null, `2017-12-31T23:59:59.999+02:00 becomes null`);

  t.deepEqual(toExtendedISODate('2017-01-01T00:00:00.000-02:00'), null, `2017-01-01T00:00:00.000-02:00 becomes null`);
  t.deepEqual(toExtendedISODate('2017-12-31T00:00:00.000-02:00'), null, `2017-12-31T00:00:00.000-02:00 becomes null`);
  t.deepEqual(toExtendedISODate('2017-12-31T00:00:00.001-02:00'), null, `2017-12-31T00:00:00.001-02:00 becomes null`);
  t.deepEqual(toExtendedISODate('2017-12-31T23:59:59.999-02:00'), null, `2017-12-31T23:59:59.999-02:00 becomes null`);

  // Extended variants
  t.deepEqual(toExtendedISODate(new Date('+2017-12-31Z')), new Date('+2017-12-31Z'), `+2017-12-31Z becomes an extended ISO date-time ${new Date('+2017-12-31Z').toISOString()}`);
  t.deepEqual(toExtendedISODate(new Date('+02017-12-31Z')), new Date('+02017-12-31Z'), `+02017-12-31Z becomes an extended ISO date-time ${new Date('+02017-12-31Z').toISOString()}`);
  t.deepEqual(toExtendedISODate(new Date('+002017-12-31Z')), new Date('+002017-12-31Z'), `+002017-12-31Z becomes an extended ISO date-time ${new Date('+002017-12-31Z').toISOString()}`);
  t.deepEqual(toExtendedISODate(new Date('+212017-12-31Z')), new Date('+212017-12-31Z'), `+212017-12-31Z becomes an extended ISO date-time ${new Date('+212017-12-31Z').toISOString()}`);

  t.deepEqual(toExtendedISODate(new Date('-2017-12-31Z')), new Date('-2017-12-31Z'), `-2017-12-31Z becomes an extended ISO date-time ${new Date('-2017-12-31Z').toISOString()}`);
  t.deepEqual(toExtendedISODate(new Date('-02017-12-31Z')), new Date('-02017-12-31Z'), `-02017-12-31Z becomes an extended ISO date-time ${new Date('-02017-12-31Z').toISOString()}`);
  t.deepEqual(toExtendedISODate(new Date('-002017-12-31Z')), new Date('-002017-12-31Z'), `-002017-12-31Z becomes an extended ISO date-time ${new Date('-002017-12-31Z').toISOString()}`);
  t.deepEqual(toExtendedISODate(new Date('-212017-12-31Z')), new Date('-212017-12-31Z'), `-212017-12-31Z becomes an extended ISO date-time ${new Date('-212017-12-31Z').toISOString()}`);

  t.deepEqual(toExtendedISODate(new Date('+2017-12-31')), null, `+2017-12-31 becomes null`);
  t.deepEqual(toExtendedISODate(new Date('+02017-12-31')), null, `+02017-12-31 becomes null`);
  t.deepEqual(toExtendedISODate(new Date('+002017-12-31')), new Date('+002017-12-31'), `+002017-12-31 becomes an extended ISO date-time ${new Date('+002017-12-31').toISOString()}`);
  t.deepEqual(toExtendedISODate(new Date('+212017-12-31')), new Date('+212017-12-31'), `+212017-12-31 becomes an extended ISO date-time ${new Date('+212017-12-31').toISOString()}`);

  t.deepEqual(toExtendedISODate(new Date('-2017-12-31')), null, `-2017-12-31 becomes null`);
  t.deepEqual(toExtendedISODate(new Date('-02017-12-31')), null, `-02017-12-31 becomes null`);
  t.deepEqual(toExtendedISODate(new Date('-002017-12-31')), new Date('-002017-12-31'), `-002017-12-31 becomes an extended ISO date-time ${new Date('-002017-12-31').toISOString()}`);
  t.deepEqual(toExtendedISODate(new Date('-212017-12-31')), new Date('-212017-12-31'), `-212017-12-31 becomes an extended ISO date-time ${new Date('-212017-12-31').toISOString()}`);

  t.end();
});

test('toDateTime', t => {
  t.deepEqual(toDateTime(new Date('2017-02-31')), new Date('2017-02-31'), `2017-02-31 becomes a simple ISO date-time ${new Date('2017-02-31').toISOString()}`);
  t.deepEqual(toDateTime(new Date('2017-12-31')), new Date('2017-12-31'), `2017-12-31 becomes a simple ISO date-time ${new Date('2017-12-31').toISOString()}`);
  t.deepEqual(toDateTime(new Date('2017-02-31Z')), new Date('2017-02-31Z'), `2017-02-31Z becomes a simple ISO date-time ${new Date('2017-02-31Z').toISOString()}`);
  t.deepEqual(toDateTime(new Date('2017-12-31Z')), new Date('2017-12-31Z'), `2017-12-31Z becomes a simple ISO date-time ${new Date('2017-12-31Z').toISOString()}`);

  t.deepEqual(toDateTime(new Date('2017-12-31T00:00:00.000')), new Date('2017-12-31T00:00:00.000'), `2017-12-31T00:00:00.000 becomes a simple ISO date-time ${new Date('2017-12-31T00:00:00.000').toISOString()}`);
  t.deepEqual(toDateTime(new Date('2017-12-31T00:00:00.001')), new Date('2017-12-31T00:00:00.001'), `2017-12-31T00:00:00.001 becomes a simple ISO date-time ${new Date('2017-12-31T00:00:00.001').toISOString()}`);
  t.deepEqual(toDateTime(new Date('2017-12-31T23:59:59.999')), new Date('2017-12-31T23:59:59.999'), `2017-12-31T23:59:59.999 becomes a simple ISO date-time ${new Date('2017-12-31T23:59:59.999').toISOString()}`);

  t.deepEqual(toDateTime(new Date('2017-12-31T00:00:00.000Z')), new Date('2017-12-31T00:00:00.000Z'), `2017-12-31T00:00:00.000Z becomes a simple ISO date-time`);
  t.deepEqual(toDateTime(new Date('2017-12-31T00:00:00.001Z')), new Date('2017-12-31T00:00:00.001Z'), `2017-12-31T00:00:00.001Z becomes a simple ISO date-time`);
  t.deepEqual(toDateTime(new Date('2017-12-31T23:59:59.999Z')), new Date('2017-12-31T23:59:59.999Z'), `2017-12-31T23:59:59.999Z becomes a simple ISO date-time`);

  t.deepEqual(toDateTime('2017-02-31'), new Date('2017-02-31'), `2017-02-31 becomes a simple ISO date-time (${new Date('2017-02-31').toISOString()})`);
  t.deepEqual(toDateTime('2017-12-31'), new Date('2017-12-31'), `2017-12-31 becomes a simple ISO date-time (${new Date('2017-12-31').toISOString()})`);
  t.deepEqual(toDateTime('2017-02-31Z'), new Date('2017-02-31Z'), `2017-02-31Z becomes a simple ISO date-time (${new Date('2017-02-31Z').toISOString()})`);
  t.deepEqual(toDateTime('2017-12-31Z'), new Date('2017-12-31Z'), `2017-12-31Z becomes a simple ISO date-time`);

  t.deepEqual(toDateTime('2017-00-01T00:00:00.000Z'), null, `2017-00-01T00:00:00.000Z becomes null`);
  t.deepEqual(toDateTime('2017-13-01T00:00:00.000Z'), null, `2017-13-01T00:00:00.000Z becomes null`);
  t.deepEqual(toDateTime('2017-01-00T00:00:00.000Z'), null, `2017-01-00T00:00:00.000Z becomes null`);
  t.deepEqual(toDateTime('2017-01-32T00:00:00.000Z'), null, `2017-01-32T00:00:00.000Z becomes null`);

  t.deepEqual(toDateTime('2017-01-01T00:00:00.000Z'), new Date('2017-01-01T00:00:00.000Z'), `2017-01-01T00:00:00.000Z becomes a simple ISO date-time`);
  t.deepEqual(toDateTime('2017-12-31T00:00:00.000Z'), new Date('2017-12-31T00:00:00.000Z'), `2017-12-31T00:00:00.000Z becomes a simple ISO date-time`);
  t.deepEqual(toDateTime('2017-12-31T00:00:00.001Z'), new Date('2017-12-31T00:00:00.001Z'), `2017-12-31T00:00:00.001Z becomes a simple ISO date-time`);
  t.deepEqual(toDateTime('2017-12-31T23:59:59.999Z'), new Date('2017-12-31T23:59:59.999Z'), `2017-12-31T23:59:59.999Z becomes a simple ISO date-time`);

  t.deepEqual(toDateTime('2017-01-01T00:00:00.000+02:00'), new Date('2017-01-01T00:00:00.000+02:00'), `2017-01-01T00:00:00.000+02:00 becomes a simple ISO date-time`);
  t.deepEqual(toDateTime('2017-12-31T00:00:00.000+02:00'), new Date('2017-12-31T00:00:00.000+02:00'), `2017-12-31T00:00:00.000+02:00 becomes a simple ISO date-time`);
  t.deepEqual(toDateTime('2017-12-31T00:00:00.001+02:00'), new Date('2017-12-31T00:00:00.001+02:00'), `2017-12-31T00:00:00.001+02:00 becomes a simple ISO date-time`);
  t.deepEqual(toDateTime('2017-12-31T23:59:59.999+02:00'), new Date('2017-12-31T23:59:59.999+02:00'), `2017-12-31T23:59:59.999+02:00 becomes a simple ISO date-time`);

  t.deepEqual(toDateTime('2017-01-01T00:00:00.000-02:00'), new Date('2017-01-01T00:00:00.000-02:00'), `2017-01-01T00:00:00.000-02:00 becomes a simple ISO date-time`);
  t.deepEqual(toDateTime('2017-12-31T00:00:00.000-02:00'), new Date('2017-12-31T00:00:00.000-02:00'), `2017-12-31T00:00:00.000-02:00 becomes a simple ISO date-time`);
  t.deepEqual(toDateTime('2017-12-31T00:00:00.001-02:00'), new Date('2017-12-31T00:00:00.001-02:00'), `2017-12-31T00:00:00.001-02:00 becomes a simple ISO date-time`);
  t.deepEqual(toDateTime('2017-12-31T23:59:59.999-02:00'), new Date('2017-12-31T23:59:59.999-02:00'), `2017-12-31T23:59:59.999-02:00 becomes a simple ISO date-time`);

  t.deepEqual(toDateTime('+2017-12-31T23:59:59.999Z'), null, `+2017-12-31T23:59:59.999Z becomes null`);
  t.deepEqual(toDateTime('+02017-12-31T23:59:59.999Z'), null, `+02017-12-31T23:59:59.999Z becomes null`);
  t.deepEqual(toDateTime('+002017-12-31T23:59:59.999Z'), new Date('+002017-12-31T23:59:59.999Z'), `+002017-12-31T23:59:59.999Z becomes a simple ISO date-time ${new Date('+002017-12-31T23:59:59.999Z').toISOString()}`);

  t.end();
});

test('isValidDate', t => {
  // Non-Dates
  t.notOk(isValidDate(undefined), `undefined is NOT a valid date`);
  t.notOk(isValidDate(null), `null is NOT a valid date`);
  t.notOk(isValidDate({}), `{} is NOT a valid date`);
  t.notOk(isValidDate([]), `[] is NOT a valid date`);
  t.notOk(isValidDate(''), `'' is NOT a valid date`);
  t.notOk(isValidDate('abc'), `'abc' is NOT a valid date`);

  // Dates
  t.notOk(isValidDate(new Date('a')), `Date('a') is NOT a valid date`);
  t.notOk(isValidDate(new Date('2017-00-01')), `Date('2017-00-01') is NOT a valid date`);
  t.notOk(isValidDate(new Date('2017-01-00')), `Date('2017-01-00') is NOT a valid date`);
  t.notOk(isValidDate(new Date('2017-12-32')), `Date('2017-12-32') is NOT a valid date`);
  t.notOk(isValidDate(new Date('2017-13-31')), `Date('2017-13-31') is NOT a valid date`);

  t.ok(isValidDate(new Date('2017-01-01')), `Date('2017-01-01') is a valid date`);
  t.ok(isValidDate(new Date('2017-02-31')), `Date('2017-02-31') is a valid date`);
  t.ok(isValidDate(new Date('2017-12-31')), `Date('2017-12-31') is a valid date`);

  t.ok(isValidDate(new Date('2017-01-01Z')), `Date('2017-01-01Z') is a valid date`);
  t.ok(isValidDate(new Date('2017-02-31Z')), `Date('2017-02-31Z') is a valid date`);
  t.ok(isValidDate(new Date('2017-12-31Z')), `Date('2017-12-31Z') is a valid date`);

  // Date-times
  t.notOk(isValidDate(new Date('2017-00-01T23:59:59.999Z')), `Date('2017-00-01T23:59:59.999Z') is NOT a valid date`);
  t.notOk(isValidDate(new Date('2017-01-00T23:59:59.999Z')), `Date('2017-01-00T23:59:59.999Z') is NOT a valid date`);
  t.ok(isValidDate(new Date('2017-01-01T23:59:59.999Z')), `Date('2017-01-01T23:59:59.999Z') is a valid date`);
  t.ok(isValidDate(new Date('2017-02-31T23:59:59.999Z')), `Date('2017-02-31T23:59:59.999Z') is a valid date (${new Date('2017-02-31T23:59:59.999Z').toISOString()})`);
  t.ok(isValidDate(new Date('2017-12-31T23:59:59.999Z')), `Date('2017-12-31T23:59:59.999Z') is a valid date`);
  t.notOk(isValidDate(new Date('2017-12-32T23:59:59.999Z')), `Date('2017-12-32T23:59:59.999Z') is NOT a valid date`);
  t.notOk(isValidDate(new Date('2017-13-31T23:59:59.999Z')), `Date('2017-13-31T23:59:59.999Z') is NOT a valid date`);

  t.notOk(isValidDate(new Date('2017-12-31T00:00:60.000Z')), `Date('2017-12-31T00:00:60.000Z') is NOT a valid date`);
  t.notOk(isValidDate(new Date('2017-12-31T00:60:00.000Z')), `Date('2017-12-31T00:60:00.000Z') is NOT a valid date`);
  if (process.version && process.version.startsWith("4.3.")) { // special case for 4.3.x
    t.notOk(isValidDate(new Date('2017-12-31T24:00:00.000Z')), `Date('2017-12-31T24:00:00.000Z') is NOT a valid date`);
  } else if (process.version && process.version.startsWith("6.10.")) { // special case for 6.10.x
    t.ok(isValidDate(new Date('2017-12-31T24:00:00.000Z')), `Date('2017-12-31T24:00:00.000Z') is a valid date`);
  }
  t.notOk(isValidDate(new Date('2017-12-31T24:59:59.999Z')), `Date('2017-12-31T24:59:59.999Z') is NOT a valid date`);

  // Extended dates and date-times
  t.ok(isValidDate(new Date('+2017-12-31Z')), `Date('+2017-12-31Z') is a "valid" date (${new Date('+2017-12-31Z').toISOString()}) - WEIRD - inconsistent with below!`);
  t.notOk(isValidDate(new Date('+2017-01-01T23:59:59.999Z')), `Date('+2017-01-01T23:59:59.999Z') is NOT a valid date`);
  t.notOk(isValidDate(new Date('+2017-12-31T23:59:59.999Z')), `Date('+2017-12-31T23:59:59.999Z') is NOT a valid date`);
  t.ok(isValidDate(new Date('+02017-12-31Z')), `Date('+02017-12-31Z') is a "valid" date (${new Date('+02017-12-31Z').toISOString()}) - WEIRD - inconsistent with below!`);
  t.notOk(isValidDate(new Date('+02017-12-31T23:59:59.999Z')), `Date('+02017-12-31T23:59:59.999Z') is NOT a valid date`);
  t.ok(isValidDate(new Date('+002017-12-31Z')), `Date('+002017-12-31Z') is a valid date`);
  t.ok(isValidDate(new Date('+002017-12-31T23:59:59.999Z')), `Date('+002017-12-31T23:59:59.999Z') is a valid date`);

  t.ok(isValidDate(new Date('-2017-12-31Z')), `Date('-2017-12-31Z') is a "valid" date (${new Date('-2017-12-31Z').toISOString()}) - WEIRD - inconsistent with below!`);
  t.notOk(isValidDate(new Date('-2017-01-01T23:59:59.999Z')), `Date('-2017-01-01T23:59:59.999Z') is NOT a valid date`);
  t.notOk(isValidDate(new Date('-2017-12-31T23:59:59.999Z')), `Date('-2017-12-31T23:59:59.999Z') is NOT a valid date`);
  t.ok(isValidDate(new Date('-02017-12-31Z')), `Date('-02017-12-31Z') is a "valid" date (${new Date('-02017-12-31Z').toISOString()}) - WEIRD - inconsistent with below!`);
  t.notOk(isValidDate(new Date('-02017-12-31T23:59:59.999Z')), `Date('-02017-12-31T23:59:59.999Z') is NOT a valid date`);
  t.ok(isValidDate(new Date('-002017-12-31Z')), `Date('-002017-12-31Z') is a valid date`);
  t.ok(isValidDate(new Date('-002017-12-31T23:59:59.999Z')), `Date('-002017-12-31T23:59:59.999Z') is a valid date`);

  t.end();
});
