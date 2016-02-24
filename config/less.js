var fs = require("fs");
var printf = require("printf");

module.exports = function() {
	var result = {};

	addBase(result);
	addThemes(result);

	return result;
}();

function addBase(result) {
	result.base = {
		options: {
			cleancss: true,
		},
		files: {
			"dist/css/base.css": ["src/less/vendor/**/*.less", "src/less/base.less"]
		}
	};
}

function addThemes(result) {
	var themes = getFilenamesFromPath("src/less/themes");

	for (var i = 0; i < themes.length; i++) {
		var theme = themes[i];

		var obj = {
			options: {
				imports: {
					less: [
						printf("../themes/%s.less", theme), 
						printf("themes/%s.less", theme)
					]
				},
				cleancss: true,
			}
		};

		obj.files = {};
		obj.files[printf("dist/css/%s.css", theme)] = [			
			"src/less/**/*.less",
			"!src/less/themes/**/*.less",
			"!src/less/vendor/**/*.less",
			"!src/less/base.less"
		];

		result[theme] = obj;
	};
}

function getFilenamesFromPath(path) {
	var filenames = fs.readdirSync(path);

	return filenames.map(function(item) {
		return item.split(".")[0];
	});
}