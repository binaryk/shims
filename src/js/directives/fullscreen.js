"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("fullscreen", ["$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "E",
		replace: true,
		template: "<span class='icon icon-fullscreen'></span>",

		link: function(scope, elem, attrs) {
			var body = $(document.body);
			var contentSection = $(elem).parents(".content-section");
			var iconFullscreen = $(elem);

			iconFullscreen.css("cursor", "pointer");

			$timeout(function() {
				iconFullscreen.on("click", function() {
					contentSection.toggleClass("fullscreen");
					body.toggleClass("body-fullscreen");
					scope.$emit("fullscreenChangePing");
				});
			});
		}
	};
}]);