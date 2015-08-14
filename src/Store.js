var extend = require('./extend');
var Events = require('./Events');

// STORE
// Store is your "model" or data layer. A store represents, and maintains, a discrete
// piece of application or UI data. Todo: use props as static data from the server, only
// updated when about to be POSTed back to the server.
// State is solely data for the UI component's consumption (i.e. a "view model")

var Store = function(obj) {
	this._lifecycle = ['startUpdate', 'onUpdate', 'afterUpdate'];
	this._lifecycleTimeout = true;
	// imagine the store as a model/state universe that intakes data
	// from the server, constructs an updated view data obj, and then sets it on the view
	this.model = {};
	this.props = {}; // the response from the server (parsed), in other words static data
	this.state = {}; // current state (before set on model, posted to server)
	for (var prop in obj) {
		this[prop] = obj[prop];
	}
	this.init.apply(this, arguments);
};

/*
	initialize,				// all preliminary setup
	deinitialize,			// deconstruction, unbinding events, etc

	bindInternals, 			// convenience function for binding internal events (and events the component listens to)
	registerWithDispatcher, 	// all dispatcher registrations (blank by default)

	compareCidsByLevel, 		// takes two concatenated cids and checks if they match to a certain level, informing us if the two are related.
								// this is particularly useful in event handlers when listening to blanket dispatcher events.
								// use this function when you want to block a store's process because the dispatcher's message was irrelevant based
								// on the component parent-child hierarchy

	getCurrentState,				// needs work, should provide a copied object of this store's state
	getCurrentProps,				// needs work, should provide a copied object of this store's props

	setState,				// takes an incoming object, sets state properties based on that object. if successful, fires off an event
	setProps,				// takes an incoming object, sets state properties based on that object. if successful, fires off an event

	shouldComponentUpdate,	// takes the current state (props?) and a mutated version of the same object, compares the two, and if they are different, fires an event
	startLifecycle,			// kicks off the store's update process, firing the specified functions in a queue

	startUpdate,			// update process part 1
	onUpdate,				// update process part 2 (most often used)
	afterUpdate			// any post-update processes
	
*/

_.extend(Store.prototype, Events, {
	init: function() {
		this.cid = _.uniqueId('s');
		this.setProps(this.model);
		// initial state from constructor args
		this.setState(this.state);
		this.bindInternals();
		this.registerWithDispatcher();
		// this._startLifecycle( );
	},

	bindInternals: function() {
		// this.on('setState', this.setState, this);
		this.on('startLifecycle', this._startLifecycle, this);
		this.on('shouldComponentUpdate', this.shouldComponentUpdate, this);
	},

	registerWithDispatcher: function() {
		// overrule in your constructor
	},

	compareCidsByLevel: function(integer, compareCid, comparatorCid) {
		// take two cids and compare them to see if they match up to a certain limit,
		// starting from the beginning.
		// the integer specifies how many levels we are checking down in the component hierarchy
		// starting from the topmost cid
		// in an event handler, the compareCid is the incoming cid, while the comparatorCid
		// is the id to check against, usually this.cid or this.parent.cid
		// basically the first id should be the same length or longer than the second
		var compareCidArr = compareCid.split('c');
		compareCidArr.shift();

		var comparatorCidArr = comparatorCid.split('c');
		comparatorCidArr.shift();

		for (var i = 0; i < integer; i++) {
			if (compareCidArr[i] !== comparatorCidArr[i]) {
				return false;
			}
		}
		return true;
	},

	getState: function(string) {
		if (this.state.hasOwnProperty(string)) {
			return this.state[string];
		}
	},

	setProps: function(obj) {
		for (var prop in obj) {
			if (this.model.hasOwnProperty(prop)) {
				this.props[prop] = obj[prop];
			}
		}

		this.trigger('propsSet', this.cid);
	},

	setState: function(state) {
		for (var item in state) {
			if (this.state.hasOwnProperty(item)) {
				this.state[item] = state[item];
				this.trigger('shouldComponentUpdate');
			} else {
				return false;
			}
		}
	},

	getCurrentState: function(state) {
		var clonedState = _.clone(this.state);
		return clonedState;
	},

	getCurrentProps: function() {
		return $.extend(true, {}, this.props);
	},

	shouldComponentUpdate: function(nextState) {
		if (_.isEqual(nextState, this.state)) {
			return false;
		} else {
			this.setState(nextState);
			this.trigger('componentUpdate');
			return true;
		}
	},

	_startLifecycle: function() {
		var payload = arguments;
		var self = this;

		if (self._lifecycle.length <= 0) {
			return;
		}

		var continueCycle;
		(function chain(i) {

			if (i >= self._lifecycle.length || typeof self[self._lifecycle[i]] !== 'function') {
				return;
			}

			self._lifecycleTimeout = setTimeout(function() {
				continueCycle = self[self._lifecycle[i]](payload);
				if (!continueCycle) {
					return;
				}
				chain(i + 1);
			}, 0);

		})(0);
	},

	startUpdate: function() {
		// define your custom method
		// ensure this target obj based on the desired id
		// if not, return false
		return true;
	},

	onUpdate: function() {
		// define your custom method
		// clone current state
		// construct new state object
		// shouldComponentUpdate( prevState, nextState )
		return true;
	},

	afterUpdate: function() {
		// make dispatcher calls if necessary, etc
	}
});

Store.extend = extend;

module.exports = Store;

