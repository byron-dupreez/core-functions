'use strict';

/**
 * Unit tests for core-functions/tries.js
 * @author Byron du Preez
 */

const test = require('tape');

const tries = require('../tries');
const Try = tries.Try;
const Success = tries.Success;
const Failure = tries.Failure;

const Strings = require('../strings');
const stringify = Strings.stringify;

const tried = new Try();
const tried2 = new Try();

const value = 42;
const value2 = 'Abc';
const success = new Success(value);
const success2 = new Success(value2);

const err = new Error('Boom');
const errRegex = /Boom/;
const err2 = new Error('Crash');
const err2Regex = /Crash/;
const failure = new Failure(err);
const failure2 = new Failure(err2);

const returnA1 = () => { return {a: 1} };
const throwErr = () => { throw err };
const throwErr2 = () => { throw err2 };
function throwError(e) { throw e }

const noValueOrErrorRegex = /No value or error/;

const Promises = require('../promises');

test('new Try()', t => {
  t.ok(tried, `${tried} must exist`);
  t.ok(tried2, `${tried2} must exist`);

  t.ok(tried instanceof Try, `${tried} must be an instance of Try`);
  t.notOk(tried instanceof Success, `${tried} must NOT be an instance of Success`);
  t.notOk(tried instanceof Failure, `${tried} must NOT be an instance of Failure`);

  t.notOk(tried.isSuccess(), `${tried}.isSuccess() must be false`);
  t.notOk(tried.isFailure(), `${tried}.isFailure() must be false`);

  t.throws(() => tried.get(), noValueOrErrorRegex, `${tried}.get() must throw a ${noValueOrErrorRegex} error`);

  t.equal(tried.getOrElse(value), value, `${tried}.getOrElse(${value}) must be ${value}`);
  t.equal(tried.getOrElse(value2), value2, `${tried}.getOrElse(${value2}) must be ${value2}`);
  t.equal(tried.getOrElse(() => value), value, `${tried}.getOrElse(() => value) must be ${value}`);
  t.equal(tried.getOrElse(() => value2), value2, `${tried}.getOrElse(() => value2) must be ${value2}`);
  t.throws(() => tried.getOrElse(throwErr), errRegex, `${tried}.getOrElse(throwErr) must throw err`);

  t.throws(() => tried.getOrElse(tried), noValueOrErrorRegex, `${tried}.getOrElse(tried) must throw a ${noValueOrErrorRegex} error`);
  t.throws(() => tried.getOrElse(tried2), noValueOrErrorRegex, `${tried}.getOrElse(tried2) must throw a ${noValueOrErrorRegex} error`);
  t.equal(tried.getOrElse(success), value, `${tried}.getOrElse(success) must be ${value}`);
  t.equal(tried.getOrElse(success2), value2, `${tried}.getOrElse(success2) must be ${value2}`);
  t.throws(() => tried.getOrElse(failure), errRegex, `${tried}.getOrElse(failure) must throw err`);
  t.throws(() => tried.getOrElse(failure2), err2Regex, `${tried}.getOrElse(failure2) must throw err2`);

  t.equal(tried.orElse(tried), tried, `${tried}.orElse(tried) must be tried`);
  t.equal(tried.orElse(tried2), tried2, `${tried}.orElse(tried2) must be tried2`);
  t.equal(tried.orElse(success), success, `${tried}.orElse(success) must be success`);
  t.equal(tried.orElse(success2), success2, `${tried}.orElse(success2) must be success2`);
  t.equal(tried.orElse(failure), failure, `${tried}.orElse(failure) must be failure`);
  t.equal(tried.orElse(failure2), failure2, `${tried}.orElse(failure2) must be failure2`);

  t.equal(tried.orElse(() => tried), tried, `${tried}.orElse(() => tried) must be tried`);
  t.equal(tried.orElse(() => tried2), tried2, `${tried}.orElse(() => tried2) must be tried2`);
  t.equal(tried.orElse(() => success), success, `${tried}.orElse(() => success) must be success`);
  t.equal(tried.orElse(() => success2), success2, `${tried}.orElse(() => success2) must be success2`);
  t.equal(tried.orElse(() => failure), failure, `${tried}.orElse(() => failure) must be failure`);
  t.equal(tried.orElse(() => failure2), failure2, `${tried}.orElse(() => failure2) must be failure2`);

  // mapping with only a success function
  t.equal(tried.map(v => v * 2), tried, `${tried}.map(v => v * 2) must still be tried`);
  t.equal(tried.map(throwErr), tried, `${tried}.map(throwErr) must still be tried`);

  // mapping with only a failure function
  t.equal(tried.map(undefined, e => value), tried, `${tried}.map(undefined, e => 42) must still be tried`);
  t.equal(tried.map(undefined, e => throwError(e)), tried, `${tried}.map(undefined, e => throwError(e)) must still be tried`);

  // mapping without any functions
  t.equal(tried.map(), tried, `${tried}.map() must still be tried`);
  t.equal(tried.map(undefined), tried, `${tried}.map(undefined) must still be tried`);
  t.equal(tried.map(undefined, undefined), tried, `${tried}.map(undefined, undefined) must still be tried`);
  t.equal(tried.map(null), tried, `${tried}.map(null) must still be tried`);
  t.equal(tried.map(null, null), tried, `${tried}.map(null, null) must still be tried`);
  t.equal(tried.map(123), tried, `${tried}.map(123) must still be tried`);
  t.equal(tried.map(123, 456), tried, `${tried}.map(123, 456) must still be tried`);

  // recovering with a function
  t.equal(tried.recover(e => value), tried, `${tried}.recover(e => 42) must still be tried`);
  t.equal(tried.recover(e => throwError(e)), tried, `${tried}.recover(e => throwError(e)) must still be tried`);

  // recovering without a function
  t.equal(tried.recover(), tried, `${tried}.recover() must still be tried`);
  t.equal(tried.recover(undefined), tried, `${tried}.recover(undefined) must still be tried`);
  t.equal(tried.recover(null), tried, `${tried}.recover(null) must still be tried`);
  t.equal(tried.recover(123), tried, `${tried}.recover(123) must still be tried`);

  // mapping with both functions
  t.equal(tried.map(v => v * 2, e => value), tried, `${tried}.map(v => v * 2, e => 42) must still be tried`);
  t.equal(tried.map(v => v * 2, e => throwError(e)), tried, `${tried}.map(v => v * 2, e => throwError(e)) must still be tried`);
  t.equal(tried.map(throwErr, e => value), tried, `${tried}.map(throwErr, e => 42) must still be tried`);
  t.equal(tried.map(throwErr, e => throwError(e)), tried, `${tried}.map(throwErr, e => throwError(e)) must still be tried`);

  t.equal(tried.forEach(throwErr), undefined, `${tried}.forEach(throwErr) must be undefined`);

  t.equal(tried.toString(), 'Try', `${tried}.toString() must be Try`);
  t.equal(stringify(tried), JSON.stringify({}), `JSON.stringify(${tried}) must be ${JSON.stringify({})}`);

  // flattening during construction
  t.equal(new Try(tried), tried, `new Try(tried) must be tried`);
  t.equal(new Try(success), success, `new Try(success) must be success`);
  t.equal(new Try(failure), failure, `new Try(failure) must be failure`);

  t.end();
});

