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

Components can take multiple templates as well, similar to childTypes. The component will look for a 'type' key in its data object, where the value is the name of your template

	App = new Ulna.Component({
		template: {
			MyTemplate: MyTemplate,
			MyAlternateTemplate: MyAlternateTemplate
		}
		childType: {
			ChildComponent: ChildComponent,
			OtherChild: OtherChild
		}
		data: {
			children: [
				{
					name: 'MyChildComponent',
					type: 'MyTemplate'
				},
				{
					name: 'MyChildComponent',
					type: 'MyAlternatTemplate'
				}
			]
		}
	});

The "data" object is a read-only property, and should never be modified directly. To mutate a component's data, or state, we use a Store.

# Stores
Stores are akin to Models in Backbone. In a Flux application, Stores deal with your application's data, and are in charge of mutating that data as the user interacts with your application. Think of them as self-contained universes concerned with a specific kind of data.

	var MyStore = Ulna.Store.extend({});

Components don't always need stores, but if they are mutating the DOM based on interactions, or have a need to re-render after new data is recieved, they will need a Store. A handy way to assign a store to a component is to use the Component's setStore() function.

	var MyComponent = Ulna.Component.extend({
		setStore: function() {
			this.store = new MyStore({
				// it is strongly encouraged to pass in the component as the Store's parent.
				// this will be useful when we start recieving calls from the Dispatcher.
				parent: this,
				state: {
					myStateVariable: false	// a simple state variable, such as a toggle
				}
			})
		}
	});

As in React/Flux, Stores have two important properties with which they manage your app's data: "props" (short for "properties") and "state". You can think of props as an analogue to Backbone's Model attributes. Props are the data with which your component will render its template. State is used to describe the Component's current state, usually for the purpose of modifying its HTML in some way—such as adding or removing a CSS class based on a boolean flag.

	MyComponent.store.setProps({
		children: [
			{
				name: 'MyIncomingChild'
				message: 'Some interesting data.'
			}
		]
	});

Use the setProps() function, rather than setting props on a store directly. setProps() will fire an internal event called "propsSet", which will inform the store's associated Component to start its refresh cycle.

Stores also have a "model" attribute, which you can treat as a schema for props. If the store is handed a props object the model does not have, that property will not be set. If this is undesirable, it's possible to overwrite the setProps() function—just remember to trigger the propsSet event!

	MyStore = Ulna.Store.extend({
		// setProps as it appears in the source code
		// you can overwrite this with your own version, just don't forget to trigger the event at the end!
		setProps: function(obj) {
			for (var prop in obj) {
				if (this.model.hasOwnProperty(prop)) {
					this.props[prop] = obj[prop];
				}
			}

			this.trigger('propsSet');
		}
	});

# Updating Stores
In Ulna, both Components and Stores mutate their data in a "lifecycle" where the update occurs progressively in queues. For Stores, this update cycle is where state is mutated and set. 

	MyStore = Ulna.Store.extend({
		onUpdate: function( payload ) {
			// this method is designed to be overruled in your code. it is blank by default.
			if (payload === true) {
				return true;
			} else {
				return false;
			}
		}
	});

There are three functions in the lifecycle queue. beforeUpdate(), onUpdate(), and afterUpdate() are all blank by default and are meant to be overruled by the developer. If either beforeUpdate() or onUpdate() return false, the process will stop and the Component will not update. Another way to do this is to use shouldComponentUpdate().

	MyStore = Ulna.Store.extend({
		beforeUpdate: function( payload ) {
			// let's just pass on through
			return true;
		},
		onUpdate: function( payload ) {
			
			if (payload.foo === 'bar') {
				payload.foo = 'baz'
			} else {
				payload.foo = 'bar'
			}

			// shouldComponentUpdate returns a boolean, either true or false
			return this.shouldComponentUpdate( payload );
		}
	});

shouldComponentUpdate(), a function familiar to React developers, takes a copy of the existing Store's state and diffs it against the updated version. If the two are different, the Store will set the new state and trigger the internal 'componentUpdate' event. This event tells the component it is safe to start updating.

shouldComponentUpdate() can and should be overruled by the developer when appropriate. This is usually where a simple equality check is not sufficient.

# Updating Components
Components have a similar cycle, and it is used to mutate the Component's HTML directly, usually through direct DOM scripting or jQuery manipulation.

	var MyComponent = Ulna.Component.extend({
		onUpdate: function() {
			// getCurrentState gives us a safely cloned copy of our state object
			var state = this.store.getCurrentState();
			if (state.active) {
				this.$el.addClass('active');
			} else {
				this.$el.removeClass('active');
			}

			// returning true will continue the update cycle, and fire afterUpdate();
			return true;
		}
	});

Components have also have a "refresh" cycle, which does not need to be modified by the developer. It is used to re-render the Component's template with its data, and this cycle occurrs whenever the Component's Store recieves new props. This cycle takes care of creating children (if any) and re-binding events.

