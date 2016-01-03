var example = new Component({
	root: '#child-1',

	template: {
		div: 'this is rendered child 1',
		span: '~~bool~~'
	},

	dispatcher: testDispatcher,

	props: {
		bool: true
	},

	listen: {
		'TEST_ACTION': function( payload ) {
			console.log('TEST_ACTION recieved on ' + this.root);
			this.setProps({
				bool: !this.props.bool
			});
		}
	}
});

var example2 = new Component({
	root: '#child-2',

	template: {
		div: 'this is rendered child 2',
		span: '~~bool~~'
	},

	dispatcher: testDispatcher,

	props: {
		bool: true
	},

	listen: {
		'TEST_ACTION': function( payload ) {
			console.log('TEST_ACTION recieved on ' + this.root);
			this.setProps({
				bool: this.props.bool + this.props.bool
			});
		}
	}
});


rootTempl1 = {
	h2: 'Click Me',
	div: function() {
		if (number) {
			return {
				'#amazing': {
					'#child-1': example,
					'#number': 'number: ~~number~~',
					'#child-2': example2
				}
			}	
		} else {
			return {
				'span': 'counter is at zero'
			}
		}			
	}		
}


rootTempl2 = {
	h2: 'Click Me',
	'#child-1': example,
}


var Root = new Component({
	root: '#test-root',

	template: rootTempl1,

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
			console.log('TEST_ACTION recieved:', payload);

			this.setProps({
				number: this.props.number + 1,
			});
		}
	}
});