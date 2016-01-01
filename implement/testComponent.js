var example = new component({
	root: '#test',

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
	}
});

var test = new component({
	root: '#test-root',

	template: {
		div: {
			h2: 'this is a counter',
			p: '~~number~~',
			'#test': example
		}
	},

	dispatcher: testDispatcher,

	props: {
		number: 0
	},

	events: {
		'click h2': function( event ) {
			this.dispatcher.dispatch('TEST_ACTION', {})	
		}
	},

	listen: {
		'TEST_ACTION': function( payload )  {
			console.log(this)
			console.log('TEST_ACTION recieved:', payload);

			this.setProps({
				number: this.props.number + 1,
			});
		}
	}
});