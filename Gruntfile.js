/// <binding ProjectOpened='development' />
module.exports = function (grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jade: {
      compile: {
        options: {
          amd: true,
          client: true,
          namespace: false
        },
        files: [{
          expand: true,
          cwd: 'app/',
          src: '**/*.jade',
          dest: 'build/',
          ext: '.js'
        }]
      },
      watch_compile: {
        options: {
          amd: true,
          client: true,
          namespace: false
        }
      }
    },
    coffee: {
      compile: {
        options: {
          sourceMap: true
        },
        files: [{
          expand: true,
          cwd: 'app/',
          src: '**/*.coffee',
          dest: 'build/',
          ext: '.js'
        }]
      },
      watch_compile: {
        options: {
          sourceMap: true
        }
      }
    },
    sass: {
      compile: {
        files: [{
          expand: true,
          cwd: 'app/',
          src: '**/*.scss',
          dest: 'build/',
          ext: '.css'
        }]
      },
      watch_compile: {

      }
    },
    copy: {
      svg: {
        expand: true,
        cwd: 'app/',
        src: '**/*.svg',
        dest: 'build/'
      }
    },
    watch: {
      jade: {
        files: 'app/**/*.jade',
        tasks: ['jade:watch_compile'],
        options: {
          spawn: false
        }
      },
      coffee: {
        files: 'app/**/*.coffee',
        tasks: ['coffee:watch_compile'],
        options: {
          spawn: false
        }
      },
      sass: {
        files: 'app/**/*.scss',
        tasks: ['sass:watch_compile'],
        options: {
          spawn: false
        }
      },
      svg: {
        files: 'app/**/*.svg',
        tasks: ['copy:svg'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.event.on('watch', function (action, filepath) {
    var file = {}, destfile = filepath;
    if (filepath.indexOf('.jade') !== -1) {
      destfile = filepath.replace('.jade', '.js').replace(/app(\/|\\)scripts(\/|\\)/, 'build$1scripts$2');
      file[destfile] = filepath;
      grunt.config('jade.watch_compile.files', file);
    } else if (filepath.indexOf('.coffee') !== -1) {
      destfile = filepath.replace('.coffee', '.js').replace(/app(\/|\\)scripts(\/|\\)/, 'build$1scripts$2');
      file[destfile] = filepath;
      grunt.config('coffee.watch_compile.files', file);
    } else if (filepath.indexOf('.scss') !== -1) {
      destfile = filepath.replace('.scss', '.css').replace(/app(\/|\\)styles(\/|\\)/, 'build$1styles$2');
      file[destfile] = filepath;
      grunt.config('sass.watch_compile.files', file);
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('compile', ['jade:compile', 'coffee:compile', 'sass:compile', 'copy:svg']);
  grunt.registerTask('development', ['compile', 'watch']);

  grunt.registerTask('default', ['compile'])
};