
var computedProperty = require('../../');
var info = require('../common').simple();

computedProperty(info.obj, 'fullName', info.fn);

module.exports = function () {
  info.obj.first = 'Jon';
  info.obj.last = 'Schlinkert';
  return info.obj.fullName;
};
