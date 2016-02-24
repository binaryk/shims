"use strict";

var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("patientPersonalInfo", ["$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "E",
		replace: true,
		templateUrl: "partials/patient/personal-info.html",
		
		link: function(scope, elem, attrs) {
		}
	};
}]);