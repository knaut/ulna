var _ = require('underscore');
var extend = require('./extend.js');

var Services = function(obj) {
	this.data = null;
	this.history = []; 	// could push state changes to an array

	for (var prop in obj) {
		this[prop] = obj[prop];
	}

	if (this.listen) {
		this.bindListen();	
	}
}

var methods = {
	cloneData: function( component ) {
		// accept a component as optional, otherwise clone whole state
		var clone = {};

		if ( component ) {
			for (var prop in component.data) {
				clone[prop] = component.data[prop];
			}
		} else {
			for (var prop in this.data) {
				clone[prop] = this.data[prop];
			}	
		}

		return clone;
	},

	setData: function( obj ) {
		for (var prop in obj) {
			if (this.data.hasOwnProperty(prop)) {
				this.data[prop] = obj[prop]
			}
		}

		return this.data;
	},

	// FLUX
	// bindListen: function() {
	// 	// backbone-style hashes for flux-style action configuration
	// 	for (var action in this.listen) {
	// 		this.dispatcher.register(action, this, this.listen[action].bind(this));
	// 	}
	// }
}

_.extend(Services.prototype, methods);

Services.extend = extend;

module.exports = Services;