test('new Success()', t => {
  t.ok(success, `${success} must exist`);
  t.ok(success2, `${success2} must exist`);

  t.ok(success instanceof Try, `${success} must be an instance of Try`);
  t.ok(success instanceof Success, `${success} must be an instance of Success`);
  t.notOk(success instanceof Failure, `${success} must NOT be an instance of Failure`);

  t.ok(success.isSuccess(), `${success}.isSuccess() must be true`);
  t.notOk(success.isFailure(), `${success}.isFailure() must be false`);

  t.equal(success.get(), value, `${success}.get() must be ${value}`);
  t.equal(success2.get(), value2, `${success2}.get() must be ${value2}`);

  t.equal(success.getOrElse(value), value, `${success}.getOrElse(${value}) must be ${value}`);
  t.equal(success.getOrElse(value2), value, `${success}.getOrElse(${value2}) must be ${value}`);
  t.equal(success.getOrElse(() => value), value, `${success}.getOrElse(() => value) must be ${value}`);
  t.equal(success.getOrElse(() => value2), value, `${success}.getOrElse(() => value2) must be ${value}`);
  t.equal(success.getOrElse(throwErr), value, `${success}.getOrElse(throwErr) must be ${value}`);

  t.equal(success.getOrElse(tried), value, `${success}.getOrElse(tried) must be be ${value}`);
  t.equal(success.getOrElse(tried2), value, `${success}.getOrElse(tried2) must be be ${value}`);
  t.equal(success.getOrElse(success), value, `${success}.getOrElse(success) must be ${value}`);
  t.equal(success.getOrElse(success2), value, `${success}.getOrElse(success2) must be ${value}`);
  t.equal(success.getOrElse(failure), value, `${success}.getOrElse(failure) must be ${value}`);
  t.equal(success.getOrElse(failure2), value, `${success}.getOrElse(failure2) must be ${value}`);

  t.equal(success2.getOrElse(tried), value2, `${success2}.getOrElse(tried) must be ${value2}`);
  t.equal(success2.getOrElse(tried2), value2, `${success}.getOrElse(tried2) must be ${value2}`);
  t.equal(success2.getOrElse(success), value2, `${success2}.getOrElse(success) must be ${value2}`);
  t.equal(success2.getOrElse(success2), value2, `${success}.getOrElse(success2) must be ${value2}`);
  t.equal(success2.getOrElse(failure), value2, `${success2}.getOrElse(failure) must be ${value2}`);
  t.equal(success2.getOrElse(failure2), value2, `${success}.getOrElse(failure2) must be ${value2}`);

  t.equal(success.orElse(tried), success, `${success}.orElse(tried) must be success`);
  t.equal(success.orElse(tried2), success, `${success}.orElse(tried2) must be success`);
  t.equal(success.orElse(success), success, `${success}.orElse(success) must be success`);
  t.equal(success.orElse(success2), success, `${success}.orElse(success2) must be success`);
  t.equal(success.orElse(failure), success, `${success}.orElse(failure) must be success`);
  t.equal(success.orElse(failure2), success, `${success}.orElse(failure2) must be success`);

  t.equal(success2.orElse(tried), success2, `${success2}.orElse(tried) must be success2`);
  t.equal(success2.orElse(tried2), success2, `${success2}.orElse(tried2) must be success2`);
  t.equal(success2.orElse(success), success2, `${success2}.orElse(success) must be success2`);
  t.equal(success2.orElse(success2), success2, `${success2}.orElse(success2) must be success2`);
  t.equal(success2.orElse(failure), success2, `${success2}.orElse(failure) must be success2`);
  t.equal(success2.orElse(failure2), success2, `${success2}.orElse(failure2) must be success2`);

  t.equal(success.orElse(() => tried), success, `${success}.orElse(() => tried) must be success`);
  t.equal(success.orElse(() => tried2), success, `${success}.orElse(() => tried2) must be success`);
  t.equal(success.orElse(() => success), success, `${success}.orElse(() => success) must be success`);
  t.equal(success.orElse(() => success2), success, `${success}.orElse(() => success2) must be success`);
  t.equal(success.orElse(() => failure), success, `${success}.orElse(() => failure) must be success`);
  t.equal(success.orElse(() => failure2), success, `${success}.orElse(() => failure2) must be success`);

  t.equal(success2.orElse(() => tried), success2, `${success2}.orElse(() => tried) must be success2`);
  t.equal(success2.orElse(() => tried2), success2, `${success2}.orElse(() => tried2) must be success2`);
  t.equal(success2.orElse(() => success), success2, `${success2}.orElse(() => success) must be success2`);
  t.equal(success2.orElse(() => success2), success2, `${success2}.orElse(() => success2) must be success2`);
  t.equal(success2.orElse(() => failure), success2, `${success2}.orElse(() => failure) must be success2`);
  t.equal(success2.orElse(() => failure2), success2, `${success2}.orElse(() => failure2) must be success2`);

  // mapping with only a success function
  t.deepEqual(success.map(v => v * 2), new Success(value * 2), `${success}.map(v => v * 2) must be ${new Success(value * 2)}`);
  t.deepEqual(success.map(throwErr), new Failure(err), `${success}.map(throwErr) must be ${new Failure(err)}`);
  t.deepEqual(success2.map(v => v + 'Xyz'), new Success(value2 + 'Xyz'), `${success2}.map(v => v + 'Xyz') must be ${new Success(value2 + 'Xyz')}`);
  t.deepEqual(success2.map(throwErr2), new Failure(err2), `${success2}.map(throwErr2) must be ${new Failure(err2)}`);

  // mapping with only a failure function
  t.equal(success.map(undefined, e => value), success, `${success}.map(undefined, e => 42) must be success`);
  t.equal(success2.map(undefined, e => value), success2, `${success2}.map(undefined, e => 42) must be success2`);
  t.equal(success.map(undefined, e => throwError(e)), success, `${success}.map(undefined, e => throwError(e)) must be success`);
  t.equal(success2.map(undefined, e => throwError(e)), success2, `${success2}.map(undefined, e => throwError(e)) must be success2`);

  // mapping without any functions
  t.equal(success.map(), success, `${success}.map() must still be success`);
  t.equal(success.map(undefined), success, `${success}.map(undefined) must still be success`);
  t.equal(success.map(undefined, undefined), success, `${success}.map(undefined, undefined) must still be success`);
  t.equal(success.map(null), success, `${success}.map(null) must still be success`);
  t.equal(success.map(null, null), success, `${success}.map(null, null) must still be success`);
  t.equal(success.map(123), success, `${success}.map(123) must still be success`);
  t.equal(success.map(123, 456), success, `${success}.map(123, 456) must still be success`);

  // recovering with a function
  t.equal(success.recover(e => value2), success, `${success}.recover(e => ${value2}) must be success`);
  t.equal(success.recover(e => throwError(e)), success, `${success}.recover(e => throwError(e)) must be success`);
  t.equal(success2.recover(e => value), success2, `${success2}.recover(e => ${value}) must be success2`);
  t.equal(success2.recover(e => throwError(e)), success2, `${success2}.recover(e => throwError(e)) must be success2`);

  // recovering without a function
  t.equal(success.recover(), success, `${success}.recover() must still be success`);
  t.equal(success.recover(undefined), success, `${success}.recover(undefined) must still be success`);
  t.equal(success.recover(null), success, `${success}.recover(null) must still be success`);
  t.equal(success.recover(123), success, `${success}.recover(123) must still be success`);

  // mapping with both functions
  t.deepEqual(success.map(v => v * 2, e => value2), new Success(value * 2), `${success}.map(v => v * 2, e => ${value2}) must be ${new Success(value * 2)}`);
  t.deepEqual(success.map(v => v + 'Xyz', e => throwError(e)), new Success(value + 'Xyz'), `${success}.map(v => v + 'Xyz', e => throwError(e)) must be ${new Success(value + 'Xyz')}`);
  t.deepEqual(success.map(throwErr, e => value2), new Failure(err), `${success}.map(throwErr, e => ${value2}) must be ${new Failure(err)}`);
  t.deepEqual(success.map(throwErr2, e => throwError(e)), new Failure(err2), `${success}.map(throwErr2, e => throwError(e)) must be ${new Failure(err2)}`);
  t.deepEqual(success2.map(v => v + 2, e => value2), new Success(value2 + 2), `${success2}.map(v => v + 2, e => ${value2}) must be ${new Success(value2 + 2)}`);
  t.deepEqual(success2.map(v => v + 'Xyz', e => throwError(e)), new Success(value2 + 'Xyz'), `${success2}.map(v => v + 'Xyz', e => throwError(e)) must be ${new Success(value2 + 'Xyz')}`);
  t.deepEqual(success2.map(throwErr, e => value), new Failure(err), `${success2}.map(throwErr, e => ${value}) must be ${new Failure(err)}`);
  t.deepEqual(success2.map(throwErr2, e => throwError(e)), new Failure(err2), `${success2}.map(throwErr2, e => throwError(e)) must be ${new Failure(err2)}`);

  t.throws(() => success.forEach(throwErr), errRegex, `${success}.forEach(throwErr) must throw err`);

  t.equal(success.toString(), `Success(${value})`, `${success}.toString() must be Success(${value})`);
  t.equal(success2.toString(), `Success(${value2})`, `${success2}.toString() must be Success(${value2})`);
  t.equal(JSON.stringify(success), JSON.stringify({value: value}), `JSON.stringify(success) must be ${JSON.stringify({value: value})}`);
  t.equal(JSON.stringify(success2), JSON.stringify({value: value2}), `JSON.stringify(success2) must be ${JSON.stringify({value: value2})}`);

  // flattening during construction
  t.equal(new Success(tried), tried, `new Success(tried) must be tried`);
  t.equal(new Success(success), success, `new Success(success) must be success`);
  t.equal(new Success(success2), success2, `new Success(success2) must be success2`);
  t.equal(new Success(failure), failure, `new Success(failure) must be failure`);
  t.equal(new Success(failure2), failure2, `new Success(failure2) must be failure2`);

  t.end();
});

