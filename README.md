# Ulna
A midnight micro-library for universal, single-page web applications.

## What is this?

A javascript library for writing component-oriented web applications. Ulna began as a framework that sought to combine the API of traditional BackboneJS applications with the philosophy of ReactJS and Flux-oriented messaging frameworks.

Ulna still borrows from Backbone's Event API and @tallysonic's Backbone.Dispatcher module. In version 0.0.2, however, the API has been radically simplified and minimized. Ulna now utilizes Nerve templates, a module which can be found on my github page (github.com/knaut/nerveTemplates). Nerve templates are Javascript objects that represent DOM elements, and can be rendered as templates client-side or server-side.

# The Nutshell

	var app = new Ulna.Component({
		root: 'body', 
		data: {
			message: 'Hello World'
		},
		template: {
			div: function() {
				return {
					em: this.data.message
				}
			}
		}, 
	});

	=> <body><div><em>Hello World</em></div></body>

Components are rendered into a root element which is a jQuery selector. In a server-side implementation, this root reference depends on Cheerio, which is a server-side implementation of jQuery's API.

The component's data object is a simple object that represents that state of the component. This object stores any information the component renders in its templates. Data objects represent both the state of the component and the actual content it renders into its templates. 

# Components

Components are the "View" and are solely concerned with UI interactions and rendering templates. Components can take child components as referenced in their template:

	var ChildComponent = Ulna.Component.extend({
		root: '#root',

		data: {
			message: 'none'
		},

		template: {
			'li.child': function() {
				a: this.data.message
			}
		}
	});

	App = new Ulna.Component({
		root: 'body', 
		
		data: {
			messages: [
				'first',
				'second',
				'third'
			]
		},

		template: {
			'ul#root': function() {
				var children = [];

				for (var i = 0; this.data.messages.length > i; i++) {
					children.push(new ChildComponent({
						data: {
							message: this.data.messages[i]
						}
					}))
				}

				return children;
			}
		}
	});

# Messaging

Components accept event objects where the keys of the object are CSS selectors and the assigned function is the value. The component will look for such an element below its root. This is reminiscient of Backbone-style event objects except that the function themselves are inlined within the object.

	var ChildComponent = Ulna.Component.extend({
		root: '#root',

		data: {
			message: 'none'
		},

		// events go here
		events: {
			'click li.child a': function(e) {
				e.preventDefault();

				console.log('hello from the child!', this.data.message);
			}
		},

		template: {
			'li.child': function() {
				a: this.data.message
			}
		}
	});

In Flux-style messaging, "Actions" are defined as constants within your application that are triggered by user interactions. Actions carry a payload object, which may be consumed by any listening Component. Ulna includes a Dispatcher for Flux-style messaging. Components accept a "listen" object, akin to the events object, where the keys are the name of the action and the value is a function to handle the action.

	var dispatcher = new Ulna.Dispatcher({
		actions: [
			'ROUTE_CHANGE'
		]
	});

	var ChildComponent = Ulna.Component.extend({
		root: '#root',

		dispatcher: dispatcher,

		data: {
			message: 'none'
		},

		// events go here
		events: {
			'click li.child a': function(e) {
				e.preventDefault();

				console.log('hello from the child!', this.data.message);
			}
		},

		// actions go here
		listen: {
			'ROUTE_CHANGE': function( payload ) {
				console.log('listening to ROUTE_CHANGE and recieved:', payload);
			}
		},

		template: {
			'li.child': function() {
				a: this.data.message
			}
		}
	});

Actions are used to modify the data object and refresh the template based on the payload received. It's up to the component to decide how it should consume the payload.

# Services Layer
In the past version of Ulna, Flux-style "Stores" were used in place of Backbone models. Stores were often associated with specific components, and so it was up to the developer to decide how to coordinate application state across many stores.

The current version eschews this in favor of a simple but extendable "Services" object, which holds all application state in a single object. 

	var services = new Ulna.Services({
		data: {
			// create an object that contains the data your components might need to acces
		}
	});

The library is agnostic about the "services layer" and doesn't provide any wrappers or helpers for asynchronous methods. These can be placed in the Dispatcher. Services is treated like a dumb object that the Dispatcher or Components can access when some other application data is needed. The main advantage is that the app's data is localized in a single place.

For small, static sites with non-sensitive data, application data can be bundle with logic on the client-side, minimizing any network requests.

# Router
Ulna's Router is pared-down Component that deals with browser window events and HTML's History API. It takes an event hash, like a component, but only listens for events on the window, like "popstate" or "pushstate". It also takes a listen hash, which works like a component's hash.

	var router = new Ulna.Router({
		dispatcher: dispatcher,

		data: {
			history: []
		},

		events: {
			'popstate': function(event) {
				// handle popstates that represent first load
				if ( event.state === null ) {
					var req = 'index'
				} else {
					var req = event.state.req
				}

				this.dispatcher.dispatch(
					'HISTORY_REPLACE', {
						data: req
					}
				);			
			}
		},

		listen: {
			'HISTORY_PUSH': function( payload ) {
				this.history.push(payload.data);
			},
			'HISTORY_REPLACE': function( payload ) {
				this.history.replace(payload.data);
			}
		}
	});

The architecture represented here is simplistic. In future versions the router may take on the responsibilities of the top-level component. The history methods are simple wrappers around the HTML5 history API, which accepts history changes as plain objects.

# Universal
With Cheerio, a server-side port of jQuery's API, components can be rendered server-side. This affords SEO benefits and the seamless experience of a single page app.

	npm install cheerio

Require Cheerio in your server, and write a simple HTML string that will represent your app's "head"—everything until the first "root" of your first Component.

In your server-side routes, you must set your components' data manually, spoofing the interaction that would've been recieved client-side. Cheerio will render the component string as if it was doing so normally on the client, and you can reply from the server with the resulting HTML string.

Browserifying components allows you to write the same app for the client and server, treating your top-level component as just the top of a nested object to be stringified. Once the application is loaded, you may use the "bind" function on the top-level component to bind your component chain to the server-side rendered DOM. From there, the client-side application takes over any route changes.

# Conclusion
Ulna is designed to be flexible and scrappy. 0.0.2 leaves more things up to the developer in terms of messaging and state management, but has a radically simplified API that can be used in conjunction with Nerve templates. Components can be composed together in nested objects that represent templates to be rendered. This affords JSX-like composability without the XML syntax. Ulna's notion of components is simply that of a association a template with data, event handlers to DOM elements, and action handlers with action types.

For small, static sites that want the benefits of SEO and the single-page app experience, this is all that's necessary.

## Todo
* more robust router with normalization methods for route objects
* focus on pure, testable functions
* api for template mutations below the route
* api for updating services layer based on incoming AJAX requests, if needed

# Credits
daniel anderson (knaut) - info@knaut.net, portfolio.knaut.net
Dispatcher lifted from @talyssonoc https://github.com/talyssonoc/backbone-dispatcher