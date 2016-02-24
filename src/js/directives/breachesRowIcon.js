"use strict";

var $ = require("jquery");
var _ = require("lodash");
var printf = require("printf");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("breachesRowIcon", [ "$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "A",

		link: function(scope, elem, attrs) {
			$timeout(function() {
				var td;
				var siblings = elem.siblings();
				for (var i = 0; i < siblings.length; i++) {
					var sibling = $(siblings[i]);
					if (!sibling.hasClass("ng-hide")) {
						td = sibling;
						break;
					}
				}

				if (td) {
					var row = scope.row;

					var icon;
					var title;
					if (row.PeriodType === "CancerPeriod") {
						icon = "icon icon-cancer";
						title = "Cancer period";
					} else
					if (row.EventType === "ClockPausingEvent") {
						icon = "icon icon-pause";
						title = "Clock paused";
					}

					if (icon) {
						var html = td.html();
						td.html([
							printf("<span class='%s' title='%s'></span>", icon, title),
							printf("<span class='row-icon-helper'>%s</span>", html)
						].join(""));
					}
				}
			});
		}
	};
}]);