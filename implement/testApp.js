var dispatcher = new Dispatcher({
	actions: [
		'ROUTE_CHANGE'
	]
});

var services = new Services({
	nav: {
		home: {
			url: '/',
			title: 'home',
			name: 'home'
		},
		test1: {
			url: '/test-1',
			title: 'test-1',
			name: 'test1'
		},
		test2: {
			url: '/test-2',
			title: 'test-2',
			name: 'test2'
		},
		test3: {
			url: '/test-3',
			title: 'test-3',
			name: 'test3'
		}
	},
	main: {
		home: {
			title: 'Welcome to home',
			content: 'its cold tonight wow'
		},
		test1: {
			title: 'Welcome to test 1',
			content: 'we have much needed wares here'
		},
		test2: {
			title: 'Welcome to test 2',
			content: 'faruk has rug if you have coin'
		},
		test3: {
			title: 'Welcome to test 3',
			content: 'not sure what just happened to me'
		}
	}
})


var nav = new Component({
	root: 'nav',
	dispatcher: dispatcher,

	props: {
		nav: [
			'home',
			'test1',
			'test2',
			'test3'
		]
	},

	template: {
		ul: function() {
			for (n = 0; nav.length > n; n++) {
				return {
					li: '~~nav[n]~~'
				}
			}
		}
	},

	events: {
		'click li': function(event) {
			this.dispatcher.dispatch('ROUTE_CHANGE', {
				data: event.target.innerText
			});
		}
	}
});

var main = new Component({
	root: '#main',
	dispatcher: dispatcher,
	services: services,
	
	template: {
		'h1': '~~title~~',
		'#inner-content': '~~content~~'
	},
	
	props: {
		title: 'just started',
		content: 'here\'s whatever i start out with'
	},

	listen: {
		'ROUTE_CHANGE': function(payload) {
			// if we recieve a route change, we can determine
			// what to do based on the payload
			this.setProps( this.services.main[payload.data] );
		}
	}
});

var app = new Component({
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