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