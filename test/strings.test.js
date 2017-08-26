'use strict';

/**
 * Unit tests for core-functions/strings.js
 * @author Byron du Preez
 */

const test = require('tape');

const Strings = require('../strings');

const testing = require('./testing');
// const okNotOk = testing.okNotOk;
const checkOkNotOk = testing.checkOkNotOk;
// const checkMethodOkNotOk = testing.checkMethodOkNotOk;
// const equal = testing.equal;
const checkEqual = testing.checkEqual;
// const checkMethodEqual = testing.checkMethodEqual;

function wrap(value, wrapInString) {
  // noinspection JSPrimitiveTypeWrapperUsage
  return wrapInString && !(value instanceof String) ? new String(value) : value;
}

function toPrefix(value, wrapInString) {
  const wrapped = wrap(value, wrapInString);
  return wrapInString || value instanceof String ? `String(${Strings.stringify(value, true, false, true)}) = [${Strings.stringify(wrapped ? wrapped.valueOf() : value, true, false, true)}] ` : '';
}

function checkIsString(t, wrapInString) {
  function check(value, expected) {
    return checkOkNotOk(t, Strings.isString, [wrap(value, wrapInString)], expected, ' is a string', ' is NOT a string',
      toPrefix(value, wrapInString));
  }

  // undefined
  check(undefined, wrapInString);

  // null
  check(null, wrapInString); // '' ?

  // objects
  check({}, wrapInString);
  check({a: 1, b: 2}, wrapInString);

  // booleans
  check(true, wrapInString);
  check(false, wrapInString);

  // arrays
  check([], wrapInString);
  check([1, 2, 3], wrapInString);

  // special case numbers
  check(Number.POSITIVE_INFINITY, wrapInString);
  check(Number.NEGATIVE_INFINITY, wrapInString);
  check(NaN, wrapInString);

  // negative numbers
  check(Number.MIN_VALUE, wrapInString);
  check(Number.MIN_SAFE_INTEGER, wrapInString);
  check(-123.456, wrapInString);
  check(-1, wrapInString);

  // zero
  check(0, wrapInString);

  // positive numbers
  check(1, wrapInString);
  check(123.456, wrapInString);
  check(Number.MAX_SAFE_INTEGER, wrapInString);
  check(Number.MAX_VALUE, wrapInString);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, true);
  check(`${Number.MIN_SAFE_INTEGER}`, true);
  check('-123.456', true);
  check('-1', true);

  check('0', true);

  check('1', true);
  check('123.456', true);
  check(`${Number.MAX_SAFE_INTEGER}`, true);
  check(`${Number.MAX_VALUE}`, true);

  // strings not containing numbers
  check('', true);
  check('a', true);
  check('abc', true);
  check('ABC', true);
}

function checkIsBlank(t, wrapInString) {
  function check(value, expected) {
    return checkOkNotOk(t, Strings.isBlank, [wrap(value, wrapInString)], expected, ' is blank', ' is NOT blank',
      toPrefix(value, wrapInString));
  }

  // undefined
  check(undefined, !wrapInString); // blank ?

  // null
  check(null, !wrapInString); // blank ?

  // objects
  check({}, false);
  check({a: 1, b: 2}, false);

  // booleans
  check(true, false);
  check(false, !wrapInString); // blank ?

  // arrays
  check([], wrapInString); // [] -> '' wrapped
  check([1, 2, 3], false);

  // special case numbers
  check(Number.POSITIVE_INFINITY, false);
  check(Number.NEGATIVE_INFINITY, false);
  check(NaN, !wrapInString);

  // negative numbers
  check(Number.MIN_VALUE, false);
  check(Number.MIN_SAFE_INTEGER, false);
  check(-123.456, false);
  check(-1, false);

  // zero
  check(0, !wrapInString); // not sure if this should return blank for 0

  // positive numbers
  check(1, false);
  check(123.456, false);
  check(Number.MAX_SAFE_INTEGER, false);
  check(Number.MAX_VALUE, false);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, false);
  check(`${Number.MIN_SAFE_INTEGER}`, false);
  check('-123.456', false);
  check('-1', false);

  check('0', false);

  check('1', false);
  check('123.456', false);
  check(`${Number.MAX_SAFE_INTEGER}`, false);
  check(`${Number.MAX_VALUE}`, false);

  // strings containing only whitespace
  check('', true);
  check(' ', true);
  check('\n', true);
  check('\r', true);
  check('\t', true);
  check('      ', true);
  check('  \n  ', true);
  check('  \r  ', true);
  check('  \t  ', true);
  check(' \n \r \t \n \r \t ', true);

  // strings not containing numbers
  check('a', false);
  check('abc', false);
  check('ABC', false);
}