test('new Failure()', t => {
  t.ok(failure, `${failure} must exist`);
  t.ok(failure2, `${failure2} must exist`);

  t.ok(failure instanceof Try, `${failure} must be an instance of Try`);
  t.ok(failure instanceof Failure, `${failure} must be an instance of Failure`);
  t.notOk(failure instanceof Success, `${failure} must NOT be an instance of Success`);

  t.ok(failure.isFailure(), `${failure}.isFailure() must be true`);
  t.notOk(failure.isSuccess(), `${failure}.isSuccess() must be false`);

  t.throws(() => failure.get(), err, `${failure}.get() must throw ${err}`);
  t.throws(() => failure2.get(), err2, `${failure2}.get() must throw ${err2}`);

  t.equal(failure.getOrElse(value), value, `${failure}.getOrElse(${value}) must be ${value}`);
  t.equal(failure.getOrElse(value2), value2, `${failure}.getOrElse(${value2}) must be ${value2}`);
  t.equal(failure.getOrElse(() => value), value, `${failure}.getOrElse(() => value) must be ${value}`);
  t.equal(failure.getOrElse(() => value2), value2, `${failure}.getOrElse(() => value2) must be ${value2}`);
  t.throws(() => failure.getOrElse(throwErr), errRegex, `${failure}.getOrElse(throwErr) must throw ${err}`);
  t.throws(() => failure.getOrElse(throwErr2), err2Regex, `${failure}.getOrElse(throwErr2) must throw ${err2}`);

  t.equal(failure2.getOrElse(value), value, `${failure2}.getOrElse(${value}) must be ${value}`);
  t.equal(failure2.getOrElse(value2), value2, `${failure2}.getOrElse(${value2}) must be ${value2}`);
  t.equal(failure2.getOrElse(() => value), value, `${failure2}.getOrElse(() => value) must be ${value}`);
  t.equal(failure2.getOrElse(() => value2), value2, `${failure2}.getOrElse(() => value2) must be ${value2}`);
  t.throws(() => failure2.getOrElse(throwErr), err, `${failure2}.getOrElse(throwErr) must throw ${err}`);
  t.throws(() => failure2.getOrElse(throwErr2), err2, `${failure2}.getOrElse(throwErr2) must throw ${err2}`);

  t.throws(() => failure.getOrElse(tried), noValueOrErrorRegex, `${failure}.getOrElse(tried) must throw ${noValueOrErrorRegex} error`);
  t.throws(() => failure.getOrElse(tried2), noValueOrErrorRegex, `${failure}.getOrElse(tried2) must throw ${noValueOrErrorRegex} error`);
  t.equal(failure.getOrElse(success), value, `${failure}.getOrElse(success) must be ${value}`);
  t.equal(failure.getOrElse(success2), value2, `${failure}.getOrElse(success2) must be ${value2}`);
  t.throws(() => failure.getOrElse(failure), err, `${failure}.getOrElse(failure) must throw ${err}`);
  t.throws(() => failure.getOrElse(failure2), err2, `${failure}.getOrElse(failure2) must throw ${err2}`);

  t.throws(() => failure2.getOrElse(tried), noValueOrErrorRegex, `${failure2}.getOrElse(tried) must must throw ${noValueOrErrorRegex} error`);
  t.throws(() => failure2.getOrElse(tried2), noValueOrErrorRegex, `${failure2}.getOrElse(tried2) must must throw ${noValueOrErrorRegex} error`);
  t.equal(failure2.getOrElse(success), value, `${failure2}.getOrElse(success) must be ${value}`);
  t.equal(failure2.getOrElse(success2), value2, `${failure2}.getOrElse(success2) must be ${value2}`);
  t.throws(() => failure2.getOrElse(failure), errRegex, `${failure2}.getOrElse(failure) must be ${value2}`);
  t.throws(() => failure2.getOrElse(failure2), err2Regex, `${failure2}.getOrElse(failure2) must be ${value2}`);

  t.equal(failure.orElse(tried), tried, `${failure}.orElse(tried) must be tried`);
  t.equal(failure.orElse(tried2), tried2, `${failure}.orElse(tried2) must be tried2`);
  t.equal(failure.orElse(success), success, `${failure}.orElse(success) must be success`);
  t.equal(failure.orElse(success2), success2, `${failure}.orElse(success2) must be success2`);
  t.equal(failure.orElse(failure), failure, `${failure}.orElse(failure) must be failure`);
  t.equal(failure.orElse(failure2), failure2, `${failure}.orElse(failure2) must be failure2`);

  t.equal(failure2.orElse(tried), tried, `${failure2}.orElse(tried) must be tried`);
  t.equal(failure2.orElse(tried2), tried2, `${failure2}.orElse(tried2) must be tried2`);
  t.equal(failure2.orElse(success), success, `${failure2}.orElse(success) must be success`);
  t.equal(failure2.orElse(success2), success2, `${failure2}.orElse(success2) must be success2`);
  t.equal(failure2.orElse(failure), failure, `${failure2}.orElse(failure) must be failure`);
  t.equal(failure2.orElse(failure2), failure2, `${failure2}.orElse(failure2) must be failure2`);

  t.equal(failure.orElse(() => tried), tried, `${failure}.orElse(() => tried) must be tried`);
  t.equal(failure.orElse(() => tried2), tried2, `${failure}.orElse(() => tried2) must be tried2`);
  t.equal(failure.orElse(() => success), success, `${failure}.orElse(() => success) must be success`);
  t.equal(failure.orElse(() => success2), success2, `${failure}.orElse(() => success2) must be success2`);
  t.equal(failure.orElse(() => failure), failure, `${failure}.orElse(() => failure) must be failure`);
  t.equal(failure.orElse(() => failure2), failure2, `${failure}.orElse(() => failure2) must be failure2`);

  t.equal(failure2.orElse(() => tried), tried, `${failure2}.orElse(() => tried) must be tried`);
  t.equal(failure2.orElse(() => tried2), tried2, `${failure2}.orElse(() => tried2) must be tried2`);
  t.equal(failure2.orElse(() => success), success, `${failure2}.orElse(() => success) must be success`);
  t.equal(failure2.orElse(() => success2), success2, `${failure2}.orElse(() => success2) must be success2`);
  t.equal(failure2.orElse(() => failure), failure, `${failure2}.orElse(() => failure) must be failure`);
  t.equal(failure2.orElse(() => failure2), failure2, `${failure2}.orElse(() => failure2) must be failure2`);

  // mapping with only a success function
  t.equal(failure.map(v => v * 2), failure, `${failure}.map(v => v * 2) must be failure`);
  t.equal(failure.map(throwErr), failure, `${failure}.map(throwErr) must be failure`);
  t.equal(failure2.map(v => v + 'Xyz'), failure2, `${failure2}.map(v => v + 'Xyz') must be failure2`);
  t.equal(failure2.map(throwErr2), failure2, `${failure2}.map(throwErr2) must be failure2`);

  // mapping with only a failure function
  t.deepEqual(failure.map(undefined, returnA1), new Success({a: 1}), `${failure}.map(undefined, returnA1) must be ${new Success({a: 1})}`);
  t.deepEqual(failure.map(undefined, throwErr2), new Failure(err2), `${failure}.map(undefined, throwErr2) must be ${new Failure(err2)}`);
  t.deepEqual(failure2.map(undefined, e => value), new Success(value), `${failure2}.map(undefined, e => ${value}) must be ${new Success(value)}`);
  t.deepEqual(failure2.map(undefined, throwErr), new Failure(err), `${failure2}.map(undefined, throwErr) must be ${new Failure(err)}`);

  // mapping without any functions
  t.equal(failure.map(), failure, `${failure}.map() must still be failure`);
  t.equal(failure.map(undefined), failure, `${failure}.map(undefined) must still be failure`);
  t.equal(failure.map(undefined, undefined), failure, `${failure}.map(undefined, undefined) must still be failure`);
  t.equal(failure.map(null), failure, `${failure}.map(null) must still be failure`);
  t.equal(failure.map(null, null), failure, `${failure}.map(null, null) must still be failure`);
  t.equal(failure.map(123), failure, `${failure}.map(123) must still be failure`);
  t.equal(failure.map(123, 456), failure, `${failure}.map(123, 456) must still be failure`);

  // recovering with a function
  t.deepEqual(failure.recover(returnA1), new Success({a: 1}), `${failure}.recover(returnA1) must be ${new Success({a: 1})}`);
  t.deepEqual(failure.recover(throwErr2), new Failure(err2), `${failure}.recover(throwErr2) must be ${new Failure(err2)}`);
  t.deepEqual(failure2.recover(e => value), new Success(value), `${failure2}.recover(e => ${value}) must be ${new Success(value)}`);
  t.deepEqual(failure2.recover(throwErr), new Failure(err), `${failure2}.recover(throwErr) must be ${new Failure(err)}`);

  // recovering without a function
  t.equal(failure.recover(), failure, `${failure}.recover() must still be failure`);
  t.equal(failure.recover(undefined), failure, `${failure}.recover(undefined) must still be failure`);
  t.equal(failure.recover(null), failure, `${failure}.recover(null) must still be failure`);
  t.equal(failure.recover(123), failure, `${failure}.recover(123) must still be failure`);

  // mapping with both functions
  t.deepEqual(failure.map(v => v * 2, e => value), new Success(value), `${failure}.map(v => v * 2, e => ${value}) must be ${new Success(value)}`);
  t.deepEqual(failure.map(v => v + 'Xyz', throwErr2), new Failure(err2), `${failure}.map(v => v + 'Xyz', e => {throw err2}) must be ${new Failure(err2)}`);
  t.deepEqual(failure.map(throwErr, e => value2), new Success(value2), `${failure}.map(throwErr, e => ${value2}) must be ${new Success(value2)}`);
  t.deepEqual(failure.map(throwErr2, e => throwError(e)), new Failure(err), `${failure}.map(throwErr2, e => throwError(e)) must be ${new Failure(err)}`);
  t.deepEqual(failure2.map(v => v + 2, e => value2), new Success(value2), `${failure2}.map(v => v + 2, e => ${value2}) must be ${new Success(value2)}`);
  t.deepEqual(failure2.map(v => v + 'Xyz', e => throwError(e)), new Failure(err2), `${failure2}.map(v => v + 'Xyz', e => throwError(e)) must be ${new Failure(err2)}`);
  t.deepEqual(failure2.map(throwErr, e => value * 3), new Success(value * 3), `${failure2}.map(throwErr, e => ${value * 3}) must be ${new Success(value * 3)}`);
  t.deepEqual(failure2.map(throwErr2, e => throwError(e)), new Failure(err2), `${failure2}.map(throwErr2, e => throwError(e)) must be ${new Failure(err2)}`);

  t.equal(failure.forEach(throwErr2), undefined, `${failure}.forEach(throwErr) must do nothing`);
  t.equal(failure2.forEach(throwErr), undefined, `${failure}.forEach(throwErr) must do nothing`);

  t.equal(failure.toString(), `Failure(${err})`, `${failure}.toString() must be Failure(${err})`);
  t.equal(failure2.toString(), `Failure(${err2})`, `${failure2}.toString() must be Failure(${err2})`);
  t.equal(JSON.stringify(failure), JSON.stringify({error: err}), `JSON.stringify(failure) must be ${JSON.stringify({error: err})}`);
  t.equal(JSON.stringify(failure2), JSON.stringify({error: err2}), `JSON.stringify(failure2) must be ${JSON.stringify({error: err2})}`);

  // flattening during construction
  t.equal(new Failure(tried), tried, `new Failure(tried) must be tried`);
  t.equal(new Failure(success), success, `new Failure(success) must be success`);
  t.equal(new Failure(success2), success2, `new Failure(success2) must be success2`);
  t.equal(new Failure(failure), failure, `new Failure(failure) must be failure`);
  t.equal(new Failure(failure2), failure2, `new Failure(failure2) must be failure2`);

  t.end();
});

