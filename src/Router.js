var _ = require('underscore');
var extend = require('./extend.js');

var Router = function(obj) {
	this.type = 'router';
	this.eventsBound = false;
	this.location = false;

	for (var prop in obj) {
		this[prop] = obj[prop];
	}
	
	if (this.routes) {
		this.bindRoutes();	
	}

	if (this.events) {
		this.bindEvents();
	}
	
	this.initialize.call(this);

	if (this.listen) {
		this.bindListen();	
	}
}

var methods = {
	initialize: function() {
		this.location = window.location.pathname;
	},

	// FLUX
	bindListen: function() {
		// backbone-style hashes for flux-style action configuration
		for (var action in this.listen) {
			this.dispatcher.register(action, this, this.listen[action].bind(this));
		}
	},

	bindRoutes: function() {
		for (var route in this.routes) {
			this.routes[route] = this.routes[route].bind(this);
		}
	},

	bindEvents: function() {
		for (var event in this.events) {
			// presume only window events
			window.addEventListener(event, this.events[event].bind(this));
		}
	},

	// HISTORY shorthand
	history: {
		push: function( obj ) {
			document.title = obj.title;
			history.pushState(obj, obj.title, obj.url);	
		},
		replace: function( obj ) {
			document.title = obj.title;
			history.replaceState(obj, obj.title, obj.url);
		}
	}
};


_.extend(Router.prototype, methods);

Router.extend = extend;

module.exports = Router;