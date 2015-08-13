module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		browserify: {
			dist: {
				files: {
					'dist/ulna.js': [
						'src/extend.js',
						'src/Events.js',
						'src/Component.js',
						'src/Store.js',
						'src/Dispatcher.js',
						'src/Router.js',
						'src/core.js',
					]
				},
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');

}