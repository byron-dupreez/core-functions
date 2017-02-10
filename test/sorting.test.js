'use strict';

/**
 * Unit tests for core-functions/sorting.js
 * @author Byron du Preez
 */

const test = require('tape');

const sorting = require('../sorting');
const SortType = sorting.SortType;
const compareNumbers = sorting.compareNumbers;
const compareStrings = sorting.compareStrings;
const compareBooleans = sorting.compareBooleans;
const compareDates = sorting.compareDates;
const compareIntegerLikes = sorting.compareIntegerLikes;
const compareUndefinedOrNull = sorting.compareUndefinedOrNull;
const toSortable = sorting.toSortable;
const sortSortable = sorting.sortSortable;
const sortKeyValuePairsByKey = sorting.sortKeyValuePairsByKey;

const Strings = require('../strings');
const stringify = Strings.stringify;
// const Numbers = require('../numbers');
// const Dates = require('../dates');
const Objects = require('../objects');
const toKeyValuePairs = Objects.toKeyValuePairs;

test('compareUndefinedOrNull', t => {
  t.ok(compareUndefinedOrNull(undefined, undefined) === 0, `undefined = undefined`);
  t.ok(compareUndefinedOrNull(null, null) === 0, `null = null`);

  t.ok(compareUndefinedOrNull(undefined, null) > 0, `undefined > null`);
  t.ok(compareUndefinedOrNull(null, undefined) < 0, `null < undefined`);

  t.ok(compareUndefinedOrNull(undefined, false) > 0, `undefined > false`);
  t.ok(compareUndefinedOrNull(undefined, true) > 0, `undefined > true`);
  t.ok(compareUndefinedOrNull(undefined, '') > 0, `undefined > ''`);
  t.ok(compareUndefinedOrNull(undefined, 'abc') > 0, `undefined > 'abc'`);
  t.ok(compareUndefinedOrNull(undefined, '456.789') > 0, `undefined > '456.789'`);
  t.ok(compareUndefinedOrNull(undefined, 123.987) > 0, `undefined > 123.987`);
  t.ok(compareUndefinedOrNull(undefined, -123.987) > 0, `undefined > -123.987`);

  t.ok(compareUndefinedOrNull(null, false) < 0, `null < false`);
  t.ok(compareUndefinedOrNull(null, true) < 0, `null < true`);
  t.ok(compareUndefinedOrNull(null, '') < 0, `null < ''`);
  t.ok(compareUndefinedOrNull(null, 'abc') < 0, `null < 'abc'`);
  t.ok(compareUndefinedOrNull(null, '456.789') < 0, `null < '456.789'`);
  t.ok(compareUndefinedOrNull(null, 123.987) < 0, `null < 123.987`);
  t.ok(compareUndefinedOrNull(null, -123.987) < 0, `null < -123.987`);


  t.end();
});

