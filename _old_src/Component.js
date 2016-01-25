var extend = require('./extend');
var Events = require('./Events');

// COMPONENTS
// Like Marionette or Backbone views, but able to be nested within a recursive tree-like hierarchy

var Component = function(obj) {
	// updateCycle is for state updates in an associated store
	this._updateCycle = ['beforeUpdate', 'onUpdate', 'afterUpdate'];
	this._updateCycleTimeout = true;

	// refreshCycle is for when a component's data changes and needs to re-render.
	// this is usually when its store recieved new props.
	this._refreshCycle = ['beforeRefresh', 'onRefresh', 'afterRefresh'];
	this._refreshCycleTimeout = true;

	// when we add children we fire three methods in a queue, if childAnimate is specified.
	// the before/after methods are designs to provide hooks into animating children in and out
	this._queueAddChildCycle = ['beforeAddChild', 'addChild', 'afterAddChild'];
	this._queueAddChildCycleTimeout = true;

	this._queueRemoveChildCycle = ['beforeRemoveChild', 'removeChild', 'afterRemoveChild'];
	this._queueRemoveChildCycleTimeout = true;

	this.id = _.uniqueId('c');
	this.children = [];

	for (var prop in obj) {
		this[prop] = obj[prop];
	}

	this.initialize.apply(this, arguments);
};

