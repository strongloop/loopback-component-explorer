var request = require('supertest');
var assert = require('assert');

describe('explorer', function () {
  beforeEach(function (done) {
    var loopback = require('loopback');
    var app = this.app = loopback();
    var explorer = require('../');
    var Product = loopback.Model.extend('product');
    Product.attachTo(loopback.memory());
    app.model(Product);

    app.use(loopback.rest());
    app.use('/explorer', explorer(app));

    done();
  });

  it('should redirect to /explorer/', function (done) {
    request(this.app)
      .get('/explorer')
      .expect(303)
      .end(done);
  });

  it('should serve the explorer at /explorer/', function (done) {
    request(this.app)
      .get('/explorer/')
      .expect('Content-Type', /html/)
      .expect(200)
      .end(function(err, res) {
        if(err) throw err;

        assert(!!~res.text.indexOf('<title>StrongLoop API Explorer</title>'), 'text does not contain expected string');
        done();
      });
  });
});