test('new Success() flattens properly', t => {
  // Constructed with normal values
  let valOrTry = 123;
  t.deepEqual(new Success(valOrTry), new Success(valOrTry), `new Success(${stringify(valOrTry)}) must be ${new Success(valOrTry)}`);

  valOrTry = {a: 1};
  t.deepEqual(new Success(valOrTry), new Success(valOrTry), `new Success(${stringify(valOrTry)}) must be ${new Success(stringify(valOrTry))}`);

  // Constructed with successes
  valOrTry = success;
  t.equal(new Success(valOrTry), success, `new Success(${valOrTry}) must be ${success}`);
  t.equal(new Success(new Success(valOrTry)), success, `new Success(new Success(${valOrTry})) must be ${success}`);
  t.equal(new Success(new Success(new Success(valOrTry))), success, `new Success(new Success(new Success(${valOrTry}))) must be ${success}`);

  valOrTry = success2;
  t.equal(new Success(valOrTry), success2, `new Success(${valOrTry}) must be ${success2}`);
  t.equal(new Success(new Success(valOrTry)), success2, `new Success(new Success(${valOrTry})) must be ${success2}`);
  t.equal(new Success(new Success(new Success(valOrTry))), success2, `new Success(new Success(new Success(${valOrTry}))) must be ${success2}`);

  // Constructed with failures
  valOrTry = failure;
  t.equal(new Success(valOrTry), failure, `new Success(${valOrTry}) must be ${failure}`);
  t.equal(new Success(new Success(valOrTry)), failure, `new Success(new Success(${valOrTry})) must be ${failure}`);
  t.equal(new Success(new Success(new Success(valOrTry))), failure, `new Success(new Success(new Success(${valOrTry}))) must be ${failure}`);

  valOrTry = failure2;
  t.equal(new Success(valOrTry), failure2, `new Success(${valOrTry}) must be ${failure2}`);
  t.equal(new Success(new Success(valOrTry)), failure2, `new Success(new Success(${valOrTry})) must be ${failure2}`);
  t.equal(new Success(new Success(new Success(valOrTry))), failure2, `new Success(new Success(new Success(${valOrTry}))) must be ${failure2}`);

  // Constructed with tries
  valOrTry = tried;
  t.equal(new Success(valOrTry), tried, `new Success(${valOrTry}) must be ${tried}`);
  t.equal(new Success(new Success(valOrTry)), tried, `new Success(new Success(${valOrTry})) must be ${tried}`);
  t.equal(new Success(new Success(new Success(valOrTry))), tried, `new Success(new Success(new Success(${valOrTry}))) must be ${tried}`);

  t.end();
});

