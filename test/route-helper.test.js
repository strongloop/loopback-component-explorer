'use strict';

var routeHelper = require('../lib/route-helper');
var expect = require('chai').expect;
var _defaults = require('lodash.defaults');

describe('route-helper', function() {
  it('returns "object" when a route has multiple return values', function() {
    var doc = createAPIDoc({
      returns: [
        { arg: 'max', type: 'number' },
        { arg: 'min', type: 'number' },
        { arg: 'avg', type: 'number' }
      ]
    });
    expect(doc.operations[0].responseMessages[0].responseModel).to.equal('object');
  });

  it('converts path params when they exist in the route name', function() {
    var doc = createAPIDoc({
      accepts: [
        {arg: 'id', type: 'string'}
      ],
      path: '/test/:id'
    });
    var paramDoc = doc.operations[0].parameters[0];
    expect(paramDoc.paramType).to.equal('path');
    expect(paramDoc.name).to.equal('id');
    expect(paramDoc.required).to.equal(false);
  });

  // FIXME need regex in routeHelper.acceptToParameter
  xit('won\'t convert path params when they don\'t exist in the route name', function() {
    var doc = createAPIDoc({
      accepts: [
        {arg: 'id', type: 'string'}
      ],
      path: '/test/:identifier'
    });
    var paramDoc = doc.operations[0].parameters[0];
    expect(paramDoc.paramType).to.equal('query');
  });

  it('correctly coerces param types', function() {
    var doc = createAPIDoc({
      accepts: [
        {arg: 'binaryData', type: 'buffer'}
      ]
    });
    var paramDoc = doc.operations[0].parameters[0];
    expect(paramDoc.paramType).to.equal('query');
    expect(paramDoc.type).to.equal('string');
    expect(paramDoc.format).to.equal('byte');
  });

  it('correctly converts return types (arrays)', function() {
    var doc = createAPIDoc({
      returns: [
        {arg: 'data', type: ['customType']}
      ]
    });
    var opDoc = doc.operations[0];
    expect(opDoc.responseMessages[0].responseModel).to.equal('[customType]');
  });

  it('correctly converts return types (format)', function() {
    var doc = createAPIDoc({
      returns: [
        {arg: 'data', type: 'buffer'}
      ]
    });
    var opDoc = doc.operations[0];
    expect(opDoc.responseMessages[0].responseModel).to.equal('string');
  });

  describe('#acceptToParameter', function(){
    it('should return function that converts accepts.description from array of string to string', function(){
      var f = routeHelper.acceptToParameter({verb: 'get', path: 'path'});
      var result = f({description: ['1','2','3']});
      expect(result.description).to.eql('123');
    });
  });

  describe('#routeToAPIDoc', function(){
    it('should convert route.description from array fo string to string', function(){
      var result = routeHelper.routeToAPIDoc({
        method: 'someMethod',
        verb: 'get',
        path: 'path',
        description:['1','2','3']
      });
      expect(result.operations[0].summary).to.eql('123');
    });

    it('should convert route.notes from array fo string to string', function(){
      var result = routeHelper.routeToAPIDoc({
        method: 'someMethod',
        verb: 'get',
        path: 'path',
        notes:['1','2','3']
      });
      expect(result.operations[0].notes).to.eql('123');
    });
  });
});

// Easy wrapper around createRoute
function createAPIDoc(def) {
  return routeHelper.routeToAPIDoc(_defaults(def, {
    path: '/test',
    verb: 'GET',
    method: 'test.get'
  }));
}
