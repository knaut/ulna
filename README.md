# Ulna
A midnight framework for single-page apps

"your tools should work for you, not the other way around"

# What is this?
A javascript framework designed for rapidly creating single-page webapps, for both server and client.

This README is very incomplete. A lot of documentation is forthcoming.

# The Nutshell

	app = new Ulna.Component({
		$el: 'body', 
		template: '<div>{{ message }}</div>', 
		data: { message: 'Hello World' } 
	});

	=> <body>Hello World</body>

Ulna borrows concepts from ReactJS and Flux and implements them in a Backbone style. It is designed to be familiar for Backbone users, and borrows heavily in both code and convention from Backbone and Marionette. Under the surface, however, it is biased to the Flux style of building applications—the use of Stores to maintain state, a uni-directional data flow, and a Dispatcher for messaging.

Components have an update cycle similar to React, and have shouldComponentUpdate(). This function and (all others) can be overruled by using .extend().

Ulna provides a Component, Store, Dispatcher, and Router, all of which can be extended, per Backbone's pattern. These are not all documented yet. However: 
* Components deal with UI interactions and creating child components. 
* Stores handle UI state and the data Components render templates with. 
* The Dispatcher is a shared message registry. Components dispatch messages, but never listen. Stores listen, and may dispatch as well.
* The Router is a specialized Component designed for the browser window and history manipulation.

# Components

Components are the "View" and are solely concerned with UI interactions and rendering templates. Components take children:

	var ChildComponent = Ulna.Component.extend({
		template: '<a class="child">{{ message }}</a>', 
		events: {
			'click a.child': 'log'
		},
		log: function() {
			console.log('hello from the child!')
		}
	});

	App = new Ulna.Component({
		$el: 'body', 
		template: '<div>{{ message }}</div>', 
		childType: ChildComponent,
		data: { 
			message: 'Hello World',
			children: [
				{
					name: 'ChildComponent',
					message: 'this is my child'
				},
				{
					name: 'ChildComponent',
					message: 'this is my other child'
				}
			] 
		} 
	});

Based on the data object, which is a static "view model", the Components will recursively populate its children, passing in their data. Multiple childTypes can be defined:

	App = new Ulna.Component({
		childType: {
			ChildComponent: ChildComponent,
			OtherChild: OtherChild
		}
	});

Where the object's keys are the Component's name as specificed in the data object, and the value is your variable. This can also be an AMD reference.

While populating children, the child components attach themselves to their parent, creating a "component chain". This chain of view layers can be an isolated UI in an app, or can be the app itself. This gives the developer certain advantages when handling Dispatcher messages in Stores.

Components can take multiple templates as well, similar to childTypes.

# Isomorphism
With Cheerio, a server-side port of jQuery's API, its possible to render Components (and their data) on the server. This affords SEO benefits and the seamless experience of a single page app.

# WIP, 'scuze the dust
Ulna is designed to be scrappy and flexible, while encouraging the developer to think in terms of statefulness (via Stores), Dispatcher-style messaging, and progressive UI updates that occur in queues.

Ulna is a WIP and the first production implementations of it are just finishing up. These docs will be much more fleshed out in the coming weeks. For now, you can take a look at the ulnaSimpleRouter repo, which demonstrates an Ulna app with basic routing capabilities and isomorphism.
