card = Ulna.Component.extend({
	root: '.deck'	// an imaginary parent

	events: {
		'click div.card': function( event ) {
			console.log('look, i\'m a card, i might be numbered or faced:', this.props)		
		}
	},
	
	listen: {
		'MY_ACTION': function(action) {
			// based on a specific action, update state and/or props
			if (action) {
				this.state = 'something!'
			}
		}
	},
	
	onUpdate: function() {
		if (this.state === 'something!') {
			this.template.update('div.card').addClass('something');
		} else {
			this.template.update('div.card').removeClass('something!')
		}
	},

	template: {
		/* props: {
			number: 1-10 or 0
			face: either null (if numbered) or ace, jack, queen, king
		}*/
		'div.card': function() {
			if (number) {
				return {
					span: '~~number~~'
				}
			} else {
				return {
					span: '~~face~~'
				}
			}
		} 
	}
});

ace = Ulna.Component.extend({
	props: {
		face: 'ace',
		number: 0,
		suit: 'hearts'
	}
});

// contrived example, this is how we could compose components with a new api
// and nerve templates