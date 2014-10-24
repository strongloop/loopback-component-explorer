'use strict';

var url = require('url');
var urlJoin = require('../lib/url-join');
var loopback = require('loopback');
var express = require('express');
var swagger = require('../lib/swagger');

var request = require('supertest');
var expect = require('chai').expect;

describe('swagger definition', function() {
  describe('basePath', function() {
    // No basepath on resource doc in 1.2
    it('no longer exists on resource doc', function(done) {
      var app = givenAppWithSwagger();

      var getReq = getSwaggerResources(app);
      getReq.end(function(err, res) {
        if (err) return done(err);
        expect(res.body.basePath).to.equal(undefined);
        done();
      });
    });

    it('is "http://{host}/api" by default', function(done) {
      var app = givenAppWithSwagger();

      var getReq = getAPIDeclaration(app, 'products');
      getReq.end(function(err, res) {
        if (err) return done(err);
        expect(res.body.basePath).to.equal(url.resolve(getReq.url, '/api'));
        done();
      });
    });

    it('is "http://{host}/{basePath}" when basePath is a path', function(done){
      var app = givenAppWithSwagger({ basePath: '/api-root'});

      var getReq = getAPIDeclaration(app, 'products');
      getReq.end(function(err, res) {
        if (err) return done(err);
        var apiRoot = url.resolve(getReq.url, '/api-root');
        expect(res.body.basePath).to.equal(apiRoot);
        done();
      });
    });

    it('infers API basePath from app', function(done){
      var app = givenAppWithSwagger({}, {apiRoot: '/custom-api-root'});

      var getReq = getAPIDeclaration(app, 'products');
      getReq.end(function(err, res) {
        if (err) return done(err);
        var apiRoot = url.resolve(getReq.url, '/custom-api-root');
        expect(res.body.basePath).to.equal(apiRoot);
        done();
      });
    });

    it('is reachable when explorer mounting location is changed', function(done){
      var explorerRoot = '/erforscher';
      var app = givenAppWithSwagger({}, {explorerRoot: explorerRoot});

      var getReq = getSwaggerResources(app, explorerRoot, 'products');
      getReq.end(function(err, res) {
        if (err) return done(err);
        expect(res.body.basePath).to.be.a('string');
        done();
      });
    });

    it('respects a hardcoded protocol (behind SSL terminator)', function(done){
      var app = givenAppWithSwagger({protocol: 'https'});

      var getReq = getAPIDeclaration(app, 'products');
      getReq.end(function(err, res) {
        if (err) return done(err);
        var parsed = url.parse(res.body.basePath);
        expect(parsed.protocol).to.equal('https:');
        done();
      });
    });

    it('respects X-Forwarded-Host header (behind a proxy)', function(done) {
      var app = givenAppWithSwagger();
      getAPIDeclaration(app, 'products')
        .set('X-Forwarded-Host', 'example.com')
        .end(function(err, res) {
          if (err) return done(err);
          var baseUrl = url.parse(res.body.basePath);
          expect(baseUrl.hostname).to.equal('example.com');
          done();
        });
    });

    it('respects X-Forwarded-Proto header (behind a proxy)', function(done) {
      var app = givenAppWithSwagger();
      getAPIDeclaration(app, 'products')
        .set('X-Forwarded-Proto', 'https')
        .end(function(err, res) {
          if (err) return done(err);
          var baseUrl = url.parse(res.body.basePath);
          expect(baseUrl.protocol).to.equal('https:');
          done();
        });
    });
  });

  describe('Model definition attributes', function() {
    it('Properly defines basic attributes', function(done) {
      var app = givenAppWithSwagger();

      var getReq = getAPIDeclaration(app, 'products');
      getReq.end(function(err, res) {
        if (err) return done(err);
        var data = res.body.models.product;
        expect(data.id).to.equal('product');
        expect(data.required.sort()).to.eql(['aNum', 'foo'].sort());
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

    it('includes `consumes`', function(done) {
      var app = givenAppWithSwagger();
      getAPIDeclaration(app, 'products').end(function(err, res) {
        if (err) return done(err);
        expect(res.body.consumes).to.have.members([
          'application/json',
          'application/x-www-form-urlencoded',
          'application/xml', 'text/xml'
        ]);
        done();
      });
    });

    it('includes `produces`', function(done) {
      var app = givenAppWithSwagger();
      getAPIDeclaration(app, 'products').end(function(err, res) {
        if (err) return done(err);
        expect(res.body.produces).to.have.members([
          'application/json',
          'application/xml', 'text/xml',
          // JSONP content types
          'application/javascript', 'text/javascript'
        ]);
        done();
      });
    });

    it('includes models from `accepts` args', function(done) {
      var app = createLoopbackAppWithModel();
      givenPrivateAppModel(app, 'Image');
      givenSharedMethod(app.models.Product, 'setImage', {
        accepts: { name: 'image', type: 'Image' }
      });
      mountExplorer(app);

      getAPIDeclaration(app, 'products').end(function(err, res) {
        expect(Object.keys(res.body.models)).to.include('Image');
        done();
      });
    });

    it('includes models from `returns` args', function(done) {
      var app = createLoopbackAppWithModel();
      givenPrivateAppModel(app, 'Image');
      givenSharedMethod(app.models.Product, 'getImage', {
        returns: { name: 'image', type: 'Image' }
      });
      mountExplorer(app);

      getAPIDeclaration(app, 'products').end(function(err, res) {
        expect(Object.keys(res.body.models)).to.include('Image');
        done();
      });
    });

    it('includes `accepts` models not attached to the app', function(done) {
      var app = createLoopbackAppWithModel();
      loopback.createModel('Image');
      givenSharedMethod(app.models.Product, 'setImage', {
        accepts: { name: 'image', type: 'Image' }
      });
      mountExplorer(app);

      getAPIDeclaration(app, 'products').end(function(err, res) {
        expect(Object.keys(res.body.models)).to.include('Image');
        done();
      });
    });

    it('includes `responseMessages` models', function(done) {
      var app = createLoopbackAppWithModel();
      loopback.createModel('ValidationError');
      givenSharedMethod(app.models.Product, 'setImage', {
        errors: [{
          code: '422',
          message: 'Validation failed',
          responseModel: 'ValidationError'
        }]
      });

      expectProductDocIncludesModels(app, 'ValidationError', done);
    });

    it('includes nested model references in properties', function(done) {
      var app = createLoopbackAppWithModel();
      givenWarehouseWithAddressModels(app);

      app.models.Product.defineProperty('location', { type: 'Warehouse' });

      expectProductDocIncludesModels(app, ['Address', 'Warehouse'], done);
    });

    it('includes nested array model references in properties', function(done) {
      var app = createLoopbackAppWithModel();
      givenWarehouseWithAddressModels(app);

      app.models.Product.defineProperty('location', { type: ['Warehouse'] });

      expectProductDocIncludesModels(app, ['Address', 'Warehouse'], done);
    });

    it('includes nested model references in modelTo relation', function(done) {
      var app = createLoopbackAppWithModel();
      givenWarehouseWithAddressModels(app);

      app.models.Product.belongsTo(app.models.Warehouse);

      expectProductDocIncludesModels(app, ['Address', 'Warehouse'], done);
    });

    it('includes nested model references in modelTo relation', function(done) {
      var app = createLoopbackAppWithModel();
      givenWarehouseWithAddressModels(app);
      givenPrivateAppModel(app, 'ProductLocations');

      app.models.Product.hasMany(app.models.Warehouse,
        { through: app.models.ProductLocations });

      expectProductDocIncludesModels(
        app,
        ['Address', 'Warehouse', 'ProductLocations'],
        done);
    });

    it('includes nested model references in accept args', function(done) {
      var app = createLoopbackAppWithModel();
      givenWarehouseWithAddressModels(app);

      givenSharedMethod(app.models.Product, 'aMethod', {
        accepts: { arg: 'w', type: 'Warehouse' }
      });

      expectProductDocIncludesModels(app, ['Address', 'Warehouse'], done);
    });

    it('includes nested array model references in accept args', function(done) {
      var app = createLoopbackAppWithModel();
      givenWarehouseWithAddressModels(app);

      givenSharedMethod(app.models.Product, 'aMethod', {
        accepts: { arg: 'w', type: [ 'Warehouse' ] }
      });

      expectProductDocIncludesModels(app, ['Address', 'Warehouse'], done);
    });

    it('includes nested model references in return args', function(done) {
      var app = createLoopbackAppWithModel();
      givenWarehouseWithAddressModels(app);

      givenSharedMethod(app.models.Product, 'aMethod', {
        returns: { arg: 'w', type: 'Warehouse', root: true }
      });

      expectProductDocIncludesModels(app, ['Address', 'Warehouse'], done);
    });

    it('includes nested array model references in return args', function(done) {
      var app = createLoopbackAppWithModel();
      givenWarehouseWithAddressModels(app);

      givenSharedMethod(app.models.Product, 'aMethod', {
        returns: { arg: 'w', type: ['Warehouse'], root: true }
      });

      expectProductDocIncludesModels(app, ['Address', 'Warehouse'], done);
    });

    it('includes nested model references in error responses', function(done) {
      var app = createLoopbackAppWithModel();
      givenWarehouseWithAddressModels(app);

      givenSharedMethod(app.models.Product, 'aMethod', {
        errors: {
          code: '222',
          message: 'Warehouse',
          responseModel: 'Warehouse'
        }
      });

      expectProductDocIncludesModels(app, ['Address', 'Warehouse'], done);
    });
  });

  describe('Cross-origin resource sharing', function() {
    it('allows cross-origin requests by default', function(done) {
      var app = givenAppWithSwagger();
      request(app)
        .options('/explorer/resources')
        .set('Origin', 'http://example.com/')
        .expect('Access-Control-Allow-Origin', /^http:\/\/example.com\/|\*/)
        .expect('Access-Control-Allow-Methods', /\bGET\b/)
        .end(done);
    });

    it('can be disabled by configuration', function(done) {
      var app = givenAppWithSwagger({}, { remoting: { cors: { origin: false } } });
      request(app)
        .options('/explorer/resources')
        .end(function(err, res) {
          if (err) return done(err);
          var allowOrigin = res.get('Access-Control-Allow-Origin');
          expect(allowOrigin, 'Access-Control-Allow-Origin')
            .to.equal(undefined);
          done();
        });
    });
  });

  function getSwaggerResources(app, restPath, classPath) {
    return request(app)
      .get(urlJoin(restPath || '/explorer', '/resources', classPath || ''))
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);
  }

  function getAPIDeclaration(app, className) {
    return getSwaggerResources(app, '', urlJoin('/', className));
  }

  function givenAppWithSwagger(swaggerOptions, appConfig) {
    appConfig = appConfig || {};
    var app = createLoopbackAppWithModel(appConfig.apiRoot);

    if (appConfig.remoting) app.set('remoting', appConfig.remoting);
    if (appConfig.explorerRoot) app.set('explorerRoot', appConfig.explorerRoot);

    mountExplorer(app, swaggerOptions);
    return app;
  }

  function mountExplorer(app, options) {
    var swaggerApp = express();
    swagger(app, swaggerApp, options);
    app.use(app.get('explorerRoot') || '/explorer', swaggerApp);
    return app;
  }

  function createLoopbackAppWithModel(apiRoot) {
    var app = loopback();

    app.dataSource('db', { connector: 'memory' });

    var Product = loopback.Model.extend('product', {
      foo: {type: 'string', required: true},
      bar: 'string',
      aNum: {type: 'number', min: 1, max: 10, required: true, default: 5}
    });
    app.model(Product, { dataSource: 'db'});

    // Simulate a restApiRoot set in config
    app.set('restApiRoot', apiRoot || '/api');
    app.use(app.get('restApiRoot'), loopback.rest());

    return app;
  }

  function givenSharedMethod(model, name, metadata) {
    model[name] = function(){};
    loopback.remoteMethod(model[name], metadata);
  }

  function givenPrivateAppModel(app, name, properties) {
    var model = loopback.createModel(name, properties);
    app.model(model, { dataSource: 'db', public: false} );
  }

  function givenWarehouseWithAddressModels(app) {
    givenPrivateAppModel(app, 'Address');
    givenPrivateAppModel(app, 'Warehouse', {
      shippingAddress: { type: 'Address' }
    });
  }

  function expectProductDocIncludesModels(app, modelNames, done) {
    if (!Array.isArray(modelNames)) modelNames = [modelNames];

    mountExplorer(app);

    getAPIDeclaration(app, 'products').end(function(err, res) {
      if (err) return done(err);
      expect(Object.keys(res.body.models)).to.include.members(modelNames);
      done();
    });
  }
});
