/*!
 * computed-property <https://github.com/doowb/computed-property>
 *
 * Copyright (c) 2014 Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var get = require('get-value');
var set = require('set-object');
var deepEqual = require('deep-equal');

/**
 * Add a computed property to an object. This updates
 * the property when dependent properties are updated.
 *
 * ```js
 * var computedProperty = require('computed-property');
 * var file = {
 *   name: 'home-page',
 *   ext: '.hbs',
 *   dirname: 'views',
 *   data: {
 *     title: 'Home'
 *   }
 * };
 *
 * computedProperty(
 *   // object
 *   file,
 *   // property name
 *   'path',
 *   // optional dependencies (may be deeply nested)
 *   ['name', 'ext', 'dirname', 'data.title'],
 *   // getter function
 *   function () {
 *     return this.dirname + '/' + this.name + this.ext;
 *   });
 * ```
 *
 * @param  {Object}   `obj` Object to add the property to.
 * @param  {Function} `name` Name of the property.
 * @param  {Array}    `dependencies` Optional list of properties to depend on.
 * @param  {Function} `property` Property object
 * @api public
 * @name  computedProperty
 */

module.exports = function computedProperty (obj, name, dependencies, property) {
  if (typeof dependencies === 'function') {
    property = dependencies;
    dependencies = [];
  }
  if (typeof property !== 'object') {
    throw new Error('Expected `property` to be a object but got ' + typeof property);
  }

  dependencies = [].concat.apply([], dependencies);
  var prev = {};
  prev[name] = undefined;
  var watch = initWatch(obj, prev, dependencies);

  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: true,
    get: property.get ? function () {
      if (!watch || prev[name] == undefined || changed(prev, this, dependencies)) {
        prev[name] = property.get.call(this);
      }
      return prev[name];
    } : undefined,
    set: property.set,
  });
};

/**
 * Setup the storage object for watching dependencies.
 *
 * @param  {Object}  `obj`          Object property is being added to.
 * @param  {Object}  `prev`         Object used for storage.
 * @param  {Array}   `dependencies` Dependencies to watch
 * @return {Boolean} Return if watching or not.
 * @api private
 */

function initWatch (obj, prev, dependencies) {
  var watch = false;
  var len = dependencies.length;
  if (len > 0) {
    watch = true;
    var i = 0;
    while (len--) {
      var dep = dependencies[i++];
      var value = _.cloneDeep(get(obj, dep));
      set(prev, dep, value);
    }
  }
  return watch;
}

/**
 * Determine if dependencies have changed.
 *
 * @param  {Object}  `prev` Stored dependency values
 * @param  {Object}  `current` Current object to check the dependencies.
 * @param  {Array}   `dependencies` Dependencies to check.
 * @return {Boolean} Did any dependencies change?
 * @api private
 */

function changed (prev, current, dependencies) {
  var len = dependencies.length;
  var i = 0;
  var result = false;
  while (len--) {
    var dep = dependencies[i++];
    var value = get(current, dep);
    if (!deepEqual(get(prev, dep), value)) {
      result = true;
      set(prev, dep, _.cloneDeep(value));
    }
  }
  return result;
}
