module.exports = {
	less: {
		files: "src/less/**/*.less",
		tasks: ["less"],
		options: {
			spawn: false,
		}
	},
	js: {
		files: "src/js/**/*.js",
		tasks: ["jshint", "browserify:clientWatch"],
		options: {
			spawn: false,
		}
	},
	copy: {
		files: [
			"src/img/**/*.{png,jpg,jpeg,gif,webp,svg}", 
			"src/partials/**/*.html",
			"src/*.html"
		],
		tasks: ["copy"],
		options: {
			spawn: false,
		}
	}
};