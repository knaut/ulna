Store = Ulna.Store.extend({
	// anything necessary here?
});

App = Ulna.Router.extend({
	routes: {
		// '/': 'home'								// some indices could be given
		'/about/:about': 'subAbout',				// simple wildcard
		'/downloads/*file': 'download',				// splat matches anything
		'/category/:name(/:page)': 'getCategoryPage'		// optional routes with wildcards, e.g.: /category/cats/mr-snuggle-bumps
	},

	store: new Store({
		// state: {
		// 	route: 		// won't be necessary… framework could infer this
		// }
	}),

	childType: Deck,

	subAbout: function( sub ) {
		console.log('this subpage:', sub);
	},
	download: function( file ) {
		console.log('download:', file);
	},
	getCategoryPage: function( category, page ) {
		console.log('this page is about ' + category + ' and in particular ' + page);
	}
	// back: function( route ) {},			// these should be automatic, though available to the developer
	// forward: function( route ) {}		// should be automatic, set store to infer previous state
});


// urls, in another life, could've been css selectors...