test('compareIntegerLikes', t => {
  t.ok(compareIntegerLikes(0, null) > 0, `0 > null`);
  t.ok(compareIntegerLikes(null, 0) < 0, `null < 0`);
  t.ok(compareIntegerLikes(0, undefined) < 0, `0 < undefined`);
  t.ok(compareIntegerLikes(undefined, 0) > 0, `undefined > 0`);

  t.equal(compareIntegerLikes('0', '0'), 0, '0 = 0');
  t.equal(compareIntegerLikes('+0', '+0'), 0, '+0 = +0');
  t.equal(compareIntegerLikes('-0', '-0'), 0, '-0 = -0');
  t.equal(compareIntegerLikes('-0', '+0'), 0, '+0 = -0');
  t.equal(compareIntegerLikes('+0', '-0'), 0, '-0 = +0');

  t.equal(compareIntegerLikes('0', '1'), -1, '0 < 1');
  t.equal(compareIntegerLikes('0', '+1'), -1, '0 < +1');
  t.equal(compareIntegerLikes('0', '-1'), +1, '0 > -1');
  t.equal(compareIntegerLikes('1', '0'), +1, '1 > 0');
  t.equal(compareIntegerLikes('+1', '0'), +1, '+1 > 0');
  t.equal(compareIntegerLikes('-1', '0'), -1, '-1 < 0');

  t.equal(compareIntegerLikes('1', '1'), 0, '1 = 1');
  t.equal(compareIntegerLikes('1', '+1'), 0, '1 = +1');
  t.equal(compareIntegerLikes('+1', '1'), 0, '+1 = 1');
  t.equal(compareIntegerLikes('-1', '-1'), 0, '-1 = -1');
  t.equal(compareIntegerLikes('1', '-1'), +1, '1 > -1');
  t.equal(compareIntegerLikes('-1', '1'), -1, '-1 < 1');

  t.equal(compareIntegerLikes('1', '1'), 0, '1 = 1');
  t.equal(compareIntegerLikes('2', '2'), 0, '2 = 2');
  t.equal(compareIntegerLikes('1', '2'), -1, '1 < 2');
  t.equal(compareIntegerLikes('2', '1'), +1, '2 > 1');
  t.equal(compareIntegerLikes('+1', '+2'), -1, '+1 < +2');
  t.equal(compareIntegerLikes('+2', '+1'), +1, '+2 < +1');
  t.equal(compareIntegerLikes('1', '+2'), -1, '1 < +2');
  t.equal(compareIntegerLikes('+2', '1'), +1, '+2 > 1');
  t.equal(compareIntegerLikes('+1', '2'), -1, '+1 < 2');
  t.equal(compareIntegerLikes('2', '+1'), +1, '2 > +1');

  t.equal(compareIntegerLikes('-1', '-1'), 0, '-1 = -1');
  t.equal(compareIntegerLikes('-2', '-2'), 0, '-2 = -2');

  t.equal(compareIntegerLikes('-1', '-2'), +1, '-1 > -2');
  t.equal(compareIntegerLikes('-2', '-1'), -1, '-2 < -1');

  t.equal(compareIntegerLikes('1', '-2'), +1, '1 > -2');
  t.equal(compareIntegerLikes('-2', '1'), -1, '-2 < 1');

  t.equal(compareIntegerLikes('+1', '-2'), +1, '+1 > -2');
  t.equal(compareIntegerLikes('-2', '+1'), -1, '-2 < +1');

  t.equal(compareIntegerLikes('-1', '2'), -1, '-1 < 2');
  t.equal(compareIntegerLikes('2', '-1'), +1, '2 > -1');

  t.equal(compareIntegerLikes('-1', '+2'), -1, '-1 < +2');
  t.equal(compareIntegerLikes('+2', '-1'), +1, '+2 > -1');


  t.equal(compareIntegerLikes('20', '20'), 0, '20 = 20');
  t.equal(compareIntegerLikes('-20', '-20'), 0, '-20 = -20');

  t.equal(compareIntegerLikes('20', '1'), +1, '20 > 1');
  t.equal(compareIntegerLikes('1', '20'), -1, '1 < 20');

  t.equal(compareIntegerLikes('20', '+1'), +1, '20 > +1');
  t.equal(compareIntegerLikes('+1', '20'), -1, '+1 < 20');

  t.equal(compareIntegerLikes('+20', '1'), +1, '+20 > 1');
  t.equal(compareIntegerLikes('1', '+20'), -1, '1 < +20');

  t.equal(compareIntegerLikes('-20', '1'), -1, '-20 < 1');
  t.equal(compareIntegerLikes('1', '-20'), +1, '1 > -20');

  t.equal(compareIntegerLikes('-20', '+1'), -1, '-20 < +1');
  t.equal(compareIntegerLikes('+1', '-20'), +1, '+1 > -20');

  t.equal(compareIntegerLikes('-20', '-1'), -1, '-20 < -1');
  t.equal(compareIntegerLikes('-1', '-20'), +1, '-1 > -20');

  t.equal(compareIntegerLikes('99999999999', '99999999999'), 0, '99999999999 = 99999999999');
  t.equal(compareIntegerLikes('+99999999999', '+99999999999'), 0, '+99999999999 = +99999999999');
  t.equal(compareIntegerLikes('-99999999999', '-99999999999'), 0, '-99999999999 = -99999999999');

  t.equal(compareIntegerLikes('987654321010123456789', '987654321010123456789'), 0, '987654321010123456789 = 987654321010123456789');
  t.equal(compareIntegerLikes('+987654321010123456789', '+987654321010123456789'), 0, '+987654321010123456789 = +987654321010123456789');
  t.equal(compareIntegerLikes('-987654321010123456789', '-987654321010123456789'), 0, '-987654321010123456789 = -987654321010123456789');

  t.equal(compareIntegerLikes('987654321010123456789', '99999999999'), +1, '987654321010123456789 > 99999999999');
  t.equal(compareIntegerLikes('99999999999', '987654321010123456789'), -1, '99999999999 < 987654321010123456789');

  t.equal(compareIntegerLikes('+987654321010123456789', '+99999999999'), +1, '+987654321010123456789 > +99999999999');
  t.equal(compareIntegerLikes('+99999999999', '+987654321010123456789'), -1, '+99999999999 < +987654321010123456789');

  t.equal(compareIntegerLikes('-987654321010123456789', '-99999999999'), -1, '-987654321010123456789 < -99999999999');
  t.equal(compareIntegerLikes('-99999999999', '-987654321010123456789'), +1, '-99999999999 > -987654321010123456789');

  t.equal(compareIntegerLikes('+987654321010123456789', '-99999999999'), +1, '+987654321010123456789 > -99999999999');
  t.equal(compareIntegerLikes('-99999999999', '+987654321010123456789'), -1, '-99999999999 < +987654321010123456789');

  t.equal(compareIntegerLikes('-987654321010123456789', '+99999999999'), -1, '-987654321010123456789 < +99999999999');
  t.equal(compareIntegerLikes('+99999999999', '-987654321010123456789'), +1, '+99999999999 > -987654321010123456789');

  // Sorting using comparator
  const is = ['100', '+50', '-1000', '+0', '5000', '1', '10', '-100', '-5000', '+1000', '5', '-50', '0', '500', '-0', '-500', '-10', '-5', '-1'];

  is.sort(compareIntegerLikes);

  for (let i = 0; i < is.length - 1; ++i) {
    const ab = compareIntegerLikes(is[i], is[i+1]);
    t.ok(ab <= 0, `${is[i]} <= ${is[i+1]}`);
    const ba = compareIntegerLikes(is[i+1], is[i]);
    t.ok(ba >= 0, `${is[i+1]} >= ${is[i]}`);
  }

  t.end();
});

