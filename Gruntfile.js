module.exports = function(grunt) {
	require("load-grunt-tasks")(grunt);
	grunt.loadNpmTasks("assemble-less");

	var configs = require("load-grunt-configs")(grunt);
	configs.pkg = grunt.file.readJSON("package.json");
	grunt.initConfig(configs);
	
	grunt.registerTask("default", [
		"less",
		"jshint",
		"browserify:vendor",
		"browserify:clientBuild",
		"uglify",
		"copy"
	]);
};