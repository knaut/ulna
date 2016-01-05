// hack
// jquery overrules $ in order of ops clientside
// declaring this here fixes it for server though
if (typeof window === 'undefined') {
	$ = require('./appHead.js');	
}

// requires
var Component = require('../../../../modules/component.js');
var dispatcher = require('./dispatcher.js');
var services = require('./services/services.js');

// Router
var Router = require('./Router.js');

// components
var nav = require('./components/nav.js');
var main = require('./components/main.js');

// expose the app as a global root we can access later if desired

app = new Router({
	root: '#app-root',
	dispatcher: dispatcher,

	template: {
		nav: nav,
		'#main': main
	},

	events: {
		'popstate': function( event ) {
			// handle back/forward buttons
		}
	},

	listen: {
		'APP_LOAD': function( payload ) {
			// console.log(this, payload);
			this.initialize();
		},

		'ROUTE_CHANGE': function( payload ) {
			// if we recieve a route change, we can determine
			// what to do based on the payload

			// if we have a route configured,
			// we pass the payload to that route's handler

			// best to update history here, where it'll never actually be called in the server

			var route = this.generateRoute( payload.data );

			this.history.push( route );

		}
	},

	router: {
		'/': function( key ) {
			
		},
		'/test-1': function( key ) {
			
		},
		'/test-2': function( key ) {
			
		},
		'/test-3': function( key ) {
			
		},
	 	'/test-3/*': function( key ) {}
	}
});



module.exports = app;