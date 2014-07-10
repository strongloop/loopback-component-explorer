'use strict';

var modelHelper = require('../lib/model-helper');
var expect = require('chai').expect;

describe('model-helper', function() {
  describe('properly converts LDL definitions to swagger types', function() {
    it('converts constructor types', function() {
      var def = getDefinition({
        str: String, // 'string'
        num: Number, // {type: 'number', format: 'double'}
        date: Date,  // {type: 'string', format: 'date'}
        bool: Boolean, // 'boolean'
        buf: Buffer // {type: 'string', format: 'byte'}
      });
      var props = def.properties;
      expect(props.str.type).to.equal('string');
      expect(props.num.type).to.equal('number');
      expect(props.num.format).to.equal('double');
      expect(props.date.type).to.equal('string');
      expect(props.bool.type).to.equal('boolean');
      expect(props.buf.type).to.equal('string');
    });
    it('converts string types', function() {
      var def = getDefinition({
        str: 'string', // 'string'
        num: 'number', // {type: 'number', format: 'double'}
        date: 'date',  // {type: 'string', format: 'date'}
        bool: 'boolean', // 'boolean'
        buf: 'buffer' // {type: 'string', format: 'byte'}
      });
      var props = def.properties;
      expect(props.str.type).to.equal('string');
      expect(props.num.type).to.equal('number');
      expect(props.num.format).to.equal('double');
      expect(props.date.type).to.equal('string');
      expect(props.bool.type).to.equal('boolean');
      expect(props.buf.type).to.equal('string');
    });
    describe('array definitions', function() {
      // There are three types we want to checK:
      // [String]
      // ["string"],
      // [{type: String, ...}]
      it('converts [Constructor] type', function() {
        var def = getDefinition({
          array: [String]
        });
        var props = def.properties;
        expect(props.array.type).to.equal('array');
        expect(props.array.items.type).to.equal('string');
      });

      it('converts ["string"] type', function() {
        var def = getDefinition({
          array: ['string']
        });
        var props = def.properties;
        expect(props.array.type).to.equal('array');
        expect(props.array.items.type).to.equal('string');
      });

      it('converts [{type: "string", length: 64}] type', function() {
        var def = getDefinition({
          array: [{type: 'string', length: 64}]
        });
        var props = def.properties;
        expect(props.array.type).to.equal('array');
        expect(props.array.items.type).to.equal('string');
      });

      it('converts [{type: "date"}] type (with `format`)', function() {
        var def = getDefinition({
          array: [{type: 'date'}]
        });
        var props = def.properties;
        expect(props.array.type).to.equal('array');
        expect(props.array.items.type).to.equal('string');
        expect(props.array.items.format).to.equal('date');
      });
    });
  });
});

// Simulates the format of a rmeoting class.
function getDefinition(model) {
  Object.keys(model).forEach(function(name) {
    model[name] = {type: model[name]};
  });
  var aClass = {
    ctor: {
      definition: {
        name: 'testModel',
        properties: model
      }
    }
  };
  return modelHelper.generateModelDefinition(aClass).testModel;
}
