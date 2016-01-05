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
	services: services,

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
		'/': {
			name: 'home',
			title: 'testRouter Home',
			handler: function( component ) {
				var queries = component.getChildQueries();
				var props = component.services.queryServices(queries, this.name);
				component.setQueriedChildProps( props );
			}
		},
		'/test-1': {
			name: 'test1',
			title: 'testRouter - test1',
			handler: function( component ) {
				var queries = component.getChildQueries();
				var props = component.services.queryServices(queries, this.name);
				component.setQueriedChildProps( props );
			}
		},
		'/test-2': {
			name: 'test2',
			title: 'testRouter - test2',
			handler: function( component ) {
				var queries = component.getChildQueries();
				var props = component.services.queryServices(queries, this.name);
				component.setQueriedChildProps( props );
			}
		},
		'/test-3': {
			name: 'test3',
			title: 'testRouter - test3',
			handler: function( component ) {
				var queries = component.getChildQueries();
				var props = component.services.queryServices(queries, this.name);
				component.setQueriedChildProps( props );
			}
		},
	 	'/test-3/*': function( component ) {}
	}
});



module.exports = app;