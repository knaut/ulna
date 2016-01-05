var Component = require('../../../../modules/component.js');

var Router = Component.extend({
	getLocation: function( obj ) {
		var location = obj.pathname;

		var reg = /(\/)[^(?!\/)]*/g;

		location = location.match(reg);

		for (var l = 0; location.length > l; l++) {
			location[l] = location[l].replace('/', '');
		}

		if ( location.length === 1 && location[0] === '') {
			location[0] = '/';
		}

		console.log(location)
		return location;
	},

	sanitizeRouteKey: function( key ) {
		var route = key.replace('-', '');
		route.split('/');
		return route;
	},

	generateRoute: function( key ) {
		var route = {
			key: key,
			title: 'testRouter - ' + key,
			url: null	
		};

		switch(key) {
			case 'home':
				route['url'] = '/';
			break;
			case 'test1':
				route['url'] = '/test-1';
			break;
			case 'test2':
				route['url'] = '/test-2';
			break;
			case 'test3':
				route['url'] = '/test-3';
			break;
		}

		return route;
	},

	history: {
		replace: function( obj ) {
			document.title = obj.title;
			history.pushState(obj, obj.title, obj.url);	
		},
		push: function( obj ) {
			document.title = obj.title;
			history.replaceState(obj, obj.title, obj.url);
		}
	}
});


module.exports = Router;