test('new Failure() flattens properly', t => {
  // Constructed with normal values
  let valOrTry = new Error('err');
  t.deepEqual(new Failure(valOrTry), new Failure(valOrTry), `new Failure(${stringify(valOrTry)}) must be ${new Failure(valOrTry)}`);

  valOrTry = {a: 1};
  t.deepEqual(new Failure(valOrTry), new Failure(valOrTry), `new Failure(${stringify(valOrTry)}) must be ${new Failure(stringify(valOrTry))}`);

  // Constructed with successes
  valOrTry = success;
  t.equal(new Failure(valOrTry), success, `new Failure(${valOrTry}) must be ${success}`);
  t.equal(new Failure(new Failure(valOrTry)), success, `new Failure(new Failure(${valOrTry})) must be ${success}`);
  t.equal(new Failure(new Failure(new Failure(valOrTry))), success, `new Failure(new Failure(new Failure(${valOrTry}))) must be ${success}`);

  valOrTry = success2;
  t.equal(new Failure(valOrTry), success2, `new Failure(${valOrTry}) must be ${success2}`);
  t.equal(new Failure(new Failure(valOrTry)), success2, `new Failure(new Failure(${valOrTry})) must be ${success2}`);
  t.equal(new Failure(new Failure(new Failure(valOrTry))), success2, `new Failure(new Failure(new Failure(${valOrTry}))) must be ${success2}`);

  // Constructed with failures
  valOrTry = failure;
  t.equal(new Failure(valOrTry), failure, `new Failure(${valOrTry}) must be ${failure}`);
  t.equal(new Failure(new Failure(valOrTry)), failure, `new Failure(new Failure(${valOrTry})) must be ${failure}`);
  t.equal(new Failure(new Failure(new Failure(valOrTry))), failure, `new Failure(new Failure(new Failure(${valOrTry}))) must be ${failure}`);

  valOrTry = failure2;
  t.equal(new Failure(valOrTry), failure2, `new Failure(${valOrTry}) must be ${failure2}`);
  t.equal(new Failure(new Failure(valOrTry)), failure2, `new Failure(new Failure(${valOrTry})) must be ${failure2}`);
  t.equal(new Failure(new Failure(new Failure(valOrTry))), failure2, `new Failure(new Failure(new Failure(${valOrTry}))) must be ${failure2}`);

  // Constructed with tries
  valOrTry = tried;
  t.equal(new Failure(valOrTry), tried, `new Failure(${valOrTry}) must be ${tried}`);
  t.equal(new Failure(new Failure(valOrTry)), tried, `new Failure(new Failure(${valOrTry})) must be ${tried}`);
  t.equal(new Failure(new Failure(new Failure(valOrTry))), tried, `new Failure(new Failure(new Failure(${valOrTry}))) must be ${tried}`);

  t.end();
});

