'use strict';

var typeConverter = require('./type-converter');

exports.buildTagFromClass = function(sharedClass) {
  var name = sharedClass.name;
  var modelSettings = sharedClass.ctor && sharedClass.ctor.settings;
  var sharedCtor = sharedClass.ctor && sharedClass.ctor.sharedCtor;

  var description = modelSettings && modelSettings.description ||
    sharedCtor && sharedCtor.description;

  return {
    name: name,
    description: typeConverter.convertText(description),
    // TODO: externalDocs: { description, url }
  };
};