test('compareNumbers', t => {
  t.ok(compareNumbers(null, undefined) < 0, `null < undefined`);
  t.ok(compareNumbers(undefined, null) > 0, `undefined > null`);

  t.ok(compareNumbers(-Infinity, null) > 0, `-Infinity > null`);
  t.ok(compareNumbers(null, -Infinity) < 0, `null < -Infinity`);
  t.ok(compareNumbers(+Infinity, undefined) < 0, `+Infinity < undefined`);
  t.ok(compareNumbers(undefined, +Infinity) > 0, `undefined > +Infinity`);

  t.ok(compareNumbers(0, 0) === 0, `0 = 0`);
  t.ok(compareNumbers(0, +0) === 0, `0 = +0`);
  t.ok(compareNumbers(0, -0) === 0, `0 = -0`);
  t.ok(compareNumbers(+0, 0) === 0, `+0 = 0`);
  t.ok(compareNumbers(-0, 0) === 0, `-0 = 0`);
  t.ok(compareNumbers(0.0, 0) === 0, `0.0 = 0`);

  t.ok(compareNumbers(1, 1) === 0, `1 = 1`);
  t.ok(compareNumbers(+1, +1) === 0, `+1 = +1`);
  t.ok(compareNumbers(-1, -1) === 0, `-1 = -1`);

  t.ok(compareNumbers(Math.PI, Math.PI) === 0, `${Math.PI} = ${Math.PI}`);
  t.ok(compareNumbers(-Math.PI, Math.PI) < 0, `-PI < PI`);
  t.ok(compareNumbers(Math.PI, -Math.PI) > 0, `PI > -PI`);

  t.ok(compareNumbers(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER) === 0, `MIN_SAFE_INTEGER = MIN_SAFE_INTEGER`);
  t.ok(compareNumbers(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER) === 0, `MAX_SAFE_INTEGER = MAX_SAFE_INTEGER`);

  t.ok(compareNumbers(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER) < 0, `MIN_SAFE_INTEGER < MAX_SAFE_INTEGER`);
  t.ok(compareNumbers(Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER) > 0, `MAX_SAFE_INTEGER < MIN_SAFE_INTEGER`);

  t.ok(compareNumbers(-1, 0) < 0, `-1 < 0`);
  t.ok(compareNumbers(0, -1) > 0, `0 > -1`);

  t.ok(compareNumbers(-1, 0) < 0, `-1 < 0`);
  t.ok(compareNumbers(0, -1) > 0, `0 > -1`);

  t.ok(compareNumbers(-100, 1) < 0, `-100 < 1`);
  t.ok(compareNumbers(1, -100) > 0, `1 > -100`);

  t.ok(compareNumbers(-123.456, -0.000122) < 0, `-123.456 < -0.000122`);
  t.ok(compareNumbers(-0.000122, -123.456) > 0, `-0.000122 > -123.456`);

  t.ok(compareNumbers(0.000122, 123.456) < 0, `0.000122 < 123.456`);
  t.ok(compareNumbers(123.456, 0.000122) > 0, `123.456 > 0.000122`);

  t.end();
});

test('compareStrings with opts undefined, i.e. implied {ignoreCase: false}', t => {
  t.ok(compareStrings(null, undefined) < 0, `null < undefined`);
  t.ok(compareStrings(undefined, null) > 0, `undefined > null`);

  t.ok(compareStrings('null', null) > 0, `'null' > null`);
  t.ok(compareStrings(null, 'null') < 0, `null < 'null'`);
  t.ok(compareStrings('A', null) > 0, `'A' > null`);
  t.ok(compareStrings(null, 'A') < 0, `null < 'A'`);
  t.ok(compareStrings('Z', null) > 0, `'Z' > null`);
  t.ok(compareStrings(null, 'Z') < 0, `null < 'Z'`);
  t.ok(compareStrings('-1', null) > 0, `'-1' > null`);
  t.ok(compareStrings(null, '-1') < 0, `null < '-1'`);

  t.ok(compareStrings('undefined', undefined) < 0, `'undefined' < undefined`);
  t.ok(compareStrings(undefined, 'undefined') > 0, `undefined > 'undefined'`);
  t.ok(compareStrings('A', undefined) < 0, `'A' < undefined`);
  t.ok(compareStrings(undefined, 'A') > 0, `undefined > 'A'`);
  t.ok(compareStrings('Z', undefined) < 0, `'Z' < undefined`);
  t.ok(compareStrings(undefined, 'Z') > 0, `undefined > 'Z'`);

  t.ok(compareStrings('abc', 'abc') === 0, `abc = abc`);
  t.ok(compareStrings('def', 'def') === 0, `abc = abc`);
  t.ok(compareStrings('abc', 'def') < 0, `abc < def`);
  t.ok(compareStrings('def', 'abc') > 0, `def > abc`);

  t.ok(compareStrings('Abracadabra', 'Zzz') < 0, `Abracadabra < Zzz`);
  t.ok(compareStrings('Zzz', 'Abracadabra') > 0, `Zzz > Abracadabra`);

  t.ok(compareStrings('A', 'A') === 0, `A = A`);
  t.ok(compareStrings('a', 'a') === 0, `a = a`);
  t.ok(compareStrings('z', 'z') === 0, `z = z`);
  t.ok(compareStrings('Z', 'Z') === 0, `Z = Z`);

  t.ok(compareStrings('A', 'Z') < 0, `A < Z`);
  t.ok(compareStrings('Z', 'A') > 0, `Z > A`);

  t.ok(compareStrings('a', 'z') < 0, `a < z`);
  t.ok(compareStrings('z', 'a') > 0, `z > a`);

  t.ok(compareStrings('A', 'a') < 0, `A < a`);
  t.ok(compareStrings('a', 'A') > 0, `a > A`);

  t.ok(compareStrings('Z', 'z') < 0, `Z < z`);
  t.ok(compareStrings('z', 'Z') > 0, `z > Z`);

  t.ok(compareStrings('Z', 'a') < 0, `Z < a`);
  t.ok(compareStrings('a', 'Z') > 0, `a > Z`);

  t.end();
});

