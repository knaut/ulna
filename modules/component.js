var component = (function() {

	var component = function( obj ) {
		// type checking for nerve templates
		this.type = 'component';

		// id addresses
		this.id = _.uniqueId('c');

		

		for (var prop in obj) {
			this[prop] = obj[prop]
		}

		// setup for any component, in order
		this.initialize.apply(this, arguments);


		this.bindListen.call( this, this.listen );

		// for (var action in this.listen) {
		// 	this.dispatcher.register(action, this, this.listen[ action ].bind(this) );
		// }
	}

	component.prototype = {

		initialize: function( obj ) {
			// set up a component for rendering
			this.bindRoot( this.root );

			this.bindEvents( this.events );
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
			if (obj) {
				for (var prop in this.props) {
					this.props[prop] = obj[prop];
				}	
			}
			
			this.render();
		},

		render: function() {
			this.normalized = this.normalize( this.template );

			var string = nerve.stringify.normalized( this.normalized );
			var template = _.template(string);

			this.$root.html( template( this.props ) );

			console.log(this.children, this.root, this.$root);

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
