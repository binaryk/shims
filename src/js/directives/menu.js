"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("menu", ["$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "E",
		replace: true,
		templateUrl: "partials/menu.html",

		link: function(scope, elem, attrs) {
		}
	};
}]);

app.animation(".menu-section-body", slideAnimation);
app.animation(".menu-accordion-body", slideAnimation);
app.animation(".menu-tree-child-list", slideAnimation);

function slideAnimation() {
	return {
		beforeAddClass: function(element, className, done) {
			$(element).slideUp("fast", done);

			return function(isCancelled) {
				if (isCancelled) {
					$(element).stop();
				}
			};
		},
		removeClass: function(element, className, done) {
			$(element).slideDown("fast", done);

			return function(isCancelled) {
				if (isCancelled) {
					$(element).stop();
				}
			};
		}
	};
}