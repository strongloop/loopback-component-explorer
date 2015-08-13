'use strict';

/**
 * Module dependencies.
 */
var schemaBuilder = require('./schema-builder');
var typeConverter = require('./type-converter');
var TypeRegistry = require('./type-registry');

/**
 * Export the modelHelper singleton.
 */
var modelHelper = module.exports = {
  /**
   * Given a class (from remotes.classes()), generate a model definition.
   * This is used to generate the schema at the top of many endpoints.
   * @param  {Class} modelClass Model class.
   * @param {TypeRegistry} typeRegistry Registry of types and models.
   * @return {Object} Associated model definition.
   */
  registerModelDefinition: function(modelCtor, typeRegistry) {
    var lbdef = modelCtor.definition;

    if (!lbdef) {
      // The model does not have any definition, it was most likely
      // created as a placeholder for an unknown property type
      return;
    }

    var name = lbdef.name;
    if (typeRegistry.isDefined(name)) {
      // The model is already included
      return;
    }

    var swaggerDef = {
      description: typeConverter.convertText(
        lbdef.description || (lbdef.settings && lbdef.settings.description)),
      properties: {},
      required: []
    };

    var properties = lbdef.rawProperties || lbdef.properties;

    // Iterate through each property in the model definition.
    // Types may be defined as constructors (e.g. String, Date, etc.),
    // or as strings; swaggerSchema.builFromLoopBackType() will take
    // care of the conversion.
    Object.keys(properties).forEach(function(key) {
      var prop = properties[key];

      // Hide hidden properties.
      if (modelHelper.isHiddenProperty(lbdef, key))
        return;

      // Eke a type out of the constructors we were passed.
      var schema = schemaBuilder.buildFromLoopBackType(prop, typeRegistry);

      var desc = typeConverter.convertText(prop.description || prop.doc);
      if (desc) schema.description = desc;

      // Required props sit in a per-model array.
      if (prop.required || (prop.id && !prop.generated)) {
        swaggerDef.required.push(key);
      }

      // Assign the schema to the properties object.
      swaggerDef.properties[key] = schema;
    });

    if (lbdef.settings) {
      var strict = lbdef.settings.strict;
      var additionalProperties = lbdef.settings.additionalProperties;
      var notAllowAdditionalProperties = strict || (additionalProperties !== true);
      if (notAllowAdditionalProperties){
        swaggerDef.additionalProperties = false;
      }
    }

    if (!swaggerDef.required.length) {
      // "required" must have at least one item when present
      delete swaggerDef.required;
    }

    typeRegistry.register(name, swaggerDef);

    // Add models from settings
    if (lbdef.settings && lbdef.settings.models) {
      for (var m in lbdef.settings.models) {
        var model = modelCtor[m];
        if (typeof model !== 'function' || !model.modelName) continue;
        modelHelper.registerModelDefinition(model, typeRegistry);
        // TODO it shouldn't be necessary to reference the model here,
        // let accepts/returns/property reference it instead
        typeRegistry.reference(model.modelName);
      }
    }

    // Generate model definitions for related models
    for (var r in modelCtor.relations) {
      var rel = modelCtor.relations[r];
      if (rel.modelTo) {
        modelHelper.registerModelDefinition(rel.modelTo, typeRegistry);
        // TODO it shouldn't be necessary to reference the model here,
        // let accepts/returns/property reference it instead
        typeRegistry.reference(rel.modelTo.modelName);
      }
      if (rel.modelThrough) {
        modelHelper.registerModelDefinition(rel.modelThrough, typeRegistry);
        // TODO it shouldn't be necessary to reference the model here,
        // let accepts/returns/property reference it instead
        typeRegistry.reference(rel.modelThrough.modelName);
      }
    }
  },

  isHiddenProperty: function(definition, propName) {
    return definition.settings &&
      Array.isArray(definition.settings.hidden) &&
      definition.settings.hidden.indexOf(propName) !== -1;
  },
};
