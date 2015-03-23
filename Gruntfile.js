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
	    options: {
		console: false
	    },
	    all: ['test/**/*.html']
	},
	watch: {
	    files: ['core/*.js', 'visualizations/*.js', '**/*.html', '**/*.css'],
	    tasks: ['concat'],
	    options : {
		livereload: true
	    }
	},
	express: {
	    all: {
		options: {
		    port: 8999,
		    hostname: "0.0.0.0",
		    bases: [__dirname], 
		    livereload: true
		}
	    }
	},
	jshint: {
	    all: ['Gruntfile.js', 'core/*.js', 'visualizations/*.js']
	}
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['concat', 'qunit', 'express', 'watch']);
};
