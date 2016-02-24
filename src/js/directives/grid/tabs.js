"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("tabs", [ "$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "E",
		replace: true,
		transclude: true,
		scope: {
			bind: "="
		},
		template: [
			"<div class='tabs'>",
				"<ul ng-transclude></ul>",
				"<div class='clear'></div>",
			"</div>",
		].join("\n"),

		controller: function($scope) {
			this.changeTab = function(value) {
				$scope.bind = value;
			};
			this.getActiveTab = function() {
				return $scope.bind;
			};
		},

		link: function(scope, elem, attrs) {
		}
	};
}]);