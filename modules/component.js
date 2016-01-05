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
	this.normalized = null;

	for (var prop in obj) {
		this[prop] = obj[prop];
	}

	this.nerve = new Nerve.Nerve(this);

	this.normalized = this.nerve.normalize( this.template );

	// setup for any component
	this.initialize.apply(this, arguments);

	

	// we bind dispatcher listeners on construction.
	// we use initialize/deinitialize for dom-related setup and teardown
	this.bindListen();
}

var methods = {
	initialize: function(obj) {
		// set up a component for rendering into the dom
		this.$root = $(this.root);

		this.bindEvents();

		// bind children
		if (this.children.length) {
			for (var c = 0; this.children.length > c; c++) {
				this.children[c].initialize();
			}
		}
	},
	deinitialize: function() {
		// unbind from the dom

		this.unbindEvents(this.events);

		this.$root = undefined;
	},

	bindEvents: function(events) {
		// quick isomorphic fix
		if (typeof window === 'undefined') return;

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
		console.log(obj)
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
	},

	getChildQueries: function() {
		var queries = {};
		
		for (var c = 0; this.children.length > c; c++) {			
			var query = this.children[c].query;
			console.log(query, this.children[c])
			var childKey = Object.keys(query)[0];
			queries[childKey] = query[childKey];
		}

		return queries;
	},

	setQueriedChildProps: function( props ) {
		for (var c = 0; this.children.length > c; c++) {
			var childKey = Object.keys( this.children[c].query )[0]
			for (var key in props) {
				if (key === childKey) {
					this.children[c].setProps( props[key] )
				}
			}
		}
	}
}

_.extend(Component.prototype, methods);

Component.extend = extend;

module.exports = Component;