var test = new component({
	root: '#test-root',

	dispatcher: testDispatcher,

	events: {
		'click root': function( event ) {
			console.log('look, i\'m a card, i might be numbered or faced:', this)
			this.dispatcher.dispatch('TEST_ACTION', {})	
		}
	},

	clickRoot: function( event ) {
		console.log('click root', this);
		testDispatcher.dispatch('TEST_ACTION', {})
	},

	listen: {
		'TEST_ACTION': 'testAction'
	},

	testAction: function( payload ) {
		console.log('TEST_ACTION recieved:', payload);
	},

	onUpdate: function() {

	}
});