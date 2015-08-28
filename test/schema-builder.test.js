'use strict';

var schemaBuilder = require('../lib/schema-builder');
var TypeRegistry = require('../lib/type-registry');
var format = require('util').format;
var _defaults = require('lodash').defaults;
var loopback = require('loopback');
var expect = require('chai').expect;

var ANY_TYPE = { $ref: '#/definitions/x-any' };

describe('schema-builder', function() {
  describeTestCases('for constructor types', [
    { in: String, out: { type: 'string' } },
    { in: Number, out: { type: 'number', format: 'double' } },
    { in: Date, out: { type: 'string', format: 'date' } },
    { in: Boolean, out: { type: 'boolean' } },
    { in: Buffer, out: { type: 'string', format: 'byte' } }
  ]);

  describeTestCases('for string types', [
    { in: 'string', out: { type: 'string' } },
    { in: 'number', out: { type: 'number', format: 'double' } },
    { in: 'date', out: { type: 'string', format: 'date' } },
    { in: 'boolean', out: { type: 'boolean' } },
    { in: 'buffer', out: { type: 'string', format: 'byte' } },
  ]);

  describeTestCases('for array definitions', [
    { in: [String],
      out: { type: 'array', items: { type: 'string' } } },
    { in: ['string'],
      out: { type: 'array', items: { type: 'string' } } },
    { in: [{ type: 'string', maxLength: 64 }],
      out: { type: 'array', items: { type: 'string', maxLength: 64 } } },
    { in: [{ type: 'date' }],
      out: { type: 'array', items: { type: 'string', format: 'date' } } },
    { in: [],
      out: { type: 'array', items: ANY_TYPE } },
    // This value is somehow provided by loopback-boot called from
    // loopback-workspace.
    { in: [undefined],
      out: { type: 'array', items: ANY_TYPE } },
    { in: 'array',
      out: { type: 'array', items: ANY_TYPE } },
  ]);

  describeTestCases('for complex types', [
    // Note: User is a built-in loopback model
    { in: loopback.User,
      out: { $ref: '#/definitions/User' } },
    { in: { type: 'User' },
      out: { $ref: '#/definitions/User' } },
    // Anonymous type
    { in: { type: { foo: 'string', bar: 'number' } },
      out: { type: 'object' } },
  ]);

  describeTestCases('for extra metadata', [
    { in: { type: String, doc: 'a-description' },
      out: { type: 'string', description: 'a-description' } },
    { in: { type: String, doc: ['line1', 'line2'] },
      out: { type: 'string', description: 'line1\nline2' } },
    { in: { type: String, description: 'a-description' },
      out: { type: 'string', description: 'a-description' } },
    { in: { type: String, description: ['line1', 'line2'] },
      out: { type: 'string', description: 'line1\nline2' } },
    { in: { type: String, required: true },
      out: { type: 'string' } }, // the flag required is handled specially
    { in: { type: String, length: 10 },
      out: { type: 'string', maxLength: 10 } },
  ]);

  function describeTestCases(name, testCases) {
    describe(name, function() {
      testCases.forEach(function(tc) {
        var inStr = formatType(tc.in);
        var outStr = formatType(tc.out);
        it(format('converts %s to %s', inStr, outStr), function() {
          var registry = new TypeRegistry();
          var schema = schemaBuilder.buildFromLoopBackType(tc.in, registry);
          expect(schema).to.eql(tc.out);
        });
      });
    });
  }

  function formatType(type) {
    if (Array.isArray(type))
      return '[' + type.map(formatType) + ']';

    if (typeof type === 'function')
      return type.modelName ?
        'model ' + type.modelName :
        'ctor ' + type.name;

    return format(type);
  }

});
