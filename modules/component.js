var component = (function() {

	var component = function( obj ) {
		// type checking for nerve
		this.type = 'component';

		// root selector and jquery ref
		this.root = null;
		this.$root = null;

		// nerve template structure
		this.template = null;

		// one update cycle to rule them all
		this.updateCycle = [
			'beforeUpdate',
			'onUpdate',
			'afterUpdate'
		];
		this.updateCycleTimeout = true;

		// id addresses
		this.id = _.uniqueId('c');

		// children 
		this.children = [];

		// ui event hashes
		this.events = {};

		// listen hash for dispatcher hooks
		this.listen = {};

		// apply arguments
		for (var prop in obj) {
			this[prop] = obj[prop]
		}

		this.initialize.apply(this, arguments);
	}

	component.prototype = {
		initialize: function() {
			// setup for any component, in order
			this.bindRoot( this.root );

			this.bindEvents( this.events );

			this.bindListen( this.listen );
		},
		bindRoot: function( root ) {
			// i am root
			this.root = root;
			this.$root = $(root);
		},
		deinitialize: function() {

		},
		bindEvents: function( events ) {
			// backbone-style hash pairs for easy event config
			for (var key in events) {
				var culledKey = this.cullEventKey( key );

				// shortcut to just binding the root
				if (culledKey[1] === 'root') {
					// bind the root event based on the event type and the handler we supplied
					this.$root.bind( culledKey[0], this.events[ key ].bind(this) );
				}

			}
		},
		cullEventKey: function( key ) {
			var reg = /[a-z|A-Z]*/g;
			var arr = key.match(reg).filter(function( string ) {
				return /\S/.test( string );
			});
			return arr;
		},
		unbindEvents: function() {

		},
		bindListen: function( actions ) {
			// backbone-style hashes for flux-style action configuration
			for (var action in this.listen) {
				this.dispatcher.register(action, this, this.listen[ action ].bind(this) );
			}
		},
		unbindListen: function() {

		},

		setProps: function( obj ) {
			for (var prop in this.props) {
				this.props[prop] = obj[prop];
			}

			this.normalized = this.normalize( this.template );
			this.render();
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
					console.log('found component!');

					struct['parent'] = this;

					this.children.push( struct );

					return struct;
			}

			return normalized;

		},

		render: function() {
			var string = nerve.stringify.normalized( this.normalized );
			var template = _.template(string);

			this.$root.html( template( this.props ) );

			// for (var r = 0; this.children.length > r; r++) {
			// 	this.children[r].initialize();
			// }
		}
	}

	return component;

})();
