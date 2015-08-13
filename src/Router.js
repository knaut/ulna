var extend = require('./extend');
var Events = require('./Events');

// ROUTER
var Router = function(obj) {
	this.state = {}; // current state (before set on model, posted to server)
	for (var prop in obj) {
		this[prop] = obj[prop];
	}

	this.init.apply(this, arguments);
};

_.extend(Router.prototype, Events, {
	init: function() {
		this.setState(this.state);
		this.on('routerUpdate', this.update, this);
		this.registerWithDispatcher();
	},

	registerWithDispatcher: function() {
		// overrule in the constructor
	},

	getState: function(string) {
		if (this.state.hasOwnProperty(string)) {
			return this.state[string];
		}
	},

	setState: function(state) {
		for (var item in state) {
			if (this.state.hasOwnProperty(item)) {
				this.state[item] = state[item];
				this.trigger('routerUpdate');
			} else {
				return false;
			}
		}
	},

	getCurrentState: function(state) {
		var clonedState = _.clone(this.state);
		return clonedState;
	},

	updateHistory: function(name) {
		document.title = name;

		// update the history
		history.pushState({
			title: name,
			name: name
		}, name, name);
	},

	update: function() {

	}
});

Router.extend = extend;

module.exports = Router;