var Component = require('../../../../../modules/component.js');
var dispatcher = require('../dispatcher.js');
var services = require('../services/services.js');
var nav = require('./nav.js');

var main = new Component({
	root: '#main',
	dispatcher: dispatcher,
	services: services,
	
	template: {
		'h1': '~~title~~',
		'#inner-content': '~~content~~'
	},
	
	props: {
		title: 'just started',
		content: 'here\'s whatever i start out with'
	},

	listen: {
		'ROUTE_CHANGE': function(payload) {
			// if we recieve a route change, we can determine
			// what to do based on the payload
			this.setProps( this.services.main[payload.data] );
		}
	}
});

module.exports = main;