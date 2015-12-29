var test = new component({
	root: '#test-root',

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
		}
	},

	onUpdate: function() {

	}
});