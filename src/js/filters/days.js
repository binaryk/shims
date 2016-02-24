"use strict";

var angular = require("angular");

var app = angular.module("cpms.filters");

app.filter("days", [ function() {
	return function(input) {
		var n = parseInt(input, 10);

		if (!isNaN(n)) {
			if (n !== 1) {
				return n + " days";
			} else {
				return n + " day";
			}
		}
		
		return input;
	};
}]);