function checkIsNotBlank(t, wrapInString) {
  function check(value, expected) {
    return checkOkNotOk(t, Strings.isNotBlank, [wrap(value, wrapInString)], expected, ' is not blank', ' is blank',
      toPrefix(value, wrapInString));
  }

  // undefined
  check(undefined, wrapInString); // blank ?

  // null
  check(null, wrapInString); // blank ?

  // objects
  check({}, true);
  check({a: 1, b: 2}, true);

  // booleans
  check(true, true);
  check(false, wrapInString); // blank ?

  // arrays
  check([], !wrapInString); // [] -> '' wrapped
  check([1, 2, 3], true);

  // special case numbers
  check(Number.POSITIVE_INFINITY, true);
  check(Number.NEGATIVE_INFINITY, true);
  check(NaN, wrapInString);

  // negative numbers
  check(Number.MIN_VALUE, true);
  check(Number.MIN_SAFE_INTEGER, true);
  check(-123.456, true);
  check(-1, true);

  // zero
  check(0, wrapInString); // not sure if this should return blank for 0

  // positive numbers
  check(1, true);
  check(123.456, true);
  check(Number.MAX_SAFE_INTEGER, true);
  check(Number.MAX_VALUE, true);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, true);
  check(`${Number.MIN_SAFE_INTEGER}`, true);
  check('-123.456', true);
  check('-1', true);

  check('0', true);

  check('1', true);
  check('123.456', true);
  check(`${Number.MAX_SAFE_INTEGER}`, true);
  check(`${Number.MAX_VALUE}`, true);

  // strings containing only whitespace
  check('', false);
  check(' ', false);
  check('\n', false);
  check('\r', false);
  check('\t', false);
  check('      ', false);
  check('  \n  ', false);
  check('  \r  ', false);
  check('  \t  ', false);
  check(' \n \r \t \n \r \t ', false);

  // strings not containing numbers
  check('a', true);
  check('abc', true);
  check('ABC', true);
}

