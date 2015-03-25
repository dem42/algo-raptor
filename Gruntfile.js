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
	},
	bower: {
	    install: {}
	},
	copy: {
	    options: {
		separator: '',
		punctuation: '',
	    },
	    bower_files: {
		files: [
		    {dest:'lib/d3/d3.min.js', src:'bower_components/d3/d3.min.js'},
		    {dest:'lib/jquery/jquery.min.js', src:'bower_components/jquery/jquery.min.js'},
		    {dest:'lib/bootstrap/bootstrap.min.css', src:'bower_components/bootstrap/dist/css/bootstrap.min.css'},
		    {dest:'lib/bootstrap/bootstrap.min.js', src:'bower_components/bootstrap/dist/js/bootstrap.min.js'},
		    {dest:'lib/fonts/glyphicons-halflings-regular.eot', src:'lib/bootstrap/glyphicons-halflings-regular.eot'},
		    {dest:'lib/fonts/glyphicons-halflings-regular.ttf', src:'lib/bootstrap/glyphicons-halflings-regular.ttf'},
		    {dest:'lib/fonts/glyphicons-halflings-regular.woff2', src:'lib/bootstrap/glyphicons-halflings-regular.woff2'},
		    {dest:'lib/fonts/glyphicons-halflings-regular.svg', src:'lib/bootstrap/glyphicons-halflings-regular.svg'},
		    {dest:'lib/fonts/glyphicons-halflings-regular.woff', src:'lib/bootstrap/glyphicons-halflings-regular.woff'}		]
	    }
	}
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bower-task');

    grunt.registerTask('default', ['bower', 'copy', 'concat', 'qunit', 'express', 'watch']);

    grunt.registerTask('no-test', ['bower', 'copy', 'concat', 'express', 'watch']);
};
