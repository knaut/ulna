var Services = require('../../../../../modules/services.js');

var services = new Services({
	// nav: [
	// 	'home',
	// 	'test1',
	// 	'test2',
	// 	'test4'
	// ],

	nav: {
		about: {
			ref: '/about',
			title: 'About'
		},
		gallery: {
			ref: '/gallery',
			title: 'Gallery',
			wildcards: {
				photo1: {
					ref: '/photo-1',
					title: 'Photo 1',
					content: 'Some amazing photo'
				},
				photo1: {
					ref: '/photo-2',
					title: 'Photo 2',
					content: 'Another amazing photo'
				}
			}
		}
	}

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
			content: 'not sure what just happened to me',
			wildcards: {
				wild1: {
					title: 'Welcome to wild 1',
					content: 'not sure what just happened to me BLAHBALH'
				},
				foobar: {
					title: 'Welcome to foobar',
					content: 'not sure about anything'
				},
				snafu: {
					title: 'Welcome to snafue',
					content: 'its spectacular'
				}
			}
		}
	}
});

module.exports = services;