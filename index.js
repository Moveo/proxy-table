'use strict';

var Route = require('routable');

/**
 * Construct a Proxy table.
 *
 * @Constructor
 * @param {Array} routes Collection of routing objects.
 * @api public
 */
function ProxyTable(routes) {
  this.table = Object.create(null);
  this.methods = Object.create(null);

  this.init(routes);
}

/**
 * Initialize the provided routes.
 *
 * @param {Array} routes Collection of routing objects.
 * @return {ProxyTable} fluent interface.
 * @api public
 */
ProxyTable.prototype.init = function init(routes) {
  routes.forEach(this.add, this);
  return this;
};

/**
 * Add a route to the table.
 *
 * @param {Object} route Routing object with path and method.
 * @param {Number} i Optional index.
 * @return {ProxyTable} fluent interface.
 * @api public
 */
ProxyTable.prototype.add = function add(route, i) {
  var methods = this.methods
    , table = this.table;

  //
  // Invalid routing object provided.
  //
  if (!route.path || 'function' !== typeof route.method) return;

  //
  // No index was provided, add it to the end of the table.
  //
  i = i || Object.keys(table).length;

  table[i] = new Route(route.path);
  methods[i] = route.method;

  return this;
};

/**
 * Remove the route and method from the table.
 *
 * @param {Mixed} path Index number or routable path.
 * @return {ProxyTable} fluent interface.
 * @api private
 */
ProxyTable.prototype.remove = function remove(path) {
  var proxy = this;

  /**
   * Delete the references from the routing table and methods table.
   *
   * @param {Number} i Route index.
   * @api private
   */
  function del(i) {
    delete proxy.table[i];
    delete proxy.methods[i];
  }

  switch (typeof path) {
    case 'number':
      del(path);
    break;

    case 'string':
    default:
      del(proxy.find(path));
  }

  return proxy;
};

/**
 * Find the index of the current routing path.
 *
 * @param {String} path Routed path.
 * @return {Number} i index of the route.
 * @api public
 */
ProxyTable.prototype.find = function find(path) {
  var table = this.table
    , i;

  for (i in table) {
    if (!table[i].test(path)) continue;
    return i;
  }
};

/**
 * Match the path against the proxy table. Calls the routed method
 * with the additional arguments supplied to dispatch.
 *
 * @param {String} path URI to be proxied.
 * @return {ProxyTable} fluent interface
 * @api public
 */
ProxyTable.prototype.dispatch = function dispatch(path) {
  var methods = this.methods
    , i = this.find(path)
    , table = this.table
    , result;

  //
  // Routed path does not have a registered method.
  //
  if ('function' !== typeof methods[i]) return this;

  result = table[i].exec(path);
  methods[i].apply(result, Array.prototype.slice.call(arguments, 1));

  return this;
};

//
// Export the module.
//
module.exports = ProxyTable;