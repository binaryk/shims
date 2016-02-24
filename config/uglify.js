module.exports = {
	options: {
		separator: ";",
		mangle: false,
	},
	vendor: {
		files: [
			{
				src: ["tmp/cpms-vendor.min.js"],
				dest: "dist/js/cpms-vendor.min.js"
			},
		]
	},
	client: {
		files: [
			{
				src: ["tmp/cpms.min.js"],
				dest: "dist/js/cpms.min.js"
			},
		]
	}
};