This pattern of progressive updating is designed to encourage the developer to be explicit and verbose with their updates. What is being updated should be clearly visible, even to someone unfamiliar with the underlying implementation. 

Keeping state internal to the Store and mapping it as a native Javascript object also saves us the headache of having to check the DOM to understand what our application is doing. DOM manipulation is expensive—checking an easily accessible object is much faster, and shouldComponentUpdate() keeps us from doing so unnecessarily. By storing state explicitly, we can ask a Store for its state ( Store.getCurrentState() ), and have a full understanding of what our application is doing without diving into the DOM.

# Dispatcher
The Dispatcher is used to communicate between Components and Stores. In Flux applications, there is only one dispatcher. Think of it as a shared message registry, and those messages, called "Actions" in Flux parlance, should be constant and unchanging. Actions carry a payload object, which is consumed by whomever is listening. Simple apps may only have a couple actions. Even in larger apps, actions should be relatively few in number. 

	var Dispatch = new Ulna.Dispatcher({
		actions: [
			'get_resource',		// this action may be used for a GET request
			'post_resource',	// this action may be for POSTing
			'pop_state'			// typical action for managing history
		]
	});

Try to distill the major kinds interactions your App is doing at a broad, global level, and those will likely be your actions. Actions generally don't care where they are coming from or where they are going. They are only concerned with what just happened in the application.

Similar to a Store or Component's update cycle, the actions can be modified as they pass through the Dispatcher.

	var Dispatch = new Ulna.Dispatcher({
		actions: [
			{
				name: 'my_action',
				beforeEmit: function ( payload, next ) {
					// here we can modify the payload, if we wish
					// if we do not fire next() with the payload, the action will not be emitted
					next( payload );
				},
				shouldEmit: function ( payload ) {
					if ( payload < 2 ) {
						// if we return false the action will not emit
						return false;
					}
					
					return true;
				}
			}
		]
	});

Ulna's Dispatcher is borrowed directly from @talyssonoc and his Backbone Dispatcher implmentation (https://github.com/talyssonoc/backbone-dispatcher). It is virtually identical (thank you, @talyssonoc!).

# Messaging with the Dispatcher
Components and Stores never talk directly to each other, but rather defer to the Dispatcher to communicate between themselves. 

	var MyComponent = Ulna.Component.extend({
		events: {
			'click .button': 'handleButtonClick'
		},
		handleButtonClick: function() {
			Dispatch.dispatch('my_action', {
				id: this.id,
				message: 'I clicked the button!'
			});
		}
	});

Because of the uni-directional data flow in Flux, Components can dispatch actions, but never listen. Only stores listen for Dispatcher actions, though they may also dispatch actions, too.

	var MyStore = Ulna.Store.extend({
		registerWithDispatcher: function() {
			Dispatch.register('my_action', this, 'handleMyAction')
		},
		handleMyAction: function( payload ) {
			console.log('action recieved!', payload);

			this.trigger('startUpdate', payload);
		},
		onUpdate: function( payload ) {
			console.log('now we update our state based on the payload');

			if ( payload ) {
				this.setState( payload );
				return true;
			} else {
				return false;
			}
		}
	});

The Store's registerWithDispatcher() function is a handy way to register with your Dispatcher's actions. To register an action, call Dispatch.register(), passing in the action name, the context ("this"), and then the name of your associated handler. The action's payload will automatically be passed to the handler.

From there, we trigger an internal event for the Store called 'startUpdate'. This begins the Store's update cycle, passing the payload as it goes. If we're happy with the payload, we call setState(), which sets the desired object as the new state, and tells the associated Component it is safe to begin its update cycle.

Here is a diagram of the uni-directional data flow that is central to Flux, showing the organization of Dispatcher, to Store, to Component.

	╔════════════╗       ╔══════════════╗       ╔════════════╗
	║ Dispatcher ║──────>║    Stores    ║──────>║ Components ║
	╚════════════╝       ╚══════════════╝       ╚════════════╝
	     ^                                          │
	     └──────────────────────────────────────────┘

This is different from the traditional PubSub methodology, or the practice of two-way binding. Components never manipulate their Stores directly. Instead the Stores inform Components when it is safe to update, and the Components digest that data. Whenever the Component is interacted with, or new data needs to enter the system, it passes that data to the Dispatcher, and the Stores decide what to do with it.

# Dealing with Messages in Stores
In Flux, Stores listen to whatever action they've registered to. If there are a lot of Stores, but few actions, they will all respond. This is by design in Flux. So it is up to the Stores—and the developer—to decide when the message is actually relevant to an individual store.

Ulna offers a few tricks to deal with this likely scenario.

Let's say that you have a nested list of Components, each one with the same an instance of a Store type you extended. You may want the parent lists to do something whenever their child list items are toggled—such as showing a button to clear any toggled list items. Your chain of components looks like a tree:

	List
	|—— Nested List
		|—— List Item
		|—— List Item
		|—— List Item
	|—— Nested List
		|—— List Item
		|—— List Item
		|—— List Item

If your nested lists have the same kind of Store, both Stores will respond. You toggled only one list item, but both parent lists now think they can be cleared!

