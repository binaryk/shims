"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("gridMessages", [ "$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "E",
		replace: true,
		scope: {
			loading: "&",
			noData: "&",
			fail: "&"
		},
		templateUrl: "partials/grid-messages.html",

		link: function(scope, elem, attrs) {
		}
	};
}]);