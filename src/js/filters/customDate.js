"use strict";

var angular = require("angular");

var app = angular.module("cpms.filters");

app.filter("customDate", ["$filter", function($filter) {
	var filter = $filter("date");
	return function(input) {
		return filter(input, "dd.MM.yyyy");
	};
}]);