test('compareStrings with opts {ignoreCase: true}', t => {
  const opts = {ignoreCase: true};
  t.ok(compareStrings(null, undefined, opts) < 0, `null < undefined`);
  t.ok(compareStrings(undefined, null, opts) > 0, `undefined > null`);

  t.ok(compareStrings('null', null, opts) > 0, `'null' > null`);
  t.ok(compareStrings(null, 'null', opts) < 0, `null < 'null'`);
  t.ok(compareStrings('A', null, opts) > 0, `'A' > null`);
  t.ok(compareStrings(null, 'A', opts) < 0, `null < 'A'`);
  t.ok(compareStrings('Z', null, opts) > 0, `'Z' > null`);
  t.ok(compareStrings(null, 'Z', opts) < 0, `null < 'Z'`);
  t.ok(compareStrings('-1', null, opts) > 0, `'-1' > null`);
  t.ok(compareStrings(null, '-1', opts) < 0, `null < '-1'`);

  t.ok(compareStrings('undefined', undefined, opts) < 0, `'undefined' < undefined`);
  t.ok(compareStrings(undefined, 'undefined', opts) > 0, `undefined > 'undefined'`);
  t.ok(compareStrings('A', undefined, opts) < 0, `'A' < undefined`);
  t.ok(compareStrings(undefined, 'A', opts) > 0, `undefined > 'A'`);
  t.ok(compareStrings('Z', undefined, opts) < 0, `'Z' < undefined`);
  t.ok(compareStrings(undefined, 'Z', opts) > 0, `undefined > 'Z'`);

  t.ok(compareStrings('abc', 'abc', opts) === 0, `abc = abc`);
  t.ok(compareStrings('def', 'def', opts) === 0, `abc = abc`);
  t.ok(compareStrings('abc', 'def', opts) < 0, `abc < def`);
  t.ok(compareStrings('def', 'abc', opts) > 0, `def > abc`);

  t.ok(compareStrings('Abracadabra', 'Zzz', opts) < 0, `Abracadabra < Zzz`);
  t.ok(compareStrings('Zzz', 'Abracadabra', opts) > 0, `Zzz > Abracadabra`);

  t.ok(compareStrings('A', 'A', opts) === 0, `A = A`);
  t.ok(compareStrings('a', 'a', opts) === 0, `a = a`);
  t.ok(compareStrings('z', 'z', opts) === 0, `z = z`);
  t.ok(compareStrings('Z', 'Z', opts) === 0, `Z = Z`);

  t.ok(compareStrings('A', 'Z', opts) < 0, `A < Z`);
  t.ok(compareStrings('Z', 'A', opts) > 0, `Z > A`);

  t.ok(compareStrings('a', 'z', opts) < 0, `a < z`);
  t.ok(compareStrings('z', 'a', opts) > 0, `z > a`);

  t.ok(compareStrings('A', 'a', opts) < 0, `A < a`);
  t.ok(compareStrings('a', 'A', opts) > 0, `a > A`);

  t.ok(compareStrings('Z', 'z', opts) < 0, `Z < z`);
  t.ok(compareStrings('z', 'Z', opts) > 0, `z > Z`);

  t.ok(compareStrings('a', 'Z', opts) < 0, `a < Z`);
  t.ok(compareStrings('Z', 'a', opts) > 0, `Z > a`);

  t.end();
});

test('compareBooleans', t => {
  t.ok(compareBooleans(null, undefined) < 0, `null < undefined`);
  t.ok(compareBooleans(undefined, null) > 0, `undefined > null`);

  t.ok(compareBooleans(false, null) > 0, `false > null`);
  t.ok(compareBooleans(null, false) < 0, `null < false`);
  t.ok(compareBooleans(false, undefined) < 0, `false < undefined`);
  t.ok(compareBooleans(undefined, false) > 0, `undefined > false`);

  t.ok(compareBooleans(true, null) > 0, `true > null`);
  t.ok(compareBooleans(null, true) < 0, `null < true`);
  t.ok(compareBooleans(true, undefined) < 0, `true < undefined`);
  t.ok(compareBooleans(undefined, true) > 0, `undefined > true`);

  t.ok(compareBooleans(false, false) === 0, `false = false`);
  t.ok(compareBooleans(true, true) === 0, `true = true`);
  t.ok(compareBooleans(false, true) < 0, `false < true`);
  t.ok(compareBooleans(true, false) > 0, `true > false`);
  t.end();
});

