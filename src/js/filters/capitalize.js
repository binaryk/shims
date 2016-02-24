"use strict";

var angular = require("angular");

var app = angular.module("cpms.filters");

app.filter("capitalize", [ function() {
	return function(input) {		
		return input.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
	};
}]);