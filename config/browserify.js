var external = [
	"jquery",

	"lodash",
	"printf",

	"angular", 
	"angular-animate", 
	"angular-sanitize",
	"angular-timeago"
];

module.exports = {
	vendor: {
		src: [],
		dest: "tmp/cpms-vendor.min.js",
		options: {
			require: external,
			transform: ["browserify-shim"]
		}
	},
	clientWatch: {
		files: {
			"dist/js/cpms.min.js": ["src/js/**/*.js", "!src/js/config.js"]
		},
		options: {
			external: external,
			bundleOptions: {
				debug: true,
			},
		}
	},
	clientBuild: {
		files: {
			"tmp/cpms.min.js": ["src/js/**/*.js", "!src/js/config.js"]
		},
		options: {
			external: external,
		}
	},
};