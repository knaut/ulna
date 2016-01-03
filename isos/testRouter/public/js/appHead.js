var Cheerio = require('cheerio');

var appHead = '<!DOCTYPE html>' +
'<html>' +
	'<head>' +
		'<title>test router</title>' +
		'<link rel="stylesheet" href="/css/app.css"/>' +
		'<script src="/js/libs/jquery.js"></script>' +
		'<script src="/js/app.bundle.js"></script>' +
	'</head>' +
	'<body>' +
		'<div id="app-root"></div>' +
	'</body>' +
	'<script type="text/javascript">' +
		'$(document).ready( function() { app.render() });' +
	'</script>' +
'</html>';

var $ = Cheerio.load( appHead );

module.exports = $;