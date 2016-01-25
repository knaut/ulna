var _ = require('underscore');
var nerve = require('nerve-templates');
var extend = require('./extend.js');

Component = function(obj) {
	this.type = 'component';
	this.children = [];
	this.normalized = null;

	for (var prop in obj) {
		this[prop] = obj[prop];
	}

	this.initialize.apply(this, arguments);

	// we bind dispatcher listeners on construction.
	// we use initialize/deinitialize for dom-related setup and teardown
	this.bindListen();
}

methods = {
	initialize: function() {
		this.normalized = this.normalize( this.template );	
		this.stringified = this.stringify.normalized( this.normalized );

		if (Ulna.env === 'browser') {
			this.bindEvents();

			this.$root = $(this.root);
		}
	},

	bindListen: function() {
		// backbone-style hashes for flux-style action configuration
		for (var action in this.listen) {
			this.dispatcher.register(action, this, this.listen[action].bind(this));
		}
	},

	bindEvents: function(events) {

		// backbone-style hash pairs for easy event config
		for (var key in this.events) {
			var culledKey = this.cullEventKey(key);

			// shortcut to just binding the root
			if (culledKey[1] === 'root') {
				// bind the root event based on the event type and the handler we supplied
				this.$root.on(culledKey[0], this.events[key].bind(this));
			} else {
				this.$root.find(culledKey[1]).on(culledKey[0], this.events[key].bind(this));
			}
		}
	},

	unbindEvents: function(events) {
		for (var key in events) {
			var culledKey = this.cullEventKey(key);

			// shortcut to just binding the root
			if (culledKey[1] === 'root') {
				// bind the root event based on the event type and the handler we supplied
				this.$root.off(culledKey[0]);
			} else {
				this.$root.find(culledKey[1]).off(culledKey[0]);
			}

		}
	},

	cullEventKey: function(key) {
		var reg = /[a-z|A-Z]*/;
		var eventString = key.match(reg)[0];
		var selector = key.replace(eventString + ' ', '');

		return [eventString, selector];
	},
}

// we need to use the nerve object like a mixin
// every component should have access to its library

for (var prop in nerve) {
	Component.prototype[prop] = nerve[prop];
}

_.extend(Component.prototype, methods);

Component.extend = extend;

module.exports = Component;