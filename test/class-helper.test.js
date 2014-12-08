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
});

// Easy wrapper around createRoute
function generateResourceDocAPIEntry(def) {
  return classHelper.generateResourceDocAPIEntry(_defaults(def, {
    http: { path: '/test' },
    ctor: { settings: { } },
  }));
}
