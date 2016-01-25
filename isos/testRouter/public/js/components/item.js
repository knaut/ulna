var Component = require('../../../../../modules/component.js');
var dispatcher = require('../dispatcher.js');
var services = require('../services/services.js');

var item = new Component({
	root: 'li',
	dispatcher: dispatcher,

	template: {
		'a': 'title'
	},
	// events: {
	// 	'click li': function(event) {
	// 		this.dispatcher.dispatch('ROUTE_CHANGE', {
	// 			data: event.target.innerText
	// 		});
	// 	}
	// }
});

module.exports = item;