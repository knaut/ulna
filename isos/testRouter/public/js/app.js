// hack
// jquery overrules $ in order of op clientside
// declaring this here fixes it for server though
if (typeof window === 'undefined') {
	$ = require('./appHead.js');	
}

// requires
var Component = require('../../../../modules/component.js');
var dispatcher = require('./dispatcher.js');
var services = require('./services/services.js');

// components
var nav = require('./components/nav.js');
var main = require('./components/main.js');

// expose the app as a global root we can access later if desired
app = new Component({
	root: '#app-root',
	dispatcher: dispatcher,
	template: {
		nav: nav,
		'#main': main
	},

	events: {
		'popstate': function() {
			// handle back/forward buttons
		}
	},

	listen: {
		'ROUTE_CHANGE': function() {
			// if we recieve a route change, we can determine
			// what to do based on the payload

			// if we have a route configured,
			// we pass the payload to that route's handler
		}
	},

	router: {
		'/': function() {
			// do something based on a route
		},
		'/test-1': function() {
			// do something based on a route,
			// like query a services layer and pass on a payload
		},
		'/test-2': function() {
			// do something based on a route
		},
		'/test-3/wildcard': function() {
			// do something based on a route
		}
	}
});



module.exports = app;