"use strict";

var angular = require("angular");

var app = angular.module("cpms.services");

app.factory("SortType", function() {
	return {
		Disabled: 0,
		None: 1,
		Ascending: 2,
		Descending: 3,
	};
});