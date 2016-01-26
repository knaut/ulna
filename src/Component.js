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
	
	this.initialize.call(this)

	// we bind dispatcher listeners on construction.
	// we use initialize/deinitialize for dom-related setup and teardown
	if (this.listen) {
		this.bindListen();	
	}
}

methods = {
	initialize: function() {
		// reset children
		if (this.children.length) {
			this.deinitializeChildren();
		}

		this.normalized = this.normalize( this.template );	
		this.stringified = this.stringify.normalized( this.normalized );

		if (Ulna.env === 'browser') {
			this.$root = $(this.root);

			if (this.events) {
				this.bindEvents();	
			}
		}

		// initialize children
		if (this.children.length) {
			this.initializeChildren();	
		}
	},

	deinitialize: function() {
		this.$root = [];
		this.children = [];

		if (Ulna.env === 'browser') {
			this.unbindEvents();
		}
	},

	initializeChildren: function() {
		// bind their roots and events
		for (var c = 0; this.children.length > c; c++) {
			this.children[c].initialize();
		}
	},

	deinitializeChildren: function() {
		// bind their roots and events
		for (var c = 0; this.children.length > c; c++) {
			this.children[c].deinitialize();
		}

		this.children = [];
	},

	renderChildren: function() {
		// bind their roots and events
		for (var c = 0; this.children.length > c; c++) {
			this.children[c].render();
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

	stringifyTemplate: function() {
		return this.stringify.normalized( this.normalize( this.template ) )
	},

	render: function() {
		// side effect of normalizing
		// we push children in normalize
		// have to reset each time
		if (this.children.length) {
			this.deinitializeChildren();	
		}

		if (!this.$root.length) {
			this.initialize();
		}

		this.$root.html( this.stringifyTemplate() );

		if (this.children.length) {
			this.initializeChildren();
		}
	}
}

// we need to use the nerve object like a mixin
// every component should have access to its library

for (var prop in nerve) {
	Component.prototype[prop] = nerve[prop];
}

_.extend(Component.prototype, methods);

Component.extend = extend;

module.exports = Component;