test('new Try() flattens properly', t => {
  // Constructed with normal values
  let valOrTry = new Error('err');
  t.deepEqual(new Try(valOrTry), new Try(), `new Try(${stringify(valOrTry)}) must be similar to ${new Try()}`);

  valOrTry = {a: 1};
  t.deepEqual(new Try(valOrTry), new Try(), `new Try(${stringify(valOrTry)}) must be similar to ${new Try()}`);

  // Constructed with successes
  valOrTry = success;
  t.equal(new Try(valOrTry), success, `new Try(${valOrTry}) must be ${success}`);
  t.equal(new Try(new Try(valOrTry)), success, `new Try(new Try(${valOrTry})) must be ${success}`);
  t.equal(new Try(new Try(new Try(valOrTry))), success, `new Try(new Try(new Try(${valOrTry}))) must be ${success}`);

  valOrTry = success2;
  t.equal(new Try(valOrTry), success2, `new Try(${valOrTry}) must be ${success2}`);
  t.equal(new Try(new Try(valOrTry)), success2, `new Try(new Try(${valOrTry})) must be ${success2}`);
  t.equal(new Try(new Try(new Try(valOrTry))), success2, `new Try(new Try(new Try(${valOrTry}))) must be ${success2}`);

  // Constructed with failures
  valOrTry = failure;
  t.equal(new Try(valOrTry), failure, `new Try(${valOrTry}) must be ${failure}`);
  t.equal(new Try(new Try(valOrTry)), failure, `new Try(new Try(${valOrTry})) must be ${failure}`);
  t.equal(new Try(new Try(new Try(valOrTry))), failure, `new Try(new Try(new Try(${valOrTry}))) must be ${failure}`);

  valOrTry = failure2;
  t.equal(new Try(valOrTry), failure2, `new Try(${valOrTry}) must be ${failure2}`);
  t.equal(new Try(new Try(valOrTry)), failure2, `new Try(new Try(${valOrTry})) must be ${failure2}`);
  t.equal(new Try(new Try(new Try(valOrTry))), failure2, `new Try(new Try(new Try(${valOrTry}))) must be ${failure2}`);

  // Constructed with tries
  valOrTry = tried;
  t.equal(new Try(valOrTry), tried, `new Try(${valOrTry}) must be ${tried}`);
  t.equal(new Try(new Try(valOrTry)), tried, `new Try(new Try(${valOrTry})) must be ${tried}`);
  t.equal(new Try(new Try(new Try(valOrTry))), tried, `new Try(new Try(new Try(${valOrTry}))) must be ${tried}`);

  t.end();
});

