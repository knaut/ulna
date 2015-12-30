var example = new component({
	root: '#container',

	template: {
		div: 'this is an example component',
		span: '~~bool~~'
	},

	dispatcher: testDispatcher,

	props: {
		bool: true
	},

	listen: {
		'TEST_ACTION': function( payload ) {
			this.setProps({
				bool: !this.props.bool
			});
		}
	},

	onUpdate: function() {
		var template = _.template( nerve.render( this.template ) );
		
		console.log(this.props)

		console.log( template(this.props ) )

		this.$root.html( template(this.props) );
	}
})



var test = new component({
	root: '#test-root',

	template: {
		div: {
			h2: 'this is a counter',
			p: '~~number~~',
			'#container': example
		}
	},

	dispatcher: testDispatcher,

	props: {
		number: 0,
		// bool: false	
	},

	events: {
		'click root': function( event ) {
			this.dispatcher.dispatch('TEST_ACTION', {})	
		}
	},

	listen: {
		'TEST_ACTION': function( payload )  {
			console.log('TEST_ACTION recieved:', payload);

			this.setProps({
				number: this.props.number + 1,
			});
		}
	},

	onUpdate: function( template ) {
		// traditional string rendering with underscore
		// console.log( nerve.render(this.template) )

		console.log(this.children, template)

		var stringTemp = nerve.normalize.call(this, template)

		var template = _.template( nerve.render( this.template ) );

		this.$root.html( template(this.props) )
	}
});