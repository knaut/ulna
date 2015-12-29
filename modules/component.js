var component = function( obj ) {
	// root selector and jquery ref
	this.root = null;
	this.$root = null;

	// nerve template structure
	this.template = null;

	// one update cycle to rule them all
	this.updateCycle = [
		'beforeUpdate',
		'onUpdate',
		'afterUpdate'
	];
	this.updateCycleTimeout = true;

	// id addresses
	this.id = _.uniqueId('c');

	// children 
	this.children = [];

	// ui event hashes
	this.events = {};

	// listen hash for dispatcher hooks
	this.listen = {};

	// apply arguments
	for (var prop in obj) {
		this[prop] = obj[prop]
	}

	this.initialize.apply(this, arguments);
}

component.prototype = {
	initialize: function() {
		// setup for any component, in order
		this.bindRoot( this.root );

		this.bindEvents( this.events );

		this.bindListen( this.listen );
	},
	bindRoot: function( root ) {
		// i am root
		this.root = root;
		this.$root = $(root);
	},
	deinitialize: function() {

	},
	bindEvents: function( events ) {
		// backbone-style hash pairs for easy event config
		var self = this;
		var events = this.events();
		for (var key in events) {

			var culledKey = this.cullEventKey( key );

			// shortcut to just binding the root
			if (culledKey[1] === 'root') {
				// bind the root event based on the event type and the handler we supplied
				this.$root.bind( culledKey[0], $.proxy( events[key], self.events) );
			}

		}
	},
	cullEventKey: function( key ) {
		var reg = /[a-z|A-Z]*/g;
		var arr = key.match(reg).filter(function( string ) {
			return /\S/.test( string );
		});
		return arr;
	},
	unbindEvents: function() {

	},
	bindListen: function( actions ) {
		// backbone-style hashes for flux-style action configuration
		for (var action in actions) {
			console.log(action, actions[action]);

			this.dispatcher.register(action, this, 'handleTest');
		}
	},
	unbindListen: function() {

	}
}