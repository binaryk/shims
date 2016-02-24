"use strict";

var printf = require("printf");

var angular = require("angular");

var app = angular.module("cpms.controllers");

app.controller("PatientBreachesController", [ 
	"$scope", "$sce", "$filter", "GridDataProvider",

	function($scope, $sce, $filter, GridDataProvider) {
		init();

		function init() {
			$scope.gridColumns = {
				eventCode: {
					field: "EventCode"
				},
				status: {
					field: "Status"
				},
			};

			$scope.dataProvider = new GridDataProvider($scope, "/Patient/api/LiteEventBreaches");

			$scope.dataProvider.onAddQueryParams = function(query) {
				query.periodId = $scope.selectedPeriod.value.Id;
			};
			$scope.dataProvider.onExtractData = function(data) {
				$scope.$emit("breachesGridDataReceived", { count: data.length });

				return {
					data: data,
					totalCount: data.length,
				};
			};

			$scope.dataProvider.init();

			$scope.$watch(function() { return $scope.selectedPeriod; }, function(newValue, oldValue) {
				if (newValue !== oldValue) {
					$scope.dataProvider.getData();
				}
			});

			$scope.getStatusHtml = function(row) {
				var html = "";

				if (row.Status === "Breached") {
					html += printf("<span class='breach-text postbreach'>%s post breach date</span>", $filter("days")(row.DaysForStatus));
				} else
				if (row.Status === "Breach") {
					html += printf("<span class='breach-text'>Breach date</span>");
				} else
				if (row.Status === "AboutToBreach") {
					html += printf("<span class='breach-text about-to-breach'>%s to breach</span>", $filter("days")(row.DaysForStatus));
				}

				return $sce.trustAsHtml(html);
			};
		}
	}
]);