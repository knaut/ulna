var Component = require('../../../../../modules/component.js');
var dispatcher = require('../dispatcher.js');
var services = require('../services/services.js');

var item = require('./item.js');

var nav = new Component({
	root: 'nav',
	dispatcher: dispatcher,

	props: {
		nav: services.nav
	},

	query: {
		nav: 'object'
	},

	template: {
		div: item,
		ul: function() {
			for (var i in nav) {
				return {
					li: {
						'a': item
					}
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