test('compareDates', t => {
  t.ok(compareDates(null, undefined) < 0, `null < undefined`);
  t.ok(compareDates(undefined, null) > 0, `undefined > null`);

  t.ok(compareDates(new Date('2017-01-31'), null) > 0, `2017-01-31 > null`);
  t.ok(compareDates(null, new Date('2017-01-31')) < 0, `null < 2017-01-31`);
  t.ok(compareDates(new Date('2017-01-31'), undefined) < 0, `2017-01-31 < undefined`);
  t.ok(compareDates(undefined, new Date('2017-01-31')) > 0, `undefined > 2017-01-31`);

  // Compare dates
  t.ok(compareDates(new Date('2017-01-31'), new Date('2017-01-31')) === 0, `2017-01-31 = 2017-01-31`);
  t.ok(compareDates(new Date('2017-12-01'), new Date('2017-12-01')) === 0, `2017-12-01 = 2017-12-01`);

  t.ok(compareDates(new Date('2017-01-31'), new Date('2017-01-31Z')) === 0, `2017-01-31 = 2017-01-31Z`);

  t.ok(compareDates(new Date('2017-01-31'), new Date('2017-12-01')) < 0, `2017-01-31 < 2017-12-01`);
  t.ok(compareDates(new Date('2017-12-01'), new Date('2017-01-31')) > 0, `2017-12-01 > 2017-01-31`);

  t.ok(compareDates(new Date('2017-11-01'), new Date('2018-02-15')) < 0, `2017-11-01 < 2018-02-15`);
  t.ok(compareDates(new Date('2018-02-15'), new Date('2017-11-01')) > 0, `2018-02-15 > 2017-11-01`);

  // Compare date-times
  t.ok(compareDates(new Date('2017-01-31T23:59:59.999'), new Date('2017-01-31T23:59:59.999')) === 0, `2017-01-31T23:59:59.999 = 2017-01-31T23:59:59.999`);
  t.ok(compareDates(new Date('2017-01-31T23:59:59.999Z'), new Date('2017-01-31T23:59:59.999Z')) === 0, `2017-01-31T23:59:59.999Z = 2017-01-31T23:59:59.999Z`);

  t.ok(compareDates(new Date('2017-01-31T23:59:59.998'), new Date('2017-01-31T23:59:59.999')) < 0, `2017-01-31T23:59:59.998 < 2017-01-31T23:59:59.999`);
  t.ok(compareDates(new Date('2017-01-31T23:59:59.999'), new Date('2017-01-31T23:59:59.998')) > 0, `2017-01-31T23:59:59.999 > 2017-01-31T23:59:59.998`);

  t.ok(compareDates(new Date('2017-01-31T00:00:00.000Z'), new Date('2017-01-31T23:59:59.999Z')) < 0, `2017-01-3100:00:00.000Z < 2017-01-31T23:59:59.999Z`);
  t.ok(compareDates(new Date('2017-02-01T00:00:00.000Z'), new Date('2017-01-31T23:59:59.999Z')) > 0, `2017-02-0100:00:00.000Z > 2017-01-31T23:59:59.999Z`);

  t.ok(compareDates(new Date('2017-01-31T23:59:59.999Z'), new Date('2017-01-31T23:59:59.999+02:00')) > 0, `2017-01-31T23:59:59.999Z > 2017-01-31T23:59:59.999+02:00`);
  t.ok(compareDates(new Date('2017-01-31T23:59:59.999Z'), new Date('2017-01-31T23:59:59.999-02:00')) < 0, `2017-01-31T23:59:59.999Z < 2017-01-31T23:59:59.999-02:00`);

  t.end();
});

