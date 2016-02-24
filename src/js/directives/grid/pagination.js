"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("pagination", [ "$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "E",
		templateUrl: "partials/pagination.html",

		link: function(scope, elem, attrs) {
		}
	};
}]);