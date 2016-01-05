var Dispatcher = require('../../../../modules/dispatcher.js');

var dispatcher = new Dispatcher({
	actions: [
		'APP_LOAD',
		'ROUTE_CHANGE'
	]
});

module.exports = dispatcher;