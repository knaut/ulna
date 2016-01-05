var Component = require('../../../../../modules/component.js');
var dispatcher = require('../dispatcher.js');

var nav = new Component({
	root: 'nav',
	dispatcher: dispatcher,

	props: {
		nav: [
			'home',
			'test1',
			'test2',
			'test3'
		]
	},

	query: {
		nav: 'array'
	},

	template: {
		ul: function() {
			for (n = 0; nav.length > n; n++) {
				return {
					li: '~~nav[n]~~'
				}
			}
		}
	},

	events: {
		'click li': function(event) {
			this.dispatcher.dispatch('ROUTE_CHANGE', {
				data: event.target.innerText
			});
		}
	}
});

module.exports = nav;