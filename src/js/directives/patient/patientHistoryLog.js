"use strict";

var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("patientHistoryLog", ["$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "E",
		replace: true,
		templateUrl: "partials/patient/history-log.html",
		
		link: function(scope, elem, attrs) {
		}
	};
}]);