var proto = {
	initialize: function() {
		this.setStore();

		if (typeof this.$el === 'string') {
			this.$el = $(this.$el);

			if (this.template) {
				this.render();
			}
		} else {
			// if we haven't supplied an $el, we're probably populating children
			this.renderAsChild();
		}

		if (this.store) {
			this.bindInternals();
		}
	
		if (this.data.hasOwnProperty('children')) {
			this.createChildren();
		}

		if (this.events) {
			this.bindEvents();
		}

		this.trigger('initialized');
	},
	deinitialize: function() {
		if (this.store) {
			this.store.deinitialize();
		}

		if (this.data.hasOwnProperty('children')) {
			this.destroyChildren();
		}

		this.unrender();
	},

	// internal events only, like componentUpdate and propsSet
	bindInternals: function() {
		this.store.on( 'componentUpdate', this.startUpdate, this );
		this.store.on( 'propsSet', this.startRefresh, this );
	},
	unbindInternals: function() {
		this.store.off( 'componentUpdate', this.startUpdate, this );
		this.store.off( 'propsSet', this.startRefresh, this );
	},

	setStore: function() {
		// meant to be overriden
		// stores may not always be needed for a component
		// you can overrule this function to set your store during initialization
		return false;
	},
	setComponentData: function() {
		if (this.store) {
			this.data = this.store.getCurrentProps();
		} else {
			console.log('Warning: setComponentData fired, but no store to get props from')
		}
	},

	// the only difference between render and renderAsChild, is that renderAsChild
	// assigns the rendered template as the component's element. render, however,
	// dumps the template into an already assigned $el
	render: function() {
		var template = this.getTemplate();

		template = _.template( template );

		template = template( this.data );

		this.$el.html( template );

		this.trigger('rendered');
	},

	renderAsChild: function() {
		var template = this.getTemplate();

		template = _.template( template );
		
		template = template( this.data );

		this.$el = $( template );

		this.trigger('renderedAsChild');
	},

	unrender: function() {
		this.unbindEvents();
		this.$el.remove();
	},

	bindEvents: function() {
		var regex = /^(\w+)/;
		for (var prop in this.events) {
			var eventString = regex.exec(prop)[0];
			if (eventString.indexOf('key') > -1) {
				$(document).on(eventString, _.bind(this[this.events[prop]], this));
			} else {
				var reg = /[\S]*$/;

				this.$el.find(reg.exec(prop)[0]).on(eventString, _.bind(this[this.events[prop]], this));
			}
		}
	},
	unbindEvents: function() {
		var regex = /^(\w+)/;
		for (var prop in this.events) {
			var eventString = regex.exec(prop)[0];
			if (eventString.indexOf('key') > -1) {
				$(document).off(eventString, _.bind(this[this.events[prop]], this));
			} else {
				var reg = /[\S]*$/;

				this.$el.find(reg.exec(prop)[0]).off(eventString, _.bind(this[this.events[prop]], this));
			}
		}
	},

	getChildByType: function( node ) {
		// iterate over this.childType, returning the necessary constructor references
		// based on the 'name' of the current prop's child node
		/* 
		i.e. sample props:
		
		children : [
			{ name: 'myChildType',
			  data: 'some data'},
			{ name: 'otherChildType'
			  data: 'other data' }
		]

		in your constructor:

		childType: {
			myChildType: myChildType	// the first is a key (string), the second is your require() reference
			otherChildType: otherChildType
		}
		*/

		// would be nice to have the node keys dynamically set by the developer
		for (var prop in this.childType) {
			if (prop === node.name) {
				return this.childType[prop];
			}
		}
	},

	// support for multiple templates
	getTemplate: function() {

		// look for a 'type' property associated with a given child node
		// if the type matches a template's key in an object hash, we return that template
		// if not, we just pass the template as normal
		if (typeof this.template === 'object') {

			if ( Object.keys(this.data).length === 1 ) {
				// only one key, we've just inited with no real data
				return this.template.default;
			} else {

				for ( var prop in this.template ) {
					if ( prop === this.data.type ) {
						return this.template[prop]
					}
				}
			}
		} else {
			return this.template;
		}
	},

	createChildren: function() {
		for (var i = 0; i < this.data.children.length; i++) {
			if (typeof this.childType === 'object') {
				var Constructor = this.getChildByType(this.data.children[i]);

				var child = new Constructor({
					id: this.id + 'c' + i,
					data: this.data.children[i],
					parent: this
				});
			} else {
				var child = new this.childType({
					id: this.id + 'c' + i,
					data: this.data.children[i],
					parent: this,
				});
			}

			// try these out
			// if race conditions, make a queue
			if (this.hasOwnProperty('childAnimate') || this.__proto__.hasOwnProperty('childAnimate')) {
				// console.log('createChildren: this.childAnimate', this.childAnimate)
				this.queueAddChild( child );
			} else {
				this.addChild( child );
			}
		}

		this.trigger('createdChildren', {
			id: this.id,
			children: this.children
		});
	},

	queueAddChild: function( child ) {
		// fire our assigned lifecycle methods in a queue, blocking the process if any return false
		var self = this;
		if (self._queueAddChildCycle.length <= 0) {
			return;
		}

		var continueCycle;
		var ms = 0;
		(function chain(i) {

			if (i >= self._queueAddChildCycle.length) {
				return;
			}

			self._queueAddChildCycleTimeout = setTimeout(function() {

				if ( self._queueAddChildCycle[ i ] !== 'addChild') {

					// we make the millisecond wait delay an optional argument here
					if ( self.childAnimate[ self._queueAddChildCycle[ i ] ].length > 0 ) {
						ms = self.childAnimate[ self._queueAddChildCycle[ i ] ][1];
					}
					
					self.childAnimate[ self._queueAddChildCycle[ i ] ][0]( child );
				} else {
					ms = 0;
					self[ self._queueAddChildCycle[ i ] ]( child );
				}

				chain(i + 1);
			}, ms);

		})(ms);
	},

	addChild: function(child) {
		if (this.childContainer) {
			this.$el.find( this.childContainer ).first().append( child.$el );
		} else {
			this.$el.append( child.$el );
		}

		this.children.push( child );

		this.trigger('addedChild', child);
	},

	destroyChildren: function() {
		if (this.children.length) {
			for (var i = 0; this.children.length > i; i++) {
				if (this.hasOwnProperty('childAnimate') || this.__proto__.hasOwnProperty('childAnimate')) {
					this.queueRemoveChild( this.children[i] );
				} else {
					this.removeChild( this.children[i] );
				}
			}

			this.children = [];

			this.trigger('destroyedChildren', this.id);
		}
	},

	queueRemoveChild: function( child ) {
		// fire our assigned lifecycle methods in a queue, blocking the process if any return false
		var self = this;
		if (self._queueRemoveChildCycle.length <= 0) {
			return;
		}

		var continueCycle;
		var ms = 0;
		(function chain(i) {

			if (i >= self._queueRemoveChildCycle.length) {
				return;
			}

			self._queueRemoveChildCycleTimeout = setTimeout(function() {

				if ( self._queueRemoveChildCycle[ i ] !== 'removeChild') {

					// we make the millisecond wait delay an optional argument here
					if ( self.childAnimate[ self._queueRemoveChildCycle[ i ] ].length > 0 ) {
						ms = self.childAnimate[ self._queueRemoveChildCycle[ i ] ][1];
					}
					
					self.childAnimate[ self._queueRemoveChildCycle[ i ] ][0]( child );
				} else {
					ms = 0;
					self[ self._queueRemoveChildCycle[ i ] ]( child );
				}

				chain(i + 1);
			}, ms);

		})(ms);
	},

	removeChild: function( child ) {
		child.deinitialize();
	},

	startRefresh: function( payload ) {
		// fire our assigned lifecycle methods in a queue, blocking the process if any return false
		var self = this;
		if (self._refreshCycle.length <= 0) {
			return;
		}

		var continueCycle;
		(function chain(i) {

			if (i >= self._refreshCycle.length || typeof self[self._refreshCycle[i]] !== 'function') {
				return;
			}

			self._refreshCycleTimeout = setTimeout(function() {
				continueCycle = self[self._refreshCycle[i]](payload);
				if (!continueCycle) {
					return;
				}
				chain(i + 1);
			}, 0);

		})(0);
	},

	beforeRefresh: function() {
		if (this.children.length) {
			this.destroyChildren();
		} else {
			this.unbindEvents();
			this.$el.empty();
		}
		this.setComponentData();

		return true;
	},
	onRefresh: function() {
		if (this.data.hasOwnProperty('children')) {
			this.createChildren();
		} else {
			this.render();
		}

		return true;
	},
	afterRefresh: function() {
		if (this.events || this.__proto__.events) {
			this.bindEvents();
		}
	},

	startUpdate: function( payload ) {
		// fire our assigned lifecycle methods in a queue, blocking the process if any return false
		var self = this;
		if (self._updateCycle.length <= 0) {
			return;
		}

		var continueCycle;
		(function chain(i) {

			if (i >= self._updateCycle.length || typeof self[self._updateCycle[i]] !== 'function') {
				return;
			}

			self._updateCycleTimeout = setTimeout(function() {
				continueCycle = self[self._updateCycle[i]](payload);
				if (!continueCycle) {
					return;
				}
				chain(i + 1);
			}, 0);

		})(0);
	},

	beforeUpdate: function() {
		return true;
	},
	onUpdate: function() {
		return true;
	},
	afterUpdate: function() {

	}
}

_.extend(Component.prototype, Events, proto);

Component.extend = extend;

module.exports = Component;
