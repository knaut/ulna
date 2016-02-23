Ulna = {};

if (typeof window === 'undefined') {
	Ulna.env = 'node'
} else {
	Ulna.env = 'browser'
}

Ulna.extend = require('./src/extend.js');
Ulna.toType = require('./src/toType.js');
Ulna.Dispatcher = require('./src/Dispatcher.js');
Ulna.Component = require('./src/Component.js');
Ulna.Services = require('./src/Services.js');

if (Ulna.env === 'browser') {
	Ulna.Router = require('./src/Router.js');
} else {
	Ulna.Router = null;
}

module.exports = Ulna;