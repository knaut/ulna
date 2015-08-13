var Events = require('./Events');
var extend = require('./extend');
var Component = require('./Component');
var Store = require('./Store');
var Dispatcher = require('./Dispatcher');
var Router = require('./Router');

// Ulna - the midnight framework
// A Backbone-style implementation of concepts borrowed from ReactJS and Flux.

// ** your tools should work for you, not the other way around **

// CORE
// create a singleton object to collect all our pieces

var Ulna = {};

// Allow the `Ulna` object to serve as a global event bus, for folks who
// want global "pubsub" in a convenient place.
_.extend(Ulna, Events);

Ulna.extend = extend;
Ulna.Events = Events;
Ulna.Component = Component;
Ulna.Store = Store;
Ulna.Dispatcher = Dispatcher;
Ulna.Router = Router;

if (window) {
	window.Ulna = Ulna;
}

module.exports = Ulna;