function checkStringify(t, wrapInString) {
  function check(value, expected) {
    return checkEqual(t, Strings.stringify, [wrap(value, wrapInString)], expected, toPrefix(value, wrapInString));
  }

  function checkWithArgs(value, useToStringForErrors, avoidToJSONMethods, quoteStrings, expected) {
    return checkEqual(t, Strings.stringify, [wrap(value, wrapInString), useToStringForErrors, avoidToJSONMethods, quoteStrings], expected, toPrefix(value, wrapInString));
  }

  // undefined
  check(undefined, 'undefined');

  // null
  check(null, 'null');

  // objects
  check({}, wrapInString ? '[object Object]' : '{}');
  check({a: 1, b: 2}, wrapInString ? '[object Object]' : JSON.stringify({a: 1, b: 2}));
  check({a: 1, b: 2, o: {c: 'C'}}, wrapInString ? '[object Object]' : JSON.stringify({a: 1, b: 2, o: {c: 'C'}}));

  // booleans
  check(true, 'true');
  check(false, 'false');

  // arrays
  check([], wrapInString ? '' : '[]');
  check([1, 2, 3], wrapInString ? '1,2,3' : '[1, 2, 3]');

  // special case numbers
  check(Number.POSITIVE_INFINITY, `${Number.POSITIVE_INFINITY}`);
  check(Number.NEGATIVE_INFINITY, `${Number.NEGATIVE_INFINITY}`);
  check(NaN, 'NaN');

  // negative numbers
  check(Number.MIN_VALUE, `${Number.MIN_VALUE}`);
  check(Number.MIN_SAFE_INTEGER, `${Number.MIN_SAFE_INTEGER}`);
  check(-123.456, '-123.456');
  check(-1, '-1');

  // zero
  check(0, '0'); // not sure if this should return blank for 0

  // positive numbers
  check(1, '1');
  check(123.456, '123.456');
  check(Number.MAX_SAFE_INTEGER, `${Number.MAX_SAFE_INTEGER}`);
  check(Number.MAX_VALUE, `${Number.MAX_VALUE}`);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, `${Number.MIN_VALUE}`);
  check(`${Number.MIN_SAFE_INTEGER}`, `${Number.MIN_SAFE_INTEGER}`);
  check('-123.456', '-123.456');
  check('-1', '-1');

  check('0', '0');

  check('1', '1');
  check('123.456', '123.456');
  check(`${Number.MAX_SAFE_INTEGER}`, `${Number.MAX_SAFE_INTEGER}`);
  check(`${Number.MAX_VALUE}`, `${Number.MAX_VALUE}`);

  // strings containing only whitespace
  check('', '');
  check(' ', ' ');
  check('\n', '\n');
  check('\r', '\r');
  check('\t', '\t');
  check('      ', '      ');
  check('  \n  ', '  \n  ');
  check('  \r  ', '  \r  ');
  check('  \t  ', '  \t  ');
  check(' \n \r \t \n \r \t ', ' \n \r \t \n \r \t ');

  // strings not containing numbers
  check('a', 'a');
  check('abc', 'abc');
  check('ABC', 'ABC');
  checkWithArgs('', false, false, true, '""');
  checkWithArgs('ABC', false, false, true, '"ABC"');

  // errors
  check(new Error('Planned error'), wrapInString ? 'Error: Planned error' : '{"name":"Error","message":"Planned error"}');
  checkWithArgs(new Error('Planned error'), true, false, false, wrapInString ? 'Error: Planned error' : '[Error: Planned error]');

  // circular objects
  const circular0 = {a: 1, o: {b: 2}};
  circular0.circular = circular0;
  circular0.o.oAgain = circular0.o;
  check(circular0, wrapInString ? '[object Object]' : '{"a":1,"o":{"b":2,"oAgain":[Circular: this.o]},"circular":[Circular: this]}');

  const circular1 = {a: 1, b: 2, o: {c: 'C', p: {d: 'D'}}};
  circular1.thisAgain = circular1;
  circular1.o.thisAgain = circular1;
  circular1.o.p.thisAgain = circular1;

  circular1.oAgain = circular1.o;
  circular1.o.oAgain = circular1.o;
  circular1.o.p.oAgain = circular1.o;

  circular1.pAgain = circular1.o.p;
  circular1.o.pAgain = circular1.o.p;
  circular1.o.p.pAgain = circular1.o.p;
  check(circular1, wrapInString ? '[object Object]' : '{"a":1,"b":2,"o":{"c":"C","p":{"d":"D","thisAgain":[Circular: this],"oAgain":[Circular: this.o],"pAgain":[Circular: this.o.p]},"thisAgain":[Circular: this],"oAgain":[Circular: this.o],"pAgain":[Reference: this.o.p]},"thisAgain":[Circular: this],"oAgain":[Reference: this.o],"pAgain":[Reference: this.o.p]}');

  // circular arrays with circular objects
  const array2 = ['a', {}, 123];
  const circular2 = array2[1];
  circular2.thisAgain = array2;
  circular2.this1Again = circular2;
  array2.push(array2);

  check(array2, wrapInString ? 'a,[object Object],123,' : '["a", {"thisAgain":[Circular: this],"this1Again":[Circular: this[1]]}, 123, [Circular: this]]');

  const array3 = ['x', {y: 'Y'}, 123];
  const circular3 = array3[1];
  circular3.thisAgain = circular3;
  circular3.arrayAgain = array3;
  array3.push(array3);

  check(circular3, wrapInString ? '[object Object]' : '{"y":"Y","thisAgain":[Circular: this],"arrayAgain":["x", [Circular: this], 123, [Circular: this.arrayAgain]]}');

  // circular objects with circular arrays
  const array4 = ['b', {z: "Z"}, 456];
  const circular4 = {a: 'A', array: array4};
  circular4.thisAgain = circular4;
  circular4.arrayAgain = circular4.array;

  array4[1].thisAgain = circular4;
  array4[1].arrayAgain = circular4.array;

  array4.push(array4);

  check(circular4, wrapInString ? '[object Object]' : '{"a":"A","array":["b", {"z":"Z","thisAgain":[Circular: this],"arrayAgain":[Circular: this.array]}, 456, [Circular: this.array]],"thisAgain":[Circular: this],"arrayAgain":[Reference: this.array]}');

  const array5 = ['c', {x: "X"}, 789];
  const circular5 = {a: 'A', array: array5};
  array5[1].thisAgain = array5;
  array5[1].this1Again = array5[1];
  array5[1].circular5 = circular5;

  circular5.thisAgain = array5;
  circular5.this1Again = array5[1];
  circular5.this1Circular5Again = circular5;
  circular5.this1Circular5ArrayAgain = circular5.array;

  array5.push(array5);

  check(array5, wrapInString ? 'c,[object Object],789,' : '["c", {"x":"X","thisAgain":[Circular: this],"this1Again":[Circular: this[1]],"circular5":{"a":"A","array":[Circular: this],"thisAgain":[Circular: this],"this1Again":[Circular: this[1]],"this1Circular5Again":[Circular: this[1].circular5],"this1Circular5ArrayAgain":[Circular: this]}}, 789, [Circular: this]]');

  // reference-only objects
  const array6 = [{a:1}, {b:"B"}];
  const references6 = {
    array6: array6,
    array6Again: array6,
    array6aOnly: [array6[0]],
    array6bOnly: [array6[1]],
    diffArrayWithSameElems: [array6[0], array6[1]]
  };
  check(references6, wrapInString ? '[object Object]' : '{"array6":[{"a":1}, {"b":"B"}],"array6Again":[Reference: this.array6],"array6aOnly":[[Reference: this.array6[0]]],"array6bOnly":[[Reference: this.array6[1]]],"diffArrayWithSameElems":[[Reference: this.array6[0]], [Reference: this.array6[1]]]}');

  // Functions
  function func() {
  }
  //check(func, wrapInString ? 'function func() {}' : '[Function: func]'); // this test breaks if function func() {} is reformatted to multi-line
  if (wrapInString) {
    t.ok(Strings.stringify(wrap(func, wrapInString)).startsWith('function func('), `stringify(new String(func)) -> ${Strings.stringify(func)} must start with 'function func('`);
  } else {
    check(func, '[Function: func]');
  }
  check({fn: func}, wrapInString ? '[object Object]' : '{"fn":[Function: func]}');

  // undefined object properties
  check({a: undefined}, wrapInString ? '[object Object]' : '{"a":undefined}');

  // objects with toJSON methods
  const task = {
    name: "Task1",
    definition: {
      name: "Task1",
      executable: true,
      execute: () => { },
      subTaskDefs: [],
      parent: undefined
    },
    executable: true,
    execute: () => { },
      _subTasks: [],
    _subTasksByName: {},
    parent: undefined,
    _state: {
      code: "Unstarted",
      completed: false,
      error: undefined,
      rejected: false,
      reason: undefined
    },
    _attempts: 1,
    _lastExecutedAt: "2016-12-01T05:09:09.119Z",
    _result: undefined,
    _error: undefined,
    _slaveTasks: [],
    _frozen: true,
    toJSON: function toJSON() {
      return {
        name: this.name,
        executable: this.executable,
        state: this._state,
        attempts: this._attempts,
        lastExecutedAt: this._lastExecutedAt,
        subTasks: this._subTasks
      };
    }
  };
  // default behaviour must use toJSON method
  check(task, wrapInString ? '[object Object]' : '{"name":"Task1","executable":true,"state":{"code":"Unstarted","completed":false,"rejected":false},"attempts":1,"lastExecutedAt":"2016-12-01T05:09:09.119Z","subTasks":[]}');

  // explicit !avoidToJSONMethods must use toJSON method
  checkWithArgs(task, false, false, false, wrapInString ? '[object Object]' : '{"name":"Task1","executable":true,"state":{"code":"Unstarted","completed":false,"rejected":false},"attempts":1,"lastExecutedAt":"2016-12-01T05:09:09.119Z","subTasks":[]}');

  // explicit avoidToJSONMethods must NOT use toJSON method
  if (process && process.version) {
    if (process.version.startsWith("4.3.")) {
      checkWithArgs(task, false, true, false, wrapInString ? '[object Object]' : '{"name":"Task1","definition":{"name":"Task1","executable":true,"execute":[Function: anonymous],"subTaskDefs":[],"parent":undefined},"executable":true,"execute":[Function: anonymous],"_subTasks":[],"_subTasksByName":{},"parent":undefined,"_state":{"code":"Unstarted","completed":false,"error":undefined,"rejected":false,"reason":undefined},"_attempts":1,"_began":"2016-12-01T05:09:09.119Z","_result":undefined,"_error":undefined,"_slaveTasks":[],"_frozen":true,"toJSON":[Function: toJSON]}');
    } else if (process.version.startsWith("6.10.")) {
      checkWithArgs(task, false, true, false, wrapInString ? '[object Object]' : '{"name":"Task1","definition":{"name":"Task1","executable":true,"execute":[Function: execute],"subTaskDefs":[],"parent":undefined},"executable":true,"execute":[Function: execute],"_subTasks":[],"_subTasksByName":{},"parent":undefined,"_state":{"code":"Unstarted","completed":false,"error":undefined,"rejected":false,"reason":undefined},"_attempts":1,"_began":"2016-12-01T05:09:09.119Z","_result":undefined,"_error":undefined,"_slaveTasks":[],"_frozen":true,"toJSON":[Function: toJSON]}');
    }
  }
}

