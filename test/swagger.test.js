/* Copyright (c) 2013 StrongLoop, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var extend = require('util')._extend;
var inherits = require('util').inherits;
var url = require('url');
var loopback = require('loopback');

var RemoteObjects = require('strong-remoting');
var swagger = require('../lib/swagger.js');

var request = require('supertest');
var expect = require('chai').expect;

describe('swagger definition', function() {
  var objects;
  var remotes;

  // setup
  beforeEach(function(){
    objects = RemoteObjects.create();
    remotes = objects.exports;
  });

  describe('basePath', function() {
    it('is "http://{host}/" by default', function(done) {
      swagger(objects);

      var getReq = getSwaggerResources();
      getReq.end(function(err, res) {
          if (err) return done(err);
          expect(res.body.basePath).to.equal(url.resolve(getReq.url, '/'));
          done();
        });
    });

    it('is "http://{host}/{basePath}" when basePath is a path', function(done){
      swagger(objects, { basePath: '/api-root'});

      var getReq = getSwaggerResources();
      getReq.end(function(err, res) {
        if (err) return done(err);
        var apiRoot = url.resolve(getReq.url, '/api-root');
        expect(res.body.basePath).to.equal(apiRoot);
        done();
      });
    });

    it('is custom URL when basePath is a http(s) URL', function(done) {
      var apiUrl = 'http://custom-api-url/';

      swagger(objects, { basePath: apiUrl });

      var getReq = getSwaggerResources();
      getReq.end(function(err, res) {
        if (err) return done(err);
        expect(res.body.basePath).to.equal(apiUrl);
        done();
      });
    });
  });

  describe('Model definition attributes', function() {
    it('Properly defines basic attributes', function(done) {
      var app = createLoopbackAppWithModel();
      var extension = swagger(app.remotes(), {});
      getModelFromRemoting(extension, 'product', function(data) {
        expect(data.id).to.equal('product');
        expect(data.required.sort()).to.eql(['id', 'aNum', 'foo'].sort());
        expect(data.properties.foo.type).to.equal('string');
        expect(data.properties.bar.type).to.equal('string');
        expect(data.properties.aNum.type).to.equal('number');
        // These will be Numbers for Swagger 2.0
        expect(data.properties.aNum.minimum).to.equal('1');
        expect(data.properties.aNum.maximum).to.equal('10');
        // Should be Number even in 1.2
        expect(data.properties.aNum.defaultValue).to.equal(5);
        done();
      });
    });
  });

  function getSwaggerResources(restPath) {
    var app = createRestApiApp(restPath);
    var prefix = restPath || '';
    return request(app)
      .get(prefix + '/swagger/resources')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  }

  function createRestApiApp(restPath) {
    restPath = restPath || '/';

    var app = loopback();
    app.use(restPath, function (req, res, next) {
      // create the handler for each request
      objects.handler('rest').apply(objects, arguments);
    });
    return app;
  }

  function createLoopbackAppWithModel() {
    var app = loopback();

    var Product = loopback.Model.extend('product', {
      foo: {type: 'string', required: true},
      bar: 'string',
      aNum: {type: 'number', min: 1, max: 10, required: true, default: 5}
    });
    Product.attachTo(loopback.memory());
    app.model(Product);
    app.use(loopback.rest());
    return app;
  }

  function getModelFromRemoting(extension, modelName, cb) {
    extension[modelName](function(err, data) {
      cb(data.models[modelName]);
    });
  }
});