test('Try.try', t => {
  // Values
  let f = 123;
  t.deepEqual(Try.try(f), new Success(f), `Try.try(${stringify(f)}) must be ${new Success(f)}`);

  f = {a: 1};
  t.deepEqual(Try.try(f), new Success(f), `Try.try(${stringify(f)}) must be ${new Success(stringify(f))}`);

  // Tries
  f = success;
  t.equal(Try.try(f), success, `Try.try(${f}) must be ${success}`);

  f = failure;
  t.equal(Try.try(f), failure, `Try.try(${f}) must be ${failure}`);

  f = tried;
  t.equal(Try.try(f), tried, `Try.try(${f}) must be ${tried}`);

  // Functions with sync values
  let v = 789;
  f = function num() {
    return v;
  };
  t.deepEqual(Try.try(f), new Success(v), `Try.try(${stringify(f)}) must be ${new Success(stringify(v))}`);

  v = {a: 1};
  f = function obj() {
    return v;
  };
  t.deepEqual(Try.try(f), new Success(v), `Try.try(${stringify(f)}) must be ${new Success(stringify(v))}`);

  // Functions with async values
  v = Promise.resolve('Later');
  f = function later() {
    return v;
  };
  t.deepEqual(Try.try(f), new Success(v), `Try.try(${stringify(f)}) must be ${new Success(stringify(v))}`);

  v = Promise.reject(new Error("Crunch"));
  f = function never() {
    return v;
  };
  t.deepEqual(Try.try(f), new Success(v), `Try.try(${stringify(f)}) must be ${new Success(stringify(v))}`);

  // Functions that throw errors
  let e = err;
  f = function boom() {
    throw e
  };
  t.deepEqual(Try.try(f), new Failure(e), `Try.try(${stringify(f)}) must be ${new Failure(stringify(e))}`);

  e = err2;
  f = function crash() {
    throw e
  };
  t.deepEqual(Try.try(f), new Failure(e), `Try.try(${stringify(f)}) must be ${new Failure(stringify(e))}`);

  t.end();
});

