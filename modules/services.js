var Services = (function() {

	var Services = function( data ) {
		for (var prop in data) {
			this[prop] = data[prop];
		}
	}

	Services.prototype = { 
		queryServices: function( queries, routeName) {
			// take a hash of queries
			// assume the first keys are child names, 
			// subprops are route keys, and further subprops are the props we want
			// based on a given route.

			// we push props based on the query. if the query doesn't describe it, we don't
			// return it.

			var props = {};

			// console.log(queries, routeName);

			var childKeys = Object.keys(this);

			for (var c = 0; childKeys.length > c; c++) {

				var childKey = childKeys[c];

				if ( this[childKey] ) {
					
					var routes = this[childKey];
					var routeKeys = Object.keys(routes);

					for (var r = 0; routeKeys.length > r; r++) {
						var routeKey = routeKeys[r];

						if (routeKey === routeName) {

							var routeProps = routes[routeKey];
							var routePropKeys = Object.keys( routeProps );

							for (var p = 0; routePropKeys.length > p; p++ ) {
								
								var routePropKey = routePropKeys[p];

								// we block out wildcard sub-routes here
								if (routePropKey !== 'wildcards') {
									var routeProp = routeProps[routePropKey];
									props[childKey] = routeProps;
								}
							}
						}
					}
				}
			}
			// console.log('props', props)
			return props;
		}
	}

	module.exports = Services;

})();

