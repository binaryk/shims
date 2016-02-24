"use strict";

var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("patientEvents", ["$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "E",
		replace: true,
		templateUrl: "partials/patient/events.html",
		
		link: function(scope, elem, attrs) {
		}
	};
}]);