test('Success toPromise', t => {
  const p = success.toPromise();
  t.ok(p instanceof Promise, `success.toPromise() must be a Promise`);

  p.then(
    v => {
      t.equal(v, success.value, `resolved Promise value must be success.value`);

      // Use Promises.one to "reverse" the promise back into a Promise of a Try
      Promises.one(p).then(
        outcome => {
          t.ok(outcome.isSuccess(), `outcome must be a Success`);
          t.equal(outcome.value, success.value, `outcome.value must be success.value`);
          t.end();
        },
        err => {
          t.fail(`success.toPromise() followed by Promises.one(p) should NEVER have failed as a rejected promise`, err.stack);
          t.end();
        }
      );
    },
    e => {
      t.fail(`success.toPromise() should NOT have failed as a rejected promise`, e.stack);
      t.end();
    }
  );
});

test('Failure toPromise', t => {
  const p = failure.toPromise();
  t.ok(p instanceof Promise, `failure.toPromise() must be a Promise`);

  p.then(
    v => {
      t.fail(`failure.toPromise() should have failed as a rejected promise - value(${v}`);
      t.end();
    },
    e => {
      t.equal(e, failure.error, `rejected Promise error must be failure.error`);

      // Use Promises.one to "reverse" the promise back into a Promise of a Try
      Promises.one(p).then(
        outcome => {
          t.ok(outcome.isFailure(), `outcome must be a Failure`);
          t.equal(outcome.error, failure.error, `outcome.error must be failure.error`);
          t.end();
        },
        err => {
          t.fail(`failure.toPromise() followed by Promises.one(p) should NEVER have failed as a rejected promise`, err.stack);
          t.end();
        }
      );
    }
  );
});

test('Try toPromise', t => {
  const p = tried.toPromise();
  t.ok(p instanceof Promise, `tried.toPromise() must be a Promise`);

  p.then(
    v => {
      t.fail(`tied.toPromise() should have failed as a rejected promise - value(${v}`);
      t.end();
    },
    e => {
      t.deepEqual(e, new Error(Try.errorMessages.NoValueOrError), `rejected Promise error must be similar to ${new Error(Try.errorMessages.NoValueOrError)}`);

      // Use Promises.one to "reverse" the promise back into a Promise of a Try
      Promises.one(p).then(
        outcome => {
          t.ok(outcome.isFailure(), `outcome must be a Failure`);
          t.deepEqual(outcome.error, new Error(Try.errorMessages.NoValueOrError), `outcome.error must be similar to ${new Error(Try.errorMessages.NoValueOrError)}`);
          t.end();
        },
        err => {
          t.fail(`tried.toPromise() followed by Promises.one(p) should NEVER have failed as a rejected promise`, err.stack);
          t.end();
        }
      );
    }
  );
});



