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
		this.bindRoot( this.root );
		console.log(this.root)
	},
	bindRoot: function( root ) {
		// i am root
		this.root = root;
		this.$root = $(root);
	},
	deinitialize: function() {

	},
	bindEvents: function() {

	},
	unbindEvents: function() {

	},
	bindListen: function() {

	},
	unbindListen: function() {

	}
}