function checkTrim(t, wrapInString) {
  function check(value, expected) {
    return checkEqual(t, Strings.trim, [wrap(value, wrapInString)], expected, toPrefix(value, wrapInString));
  }

  // undefined
  check(undefined, wrapInString ? "undefined" : undefined);

  // null
  check(null, wrapInString ? "null" : null);

  // objects
  check({}, wrapInString ? "[object Object]" : {});
  check({a: 1, b: 2}, wrapInString ? "[object Object]" : {a: 1, b: 2});

  // booleans
  check(true, wrapInString ? "true" : true);
  check(false, wrapInString ? "false" : false);

  // arrays
  check([], wrapInString ? "" : []);
  check([1, 2, 3], wrapInString ? "1,2,3" : [1, 2, 3]);

  // special case numbers
  check(Number.POSITIVE_INFINITY, wrapInString ? `${Number.POSITIVE_INFINITY}` : Number.POSITIVE_INFINITY);
  check(Number.NEGATIVE_INFINITY, wrapInString ? `${Number.NEGATIVE_INFINITY}` : Number.NEGATIVE_INFINITY);
  check(NaN, wrapInString ? 'NaN' : NaN);

  // negative numbers
  check(Number.MIN_VALUE, wrapInString ? `${Number.MIN_VALUE}` : Number.MIN_VALUE);
  check(Number.MIN_SAFE_INTEGER, wrapInString ? `${Number.MIN_SAFE_INTEGER}` : Number.MIN_SAFE_INTEGER);
  check(-123.456, wrapInString ? '-123.456' : -123.456);
  check(-1, wrapInString ? '-1' : -1);

  // zero
  check(0, wrapInString ? '0' : 0); // not sure if this should return blank for 0

  // positive numbers
  check(1, wrapInString ? '1' : 1);
  check(123.456, wrapInString ? '123.456' : 123.456);
  check(Number.MAX_SAFE_INTEGER, wrapInString ? `${Number.MAX_SAFE_INTEGER}` : Number.MAX_SAFE_INTEGER);
  check(Number.MAX_VALUE, wrapInString ? `${Number.MAX_VALUE}` : Number.MAX_VALUE);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, `${Number.MIN_VALUE}`);
  check(`${Number.MIN_SAFE_INTEGER}`, `${Number.MIN_SAFE_INTEGER}`);
  check('-123.456', '-123.456');
  check('-1', '-1');

  check('0', '0');

  check('1', '1');
  check('123.456', '123.456');
  check(`${Number.MAX_SAFE_INTEGER}`, `${Number.MAX_SAFE_INTEGER}`);
  check(`${Number.MAX_VALUE}`, `${Number.MAX_VALUE}`);

  // strings containing only whitespace
  check('', '');
  check(' ', '');
  check('\n', '');
  check('\r', '');
  check('\t', '');
  check('      ', '');
  check('  \n  ', '');
  check('  \r  ', '');
  check('  \t  ', '');
  check(' \n \r \t \n \r \t ', '');

  // strings not containing numbers
  check('a', 'a');
  check('abc', 'abc');
  check('ABC', 'ABC');
  check('   ABC   ', 'ABC');
  check('  A B C  ', 'A B C');
}

