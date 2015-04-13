/**
 * Created by ytang on 4/7/15.
 */
var classHelper = require('../lib/class-helper');
var loopback = require('loopback');
var expect = require('chai').expect;

describe('class-helper', function() {
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
        expect(result.description).to.eql('123');
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
        expect(result.description).to.eql('123');
      });
    });
  });
});