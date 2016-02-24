"use strict";

var _ = require("lodash");
var angular = require("angular");

var app = angular.module("cpms.services");

app.controller("PatientPersonalInfoController", ["$scope", "$location", "$window", "AjaxHelper", 
	function($scope, $location, $window, ajax) {
		var isNon18WeekPeriods = $location.search().non18w === "1";
		var isCancerPeriods = $location.search().cancer === "1";

		init();

		function init() {
			ajax("/Patient/api/Patients", {
				nhsNumber: $scope.nhsNumber,
			}).success(function(data) {
				if (data.PatientsInfo.length > 0) {
					var first = data.PatientsInfo[0];

					$scope.patient = first;
					$scope.$emit("patientName", first.PatientName);

					$scope.patientRows = data.PatientsInfo;
				} else {
					var url = "patients.html";

					if (isNon18WeekPeriods) {
						url += "?non18w=1";
					} else
					if (isCancerPeriods) {
						url += "?cancer=1";
					}

					$window.location.href = url;
				}
			});
		}
	}
]);