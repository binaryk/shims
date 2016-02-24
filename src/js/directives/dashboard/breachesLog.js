"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("breachesLog", ["$compile", "$timeout", "$window", 
	function($compile, $timeout, $window) {
		return {
			restrict: "E",
			replace: true,
			templateUrl: "partials/dashboard/breaches-log.html",
			
			link: function(scope, elem, attrs) {
				var content = $(".content", elem);
				var isFullscreen = false;

				scope.$on("breachesLogFadeOut", function() {
					content.fadeOut("fast", function() {
						content.show().css("visibility", "hidden");
					});
				});
				scope.$on("breachesLogFadeIn", function() {
					content.removeClass("loading");
					content.css("visibility", "visible").hide().fadeIn("fast");
				});

				scope.$on("fullscreenChangePong", function(e, data) {
					isFullscreen = data.isFullscreen;

					if (isFullscreen) {
						var height = $($window).height() - content.offset().top;
						content.css("overflow", "auto");
						content.css("height", height + "px");
					} else {
						content.css("height", "auto");
						content.css("overflow", "hidden");
					}
				});

				$($window).on("resize", function(e) {
					if (isFullscreen) {
						var height = $($window).height() - content.offset().top;
						content.css("overflow", "auto");
						content.css("height", height + "px");
					}
				});
			}
		};
	}
]);