'use strict';

var tagBuilder = require('../lib/tag-builder');
var expect = require('chai').expect;
var _defaults = require('lodash').defaults;

describe('tag-builder', function() {
  it('joins array descriptions from ctor.settings', function() {
    var tag = tagBuilder.buildTagFromClass({
      ctor: { settings: { description: ['line1', 'line2'] } }
    });

    expect(tag.description).to.equal('line1\nline2');
  });

  it('joins array descriptions from ctor.sharedCtor', function() {
    var tag = tagBuilder.buildTagFromClass({
      ctor: { sharedCtor: { description: ['1', '2', '3'] } }
    });

    expect(tag.description).to.eql('1\n2\n3');
  });
});
