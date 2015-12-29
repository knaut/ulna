toType = function(obj) {
	// better type checking
	// https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
	var type = ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();

	// for components, we assume they will be capitalized or pascal cased
	// if (type === 'string') {
	// 	if (obj.toLowerCase() !== obj) {
	// 		type = 'component'
	// 	}
	// }

	return type;
}