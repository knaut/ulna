Ulna = {};

if (typeof window === 'undefined') {
	Ulna.env = 'node'
} else {
	Ulna.env = 'browser'
}

Ulna.extend = require('./src/extend.js');
Ulna.Dispatcher = require('./src/Dispatcher.js');
Ulna.Component = require('./src/Component.js');

module.exports = Ulna;