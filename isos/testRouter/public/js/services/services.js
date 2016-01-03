var Services = require('../../../../../modules/services.js');

var services = new Services({
	nav: {
		home: {
			url: '/',
			title: 'home',
			name: 'home'
		},
		test1: {
			url: '/test-1',
			title: 'test-1',
			name: 'test1'
		},
		test2: {
			url: '/test-2',
			title: 'test-2',
			name: 'test2'
		},
		test3: {
			url: '/test-3',
			title: 'test-3',
			name: 'test3'
		}
	},
	main: {
		home: {
			title: 'Welcome to home',
			content: 'its cold tonight wow'
		},
		test1: {
			title: 'Welcome to test 1',
			content: 'we have much needed wares here'
		},
		test2: {
			title: 'Welcome to test 2',
			content: 'faruk has rug if you have coin'
		},
		test3: {
			title: 'Welcome to test 3',
			content: 'not sure what just happened to me'
		}
	}
});

module.exports = services;