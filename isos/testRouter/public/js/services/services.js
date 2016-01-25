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
			title: 'About',
			href: '/about'
		},
		gallery: {
			title: 'Gallery',
			href: '/gallery',
			items: {
				photo1: {
					title: 'Photo 1',
					href: '/gallery/photo-1'
				},
				photo1: {
					title: 'Photo 2',
					href: '/gallery/photo-2'
				}
			}
		}
	},

	main: {
		about: {
			title: 'Welcome to home',
			content: 'its cold tonight wow'
		},
		gallery: {
			title: 'this is a gallery',
			content: 'we have lots of cool things'
		}
	}
});

module.exports = services;