"use strict";

var printf = require("printf");
var angular = require("angular");

var app = angular.module("cpms.controllers");

app.controller("PatientsGridController", [ "$scope", "$window", "$location", "MenuDataProvider", "GridDataProvider", 
	function($scope, $window, $location, MenuDataProvider, GridDataProvider) {
		var showOnlyNon18WeekPeriods = $location.search().non18w === "1";
		var showOnlyCancerPeriods = $location.search().cancer === "1";

		handleAccessDenied();
		init();
		modifyNavigationMenu();

		function init() {
			$scope.gridColumns = {
				name: {
					field: "PatientName",
				},
				dateOfBirth: {
					field: "DateOfBirth",
				},
				age: {
					field: "Age",
				},
				hospital: {
					field: "Hospital",
				},
				ppiNo: {
					field: "PpiNumber",
				},
			};

			$scope.dataProvider = new GridDataProvider($scope, "/Patient/api/Patients");

			$scope.dataProvider.onAddQueryParams = function(query) {
				if (showOnlyNon18WeekPeriods) {
					query.periodType = "Non18WeekPeriod";
				} else 
				if (showOnlyCancerPeriods) {
					query.periodType = "CancerPeriod";
				} else {
					query.periodType = "RTT18WeekPeriod";
				}

			};
			$scope.dataProvider.onExtractData = function(data) {
				return {
					data: data.PatientsInfo,
					totalCount: data.TotalNumberOfPatients,
				};
			};

			$scope.dataProvider.init();
			$scope.dataProvider.getData();

			$scope.onRowClick = function(row) {
				var url = printf("patient-pathway.html?id=%s&ppiNumber=%s&periodId=%s", row.NHSNumber, row.PpiNumber, row.PeriodId);
				if (showOnlyNon18WeekPeriods) {
					url += "&non18w=1";
				} else
				if (showOnlyCancerPeriods) {
					url += "&cancer=1";
				}

				$window.location.href = url;
			};
		}

		function handleAccessDenied() {
			$scope.$on("userDataReceived", function(e, data) {
				var rights = data.role.permissions;

				if (!rights.Patient) {
					redirect();
				}
			});

			function redirect() {
				$window.location.href = "./access-denied.html";
			}
		}

		function modifyNavigationMenu() {			
			MenuDataProvider.clearExpanded(MenuDataProvider.root);
			MenuDataProvider.setExpanded(MenuDataProvider.tree.categories.patients._item);

			var menu = MenuDataProvider.tree.categories.patients;

			if (!showOnlyNon18WeekPeriods && !showOnlyCancerPeriods) {
				$scope.pageName = "18 week periods";
				menu.patients._item.active = true;
			} else
			if (showOnlyNon18WeekPeriods) {
				$scope.pageName = "Non 18 week periods";
				menu.non18w._item.active = true;
			} else
			if (showOnlyCancerPeriods) {
				$scope.pageName = "Cancer periods";
				menu.cancer._item.active = true;
			}
		}
	}
]);