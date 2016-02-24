"use strict";

var $ = require("jquery");
var printf = require("printf");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("breachedEventMilestonesChart", [
	"BreachedEventsChart",

	function(breachedEventsChart) {
		return {
			restrict: "E",
			replace: true,
			templateUrl: "partials/dashboard/breached-event-milestones-chart.html",

			link: function(scope, elem, attrs) {
				breachedEventsChart(scope, elem, attrs);
			}
		};
	}
]); 