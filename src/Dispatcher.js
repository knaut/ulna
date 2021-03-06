var underscore = require('underscore');
var Events = require('./events.js');
var extend = require('./extend.js');

var Dispatcher = function(options) {
	if (options && options.actions) {
		if (typeof options.actions === 'string') {
			this.createAction(options.actions);
		} else {
			this.createActions(options.actions);
		}
	}

	Object.defineProperty(this, '_actions', {
		enumerable: false,
		value: {}
	});

	underscore.extend(this._actions, Events);

	this.initialize.apply(this, arguments);
}

Dispatcher.prototype = {
	initialize: function() {},

	_prepareAction: function(name, callbacks) {
		var action = {};
		if (underscore.isString(name)) {
			action.name = name;
			if (callbacks) {
				if (underscore.isFunction(callbacks)) {
					action.beforeEmit = callbacks;
				} else {
					for (var c in callbacks) {
						if (callbacks.hasOwnProperty(c)) {
							action[c] = callbacks[c];
						}
					}
				}
			}
		} else {
			action = name;
		}
		return action;
	},

	createAction: function(name, callbacks) {
		var action = this._prepareAction(name, callbacks);
		var dispatch;
		var emit = function(payload) {
			this._triggerAction(action.name, payload);
		}.bind(this);
		var beforeEmit = function(payload) {
			action.beforeEmit(payload, function(newPayload) {
				emit(newPayload);
			});
		};
		var shouldEmit = function(fn) {
			return function(payload) {
				if (action.shouldEmit(payload)) {
					fn(payload);
				}
			};
		};
		if (action.shouldEmit) {
			if (action.beforeEmit) {
				dispatch = shouldEmit(beforeEmit);
			} else {
				dispatch = shouldEmit(emit);
			}
		} else if (action.beforeEmit) {
			dispatch = beforeEmit;
		} else {
			dispatch = emit;
		}
		Object.defineProperty(this, action.name, {
			enumerable: false,
			value: dispatch
		});
	},

	createActions: function(actions) {
		var action;
		for (action in actions) {
			if (actions.hasOwnProperty(action)) {
				this.createAction(actions[action]);
			}
		}
	},

	register: function(action, listener, method) {
		if (!listener) {
			throw new Error('The listener is undefined!');
		}
		method = (typeof(method) === 'function') ? method : listener[method || action];
		if (typeof(method) !== 'function') {
			throw new Error('Cannot register callback `' + method +
				'` for the action `' + action +
				'`: the method is undefined on the provided listener object!');
		}
		this._actions.on(action, method.bind(listener));
	},

	registerStore: function(actions, listener, methods) {
		var isUniqueCallback = (typeof methods) === 'string' || (typeof methods) === 'function';
		var actionsNames;
		if (underscore.isArray(actions)) {
			methods = methods || actions;
			if (!isUniqueCallback && actions.length !== methods.length) {
				throw new RangeError('The # of callbacks differs from the # of action names!');
			}
		} else if (underscore.isObject(actions)) {
			actionsNames = Object.keys(actions);
			methods = actionsNames.map(function(actionName) {
				return actions[actionName];
			});
			actions = actionsNames;
		}
		for (var i = 0, action;
			(action = actions[i]); i++) {
			this.register(action, listener, isUniqueCallback ? methods : methods[i]);
		}
	},

	dispatch: function(actionName, payload) {
		if (this.hasOwnProperty(actionName)) {
			return this[actionName](payload);
		}
		throw new Error('There is not an action called `' + actionName + '`');
	},

	_triggerAction: function(actionName, payload) {
		this._actions.trigger(actionName, payload);
	}
};

Dispatcher.extend = extend;

module.exports = Dispatcher;