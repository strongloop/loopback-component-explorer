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

  describe('#generateResourceDocAPIEntry', function() {
    describe('when ctor.settings.description is an array of string', function() {
      it('should return description as a string', function() {
        var aClass = {
          ctor: {
            settings: {
              description: ['1','2','3']
            }
          },
          http:{
            path: 'path'
          }
        };

        var result = classHelper.generateResourceDocAPIEntry(aClass);
        expect(result.description).to.eql("1\n2\n3");
      });
    });

    describe('when ctor.sharedCtor.description is an array of string', function() {
      it('should return description as a string', function() {
        var aClass = {
          ctor: {
            settings: {},
            sharedCtor: {
              description: ['1','2','3']
            }
          },
          http:{
            path: 'path'
          }
        };

        var result = classHelper.generateResourceDocAPIEntry(aClass);
        expect(result.description).to.eql("1\n2\n3");
      });
    });
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
