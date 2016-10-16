'use strict';

const test = require('tape');

const b64 = require('../../core-functions/base64'); //TODO fix after publishing
const toBase64 = b64.toBase64;
const fromBase64 = b64.fromBase64;
const toBase64FromUtf8 = b64.toBase64FromUtf8;
const toUtf8FromBase64 = b64.toUtf8FromBase64;
const isEncodableDecodable = b64.isEncodableDecodable;

const returnUndefinedInsteadOfThrow = false;

function checkToBase64AndBackToUtf8(utf8, t) {
  try {
    const actual = toUtf8FromBase64(toBase64FromUtf8(utf8, returnUndefinedInsteadOfThrow), returnUndefinedInsteadOfThrow);
    t.deepEqual(actual, utf8, `must be ${JSON.stringify(utf8)}`);
  } catch (err) {
    if (isEncodableDecodable(utf8)) {
      t.fail(`encodable/decodable (${JSON.stringify(utf8)}) should NOT have thrown error (${err})`);
    } else {
      t.pass(`Non-encodable/decodable (${JSON.stringify(utf8)}) should have thrown error (${err})`);
    }
  }
}

function checkToBase64AndBack(data, t) {
  try {
    const actual = fromBase64(toBase64(data, returnUndefinedInsteadOfThrow), returnUndefinedInsteadOfThrow);
    t.deepEqual(actual, data, `must be ${JSON.stringify(data)}`);
  } catch (err) {
    if (isEncodableDecodable(data)) {
      t.fail(`Encodable/decodable (${JSON.stringify(data)}) should NOT have thrown error (${err})`);
    } else {
      t.pass(`Non-encodable/decodable (${JSON.stringify(data)}) should have thrown error (${err})`);
    }
  }

}

test('isEncodableDecodable', t => {
  // Encodable/decodable must start with number, buffer, array or string (otherwise new Buffer throws TypeError)
  t.ok(isEncodableDecodable(''), 'empty string should be encodable/decodable');
  t.ok(isEncodableDecodable('abc'), 'string should be encodable/decodable');
  t.ok(isEncodableDecodable(new Buffer('abc', 'utf-8')), 'Buffer should be encodable/decodable');
  t.ok(isEncodableDecodable(['abc', 123]), 'Array should be encodable/decodable');

  t.notOk(isEncodableDecodable(123), 'number should NOT be encodable/decodable');
  t.notOk(isEncodableDecodable({}), `Object {} should NOT be encodable/decodable`);
  const obj = {'abc': 123};
  t.notOk(isEncodableDecodable(obj), `Object (${JSON.stringify(obj)}) should NOT be encodable/decodable`);
  t.notOk(isEncodableDecodable(new Date()), `Date should NOT be encodable/decodable`);
  t.end();
});

test('toBase64FromUtf8 and toUtf8FromBase64', t => {
  checkToBase64AndBackToUtf8(undefined, t);

  checkToBase64AndBackToUtf8('', t);
  checkToBase64AndBackToUtf8('Testing 123', t);
  checkToBase64AndBackToUtf8('Testing\n123', t);

  // Despite: TypeError: must start with number, buffer, array or string

  // TODO Arrays don't seem to throw errors, but also don't return original value
  // checkToBase64AndBackToUtf8([], t); // returns ''
  // checkToBase64AndBackToUtf8(['abc', '123'], t); // returns '\x00{'

  // Numbers don't seem to throw errors, but also don't return original value - they return long strings of unicode/random chars
  // REASON: Actually numbers specify the size of the buffer to create!   new Buffer(size)
  // so they are NOT appropriate encodable/decodables!
  // checkToBase64AndBackToUtf8(789, t);
  // checkToBase64AndBackToUtf8(123.456, t);
  // checkToBase64AndBackToUtf8(0, t);

  // Objects are expected to fail (and they do)
  checkToBase64AndBackToUtf8(null, t);
  checkToBase64AndBackToUtf8({}, t);
  checkToBase64AndBackToUtf8({a: 1, b: '2'}, t);
  checkToBase64AndBackToUtf8({a: 1, b: '2', o: { c: '3'}}, t);

  t.end();
});

test('toBase64 and fromBase64', t => {
  // Everything works here, because they all use JSON strings
  checkToBase64AndBack(undefined, t);

  checkToBase64AndBack('', t);
  checkToBase64AndBack('Testing 123', t);
  checkToBase64AndBack('Testing\n123', t);

  checkToBase64AndBack([], t); // returns ''
  checkToBase64AndBack(['abc', '123'], t); // returns '\x00{'

  // Numbers don't seem to throw errors, but also don't return original value - they return long strings of unicode/random chars
  // REASON: Actually numbers specify the size of the buffer to create!   new Buffer(size)
  // so they are NOT appropriate encodable/decodables!
  // checkToBase64AndBack(789, t);
  // checkToBase64AndBack(123.456, t);
  // checkToBase64AndBack(0, t);

  checkToBase64AndBack(null, t);
  checkToBase64AndBack({}, t);
  checkToBase64AndBack({a: 1, b: '2'}, t);
  checkToBase64AndBack({a: 1, b: '2', o: { c: '3'}}, t);
  t.end();
});