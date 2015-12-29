var test = new component({
	root: '#test-root',

	dispatcher: testDispatcher,

	events: function() {
		var self = this;
		return {
			'click root': function( event ) {
				console.log('click root');
				console.log(event, this)
				self.dispatcher.dispatch('TEST_ACTION', {})
			}
		}
	},

	listen: function() {
		var self = this;
		return {
			'TEST_ACTION': function( action ) {
				// update something
				console.log(action);
			}
		}
	},

	handleTest: function() {
		console.log(this);
	},

	onUpdate: function() {

	}
});

console.log(test)