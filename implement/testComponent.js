var test = new component({
	root: '#test-root',

	dispatcher: testDispatcher,

	events: {
		'click root': 'clickRoot'
	},

	clickRoot: function( event ) {
		console.log('click root', this);
		testDispatcher.dispatch('TEST_ACTION', {})
	},

	listen: {
		'TEST_ACTION': 'testAction'
	},

	testAction: function() {
		console.log(this);
	},

	onUpdate: function() {

	}
});