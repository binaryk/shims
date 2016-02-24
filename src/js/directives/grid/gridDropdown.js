"use strict";

var $ = require("jquery");
var printf = require("printf");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("gridDropdown", [ "$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "A",
		scope: {
			values: "=",
			selected: "=",
		},
		templateUrl: "partials/grid-dropdown.html",

		link: function(scope, elem, attrs) {
			scope.$watch(function() { return scope.selected; }, function(newValue, oldValue) {
				if (newValue !== oldValue) {
					scope.$emit("gridDropdownChange");
				}
			});
		}
	};
}]);