test('toSortable(values, ignoreCase) and sortSortable', t => {
  // Numbers - integers
  let sortables = [undefined, Number.MAX_SAFE_INTEGER,3,2,1,0,-1,-2,-3,Number.MIN_SAFE_INTEGER, null];
  let expected = {sortType: SortType.NUMBER, compare: compareNumbers, sortableValues: sortables};
  let actual = toSortable(sortables);
  t.deepEqual(actual, expected, `toSortable must be ${stringify(expected)}`);
  let sorted = [null, Number.MIN_SAFE_INTEGER,-3,-2,-1,0,1,2,3,Number.MAX_SAFE_INTEGER, undefined];
  t.deepEqual(sortSortable(actual), sorted, `sorted must be ${stringify(sorted)}`);

  // Numbers - integers (including unsafe ones)
  const MAX_INTEGER = Math.floor(Number.MAX_VALUE);
  sortables = [undefined, MAX_INTEGER,Number.MAX_SAFE_INTEGER*1000,Number.MAX_SAFE_INTEGER,3,2,1,0,-1,-2,-3,Number.MIN_SAFE_INTEGER,Number.MIN_SAFE_INTEGER*1000,-MAX_INTEGER, null];
  expected = {sortType: SortType.NUMBER, compare: compareNumbers, sortableValues: sortables};
  actual = toSortable(sortables);
  t.deepEqual(actual, expected, `toSortable must be ${stringify(expected)}`);
  sorted = [null, -MAX_INTEGER,Number.MIN_SAFE_INTEGER*1000,Number.MIN_SAFE_INTEGER,-3,-2,-1,0,1,2,3,Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER*1000,MAX_INTEGER, undefined];
  t.deepEqual(sortSortable(actual), sorted, `sorted must be ${stringify(sorted)}`);

  // Numbers - integers & floating-points & special numbers
  sortables = [undefined,Infinity,Number.MAX_VALUE,Number.MAX_SAFE_INTEGER,Math.PI,3,2,1.1,Number.MIN_VALUE,NaN,0,NaN,-Number.MIN_VALUE,-1.1,-2,-3,-Math.PI,Number.MIN_SAFE_INTEGER,-Number.MAX_VALUE,-Infinity,null];
  expected = {sortType: SortType.NUMBER, compare: compareNumbers, sortableValues: sortables};
  actual = toSortable(sortables);
  t.deepEqual(stringify(actual), stringify(expected), `toSortable must be ${stringify(expected)}`);
  sorted = [null,NaN,NaN,-Infinity,-Number.MAX_VALUE,Number.MIN_SAFE_INTEGER,-Math.PI,-3,-2,-1.1,-Number.MIN_VALUE,0,Number.MIN_VALUE,1.1,2,3,Math.PI,Number.MAX_SAFE_INTEGER,Number.MAX_VALUE,Infinity,undefined];
  t.deepEqual(stringify(sortSortable(actual)), stringify(sorted), `sorted must be ${stringify(sorted)}`);

  // Integer-likes with some strings and some numbers
  sortables = [undefined,'9'.repeat(30),'3','2','1','0','-1',`-${'9'.repeat(30)}`,null];
  expected = {sortType: SortType.INTEGER_LIKE, compare: compareIntegerLikes, sortableValues: sortables};
  actual = toSortable(sortables);
  t.deepEqual(actual, expected, `toSortable must be ${stringify(expected)}`);
  sorted = [null,`-${'9'.repeat(30)}`,'-1','0','1','2','3', '9'.repeat(30), undefined];
  t.deepEqual(sortSortable(actual), sorted, `sorted must be ${stringify(sorted)}`);

  // Integer-likes with ALL strings
  sortables = [undefined,'9'.repeat(30),'3','2','1','0','-1',`-${'9'.repeat(30)}`,null];
  expected = {sortType: SortType.INTEGER_LIKE, compare: compareIntegerLikes, sortableValues: sortables};
  actual = toSortable(sortables);
  t.deepEqual(actual, expected, `toSortable must be ${stringify(expected)}`);
  sorted = [null,`-${'9'.repeat(30)}`,'-1','0','1','2','3', '9'.repeat(30),undefined];
  t.deepEqual(sortSortable(actual), sorted, `sorted must be ${stringify(sorted)}`);

  // Strings - case-sensitive
  sortables = [undefined, 'z', 'a', 'Z', 'A', null];
  expected = {sortType: SortType.STRING, compare: compareStrings, sortableValues: sortables};
  actual = toSortable(sortables, false);
  t.deepEqual(actual, expected, `toSortable must be ${stringify(expected)}`);
  sorted = [null, 'A', 'Z', 'a', 'z', undefined];
  t.deepEqual(sortSortable(actual), sorted, `sorted must be ${stringify(sorted)}`);

  // Strings - case-insensitive
  sortables = [undefined, 'z', 'a', 'Z', 'A', null];
  expected = {sortType: SortType.STRING, compare: compareStrings, sortableValues: sortables};
  actual = toSortable(sortables, true);
  t.deepEqual(actual, expected, `toSortable must be ${stringify(expected)}`);
  sorted = [null, 'A', 'a', 'Z', 'z', undefined];
  t.deepEqual(sortSortable(actual, {ignoreCase: true}), sorted, `sorted must be ${stringify(sorted)}`);

  // Dates
  sortables = [undefined, '2017-12-31', '2017-07-15', '2017-03-01', '2017-02-31', '2017-01-01', '2016-12-31', null];
  expected = {sortType: SortType.DATE, compare: compareDates, sortableValues: sortables.map(d => d ? new Date(d) : d)};
  actual = toSortable(sortables);
  t.deepEqual(actual, expected, `toSortable must be ${stringify(expected)}`);
  sorted = [null, '2016-12-31', '2017-01-01', '2017-03-01', '2017-02-31', '2017-07-15', '2017-12-31', undefined];
  t.deepEqual(sortSortable(actual), sorted.map(d => d ? new Date(d) : d), `sorted must be ${stringify(sorted)}`);

  // Date-times
  sortables = [undefined, '2017-12-31T00:00Z', '2017-07-15T03:30Z', '2017-03-01T13:22Z', '2017-02-31T04:45Z', '2017-01-01T01:11Z', '2016-12-31T23:59Z', '2016-12-31T17:23Z', null];
  expected = {sortType: SortType.DATE_TIME, compare: compareDates, sortableValues: sortables.map(d => d ? new Date(d) : d)};
  actual = toSortable(sortables);
  t.deepEqual(actual, expected, `toSortable must be ${stringify(expected)}`);
  sorted = [null, '2016-12-31T17:23Z', '2016-12-31T23:59Z', '2017-01-01T01:11Z', '2017-03-01T13:22Z', '2017-02-31T04:45Z', '2017-07-15T03:30Z', '2017-12-31T00:00Z', undefined];
  t.deepEqual(sortSortable(actual), sorted.map(d => d ? new Date(d) : d), `sorted must be ${stringify(sorted)}`);

  // Booleans
  sortables = [undefined, true, false, true, false, null];
  expected = {sortType: SortType.BOOLEAN, compare: compareBooleans, sortableValues: sortables};
  actual = toSortable(sortables);
  t.deepEqual(actual, expected, `toSortable must be ${stringify(expected)}`);
  sorted = [null, false, false, true, true, undefined];
  t.deepEqual(sortSortable(actual), sorted, `sorted must be ${stringify(sorted)}`);

  // Mixed bag of junk to be "sorted" - case-sensitive
  sortables = [undefined, true, 'zzz', Math.PI, 1, 10, 100, 'undefined', false, 'false', 'null', 0, NaN, 'Aardvark', [1,2,3], 'true', 'Zoo', {a:1, b: {c: 2}}, 'alien', -1234, false, null];
  expected = {sortType: SortType.UNKNOWN, compare: compareStrings, sortableValues: sortables.map(s => typeof s === 'string' || s === null || s === undefined ? s : Strings.stringify(s))};
  actual = toSortable(sortables, false);
  t.deepEqual(actual, expected, `toSortable must be ${stringify(expected)}`);
  sorted = [null, '-1234', '0', '1', '10', '100', '3.141592653589793', 'Aardvark', 'NaN', 'Zoo', '[1, 2, 3]', 'alien', 'false', 'false', 'false', 'null', 'true', 'true', 'undefined', 'zzz', '{"a":1,"b":{"c":2}}', undefined];
  t.deepEqual(sortSortable(actual), sorted, `sorted must be ${stringify(sorted)}`);

  // Mixed bag of junk to be "sorted" - case-insensitive
  sortables = [undefined, Infinity, true, 'zzz', Math.PI, 1, 10, 100, 'undefined', 'False', 'null', 0, NaN, 'Aardvark', [1,2,3], 'True', 'Zoo', {Aaa:1, Bbb: {Ccc: 2}}, 'alien', -1234, false, null];
  expected = {sortType: SortType.UNKNOWN, compare: compareStrings, sortableValues: sortables.map(s => typeof s === 'string' || s === null || s === undefined ? s : Strings.stringify(s))};
  actual = toSortable(sortables, true);
  t.deepEqual(actual, expected, `toSortable must be ${stringify(expected)}`);
  sorted = [null, '-1234', '0', '1', '10', '100', '3.141592653589793', '[1, 2, 3]', 'Aardvark', 'alien', 'False', 'false', 'Infinity', 'NaN', 'null', 'True', 'true', 'undefined', 'Zoo', 'zzz', '{"Aaa":1,"Bbb":{"Ccc":2}}', undefined];
  t.deepEqual(sortSortable(actual, {ignoreCase:true}), sorted, `sorted must be ${stringify(sorted)}`);

  // All either undefined or null
  sortables = [undefined, null, undefined, null, undefined];
  expected = {sortType: SortType.UNDEFINED_OR_NULL, compare: compareUndefinedOrNull, sortableValues: sortables};
  actual = toSortable(sortables);
  t.deepEqual(actual, expected, `toSortable must be ${stringify(expected)}`);
  sorted = [null, null, undefined, undefined, undefined];
  t.deepEqual(sortSortable(actual), sorted, `sorted must be ${stringify(sorted)}`);

  t.end();
});

