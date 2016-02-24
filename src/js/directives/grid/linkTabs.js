"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("linkTabs", [ "$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "E",
		transclude: true,
		replace: true,
		scope: {
			bind: "="
		},
		template: "<div ng-transclude></div>",

		controller: function($scope) {
			this.changeTab = function(value) {
				$scope.bind = value;
			};
		},

		link: function(scope, elem, attrs) {
		}
	};
}]);