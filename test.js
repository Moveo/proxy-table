describe('ProxyTable', function () {
  'use strict';

  var ProxyTable = require('./')
    , assume = require('assume')
    , table;

  function noop() {}

  beforeEach(function () {
    table = new ProxyTable([
      { path: '/simple', method: noop },
      { path: '/with/:key', method: noop }
    ]);
  });

  afterEach(function () {
    table = null;
  });

  it('is exported as constructor', function () {
    assume(ProxyTable).to.be.a('function');
  });

  describe('#dispatch', function () {
    it('is a function', function () {
      assume(table.dispatch).to.be.a('function');
    });

    it('calls the method that is proxied to', function (done) {
      function callable(list, of, args) {
        assume(list).to.equal('with');
        assume(of).to.equal('custom');
        assume(args).to.equal('args');
        done();
      }

      table.add({ path: '/test', method: callable });
      table.dispatch('/test', 'with', 'custom', 'args');
    });

    it('extracts parameters provided to the proxy', function (done) {
      function callable() {
        assume(this).to.have.property('param', 'list');
        done();
      }

      table.add({ path: '/test/:param', method: callable });
      table.dispatch('/test/list');
    });
  });
});