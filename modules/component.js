var component = (function() {

	var component = function( obj ) {
		// type checking for nerve templates
		this.type = 'component';

		for (var prop in obj) {
			this[prop] = obj[prop];
		}

		// setup for any component
		

		this.initialize.apply(this, arguments);

		// we bind dispatcher listeners on construction.
		// we use initialize/deinitialize for dom-related setup and teardown
		this.bindListen();
		
	}

	component.prototype = {
		initialize: function( obj ) {
			// set up a component for rendering into the dom
			console.log('initialize', this);

			this.$root = $(this.root);

			this.bindEvents();
		},
		deinitialize: function() {
			// unbind from the dom
			console.log('deinitialize', this);

			this.unbindEvents( this.events );

			this.$root = undefined;
		},
		bindEvents: function( events ) {
			// backbone-style hash pairs for easy event config
			for (var key in this.events) {
				var culledKey = this.cullEventKey( key );
				console.log(culledKey)

				// shortcut to just binding the root
				if (culledKey[1] === 'root') {
					// bind the root event based on the event type and the handler we supplied
					this.$root.on( culledKey[0], this.events[ key ].bind(this) );
				} else {
					console.log(culledKey[1]);
					console.log(this.$root.find( culledKey[1] ) )
					this.$root.find( culledKey[1] ).on( culledKey[0], this.events[ key ].bind(this) );
				}

			}
		},
		cullEventKey: function( key ) {
			var reg = /[a-z|A-Z]*/;
			var eventString = key.match(reg)[0];
			var selector = key.replace(eventString + ' ', '');

			return [eventString, selector];
		},
		unbindEvents: function( events ) {
			for (var key in events) {
				var culledKey = this.cullEventKey( key );

				// shortcut to just binding the root
				if (culledKey[1] === 'root') {
					// bind the root event based on the event type and the handler we supplied
					this.$root.off( culledKey[0] );
				} else {
					this.$root.find( culledKey[1] ).off( culledKey[0], this.events[ key ].bind(this) );
				}

			}
		},
		bindListen: function() {
			// backbone-style hashes for flux-style action configuration
			for (var action in this.listen) {
				this.dispatcher.register(action, this, this.listen[ action ].bind(this) );
			}	
		},
		setProps: function( obj ) {
			if (obj) {
				for (var prop in this.props) {
					this.props[prop] = obj[prop];
				}	
			}
			
			this.render();
		},

		render: function() {
			this.unbindEvents()

			this.normalized = this.normalize( this.template );

			var string = nerve.stringify.normalized( this.normalized );
			var template = _.template(string);

			this.$root.html( template( this.props ) );

			this.bindEvents();

			if (this.children.length) {
				this.renderChildren();
			}
		},

		renderChildren: function() {
			for (var c = 0; this.children.length > c; c++) {
				this.children[c].initialize();

				this.children[c].setProps();
			}
		},

		normalize: function( struct ) {

			var normalized = [];
			this.children = [];

			var type = toType(struct);
			
			if (type === 'function') {
				if (struct.hasOwnProperty('template')) {
					type = 'component';
				}
			}	

			switch (type) {
				case 'string':
					return struct;
					break;
				case 'array':
					for (var i = 0; struct.length > i; i++) {

						var obj = struct[i];

						for (var key in obj) {
							var parsed = nerve.parse.css.selector(key);
							parsed.inner = this.normalize(obj[key]);
						}

						normalized.push(parsed)
					}
					break;
				case 'object':
					var keys = Object.keys(struct);

					for (var k = 0; keys.length > k; k++) {
						var obj = {};
						var key = keys[k];
						var val = struct[key];

						obj[key] = val;

						for (var keyS in obj) {
							var parsed = nerve.parse.css.selector(keyS);
							parsed.inner = this.normalize(struct[keyS]);
						}

						normalized.push(parsed);
					}
					break;
				case 'function':
					normalized.push(nerve.parse.functions.normalize(struct));
					break;
				case 'component':

					struct['parent'] = this;

					this.children.push( struct );

					console.log('found component!', struct);

					return struct;
			}

			return normalized;

		},

		
	}

	return component;

})();
