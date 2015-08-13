'use strict';

var modelHelper = require('../lib/model-helper');
var TypeRegistry = require('../lib/type-registry');
var _defaults = require('lodash').defaults;
var loopback = require('loopback');
var expect = require('chai').expect;

describe('model-helper', function() {
  describe('related models', function() {
    it('should include related models', function() {
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
      }, { models: { Model2: Model2 } });
      var defs = getDefinitionsForModel(Model1);
      expect(defs).has.property('Model1');
      expect(defs).has.property('Model2');
    });

    it('should include used models', function() {
      var Model4 = loopback.createModel('Model4', {street: String});
      var Model3 = loopback.createModel('Model3', {
        str: String // 'string'
      }, {models: {model4: 'Model4'}});
      var defs = getDefinitionsForModel(Model3);
      expect(defs).has.property('Model3');
      expect(defs).has.property('Model4');
    });

    it('should include nesting models in array', function() {
      var Model6 = loopback.createModel('Model6', {street: String});
      var Model5 = loopback.createModel('Model5', {
        str: String, // 'string'
        addresses: [Model6]
      }, { models: { Model6: Model6 } });
      var defs = getDefinitionsForModel(Model5);
      expect(defs).has.property('Model5');
      expect(defs).has.property('Model6');
    });

    // https://github.com/strongloop/loopback-explorer/issues/49
    it('should work if Array class is extended and no related models are found',
      function() {
        var Model7 = loopback.createModel('Model7', {street: String});
        Array.prototype.customFunc = function() {
        };
        var defs = getDefinitionsForModel(Model7);
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
      var defs = getDefinitionsForModel(Model8);
      // Hack: prevent warnings in other tests caused by global model registry
      Model8.definition.rawProperties.patient.type = 'string';
      Model8.definition.properties.patient.type = 'string';

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
      var def = getDefinitionsForModel(aClass.ctor).testModel;
      expect(def.properties).to.not.have.property('hiddenProperty');
      expect(def.properties).to.have.property('visibleProperty');
    });
  });

  it('should convert top level array description to string', function() {
    var model = {};
    model.definition = {
      name: 'test',
      description: ['1', '2', '3'],
      properties: {}
    };
    var defs = getDefinitionsForModel(model);
    expect(defs.test.description).to.equal('1\n2\n3');
  });

  it('should convert property level array description to string', function() {
    var model = {};
    model.definition = {
      name: 'test',
      properties: {
        prop1: {
          type: 'string',
          description: ['1', '2', '3']
        }
      }
    };
    var defs = getDefinitionsForModel(model);
    expect(defs.test.properties.prop1.description).to.equal('1\n2\n3');
  });

  it('omits empty "required" array', function() {
    var aClass = createModelCtor({});
    var def = getDefinitionsForModel(aClass.ctor).testModel;
    expect(def).to.not.have.property('required');
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

  var registry = new TypeRegistry();
  modelHelper.registerModelDefinition(aClass.ctor, registry);
  return registry.getAllDefinitions();
}

function getDefinitionsForModel(modelCtor) {
  var registry = new TypeRegistry();
  modelHelper.registerModelDefinition(modelCtor, registry);
  registry.reference(modelCtor.modelName || modelCtor.definition.name);
  return registry.getDefinitions();
}
