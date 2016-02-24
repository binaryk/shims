"use strict";

var angular = require("angular");

var app = angular.module("cpms.services");	

app.factory("AjaxHelper", ["$http", "DebugHelper", function($http, DebugHelper) {
	return function(url, params) {
		params = params || {};

		var request = $http({
			url: url,
			params: params,
		});

		DebugHelper.printQueryString(url, params);

		return request;
	};
}]);
