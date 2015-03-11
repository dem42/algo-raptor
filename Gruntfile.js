module.exports = function(grunt) {
    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	uglify: {
	    options: {
		banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
		screwIE8: true
	    },
	    build: {
		src: 'build/<%= pkg.name %>.js',
		dest: 'build/<%= pkg.name %>.min.js'
	    }
	},
	concat: {
	    options: {
		separator: ';',
	    },
	    dist: {
		src: ['core/polyfill.js', 'core/algo_utils.js', 'core/visualization_utils.js', 'core/algo.js', 'visualizations/*.js', 'core/main.js'],
		dest: 'build/<%= pkg.name %>.js',
	    },
	},
	qunit: {
	    all: ['test/**/*.html']
	}
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.registerTask('default', ['concat', 'qunit']);
}




