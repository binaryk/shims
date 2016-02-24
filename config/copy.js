module.exports = {
	main: {
		files: [
			{ cwd: "src/img", src: "**/*.{png,jpg,jpeg,gif,webp,svg}", dest: "dist/img", expand: true },
			{ cwd: "src/fonts", src: "**/*.{woff,eot,svg,ttf}", dest: "dist/fonts", expand: true },
			{ cwd: "src/partials", src: "**/*.html", dest: "dist/partials", expand: true },
			{ src: "src/*.html", dest: "dist", expand: true, flatten: true },
			{ src: "src/favicon.ico", dest: "dist/favicon.ico" },
			{ src: "src/js/config.js", dest: "dist/js/cpms-config.js" }
		]
	}
};