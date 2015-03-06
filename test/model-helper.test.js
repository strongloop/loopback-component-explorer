'use strict';

var modelHelper = require('../lib/model-helper');
var _defaults = require('lodash').defaults;
var loopback = require('loopback');
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
        expect(prop).to.eql({
          type: 'array',
          items: { type: 'any' }
        });
      });

      it('converts [undefined] type', function() {
        var def = buildSwaggerModels({
          // This value is somehow provided by loopback-boot called from
          // loopback-workspace.
          array: [undefined]
        });
        var prop = def.properties.array;
        expect(prop).to.eql({ type: 'array', items: { type: 'any' } });
      });

      it('converts "array" type', function() {
        var def = buildSwaggerModels({
          array: 'array'
        });
        var prop = def.properties.array;
        expect(prop).to.eql({ type: 'array', items: { type: 'any' } });
      });

      it('converts Model type', function() {
        var Address = loopback.createModel('Address', {street: String});
        var def = buildSwaggerModels({
          str: String,
          address: Address
        });
        var prop = def.properties.address;
        expect(prop).to.eql({ type: 'Address' });
      });

    });

    it('converts model property field `doc`', function() {
      var def = buildSwaggerModels({
        name: { type: String, doc: 'a-description' }
      });
      var nameProp = def.properties.name;
      expect(nameProp).to.have.property('description', 'a-description');
    });

    it('converts model property field `description`', function() {
      var def = buildSwaggerModels({
        name: { type: String, description: 'a-description' }
      });
      var nameProp = def.properties.name;
      expect(nameProp).to.have.property('description', 'a-description');
    });

    it('converts model field `description`', function() {
      var def = buildSwaggerModels({}, { description: 'a-description' });
      expect(def).to.have.property('description', 'a-description');
    });
  });

  describe('related models', function() {
    it('should include related models', function () {
      var defs = buildSwaggerModelsWithRelations({
        str: String // 'string'
      });
      expect(defs).has.property('testModel');
      expect(defs).has.property('relatedModel');
    });

    it('should include nesting models', function() {
      var Model2 = loopback.createModel('Model2', {street: String});
      var Model1 = loopback.createModel('Model1', {
        str: String, // 'string'
        address: Model2
      });
      var defs = modelHelper.generateModelDefinition(Model1, {});
      expect(defs).has.property('Model1');
      expect(defs).has.property('Model2');
    });

    it('should include used models', function() {
      var Model4 = loopback.createModel('Model4', {street: String});
      var Model3 = loopback.createModel('Model3', {
        str: String, // 'string'
      }, {models: {model4: 'Model4'}});
      var defs = modelHelper.generateModelDefinition(Model3, {});
      expect(defs).has.property('Model3');
      expect(defs).has.property('Model4');
    });

    it('should include nesting models in array', function() {
      var Model6 = loopback.createModel('Model6', {street: String});
      var Model5 = loopback.createModel('Model5', {
        str: String, // 'string'
        addresses: [Model6]
      });
      var defs = modelHelper.generateModelDefinition(Model5, {});
      expect(defs).has.property('Model5');
      expect(defs).has.property('Model6');
    });

    // https://github.com/strongloop/loopback-explorer/issues/49
    it('should work if Array class is extended and no related models are found',
      function() {
        var Model7 = loopback.createModel('Model7', {street: String});
        Array.prototype.customFunc = function() {
        };
        var defs = modelHelper.generateModelDefinition(Model7, {});
        expect(defs).has.property('Model7');
        expect(Object.keys(defs)).has.property('length', 1);
      });

    // https://github.com/strongloop/loopback-explorer/issues/71
    it('should skip unknown types', function() {
      var Model8 = loopback.createModel('Model8', {
        patient: {
          model: 'physician',
          type: 'hasMany',
          through: 'appointment'
        }
      });
      var defs = modelHelper.generateModelDefinition(Model8, {});
      expect(Object.keys(defs)).to.not.contain('hasMany');
    });
  });

  describe('hidden properties', function() {
    it('should hide properties marked as "hidden"', function() {
      var aClass = createModelCtor({
        visibleProperty: 'string',
        hiddenProperty: 'string'
      });
      aClass.ctor.definition.settings = {
        hidden: ['hiddenProperty']
      };
      var def = modelHelper.generateModelDefinition(aClass.ctor, {}).testModel;
      expect(def.properties).to.not.have.property('hiddenProperty');
      expect(def.properties).to.have.property('visibleProperty');
    });
  });

  describe('getPropType', function() {
    it('converts anonymous object types', function() {
      var type = modelHelper.getPropType({ name: 'string', value: 'string' });
      expect(type).to.eql('object');
    });
  });
});

// Simulates the format of a remoting class.
function buildSwaggerModels(modelProperties, modelOptions) {
  var aClass = createModelCtor(modelProperties, modelOptions);
  return modelHelper.generateModelDefinition(aClass.ctor, {}).testModel;
}

function createModelCtor(properties, modelOptions) {
  Object.keys(properties).forEach(function(name) {
    var type = properties[name];
    if (typeof type !== 'object' || Array.isArray(type))
      properties[name] = { type: type };
  });

  var definition = {
    name: 'testModel',
    properties: properties
  };
  _defaults(definition, modelOptions);

  var aClass = {
    ctor: {
      definition: definition
    }
  };
  return aClass;
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