test('sortKeyValuePairsByKey', t => {
  // Applied to non-objects
  let expected = [];
  t.deepEqual(sortKeyValuePairsByKey(undefined), expected, `sortKeyValuePairsByKey(undefined) must be ${stringify(expected)}`);
  t.deepEqual(sortKeyValuePairsByKey(null), expected, `sortKeyValuePairsByKey(null) must be ${stringify(expected)}`);
  t.deepEqual(sortKeyValuePairsByKey('abc'), expected, `sortKeyValuePairsByKey('abc') must be ${stringify(expected)}`);
  t.deepEqual(sortKeyValuePairsByKey(123), expected, `sortKeyValuePairsByKey(123) must be ${stringify(expected)}`);

  // Applied to objects with opts undefined (defaults to ignoreCase false)
  expected = [];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs({})), expected, `sortKeyValuePairsByKey(toKeyValuePairs({})) must be ${stringify(expected)}`);

  expected = [['abc', 123]];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs({abc:123})), expected, `sortKeyValuePairsByKey(toKeyValuePairs({})) must be ${stringify(expected)}`);

  expected = [['C', 'Ccc'], ['Z', 99], ['a', 1], ['b', {c:2}], ['d', '3']];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs({a:1, b:{c:2}, Z: 99, d:'3', C: 'Ccc'})), expected, `sortKeyValuePairsByKey(toKeyValuePairs({a:1, b:{c:2}, Z: 99, d:'3', C: 'Ccc'})) must be ${stringify(expected)}`);

  //expected = [['C', 'Ccc'], ['Z', 99], ['a', 1], ['b', {c:2}], ['d', '3']];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs({d:'3', b:{c:2}, Z: 99, a:1, C: 'Ccc'})), expected, `sortKeyValuePairsByKey(toKeyValuePairs({d:'3', b:{c:2}, Z: 99, a:1, C: 'Ccc'})) must be ${stringify(expected)}`);

  // Applied to objects with opts {ignoreCase: false}
  let opts = {ignoreCase: false};
  expected = [];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs({}), opts), expected, `sortKeyValuePairsByKey(toKeyValuePairs({}, ${stringify(opts)}) must be ${stringify(expected)}`);

  expected = [['A', 'Aaa'], ['C', 'Ccc'], ['Z', 99], ['a', 1], ['b', {c:2}], ['d', '3']];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs({a: 1, b: {c:2}, Z: 99, d: '3', C: 'Ccc', A: 'Aaa'}), opts), expected, `sortKeyValuePairsByKey(toKeyValuePairs({a: 1, b: {c:2}, Z: 99, d: '3', C: 'Ccc', A: 'Aaa'}), ${stringify(opts)}) must be ${stringify(expected)}`);

  //expected = [['C', 'Ccc'], ['Z', 99], ['a', 1], ['b', {c:2}], ['d', '3']];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs({d: '3', b: {c:2}, Z: 99, a: 1, C: 'Ccc', A: 'Aaa'}), opts), expected, `sortKeyValuePairsByKey(toKeyValuePairs({d: '3', b: {c:2}, Z: 99, a: 1, C: 'Ccc', A: 'Aaa'}), ${stringify(opts)}) must be ${stringify(expected)}`);

  // Applied to objects with opts {ignoreCase: true}
  opts = {ignoreCase: true};
  expected = [];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs({}), opts), expected, `sortKeyValuePairsByKey(toKeyValuePairs({}), ${stringify(opts)}) must be ${stringify(expected)}`);

  //expected = [['a', 1], ['A', 'Aaa'], ['b', {c:2}], ['C', 'Ccc'], ['d', '3'], ['Z', 99]];
  expected = [['A', 'Aaa'], ['a', 1], ['b', {c:2}], ['C', 'Ccc'], ['d', '3'], ['Z', 99]];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs({a: 1, b: {c:2}, Z: 99, d: '3', C: 'Ccc', A: 'Aaa'}), opts), expected, `sortKeyValuePairsByKey(toKeyValuePairs({a: 1, b: {c:2}, Z: 99, d: '3', C: 'Ccc', A: 'Aaa'}), ${stringify(opts)}) must be ${stringify(expected)}`);

  //expected = [['A', 'Aaa'], ['a', 1], ['b', {c:2}], ['C', 'Ccc'], ['d', '3'], ['Z', 99]];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs({d: '3', b: {c:2}, Z: 99, a: 1, C: 'Ccc', A: 'Aaa'}), opts), expected, `sortKeyValuePairsByKey(toKeyValuePairs({d: '3', b: {c:2}, Z: 99, a: 1, C: 'Ccc', A: 'Aaa'}), ${stringify(opts)}) must be ${stringify(expected)}`);

  // expected = [['A', 'Aaa'], ['a', 1], ['b', {c:2}], ['C', 'Ccc'], ['d', '3'], ['Z', 99]];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs({A: 'Aaa', a: 1, b: {c:2}, Z: 99, d:'3', C: 'Ccc'}), opts), expected, `sortKeyValuePairsByKey(toKeyValuePairs({A: 'Aaa', a: 1, b: {c:2}, Z: 99, d:'3', C: 'Ccc'}), ${stringify(opts)}) must be ${stringify(expected)}`);

  // expected = [['A', 'Aaa'], ['a', 1], ['b', {c:2}], ['C', 'Ccc'], ['d', '3'], ['Z', 99]];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs({d: '3', b: {c:2}, Z: 99, A: 'Aaa', a: 1, C: 'Ccc'}), opts), expected, `sortKeyValuePairsByKey(toKeyValuePairs({d: '3', b: {c:2}, Z: 99, A: 'Aaa', a: 1, C: 'Ccc'}), ${stringify(opts)}) must be ${stringify(expected)}`);

  // Not meant to be applied to arrays, but if so ...
  expected = [['length', 0]];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs([])), expected, `sortKeyValuePairsByKey(toKeyValuePairs([])) must be ${stringify(expected)}`);
  expected = [['0', '1'], ['1', 2], ['2', '3'], ['length', 3]];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs(['1', 2, '3'])), expected, `sortKeyValuePairsByKey(toKeyValuePairs(['1', 2, '3'])) must be ${stringify(expected)}`);

  expected = [['0', '3'], ['1', 2], ['2', '1'], ['length', 3]];
  t.deepEqual(sortKeyValuePairsByKey(toKeyValuePairs(['3',2,'1'])), expected, `sortKeyValuePairsByKey(toKeyValuePairs(['3',2,'1'])) must be ${stringify(expected)}`);
  t.end();
});