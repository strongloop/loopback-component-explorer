'use strict';

var modelHelper = require('../lib/model-helper');
var expect = require('chai').expect;

describe('model-helper', function() {
  describe('properly converts LDL definitions to swagger types', function() {
    it('converts constructor types', function() {
      var def = buildSwaggerModels({
        str: String, // 'string'
        num: Number, // {type: 'number', format: 'double'}
        date: Date,  // {type: 'string', format: 'date'}
        bool: Boolean, // 'boolean'
        buf: Buffer // {type: 'string', format: 'byte'}
      });
      var props = def.properties;
      expect(props.str).to.eql({ type: 'string' });
      expect(props.num).to.eql({ type: 'number', format: 'double' });
      expect(props.date).eql({ type: 'string', format: 'date' });
      expect(props.bool).to.eql({ type: 'boolean' });
      expect(props.buf).to.eql({ type: 'string', format: 'byte' });
    });
    it('converts string types', function() {
      var def = buildSwaggerModels({
        str: 'string', // 'string'
        num: 'number', // {type: 'number', format: 'double'}
        date: 'date',  // {type: 'string', format: 'date'}
        bool: 'boolean', // 'boolean'
        buf: 'buffer' // {type: 'string', format: 'byte'}
      });
      var props = def.properties;
      expect(props.str).to.eql({ type: 'string' });
      expect(props.num).to.eql({ type: 'number', format: 'double' });
      expect(props.date).eql({ type: 'string', format: 'date' });
      expect(props.bool).to.eql({ type: 'boolean' });
      expect(props.buf).to.eql({ type: 'string', format: 'byte' });
    });
    describe('array definitions', function() {
      // There are three types we want to checK:
      // [String]
      // ["string"],
      // [{type: String, ...}]
      it('converts [Constructor] type', function() {
        var def = buildSwaggerModels({
          array: [String]
        });
        var props = def.properties;
        expect(props.array).to.eql({ type: 'array', items: { 
          type: 'string' 
        }});
      });

      it('converts ["string"] type', function() {
        var def = buildSwaggerModels({
          array: ['string']
        });
        var props = def.properties;
        expect(props.array).to.eql({ type: 'array', items: { 
          type: 'string' 
        }});
      });

      it('converts [{type: "string", length: 64}] type', function() {
        var def = buildSwaggerModels({
          array: [{type: 'string', length: 64}]
        });
        var props = def.properties;
        expect(props.array).to.eql({ type: 'array', items: { 
          type: 'string',
          length: 64
        }});
      });

      it('converts [{type: "date"}] type (with `format`)', function() {
        var def = buildSwaggerModels({
          array: [{type: 'date'}]
        });
        var props = def.properties;
        expect(props.array).to.eql({ type: 'array', items: {
          type: 'string', format: 'date'
        }});
      });

      it('converts [] type', function() {
        var def = buildSwaggerModels({
          array: []
        });
        var prop = def.properties.array;
        expect(prop).to.eql({ type: 'array' });
      });

      it('converts [undefined] type', function() {
        var def = buildSwaggerModels({
          // This value is somehow provided by loopback-boot called from
          // loopback-workspace.
          array: [undefined]
        });
        var prop = def.properties.array;
        expect(prop).to.eql({ type: 'array' });
      });

      it('converts "array" type', function() {
        var def = buildSwaggerModels({
          array: 'array'
        });
        var prop = def.properties.array;
        expect(prop).to.eql({ type: 'array' });
      });
    });
  });
  describe('related models', function() {
    it('should include related models', function() {
      var defs = buildSwaggerModelsWithRelations({
        str: String // 'string'
      });
      expect(defs).has.property('testModel');
      expect(defs).has.property('relatedModel');
    });
  });
});

// Simulates the format of a remoting class.
function buildSwaggerModels(model) {
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
  return modelHelper.generateModelDefinition(aClass.ctor, {}).testModel;
}

function buildSwaggerModelsWithRelations(model) {
  Object.keys(model).forEach(function(name) {
    model[name] = {type: model[name]};
  });
  // Mock up the related model
  var relatedModel = {
    definition: {
      name: 'relatedModel',
      properties: {
        fk: String
      }
    }
  };
  var aClass = {
    ctor: {
      definition: {
        name: 'testModel',
        properties: model
      },
      // Mock up relations
      relations: {
        other: {
          modelTo: relatedModel
        }
      }
    }
  };
  return modelHelper.generateModelDefinition(aClass.ctor, {});
}

