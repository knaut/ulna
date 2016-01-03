var Services = (function() {

	var Services = function( data ) {
		for (var prop in data) {
			this[prop] = data[prop];
		}
	}

	Services.prototype = { 
		clone: function( key ) {
			var clone = {};
			clone[key] = this[key];
			return clone;
		},
		getByKey: function( key ) {
			return this[key];
		}
	}

	if (typeof window === 'undefined') {
	    module.exports = Services;
	} else {
	    window.Services = Services;
	}

})();

