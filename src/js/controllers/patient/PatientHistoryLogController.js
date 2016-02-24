/* global CPMS_CONFIG:false */

"use strict";

var angular = require("angular");

var app = angular.module("cpms.controllers");

app.controller("PatientHistoryLogController", [ "$scope", "GridDataProvider", 
	function($scope, GridDataProvider) {
		initGridDropdowns();
		initGridDataProvider();

		function initGridDropdowns() {
			var now = CPMS_CONFIG.currentDate || new Date();

			$scope.dateValues = [
				{ name: "All", value: null },
				{ name: now.getFullYear().toString(), value: now.getFullYear() },
				{ name: (now.getFullYear() - 1).toString(), value: now.getFullYear() - 1 }
			];
			$scope.selectedImportDate = $scope.dateValues[0];
			$scope.selectedTargetDate = $scope.dateValues[0];
			$scope.selectedActualDate = $scope.dateValues[0];
		}

		function initGridDataProvider() {
			$scope.gridColumns = {
				date: {
					field: "ImportDate",
				},
				eventName: {
					field: "EventCode",
				},
				description: {
					field: "Description",
				},
				targetDate: {
					field: "TargetDate",
				},
				actualDate: {
					field: "ActualDate",
				},
			};

			$scope.dataProvider = new GridDataProvider($scope, "/Patient/api/EventHistoryLog");

			$scope.dataProvider.onAddQueryParams = function(query) {
				query.orderBy = "ImportDate";
				query.orderDirection = "D";

				query.periodId = $scope.selectedPeriod.value.Id;

				if ($scope.selectedImportDate.value !== null) {
					query.importYear = $scope.selectedImportDate.value;
				}
				if ($scope.selectedTargetDate.value !== null) {
					query.targetYear = $scope.selectedTargetDate.value;
				}
				if ($scope.selectedActualDate.value !== null) {
					query.actualYear = $scope.selectedActualDate.value;
				}
			};
			$scope.dataProvider.onExtractData = function(data) {
				return {
					data: data.EventsInfo,
					totalCount: data.TotalNumberOfEvents,
				};
			};

			$scope.dataProvider.init();

			$scope.$on("updateHistoryLog", function(e, data) {
				$scope.dataProvider.getData();
			});
		}
	}
]);