function checkTrimOrEmpty(t, wrapInString) {
  function check(value, expected) {
    return checkEqual(t, Strings.trimOrEmpty, [wrap(value, wrapInString)], expected, toPrefix(value, wrapInString));
  }

  // undefined
  check(undefined, wrapInString ? "undefined" : '');

  // null
  check(null, wrapInString ? "null" : '');

  // objects
  check({}, wrapInString ? "[object Object]" : {});
  check({a: 1, b: 2}, wrapInString ? "[object Object]" : {a: 1, b: 2});

  // booleans
  check(true, wrapInString ? "true" : true);
  check(false, wrapInString ? "false" : false);

  // arrays
  check([], wrapInString ? "" : []);
  check([1, 2, 3], wrapInString ? "1,2,3" : [1, 2, 3]);

  // special case numbers
  check(Number.POSITIVE_INFINITY, wrapInString ? `${Number.POSITIVE_INFINITY}` : Number.POSITIVE_INFINITY);
  check(Number.NEGATIVE_INFINITY, wrapInString ? `${Number.NEGATIVE_INFINITY}` : Number.NEGATIVE_INFINITY);
  check(NaN, wrapInString ? 'NaN' : NaN);

  // negative numbers
  check(Number.MIN_VALUE, wrapInString ? `${Number.MIN_VALUE}` : Number.MIN_VALUE);
  check(Number.MIN_SAFE_INTEGER, wrapInString ? `${Number.MIN_SAFE_INTEGER}` : Number.MIN_SAFE_INTEGER);
  check(-123.456, wrapInString ? '-123.456' : -123.456);
  check(-1, wrapInString ? '-1' : -1);

  // zero
  check(0, wrapInString ? '0' : 0); // not sure if this should return blank for 0

  // positive numbers
  check(1, wrapInString ? '1' : 1);
  check(123.456, wrapInString ? '123.456' : 123.456);
  check(Number.MAX_SAFE_INTEGER, wrapInString ? `${Number.MAX_SAFE_INTEGER}` : Number.MAX_SAFE_INTEGER);
  check(Number.MAX_VALUE, wrapInString ? `${Number.MAX_VALUE}` : Number.MAX_VALUE);

  // strings containing numbers
  check(`${Number.MIN_VALUE}`, `${Number.MIN_VALUE}`);
  check(`${Number.MIN_SAFE_INTEGER}`, `${Number.MIN_SAFE_INTEGER}`);
  check('-123.456', '-123.456');
  check('-1', '-1');

  check('0', '0');

  check('1', '1');
  check('123.456', '123.456');
  check(`${Number.MAX_SAFE_INTEGER}`, `${Number.MAX_SAFE_INTEGER}`);
  check(`${Number.MAX_VALUE}`, `${Number.MAX_VALUE}`);

  // strings containing only whitespace
  check('', '');
  check(' ', '');
  check('\n', '');
  check('\r', '');
  check('\t', '');
  check('      ', '');
  check('  \n  ', '');
  check('  \r  ', '');
  check('  \t  ', '');
  check(' \n \r \t \n \r \t ', '');

  // strings not containing numbers
  check('a', 'a');
  check('abc', 'abc');
  check('ABC', 'ABC');
  check('   ABC   ', 'ABC');
  check('  A B C  ', 'A B C');
}

