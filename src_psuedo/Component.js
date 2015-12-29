Card = Ulna.Component.extend({
	template: templateRef,

	$root: '.card',

	// childType: 'any'	// any could be any possible string name for a child type

	ui: {
		'suitSymbol': '.suit',
		'cardNumber': '.number'
	},

	events: {
		'click @ui.suitSymbol': 'clickSuit'
	},

	store: new Ulna.Store({
		state: {
			turned: false,
			inDeck: false,
			// deckIndex: null		// is it the card's privilege to know whether it's in the deck, and if it is, what its index is?
		},
		props: {
			suit: 'String',		// could specifying props as such imply schema?
			number: 'Number'
		}
	}),

	clickSuit: function( e ) {
		console.log('the suit symbol is': this.ui.suitSymbol );
	}
});



Deck = Ulna.Component.extend({
	template: deckTempl,

	$root: '#deck',

	childType: Card,

	dispatch: Dispatcher,

	store: new Ulna.Store({
		state: {
			shuffled: false
		}
	}),

	ui: {
		top: '.card:first-of-type',
		last: '.card:last-of-type',
		index: '.card:nth-of-type(:index)'		// fancy, provide a wildcard for selector?
	},

	events: {
		'click @ui.index': 'getIndex'
	},

	getIndex: function( e, index ) {
		console.log('the index of this card in the deck is: ', index);
	},

	shuffleCards: function( e ) {
		this.dispatch('CARDS_SHUFFLE');			// shorthand to the dispatcher's method
	}
});

// ()

Test = Ulna.Component.extend({
	root: '#test',
	// childType: [
	// 	'Card',
	// 	'Deck'
	// ], // is this even necessary?
	state: {
		someVar: 'fou'
	},
	props: {
		title: 'Is this even real?'
	},
	ui: {
		top: '.card:first-of-type',
		last: '.card:last-of-type',
		index: '.card:nth-of-type(:index)'		// fancy, provide a wildcard for selector?
	},
	events: {
		'click @ui.index': 'getIndex'
	},

	getIndex: function( e, index ) {
		console.log('the index of this card in the deck is: ', index);
	},
	template: {
		'#test': {
			'span': 'this is just some plain text',
			'div': 'but what if i used css selectors…',
			'div.obtuse': {
				'span': 'as an obtuse templating system?'
			},
			'if (someVar)': {
				'div': 'this is {{someVar}}'
			},
			else: {

			}
		}
	},
	// or..
	template: {
		// could specify functions that return object literals
		'#test': function( props ) {
			if (props.title) {
				return {
					'span': 'this is {{title}}'
				}
			} else {
				return {
					'div': 'there was nothing here'
				}
			}
		}
	}
})





