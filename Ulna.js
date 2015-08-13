// Ulna, the midnight framework

// A Backbone-style implementation of concepts borrowed from ReactJS and Flux.

// ** your tools should work for you, not the other way around **

// ----------- //

	// Ulna, the global object
	var Ulna = {
		// extend function stole from Backbone
		extend: function ( protoProps, staticProps ) {
			var parent = this;
			var child;

			if ( protoProps && _.has( protoProps, 'constructor' ) ) {
				child = protoProps.constructor;
			} else {
				child = function () {
					return parent.apply( this, arguments );
				};
			}

			_.extend( child, parent, staticProps );

			var Surrogate = function () {
				this.constructor = child;
			};
			Surrogate.prototype = parent.prototype;
			child.prototype = new Surrogate();

			if ( protoProps ) {
				_.extend( child.prototype, protoProps );
			}

			child.__super__ = parent.prototype;

			return child;
		}
	};

	// Events, stolen from Backbone

	// Ulna.Events
	// ---------------
	// A module that can be mixed in to *any object* in order to provide it with
	// custom events. You may bind with `on` or remove with `off` callback
	// functions to an event; `trigger`-ing an event fires all callbacks in
	// succession.
	//
	//     var object = {};
	//     _.extend(object, Ulna.Events);
	//     object.on('expand', function(){ alert('expanded'); });
	//     object.trigger('expand');
	//

	var Events = Ulna.Events = {};
	// Regular expression used to split event strings.
	var eventSplitter = /\s+/;
	// Iterates over the standard `event, callback` (as well as the fancy multiple
	// space-separated events `"change blur", callback` and jQuery-style event
	// maps `{event: callback}`), reducing them by manipulating `memo`.
	// Passes a normalized single event name and callback, as well as any
	// optional `opts`.
	var eventsApi = function ( iteratee, memo, name, callback, opts ) {
		var i = 0,
			names;
		if ( name && typeof name === 'object' ) {
			// Handle event maps.
			if ( callback !== void 0 && 'context' in opts && opts.context === void 0 ) {
				opts.context = callback;
			}
			for ( names = _.keys( name ); i < names.length; i++ ) {
				memo = iteratee( memo, names[ i ], name[ names[ i ] ], opts );
			}
		} else if ( name && eventSplitter.test( name ) ) {
			// Handle space separated event names.
			for ( names = name.split( eventSplitter ); i < names.length; i++ ) {
				memo = iteratee( memo, names[ i ], callback, opts );
			}
		} else {
			memo = iteratee( memo, name, callback, opts );
		}
		return memo;
	};
	// Bind an event to a `callback` function. Passing `"all"` will bind
	// the callback to all events fired.
	Events.on = function ( name, callback, context ) {
		return internalOn( this, name, callback, context );
	};
	// An internal use `on` function, used to guard the `listening` argument from
	// the public API.
	var internalOn = function ( obj, name, callback, context, listening ) {
		obj._events = eventsApi( onApi, obj._events || {}, name, callback, {
			context: context,
			ctx: obj,
			listening: listening
		} );
		if ( listening ) {
			var listeners = obj._listeners || ( obj._listeners = {} );
			listeners[ listening.id ] = listening;
		}
		return obj;
	};
	// Inversion-of-control versions of `on`. Tell *this* object to listen to
	// an event in another object... keeping track of what it's listening to.
	Events.listenTo = function ( obj, name, callback ) {
		if ( !obj ) {
			return this;
		}
		var id = obj._listenId || ( obj._listenId = _.uniqueId( 'l' ) );
		var listeningTo = this._listeningTo || ( this._listeningTo = {} );
		var listening = listeningTo[ id ];
		// This object is not listening to any other events on `obj` yet.
		// Setup the necessary references to track the listening callbacks.
		if ( !listening ) {
			var thisId = this._listenId || ( this._listenId = _.uniqueId( 'l' ) );
			listening = listeningTo[ id ] = {
				obj: obj,
				objId: id,
				id: thisId,
				listeningTo: listeningTo,
				count: 0
			};
		}
		// Bind callbacks on obj, and keep track of them on listening.
		internalOn( obj, name, callback, this, listening );
		return this;
	};
	// The reducing API that adds a callback to the `events` object.
	var onApi = function ( events, name, callback, options ) {
		if ( callback ) {
			var handlers = events[ name ] || ( events[ name ] = [] );
			var context = options.context,
				ctx = options.ctx,
				listening = options.listening;
			if ( listening ) {
				listening.count++;
			}
			handlers.push( {
				callback: callback,
				context: context,
				ctx: context || ctx,
				listening: listening
			} );
		}
		return events;
	};
	// Remove one or many callbacks. If `context` is null, removes all
	// callbacks with that function. If `callback` is null, removes all
	// callbacks for the event. If `name` is null, removes all bound
	// callbacks for all events.
	Events.off = function ( name, callback, context ) {
		if ( !this._events ) {
			return this;
		}
		this._events = eventsApi( offApi, this._events, name, callback, {
			context: context,
			listeners: this._listeners
		} );
		return this;
	};
	// Tell this object to stop listening to either specific events ... or
	// to every object it's currently listening to.
	Events.stopListening = function ( obj, name, callback ) {
		var listeningTo = this._listeningTo;
		if ( !listeningTo ) {
			return this;
		}
		var ids = obj ? [ obj._listenId ] : _.keys( listeningTo );
		for ( var i = 0; i < ids.length; i++ ) {
			var listening = listeningTo[ ids[ i ] ];
			// If listening doesn't exist, this object is not currently
			// listening to obj. Break out early.
			if ( !listening ) {
				break;
			}
			listening.obj.off( name, callback, this );
		}
		if ( _.isEmpty( listeningTo ) ) {
			this._listeningTo = void 0;
		}
		return this;
	};
	// The reducing API that removes a callback from the `events` object.
	var offApi = function ( events, name, callback, options ) {
		// No events to consider.
		if ( !events ) {
			return;
		}
		var i = 0,
			listening;
		var context = options.context,
			listeners = options.listeners;
		// Delete all events listeners and "drop" events.
		if ( !name && !callback && !context ) {
			var ids = _.keys( listeners );
			for ( ; i < ids.length; i++ ) {
				listening = listeners[ ids[ i ] ];
				delete listeners[ listening.id ];
				delete listening.listeningTo[ listening.objId ];
			}
			return;
		}
		var names = name ? [ name ] : _.keys( events );
		for ( ; i < names.length; i++ ) {
			name = names[ i ];
			var handlers = events[ name ];
			// Bail out if there are no events stored.
			if ( !handlers ) {
				break;
			}
			// Replace events if there are any remaining.  Otherwise, clean up.
			var remaining = [];
			for ( var j = 0; j < handlers.length; j++ ) {
				var handler = handlers[ j ];
				if (
					callback && callback !== handler.callback &&
					callback !== handler.callback._callback ||
					context && context !== handler.context
				) {
					remaining.push( handler );
				} else {
					listening = handler.listening;
					if ( listening && --listening.count === 0 ) {
						delete listeners[ listening.id ];
						delete listening.listeningTo[ listening.objId ];
					}
				}
			}
			// Update tail event if the list has any events.  Otherwise, clean up.
			if ( remaining.length ) {
				events[ name ] = remaining;
			} else {
				delete events[ name ];
			}
		}
		if ( _.size( events ) ) {
			return events;
		}
	};
	// Bind an event to only be triggered a single time. After the first time
	// the callback is invoked, it will be removed. When multiple events are
	// passed in using the space-separated syntax, the event will fire once for every
	// event you passed in, not once for a combination of all events
	Events.once = function ( name, callback, context ) {
		// Map the event into a `{event: once}` object.
		var events = eventsApi( onceMap, {}, name, callback, _.bind( this.off, this ) );
		return this.on( events, void 0, context );
	};
	// Inversion-of-control versions of `once`.
	Events.listenToOnce = function ( obj, name, callback ) {
		// Map the event into a `{event: once}` object.
		var events = eventsApi( onceMap, {}, name, callback, _.bind( this.stopListening, this, obj ) );
		return this.listenTo( obj, events );
	};
	// Reduces the event callbacks into a map of `{event: onceWrapper}`.
	// `offer` unbinds the `onceWrapper` after it has been called.
	var onceMap = function ( map, name, callback, offer ) {
		if ( callback ) {
			var once = map[ name ] = _.once( function () {
				offer( name, once );
				callback.apply( this, arguments );
			} );
			once._callback = callback;
		}
		return map;
	};
	// Trigger one or many events, firing all bound callbacks. Callbacks are
	// passed the same arguments as `trigger` is, apart from the event name
	// (unless you're listening on `"all"`, which will cause your callback to
	// receive the true name of the event as the first argument).
	Events.trigger = function ( name ) {
		if ( !this._events ) {
			return this;
		}
		var length = Math.max( 0, arguments.length - 1 );
		var args = Array( length );

		for ( var i = 0; i < length; i++ ) {
			args[ i ] = arguments[ i + 1 ];
		}
		eventsApi( triggerApi, this._events, name, void 0, args );
		return this;
	};
	// Handles triggering the appropriate event callbacks.
	var triggerApi = function ( objEvents, name, cb, args ) {
		if ( objEvents ) {
			var events = objEvents[ name ];
			var allEvents = objEvents.all;
			if ( events && allEvents ) {
				allEvents = allEvents.slice();
			}
			if ( events ) {
				triggerEvents( events, args );
			}
			if ( allEvents ) {
				triggerEvents( allEvents, [ name ].concat( args ) );
			}
		}
		return objEvents;
	};
	// A difficult-to-believe, but optimized internal dispatch function for
	// triggering events. Tries to keep the usual cases speedy (most internal
	// Ulna events have 3 arguments).
	var triggerEvents = function ( events, args ) {
		var ev, i = -1,
			l = events.length,
			a1 = args[ 0 ],
			a2 = args[ 1 ],
			a3 = args[ 2 ];
		switch ( args.length ) {
		case 0:
			while ( ++i < l ) {
				( ev = events[ i ] ).callback.call( ev.ctx );
			}
			return;
		case 1:
			while ( ++i < l ) {
				( ev = events[ i ] ).callback.call( ev.ctx, a1 );
			}
			return;
		case 2:
			while ( ++i < l ) {
				( ev = events[ i ] ).callback.call( ev.ctx, a1, a2 );
			}
			return;
		case 3:
			while ( ++i < l ) {
				( ev = events[ i ] ).callback.call( ev.ctx, a1, a2, a3 );
			}
			return;
		default:
			while ( ++i < l ) {
				( ev = events[ i ] ).callback.apply( ev.ctx, args );
			}
			return;
		}
	};
	// Aliases for backwards compatibility.
	Events.bind = Events.on;
	Events.unbind = Events.off;
	// Allow the `Ulna` object to serve as a global event bus, for folks who
	// want global "pubsub" in a convenient place.
	_.extend( Ulna, Events );



	// COMPONENTS
	// Like Marionette or Backbone views, but able to be nested within a recursive tree-like hierarchy

	var Component = function ( obj ) {
		this.cid = _.uniqueId( 'c' );
		for ( var prop in obj ) {
			this[ prop ] = obj[ prop ];
		}
		this.init.apply( this, arguments );
	};

	_.extend( Component.prototype, {
		init: function () {
			this._setup();

		},

		_setup: function () {
			this.$el = $( this.$el );
			this._renderTemplate();
			if ( this.data.hasOwnProperty( 'children' ) ) {
				this.createChildren();
			}
		},

		_addCid: function ( $el ) {
			$el.attr( 'data-cid', this.cid );
		},

		_renderTemplate: function () {
			if (this.template === undefined || !this.template) {
				this._bindEvents();
				return;
			};
			var rendered = _.template( this.template );
			rendered = rendered( this.data );
			if ( this.$el.length ) {
				this.$el.html( rendered );
			} else {
				this.$el = rendered;
			}
			this._bindEvents();
		},

		_bindEvents: function () {
			var regex = /^(\w+)/;
			for ( var prop in this.events ) {
				var eventString = regex.exec( prop )[0];
				if (eventString.indexOf('key') > -1) {
					$(document).on(eventString, _.bind( this[ this.events[ prop ] ], this ) );
				} else {
					var reg = /[\S]*$/;

					this.$el.find( reg.exec(prop)[0] ).on( eventString, _.bind( this[ this.events[ prop ] ], this ) );
				}
			}

		},

		_unbindEvents: function () {
			var regex = /^(\w+)/;
			for ( var prop in this.events ) {
				var eventString = regex.exec( prop )[0];
				if (eventString.indexOf('key') > -1) {
					$(document).on(eventString, _.bind( this[ this.events[ prop ] ], this ) );
				} else {
					var reg = /[\S]*$/;

					this.$el.find( reg.exec(prop)[0] ).off( eventString, _.bind( this[ this.events[ prop ] ], this ) );
				}
			}
		},

		ensureThisHasChildBasedOnCid: function ( cid ) {
			var hasChild = false;
			$.each( this.children, function () {
				if ( this.cid === cid ) {
					hasChild = true;
				}
			}, this );
			return hasChild;
		},

		setComponentData: function () {
            var props = this.store.getCurrentProps();
            this.data = props;

            // this.createChildren();
        },

		createChildren: function () {
            if ( typeof this.childType === 'object' ) {
                for ( var i = 0; i < this.data.children.length; i++ ) {

                    var Constructor = this.returnViewTypeByConfig( this.data.children[ i ] );

                    var child = new Constructor( {
                        cid: this.cid + 'c' + i,
                        data: this.data.children[ i ],
                        parent: this,
                        children: []
                    } );

                    this.children.push( child );
                }

                this._bindChildren();

            } else {
                for ( var i = 0; i < this.data.children.length; i++ ) {

                    var child = new this.childType( {
                        cid: this.cid + 'c' + i,
                        data: this.data.children[ i ],
                        parent: this,
                        children: []
                    } );


                    this.children.push( child );
                }

                this._bindChildren();
            }
        },

        returnViewTypeByConfig: function ( node ) {
            var viewConstructor;
            var payload = [];
            var viewModel = null;

            // eval() workaround
            // remember to add your views to "h" manually, otherwise they won't be recieved
            var h = this.childType;
            for ( var prop in this.childType ) {

                // prop could be a string or another object
                switch ( typeof this.childType[ prop ] ) {
	                case 'string':
	                    if ( prop.toUpperCase() === node[ 'name' ] ) {

	                        viewConstructor = h[ this.childType[ prop ] ];

	                    } else if ( prop === 'default' ) {
	                        viewConstructor = h[ this.childType[ 'default' ] ];
	                    }

	                break;
	                case 'object':
	                    if ( prop.toUpperCase() === node[ 'name' ] ) {

	                        var typeProp = this.childType[ prop ];

	                        if ( typeProp.hasOwnProperty( 'type' ) ) {
	                            viewConstructor = h[ typeProp.type ];
	                        }

	                        // in cases where we have a view model, we have to return just the constructor and the view model
	                        if ( typeProp.hasOwnProperty( 'viewModel' ) ) {
	                            viewModel = typeProp.viewModel;
	                        }
	                    }
                    break;
                    case 'function':
	                    if ( prop.toLowerCase() === node[ 'name' ] ) {

	                        var typeProp = this.childType[ prop ];

	                        return typeProp;
	                    }
                    break;
                }
            }

            // we hand back a payload that can contain either the viewConstructor,
            // or the viewConstructor and the viewModle from the SubAppConfig
            payload.push( viewConstructor );
            if ( viewModel ) {
                payload.push( viewModel );
            }
            return payload;
        },

		_addChild: function ( child ) {
			this.$el.find( this.childContainer ).first().append( child.$el );
		},

		_bindChildren: function () {
			var $children = this.$el.find( this.childContainer ).first().children();
			var self = this;
			var i = 0;
			$children.each( function () {
				self.children[ i ].$el = $( this );
				self.children[ i ]._bindEvents();
				i++;
			} );
		},

		destroy: function() {
			if (this.children.length) {
				for (var i = 0; this.children.length > i; i++) {
					this.children[i].destroy();
				}
			}

			this._unbindEvents();

			this.$el.empty();

			this.children = [];
		},

		startUpdate: function () {},

		update: function () {},

		afterUpdate: function () {}
	} );

	Component.extend = Ulna.extend;

	// --------------//

	// STORE
	// Store is your "model" or data layer. A store represents, and maintains, a discrete
	// piece of application or UI data. Todo: use props as static data from the server, only
	// updated when about to be POSTed back to the server.
	// State is solely data for the UI component's consumption (i.e. a "view model")

	var Store = function ( obj ) {
		this._lifecycle = [ 'startUpdate', 'onUpdate', 'afterUpdate' ];
		this._lifecycleTimeout = true;
		// imagine the store as a model/state universe that intakes data
		// from the server, constructs an updated view data obj, and then sets it on the view
		this.model = {};
		this.props = {}; // the response from the server (parsed), in other words static data
		this.state = {}; // current state (before set on model, posted to server)
		for ( var prop in obj ) {
			this[ prop ] = obj[ prop ];
		}
		this.init.apply( this, arguments );
	};

	_.extend( Store.prototype, Ulna.Events, {
		init: function () {
			this.cid = _.uniqueId( 's' );
			this.setProps( this.model );
			// initial state from constructor args
			this.setState( this.state );
			this.bindInternals();
			this.registerWithDispatcher();
			// this._startLifecycle( );
		},

		bindInternals: function () {
			// this.on('setState', this.setState, this);
			this.on( 'startLifecycle', this._startLifecycle, this );
			this.on( 'shouldComponentUpdate', this.shouldComponentUpdate, this );
		},

		registerWithDispatcher: function () {
			// overrule in your constructor
		},

		compareCidsByLevel: function ( integer, compareCid, comparatorCid ) {
			// take two cids and compare them to see if they match up to a certain limit,
			// starting from the beginning.
			// the integer specifies how many levels we are checking down in the component hierarchy
			// starting from the topmost cid
			// in an event handler, the comparingCid is the incoming cid, while the comparatorCid
			// is the id to check against, usually this.cid or this.parent.cid
			// basically the first id should be the same length or longer than the second
			var compareCidArr = compareCid.split( 'c' );
			compareCidArr.shift();

			var comparatorCidArr = comparatorCid.split( 'c' );
			comparatorCidArr.shift();

			for ( var i = 0; i < integer; i++ ) {
				if ( compareCidArr[ i ] !== comparatorCidArr[ i ] ) {
					return false;
				}
			}
			return true;
		},

		getState: function ( string ) {
			if ( this.state.hasOwnProperty( string ) ) {
				return this.state[ string ];
			}
		},

		setProps: function ( obj ) {
			for ( var prop in obj ) {
				if ( this.model.hasOwnProperty( prop ) ) {
					this.props[ prop ] = obj[ prop ];
				}
			}

			this.trigger( 'propsSet', this.cid );
		},

		setState: function ( state ) {
			for ( var item in state ) {
				if ( this.state.hasOwnProperty( item ) ) {
					this.state[ item ] = state[ item ];
					this.trigger( 'shouldComponentUpdate' );
				} else {
					return false;
				}
			}
		},

		getCurrentState: function ( state ) {
			var clonedState = _.clone( this.state );
			return clonedState;
		},

		getCurrentProps: function () {
            return $.extend( true, {}, this.props );
        },

		shouldComponentUpdate: function ( nextState ) {
			if ( _.isEqual( nextState, this.state ) ) {
				return false;
			} else {
				this.setState( nextState );
				this.trigger( 'componentUpdate' );
				return true;
			}
		},

		_startLifecycle: function () {
			var payload = arguments;
			var self = this;

			if ( self._lifecycle.length <= 0 ) {
				return;
			}

			var continueCycle;
			( function chain( i ) {

				if ( i >= self._lifecycle.length || typeof self[ self._lifecycle[ i ] ] !== 'function' ) {
					return;
				}

				self._lifecycleTimeout = setTimeout( function () {
					continueCycle = self[ self._lifecycle[ i ] ]( payload );
					if ( !continueCycle ) {
						return;
					}
					chain( i + 1 );
				}, 0 );

			} )( 0 );
		},

		startUpdate: function () {
			// define your custom method
			// ensure this target obj based on the desired id
			// if not, return false
			return true;
		},

		onUpdate: function () {
			// define your custom method
			// clone current state
			// construct new state object
			// shouldComponentUpdate( prevState, nextState )
			return true;
		},

		afterUpdate: function () {
			// make dispatcher calls if necessary, etc
		}
	} );

	Store.extend = Ulna.extend;

	// ----------- //

	// ROUTER
	var Router = function( obj ) {
		this.state = {}; // current state (before set on model, posted to server)
		for ( var prop in obj ) {
			this[ prop ] = obj[ prop ];
		}

		this.init.apply( this, arguments );
	};

	_.extend( Router.prototype, Ulna.Events, {
		init: function() {
			this.setState( this.state );
			this.on('routerUpdate', this.update, this);
			this.registerWithDispatcher();
		},

		registerWithDispatcher: function() {
			// overrule in the constructor
		},

		getState: function ( string ) {
			if ( this.state.hasOwnProperty( string ) ) {
				return this.state[ string ];
			}
		},

		setState: function ( state ) {
			for ( var item in state ) {
				if ( this.state.hasOwnProperty( item ) ) {
					this.state[ item ] = state[ item ];
					this.trigger( 'routerUpdate' );
				} else {
					return false;
				}
			}
		},

		getCurrentState: function ( state ) {
			var clonedState = _.clone( this.state );
			return clonedState;
		},

		updateHistory: function( name ) {
			document.title = 'k̄nautwerk - ' + name;

			// update the history
			history.pushState({
				title: 'k̄nautwerk - ' + name,
				name: name
			}, 'k̄nautwerk - ' + name, name );
		},

		update: function() {

		}
	});

	Router.extend = Ulna.extend;


	// ----------- //

	// DISPATCHER
	// stolen from: https://github.com/talyssonoc/backbone-dispatcher
	// Flux-style Dispatcher. Register actions, then dispatch them to deliver a payload
	// to the registered Stores.
	var Dispatcher = function ( options ) {
		if ( options && options.actions ) {
			if ( typeof options.actions === 'string' ) {
				this.createAction( options.actions );
			} else {
				this.createActions( options.actions );
			}
		}

		Object.defineProperty( this, '_actions', {
			enumerable: false,
			value: {}
		} );

		_.extend( this._actions, Ulna.Events );

		this.initialize.apply( this, arguments );
	};

	Dispatcher.prototype = {
		initialize: function () {},

		_prepareAction: function ( name, callbacks ) {
			var action = {};
			if ( _.isString( name ) ) {
				action.name = name;
				if ( callbacks ) {
					if ( _.isFunction( callbacks ) ) {
						action.beforeEmit = callbacks;
					} else {
						for ( var c in callbacks ) {
							if ( callbacks.hasOwnProperty( c ) ) {
								action[ c ] = callbacks[ c ];
							}
						}
					}
				}
			} else {
				action = name;
			}
			return action;
		},

		createAction: function ( name, callbacks ) {
			var action = this._prepareAction( name, callbacks );
			var dispatch;
			var emit = function ( payload ) {
				this._triggerAction( action.name, payload );
			}.bind( this );
			var beforeEmit = function ( payload ) {
				action.beforeEmit( payload, function ( newPayload ) {
					emit( newPayload );
				} );
			};
			var shouldEmit = function ( fn ) {
				return function ( payload ) {
					if ( action.shouldEmit( payload ) ) {
						fn( payload );
					}
				};
			};
			if ( action.shouldEmit ) {
				if ( action.beforeEmit ) {
					dispatch = shouldEmit( beforeEmit );
				} else {
					dispatch = shouldEmit( emit );
				}
			} else if ( action.beforeEmit ) {
				dispatch = beforeEmit;
			} else {
				dispatch = emit;
			}
			Object.defineProperty( this, action.name, {
				enumerable: false,
				value: dispatch
			} );
		},

		createActions: function ( actions ) {
			var action;
			for ( action in actions ) {
				if ( actions.hasOwnProperty( action ) ) {
					this.createAction( actions[ action ] );
				}
			}
		},

		register: function ( action, listener, method ) {
			if ( !listener ) {
				throw new Error( 'The listener is undefined!' );
			}
			method = ( typeof ( method ) === 'function' ) ? method : listener[ method || action ];
			if ( typeof ( method ) !== 'function' ) {
				throw new Error( 'Cannot register callback `' + method +
					'` for the action `' + action +
					'`: the method is undefined on the provided listener object!' );
			}
			this._actions.on( action, method.bind( listener ) );
		},

		registerStore: function ( actions, listener, methods ) {
			var isUniqueCallback = ( typeof methods ) === 'string' || ( typeof methods ) === 'function';
			var actionsNames;
			if ( _.isArray( actions ) ) {
				methods = methods || actions;
				if ( !isUniqueCallback && actions.length !== methods.length ) {
					throw new RangeError( 'The # of callbacks differs from the # of action names!' );
				}
			} else if ( _.isObject( actions ) ) {
				actionsNames = Object.keys( actions );
				methods = actionsNames.map( function ( actionName ) {
					return actions[ actionName ];
				} );
				actions = actionsNames;
			}
			for ( var i = 0, action;
				( action = actions[ i ] ); i++ ) {
				this.register( action, listener, isUniqueCallback ? methods : methods[ i ] );
			}
		},

		dispatch: function ( actionName, payload ) {
			if ( this.hasOwnProperty( actionName ) ) {
				return this[ actionName ]( payload );
			}
			throw new Error( 'There is not an action called `' + actionName + '`' );
		},

		_triggerAction: function ( actionName, payload ) {
			this._actions.trigger( actionName, payload );
		}
	};

	Dispatcher.extend = Ulna.extend;

	Ulna.Dispatcher = Dispatcher;
	Ulna.Component = Component;
	Ulna.Store = Store;
	Ulna.Router = Router;
