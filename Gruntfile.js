module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		browserify: {
			'ulna.bundle.js': ['core.js']
		},
		watch: {
			files: [
				'core.js',
				'src/*.js',
				'src/**/*.js'
			],
			tasks: [
				'browserify'
			]
		}
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-watch');
}