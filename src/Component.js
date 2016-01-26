var _ = require('underscore');
var nerve = require('nerve-templates');
var extend = require('./extend.js');

Component = function(obj) {
	this.type = 'component';
	this.eventsBound = false;
	this.children = [];
	this.normalized = null;
	this.$root = [];

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
		// fires on construction
		this.normalized = this.normalize( this.template );	
		this.stringified = this.stringify.normalized( this.normalized );
	},

	// DOM
	bindToDOM: function() {
		this.bindRoot();
		this.bindEvents();

		return this.eventsBound;
	},

	unbindFromDOM: function() {
		this.unbindEvents();
		this.unbindRoot();

		return this.eventsBound;
	},

	bindRoot: function() {
		this.$root = $(this.root);
		
		return this.$root;
	},

	unbindRoot: function() {
		this.$root = [];
		
		return this.$root;
	},

	bindEvents: function() {
		// backbone-style hash pairs for easy event config
		this.eventsBound = true;

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

		return this.eventsBound;
	},

	unbindEvents: function() {
		this.eventsBound = false;

		for (var key in this.events) {
			var culledKey = this.cullEventKey(key);

			// shortcut to just binding the root
			if (culledKey[1] === 'root') {
				// bind the root event based on the event type and the handler we supplied
				this.$root.off(culledKey[0]);
			} else {
				this.$root.find(culledKey[1]).off(culledKey[0]);
			}
		}

		return this.eventsBound;
	},

	cullEventKey: function(key) {
		var reg = /[a-z|A-Z]*/;
		var eventString = key.match(reg)[0];
		var selector = key.replace(eventString + ' ', '');

		return [eventString, selector];
	},

	render: function() {
		return this.stringify.normalized( this.normalized );
	},

	renderToDOM: function() {
		this.$root.html( this.render() );

		return this.$root;
	},

	unrenderFromDOM: function() {
		this.$root.empty();

		return this.$root;
	},

	// FLUX
	bindListen: function() {
		// backbone-style hashes for flux-style action configuration
		for (var action in this.listen) {
			this.dispatcher.register(action, this, this.listen[action].bind(this));
		}
	},

	// CHILDREN
	bindChildren: function() {
		if (!this.children.length) return false;

		for (var c = 0; this.children.length > c; c++) {
			this.children[c].bindToDOM();
		}

		return this.children;
	},

	unbindChildren: function() {
		if (!this.children.length) return false;

		for (var c = 0; this.children.length > c; c++) {
			this.children[c].unbindFromDOM();
		}

		return this.children;
	},

	renderChildrenToDOM: function() {
		if (!this.children.length) return false;

		for (var c = 0; this.children.length > c; c++) {
			this.children[c].bindRoot();
			this.children[c].renderToDOM();
			this.children[c].bindEvents();
		}		
	},

	unrenderChildrenFromDOM: function() {
		if (!this.children.length) return false;

		for (var c = 0; this.children.length > c; c++) {
			this.children[c].unbindEvents();
			this.children[c].unrenderFromDOM();
			this.children[c].unbindRoot();
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