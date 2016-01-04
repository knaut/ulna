if (typeof Nerve === 'undefined') {
	var Nerve = require('nerve-templates');
}

var _ = require('underscore');
var extend = require('./extend.js');

_.templateSettings = {
	evaluate: /\<\<([\s\S]+?)\>\>/g,
	interpolate: /\~\~([\s\S]+?)\~\~/g,
	escape: /\-\-([\s\S]+?)\-\-/g
}

var Component = function(obj) {
	// type checking for nerve templates
	this.type = 'component';
	this.children = [];

	for (var prop in obj) {
		this[prop] = obj[prop];
	}

	// setup for any component
	this.initialize.apply(this, arguments);

	// we bind dispatcher listeners on construction.
	// we use initialize/deinitialize for dom-related setup and teardown
	this.bindListen();

	this.nerve = new Nerve.Nerve(this);
}

var methods = {
	initialize: function(obj) {
		// set up a component for rendering into the dom

		this.$root = $(this.root);

		this.bindEvents();
	},
	deinitialize: function() {
		// unbind from the dom

		this.unbindEvents(this.events);

		this.$root = undefined;
	},

	bindEvents: function(events) {
		// backbone-style hash pairs for easy event config
		if (typeof window === 'undefined') return;

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

	cullEventKey: function(key) {
		var reg = /[a-z|A-Z]*/;
		var eventString = key.match(reg)[0];
		var selector = key.replace(eventString + ' ', '');

		return [eventString, selector];
	},

	unbindEvents: function(events) {
		if (typeof window === 'undefined') return;

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

	bindListen: function() {
		// backbone-style hashes for flux-style action configuration
		for (var action in this.listen) {
			this.dispatcher.register(action, this, this.listen[action].bind(this));
		}
	},

	setProps: function(obj) {
		if (obj) {
			for (var prop in this.props) {
				this.props[prop] = obj[prop];
			}
		}

		this.render();
	},

	render: function() {
		this.unbindEvents();

		this.derenderChildren();

		this.children = [];

		this.normalized = this.nerve.normalize(this.template);

		var string = this.nerve.stringify.normalized(this.normalized);

		var template = _.template(string);

		var compiled = template(this.props);

		this.$root.html(template(this.props));

		this.bindEvents();

		if (this.children.length) {
			this.renderChildren();
		}
	},

	derenderChildren: function() {
		for (var c = 0; this.children.length > c; c++) {
			this.children[c].deinitialize();
		}
	},

	renderChildren: function() {
		for (var c = 0; this.children.length > c; c++) {
			this.children[c].initialize();

			this.children[c].render();
		}
	}
}

_.extend(Component.prototype, methods);

Component.extend = extend;

console.log( Component.extend)

module.exports = Component;