In Ulna, similar to Backbone, every entity has a unique id, leveraging Underscore's uniqueId() function.

	_.uniqueId('c')

	// outputs 'c1'

In Ulna, every component is associated in a hierarchical parent/child relationship. Every child concatenates a unique ID with its parent's, and assigns that as its own ID. So your Component chain actually looks like:

	c1
	|—— c1c1
		|—— c1c1c1
		|—— c1c1c2
		|—— c1c1c3
	|—— c1c2
		|—— c1c2c1
		|—— c1c2c2
		|—— c1c2c3

Remember how we passed in our component as the parent which we created our store?

	var MyComponent = Ulna.Component.extend({
		setStore: function() {
			this.store = new MyStore({
				parent: this
			});
		}
	});

When we dispatched our action from the Component, we included that instance's id in the action's payload. We can now use this ID to find out if the message was relevant to us. Here is our updated handler:

	var MyStore = Ulna.Store.extend({
		registerWithDispatcher: function() {
			Dispatch.register('my_action', this, 'handleMyAction')
		},
		handleMyAction: function( payload ) {
			console.log('action recieved!', payload);

			var comparison = this.compareIdsByLevel(2, payload.id, this.parent.id);

			if (comparison === true) {
				this.trigger('startUpdate', payload);	
			} else {
				return;
			}
		}
	});

The Store's compareIdsByLevel() function takes a number (the number of levels in the chain to compare to), the ID we are comparing, and the ID we need to compare against (inevitably the parent Component's id). The function returns a boolean based on whether the compared ID is found in the comparator.

	c1c1 & c1c1c3c4 => it's a match!
	––––   ––––
	
	c1c2 & c1c1c3c8 => irrelevant message, get out
	––––   ––––

Leveraging Ulna's component chain and its notion of concatenated IDs allows you to easily opt out of certain messages in your Store's handlers. When you have many nested components with many instances of the same Store, compareIdsByLevel() can be a very useful tool.

# Router
Ulna's Router is a specialized Component that deals with browser window actions and HTML's History API.

	var MyRouter = Ulna.Router.extend({
		events: {
			'popstate': 'handlePopState'
		},
		routes: {
			'home': 'handleHome',
		},
		registerWithDispatcher: function() {

		},
		handlePopState: function(e) {
			// do everything that relates to the back/forward buttons here
		},
		handleHome: function() {
			this.updateHistory({
				title: 'home',
				name: 'home'
			});
		}
	});

Router's updateHistory() function is a simple wrapper around history.pushState().

The Router's events object is for window-level events, like 'popstate'. Specify routes in the routes object, where the url fragment is the key, and the value is the name of the handler to be called when that route is triggered.

Like Stores, Routers may listen to the Dispatcher, since route changes are usually a global action.

	var MyRouter = Ulna.Router.extend({
		registerWithDispatcher: function() {
			Dispatch.register('update_route', this, 'handleByRoute');
		},
		// a quick function that loops through the associated routes,
		// calling the relevant handler if it matches the "name" property.
		// the name would be included in our Dispatcher's action payload
		handleByRoute: function( payload ) {
			for (var route in this.routes) {
				if (payload.hasOwnProperty('name') && payload.name === route) {
					this[ this.routes[route] ]( payload );
				}
			}
		}
	});

# Isomorphism
With Cheerio, a server-side port of jQuery's API, its possible to render Components (and their data) on the server. This affords SEO benefits and the seamless experience of a single page app.

	npm install cheerio

Require Cheerio in your server, and write a simple HTML string that will represent your app's "head"—everything until the first $el of your first Component.

Require in your Components and their associated Stores. You may have to streamline your code so that it is isomorphic, or client/server agnostic. Things to keep in mind are that "window" or "document" won't exist, so avoid references to these global objects.

In your server-side routes, you can simply call your Component's handlers, spoofing the interaction that would've been recieved client-side. Cheerio will render the component chain as if it was doing so normally on the client, and you can reply from the server with the resulting HTML string.

# Conclusion
Ulna is designed to be scrappy and flexible, while encouraging the developer to think in terms of statefulness (via Stores), Dispatcher-style messaging, and progressive UI updates that occur in queues.

Ulna is a WIP and the first production implementations of it are just finishing up. These docs will be much more fleshed out in the coming weeks. For now, you can take a look at the ulnaSimpleRouter repo, which demonstrates an Ulna app with basic routing capabilities and isomorphism.

# Wish List
* better management of the services layer and sanitizing props consumption by components
* allow developers to change hard-coded keys the component chain uses to populate itself: 'children', 'name', and 'type'
* create more streamlined patterns (and examples) for isomorphic code.
* stronger router, able to deal with wildcards and splats out of the box

# Credits
daniel anderson (knaut) - info@knaut.net, portfolio.knaut.net
Dispatcher lifted from @talyssonoc https://github.com/talyssonoc/backbone-dispatcher

# Remember
"What you create with Ulna is more important than Ulna."
(thanks @jedireza)
