// Ulna - the midnight framework
// A Backbone-style implementation of concepts borrowed from ReactJS and Flux.

// ** your tools should work for you, not the other way around **

// CORE
// create a singleton object to collect all our pieces

var Ulna = {};
Ulna.extend = extend;
Ulna.Component = Component;
Ulna.Store = Store;
Ulna.Dispatcher = Dispatcher;
Ulna.Router = Router;