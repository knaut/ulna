var Component = require('../../../../../modules/component.js');
var dispatcher = require('../dispatcher.js');



var nav = new Component({
	root: 'nav',
	dispatcher: dispatcher,

	props: {},

	query: {
		nav: 'object'
	},

	template: {
		ul: function() {
			
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