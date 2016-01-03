// REQUIRES, SERVER
var Hapi = require("hapi");
var Inert = require('inert');
var Path = require('path');
var underscore = require('underscore');

// Nerve
var Nerve = require('nerve-templates');

// head
var $ = require('./public/js/appHead.js');

// server stuff
var server = new Hapi.Server();

var port = process.env.PORT || 8000;

server.register(Inert, function() {
	server.connection({
		port: port
	});
	server.route({
		method: 'GET',
		path: '/{param*}',
		handler: {
			directory: {
				path: Path.normalize(__dirname + '/')
			}
		}
	});
	server.start(function() {
		console.log('Visit: http://127.0.0.1:' + port)
	});
});

// import lib stuff

var app = require('./public/js/app.js');

console.log(app)






// ROUTES
server.route({
	path: '/',
	method: 'GET',
	handler: function(request, reply) {
		app.render();
		reply( $.html() );
	}
});

server.route({
	path: '/css/{path*}',
	method: 'GET',
	handler: {
		directory: {
			path: './public/css',
			listing: false,
			index: false
		}
	}
});

server.route({
	path: '/images/{path*}',
	method: 'GET',
	handler: {
		directory: {
			path: './public/images',
			listing: false,
			index: false
		}
	}
});

server.route({
	path: '/js/{path*}',
	method: 'GET',
	handler: {
		directory: {
			path: './public/js',
			listing: false,
			index: false
		}
	}
});