"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("navBreadcrumb", [ "$compile", "$timeout", "$window", function($compile, $timeout, $window) {
	return {
		restrict: "E",
		replace: true,
		transclude: true,
		scope: {
			url: "@"
		},
		template: "<span class='nav-breadcrumb' ng-transclude></span>",

		link: function(scope, elem, attrs) {
			if ($(elem).nextAll(".nav-breadcrumb").length > 0) {
				$("<span class='breadcrumb-separator'>\\</span>").insertAfter($(elem));
			}

			if (scope.url) {
				$(elem).addClass("link");
				$(elem).on("click", function() {
					$window.location.href = scope.url;
				});
			}
		}
	};
}]);