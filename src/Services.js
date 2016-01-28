var _ = require('underscore');
var extend = require('./extend.js');

var Services = function(obj) {
	for (var prop in obj) {
		this[prop] = obj[prop];
	}
}

var methods = {

}

_.extend(Services.prototype, methods);

Services.extend = extend;

module.exports = Services;