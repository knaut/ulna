Ulna = {};

if (typeof window === 'undefined') {
	Ulna.env = 'node'
} else {
	Ulna.env = 'browser'
}

Ulna.extend = require('./src/extend.js');
Ulna.Dispatcher = require('./src/Dispatcher.js');
Ulna.Component = require('./src/Component.js');
Ulna.Services = require('./src/Services.js');

module.exports = Ulna;