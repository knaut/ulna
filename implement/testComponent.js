var test = new component({
	root: '#test-root',

	template: {
		div: {
			h2: 'this is a counter',
			p: '~~number~~'
		}
	},

	dispatcher: testDispatcher,

	props: {
		number: 0
	},

	events: {
		'click root': function( event ) {
			console.log('event handled: click root', this);
			this.dispatcher.dispatch('TEST_ACTION', {})	
		}
	},

	listen: {
		'TEST_ACTION': function( payload )  {
			console.log('TEST_ACTION recieved:', payload);

			this.setProps({
				number: this.props.number + 1
			});
		}
	},

	onUpdate: function() {
		console.log(this.props.number)
	}
});