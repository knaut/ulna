var Dispatcher = require('../../../../modules/dispatcher.js');

var dispatcher = new Dispatcher({
	actions: [
		'ROUTE_CHANGE'
	]
});

module.exports = dispatcher;