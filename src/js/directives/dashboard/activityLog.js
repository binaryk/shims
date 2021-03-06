"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("activityLog", ["$compile", "$timeout", "$window", 
	function($compile, $timeout, $window) {
		return {
			restrict: "E",
			replace: true,
			templateUrl: "partials/dashboard/activity-log.html",
			
			link: function(scope, elem, attrs) {
				var content = $(".activity-log-content", elem);
				var isFullscreen = false;

				scope.$on("activityLogFadeOut", function() {
					content.fadeOut("fast", function() {
						content.show().css("visibility", "hidden");
					});
				});
				scope.$on("activityLogFadeIn", function() {
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