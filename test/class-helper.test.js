'use strict';

var classHelper = require('../lib/class-helper');
var expect = require('chai').expect;
var _defaults = require('lodash').defaults;

describe('class-helper', function() {
  it('joins array descriptions', function() {
    var doc = generateResourceDocAPIEntry({
      ctor: { settings: { description: [ 'line1', 'line2' ] } }
    });

    expect(doc.description).to.equal('line1\nline2');
  });

  it('sets resourcePath from aClass.http.path', function() {
    var doc = generateAPIDoc({}, 'otherPath');

    expect(doc.resourcePath).to.equal('/otherPath');
  });

  it('sets resourcePath from aClass.name', function() {
    var doc = generateAPIDoc({});

    expect(doc.resourcePath).to.equal('/test');
  });
});

// Easy wrapper around createRoute
function generateResourceDocAPIEntry(def) {
    return classHelper.generateResourceDocAPIEntry(_defaults(def, {
        http: { path: '/test' },
        ctor: { settings: { } }
    }));
}

function generateAPIDoc(def, httpPath) {
    return classHelper.generateAPIDoc(_defaults(def, {
        http: { path: httpPath || null },
        name: 'test',
        ctor: { settings: { } }
    }), {resourcePath: 'resources'});
}
