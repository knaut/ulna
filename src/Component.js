var extend = require('./extend');

// COMPONENTS
// Like Marionette or Backbone views, but able to be nested within a recursive tree-like hierarchy

var Component = function(obj) {
	// this.children = [];
	// this.childContainer = null;
	// this.childType = 'any';
	// this.template = undefined;
	
	this.cid = _.uniqueId('c');
	for (var prop in obj) {
		this[prop] = obj[prop];
	}
	this.init.apply(this, arguments);
};

/*
{
	initialize,		// all initial bootstrapping
	deinitialize,	// deconstruction, unbinding, clearing of children, etc.

	addId,			// add this unique id to the $el (unused)
	render,			// take store's props, components template, and produce an $el

	bindEvents,		// bind events based on events hash
	unbindEvents,	// unbind events in hash

	hasChildBasedOnId,	// checks if this component has a child that matches the passed cid
	createChildren,		// populates children based on data
	getChildByType,		// dynamically loads components based on childType property, whether string or object

	startUpdate,		// anything to do before updating
	update,				// updating the DOM based on store's updated state
	afterUpdate,		// post-update tasks, if any
}
*/

/*
todos:
refine the way components create/destroy their children
refine the way components create/destroy dom elements (fade in/out animations)

refine way components initialize and deinitialize (for developer use of use)

?lifecycle updating for components*
?still use component.data, or switch to props?

suite of explicit events that define the relationship between store, component
*/

_.extend(Component.prototype, {
	init: function() {
		this._setup();

	},

	_setup: function() {
		this.$el = $(this.$el);
		this._renderTemplate();
		if (this.data.hasOwnProperty('children')) {
			this.createChildren();
		}
	},

	_addCid: function($el) {
		$el.attr('data-cid', this.cid);
	},

	_renderTemplate: function() {
		if (this.template === undefined || !this.template) {
			this._bindEvents();
			return;
		};
		var rendered = _.template(this.template);
		rendered = rendered(this.data);
		if (this.$el.length) {
			this.$el.html(rendered);
		} else {
			this.$el = rendered;
		}
		this._bindEvents();
	},

	_bindEvents: function() {
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

	_unbindEvents: function() {
		var regex = /^(\w+)/;
		for (var prop in this.events) {
			var eventString = regex.exec(prop)[0];
			if (eventString.indexOf('key') > -1) {
				$(document).on(eventString, _.bind(this[this.events[prop]], this));
			} else {
				var reg = /[\S]*$/;

				this.$el.find(reg.exec(prop)[0]).off(eventString, _.bind(this[this.events[prop]], this));
			}
		}
	},

	ensureThisHasChildBasedOnCid: function(cid) {
		var hasChild = false;
		$.each(this.children, function() {
			if (this.cid === cid) {
				hasChild = true;
			}
		}, this);
		return hasChild;
	},

	setComponentData: function() {
		var props = this.store.getCurrentProps();
		this.data = props;

		// this.createChildren();
	},

	createChildren: function() {
		if (typeof this.childType === 'object') {
			for (var i = 0; i < this.data.children.length; i++) {

				var Constructor = this.returnViewTypeByConfig(this.data.children[i]);

				var child = new Constructor({
					cid: this.cid + 'c' + i,
					data: this.data.children[i],
					parent: this,
					children: []
				});

				this.children.push(child);
			}

			this._bindChildren();

		} else {
			for (var i = 0; i < this.data.children.length; i++) {

				var child = new this.childType({
					cid: this.cid + 'c' + i,
					data: this.data.children[i],
					parent: this,
					children: []
				});


				this.children.push(child);
			}

			this._bindChildren();
		}
	},

	returnViewTypeByConfig: function(node) {
		var viewConstructor;
		var payload = [];
		var viewModel = null;

		// eval() workaround
		// remember to add your views to "h" manually, otherwise they won't be recieved
		var h = this.childType;
		for (var prop in this.childType) {

			// prop could be a string or another object
			switch (typeof this.childType[prop]) {
				case 'string':
					if (prop.toUpperCase() === node['name']) {

						viewConstructor = h[this.childType[prop]];

					} else if (prop === 'default') {
						viewConstructor = h[this.childType['default']];
					}

					break;
				case 'object':
					if (prop.toUpperCase() === node['name']) {

						var typeProp = this.childType[prop];

						if (typeProp.hasOwnProperty('type')) {
							viewConstructor = h[typeProp.type];
						}

						// in cases where we have a view model, we have to return just the constructor and the view model
						if (typeProp.hasOwnProperty('viewModel')) {
							viewModel = typeProp.viewModel;
						}
					}
					break;
				case 'function':
					if (prop.toLowerCase() === node['name']) {

						var typeProp = this.childType[prop];

						return typeProp;
					}
					break;
			}
		}

		// we hand back a payload that can contain either the viewConstructor,
		// or the viewConstructor and the viewModle from the SubAppConfig
		payload.push(viewConstructor);
		if (viewModel) {
			payload.push(viewModel);
		}
		return payload;
	},

	_addChild: function(child) {
		this.$el.find(this.childContainer).first().append(child.$el);
	},

	_bindChildren: function() {
		var $children = this.$el.find(this.childContainer).first().children();
		var self = this;
		var i = 0;
		$children.each(function() {
			self.children[i].$el = $(this);
			self.children[i]._bindEvents();
			i++;
		});
	},

	destroy: function() {
		if (this.children.length) {
			for (var i = 0; this.children.length > i; i++) {
				this.children[i].destroy();
			}
		}

		this._unbindEvents();

		this.$el.empty();

		this.children = [];
	},

	startUpdate: function() {},

	update: function() {},

	afterUpdate: function() {}
});

Component.extend = extend;

module.exports = Component;