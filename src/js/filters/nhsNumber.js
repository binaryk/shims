"use strict";

var angular = require("angular");

var app = angular.module("cpms.filters");

app.filter("nhsNumber", [ function() {
	return function(input) {
		if (input && input !== "") {
			return input.replace(/-/g, "").match(/.{3}(?=.{2,3})|.+/g).join("-");
		} else {
			return input;
		}
	};
}]);