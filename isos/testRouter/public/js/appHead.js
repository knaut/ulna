var Cheerio = require('cheerio');

var appHead = '<!DOCTYPE html>' +
'<html>' +
	'<head>' +
		'<title>test router</title>' +
		'<link rel="stylesheet" href="/css/app.css"/>' +
		'<script src="/js/app.js"></script>' +
	'</head>' +
	'<body>' +
		'<div id="app-root"></div>' +
	'</body>' +
'</html>';

var $ = Cheerio.load( appHead );

module.exports = $;