test('isString on Strings', t => {
  checkIsString(t, true);
  t.end();
});

test('isString on strings', t => {
  checkIsString(t, false);
  t.end();
});

test('isBlank on Strings', t => {
  checkIsBlank(t, true);
  t.end();
});

test('isBlank on strings', t => {
  checkIsBlank(t, false);
  t.end();
});

test('isNotBlank on Strings', t => {
  checkIsNotBlank(t, true);
  t.end();
});

test('isNotBlank on strings', t => {
  checkIsNotBlank(t, false);
  t.end();
});

test('stringify on strings', t => {
  checkStringify(t, false);
  t.end();
});

test('stringify on Strings', t => {
  checkStringify(t, true);
  t.end();
});

test('trim on strings', t => {
  checkTrim(t, false);
  t.end();
});

test('trim on Strings', t => {
  checkTrim(t, true);
  t.end();
});

test('trimOrEmpty on strings', t => {
  checkTrimOrEmpty(t, false);
  t.end();
});

test('trimOrEmpty on Strings', t => {
  checkTrimOrEmpty(t, true);
  t.end();
});

test('nthIndexOf', t => {
  const s = 'arn:aws:dynamodb:us-east-1:111111111111:table/test/stream/2020-10-10T08:18:22.385';
  //         0----+----1----+----2----+----3----+----4----+----5----+----6----+----7----+----8
  t.equal(Strings.nthIndexOf(s, ':', -1), -1, `nthIndexOf(':', -1) must be -1`);
  t.equal(Strings.nthIndexOf(s, ':', 0), -1, `nthIndexOf(':', 0) must be -1`);
  t.equal(Strings.nthIndexOf(s, ':', 1), 3, `nthIndexOf(':', 1) must be 3`);
  t.equal(Strings.nthIndexOf(s, ':', 2), 7, `nthIndexOf(':', 2) must be 7`);
  t.equal(Strings.nthIndexOf(s, ':', 3), 16, `nthIndexOf(':', 3) must be 16`);
  t.equal(Strings.nthIndexOf(s, ':', 4), 26, `nthIndexOf(':', 4) must be 26`);
  t.equal(Strings.nthIndexOf(s, ':', 5), 39, `nthIndexOf(':', 5) must be 39`);
  t.equal(Strings.nthIndexOf(s, ':', 6), 71, `nthIndexOf(':', 6) must be 71`);
  t.equal(Strings.nthIndexOf(s, ':', 7), 74, `nthIndexOf(':', 7) must be 74`);
  t.equal(Strings.nthIndexOf(s, ':', 8), -1, `nthIndexOf(':', 8) must be -1`);
  t.equal(Strings.nthIndexOf(s, ':', 9), -1, `nthIndexOf(':', 9) must be -1`);

  t.equal(Strings.nthIndexOf(s, 'table', 0), -1, `nthIndexOf('table', 0) must be -1`);
  t.equal(Strings.nthIndexOf(s, 'table', 1), 40, `nthIndexOf('table', 1) must be 40`);
  t.equal(Strings.nthIndexOf(s, 'table', 2), -1, `nthIndexOf('table', 2) must be -1`);

  t.equal(Strings.nthIndexOf(s, '/', 0), -1, `nthIndexOf('/', 0) must be -1`);
  t.equal(Strings.nthIndexOf(s, '/', 1), 45, `nthIndexOf('/', 1) must be 45`);
  t.equal(Strings.nthIndexOf(s, '/', 2), 50, `nthIndexOf('/', 2) must be 50`);
  t.equal(Strings.nthIndexOf(s, '/', 3), 57, `nthIndexOf('/', 3) must be 57`);
  t.equal(Strings.nthIndexOf(s, '/', 4), -1, `nthIndexOf('/', 4) must be -1`);

  t.equal(Strings.nthIndexOf(s, '', -1), -1, `nthIndexOf('', -1) must be -1`);
  t.equal(Strings.nthIndexOf(s, '', 0), -1, `nthIndexOf('', 0) must be -1`);
  t.equal(Strings.nthIndexOf(s, '', 1), 0, `nthIndexOf('', 1) must be 0`);
  t.equal(Strings.nthIndexOf(s, '', 2), 0, `nthIndexOf('', 2) must be 0`);
  t.equal(Strings.nthIndexOf(s, '', 100), 0, `nthIndexOf('', 100) must be 0`);

  t.end();
});

test('stringify must survive a broken getter', t => {
  const o = {x: {reading: true}, get y() { return this.x.reading; }};
  let expected = '{"x":{"reading":true},"y":true}';
  t.equal(Strings.stringify(o), expected, `stringify({x: {reading: true}, get y() { return this.x.reading; }}) must be '${expected}'`);

  // Now break the 'y' getter
  o.x = null;
  t.throws(() => o.y, TypeError, 'o.y must throw a TypeError');
  t.throws(() => o['y'], TypeError, `o['y'] must throw a TypeError`);

  // but regardless, stringify must NOT break
  expected = '{"x":null,"y":[Getter failed - TypeError: Cannot read property \'reading\' of null]}';
  t.equal(Strings.stringify(o), expected, `stringify({x: null, get y() { return this.x.reading; }}) must be '${expected}'`);

  t.end();
});