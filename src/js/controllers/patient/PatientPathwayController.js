/* global CPMS_CONFIG:false */

"use strict";

var _ = require("lodash");
var printf = require("printf");
var angular = require("angular");

var app = angular.module("cpms.controllers");

app.controller("PatientPathwayController", [ 
	"$scope", "$location", "$sce", "$filter", "$window", "MenuDataProvider", "GridDataProvider", "AjaxHelper",

	function($scope, $location, $sce, $filter, $window, MenuDataProvider, GridDataProvider, ajax) {
		var isNon18WeekPeriods = $location.search().non18w === "1";
		var isCancerPeriods = $location.search().cancer === "1";

		var usedUrlPathway = false;
		var usedUrlPeriod = false;

		handleAccessDenied();
		init();
		initGridDataProvider();
		initGridFunctions();
		initTopDropdowns();
		modifyNavigationMenu();

		function init() {
			$scope.nhsNumber = $location.search().id;
			$scope.patientName = "";
			
			$scope.chartExpanded = true;
			$scope.activePeriodDetailsTab = null;
			$scope.activeGeneralInfoTab = null;

			$scope.$on("fullscreenChangePing", function() {
				$scope.$broadcast("fullscreenChangePong");
			});

			$scope.$on("patientName", function(e, data) {
				$scope.patientName = data;
			});

			$scope.$on("chartPeriodClick", function(e, data) {
				$scope.selectedPeriod = $scope.periodValues[data.index];
				
				updatePathwayChart();
				updateGrids();
			});

			$scope.$on("breachesGridDataReceived", function(e, data) {
				if (data.count > 0) {
					$scope.eventBreachesCount = printf("(%s)", data.count);
				} else {
					$scope.eventBreachesCount = "";
				}
			});
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

		function initTopDropdowns() {
			$scope.pathwayValues = [];
			$scope.selectedPathway = null;

			$scope.onPathwayDropdownChange = function() {
				getPeriods();
			};

			$scope.periodValues = [];
			$scope.selectedPeriod = null;

			getPathways();
		}

		function getPathways() {
			ajax("/Patient/api/Pathways", {
				nhsNumber: $scope.nhsNumber,
			}).then(function(promise) {
				$scope.pathwayValues = promise.data.map(function(item) {
					return { name: item.OrganizationCode + " " + item.PPINumber, value: item };
				});

				$scope.selectedPathway = null;
				if ($scope.pathwayValues.length > 0) {
					if (!usedUrlPathway && $location.search().ppiNumber) {						
						usedUrlPathway = true;
						$scope.selectedPathway = _.find($scope.pathwayValues, function(item) {
							return item.value.PPINumber === $location.search().ppiNumber;
						});
					} else {
						$scope.selectedPathway = $scope.pathwayValues[0];
					}

					$scope.onPathwayDropdownChange();
				}
			});
		}

		function getPeriods() {
			var result;

			ajax("/Patient/api/Periods", {
				ppiNumber: $scope.selectedPathway.value.PPINumber,
			}).then(function(promise) {
				$scope.periodValues = promise.data.map(function(item) {
					var result = {
						value: item
					};

					result.name = item.Name;
					var periodType = item.PeriodType || "";
					if (periodType === "CancerPeriod") {
						result.name += " (Cancer)";
					} else
					if (periodType === "Non18WeekPeriod") {
						result.name += " (Non 18w)";
					}

					return result;
				});

				$scope.selectedPeriod = null;
				if ($scope.periodValues.length > 0) {
					if (!usedUrlPeriod && $location.search().periodId) {
						usedUrlPeriod = true;
						$scope.selectedPeriod = _.find($scope.periodValues, function(item) {
							return item.value.Id.toString() === $location.search().periodId;
						});
					} else {
						$scope.selectedPeriod = $scope.periodValues[0];
					}

					updatePathwayChart();
					updateGrids();
				}
			});
		}

		function updatePathwayChart() {
			ajax("/Patient/api/PeriodEvents", {
				periodId: $scope.selectedPeriod.value.Id,
			}).then(function(promise) {
				var events = promise.data.EventsInfo.map(function(item) {
					var e = {
						name: item.EventCode,
					};

					if (item.ActualDate || item.TargetDate) {
						e.date = new Date(item.ActualDate || item.TargetDate);
					} else {
						e.plannedEventAfterPause = true;
					}
					if (item.BreachStatus === "Breached") {
						e.breach = true;
					}
					if (item.ActualDate === null) {
						e.planned = true;
					}
					if (item.EventStatus === "Paused") {
						e.paused = true;
					}

					return e;
				});

				var data = {
					events: events,
					startDate: new Date($scope.selectedPeriod.value.StartDate)
				};

				if ($scope.selectedPeriod.value.StopDate) {
					data.endDate = new Date($scope.selectedPeriod.value.StopDate);
				}

				var i = 0;
				data.periods = $scope.periodValues.map(function(item) {
					var clone = _.cloneDeep(item.value);
					
					clone.index = i;
					clone.name = item.name;
					i++;
					
					if ($scope.selectedPeriod === item) {
						clone.selected = true;
					}					

					return clone;
				});
				fixPlannedEventsAfterPause(data.events);
				ensurePathwayIsValid(data.periods);

				$scope.$broadcast("updateChart", data);
			});
		}

		function daysBetweenDates(date1, date2) {
			var oneDay = 24 * 60 * 60 * 1000;
			return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
		}

		function updateGrids() {
			$scope.dataProvider.getData();

			$scope.$broadcast("updateHistoryLog");
		}

		function initGridDataProvider() {
			$scope.gridColumns = {
				eventCode: {
					field: "EventCode",
				},
				statusCode: {
					field: "StatusCode",
				},
				specialty: {
					field: "Specialty",
				},
				targetDate: {
					field: "TargetDate",
				},
				actualDate: {
					field: "ActualDate",
				},
				eventStatus: {
					field: "EventStatus",
				},
				breachStatus: {
					field: "BreachStatus",
				},
				action: {
				},
			};

			initGridDropdowns();

			$scope.dataProvider = new GridDataProvider($scope, "/Patient/api/PeriodEvents");

			$scope.dataProvider.onAddQueryParams = function(query) {
				query.periodId = $scope.selectedPeriod.value.Id;
				
				if ($scope.selectedTargetDate.value !== null) {
					query.targetYear = $scope.selectedTargetDate.value;
				}
				if ($scope.selectedActualDate.value !== null) {
					query.actualYear = $scope.selectedActualDate.value;
				}
				if ($scope.selectedBreachStatus.value !== null) {
					query.breaches = $scope.selectedBreachStatus.value;
				}
			};
			$scope.dataProvider.onExtractData = function(data) {
				return {
					data: data.EventsInfo,
					totalCount: data.TotalNumberOfEvents,
				};
			};

			$scope.dataProvider.init();
		}

		function initGridDropdowns() {
			var now = CPMS_CONFIG.currentDate || new Date();

			$scope.dateValues = [
				{ name: "All", value: null },
				{ name: now.getFullYear().toString(), value: now.getFullYear() },
				{ name: (now.getFullYear() - 1).toString(), value: now.getFullYear() - 1 }
			];
			$scope.selectedTargetDate = $scope.dateValues[0];
			$scope.selectedActualDate = $scope.dateValues[0];

			$scope.breachStatusValues = [
				{ name: "All", value: null },
				{ name: "About to breach", value: 4 },
				{ name: "3 days to breach", value: 3 },
				{ name: "2 days to breach", value: 2 },
				{ name: "1 day to breach", value: 1 },
				{ name: "Breach", value: 0 },
				{ name: "Postbreach", value: -1 },
			];
			$scope.selectedBreachStatus = $scope.breachStatusValues[0];
		}

		function initGridFunctions() {
			$scope.getBreachStatusHtml = function(row) {
				var html = "";

				if (row.BreachStatus === "Breached") {
					html += printf("<span class='breach-text postbreach'>%s</span>", $filter("days")(row.DaysPostbreach));
				} else
				if (row.BreachStatus === "Success") {
					html += printf("<img src='img/status_green.png'>");
				} else
				if (row.BreachStatus === "Breach") {
					html += printf("<span class='breach-text'>Today</span>");
				} else
				if (row.BreachStatus === "AboutToBreach") {
					if (row.DaysPostbreach <= 3) {
						html += printf("<img src='img/status_yellow.png'>");
					}
				}

				return $sce.trustAsHtml(html);
			};
		}

		function fixPlannedEventsAfterPause(events) {
			var lastDate = _.max(events, "date").date;
			
			for (var i = 0; i < events.length; i++) {
				var e = events[i];
				if (e.date === undefined) {
					e.date = CPMS_CONFIG.currentDate || new Date();
					e.date.setDate(lastDate.getDate() + 3);
				}
			}
		}

		function ensurePathwayIsValid(periods) {
			var i, period;
			for (i = 0; i < periods.length; i++) {
				period = periods[i];
				period.startDate = new Date(period.StartDate);

				if (period.StopDate !== null) {
					period.endDate = new Date(period.StopDate);
				} else {
					if (i + 1 < periods.length) {
						period.endDate = new Date(periods[i + 1].StartDate);
					} else {
						var date = new Date(period.StartDate);
						date.setDate(date.getDate() + 10);
						period.endDate = date;
					}
				}
			}
		}

		function modifyNavigationMenu() {
			MenuDataProvider.clearExpanded(MenuDataProvider.root);
			MenuDataProvider.setExpanded(MenuDataProvider.tree.categories.patients._item);

			if (!isNon18WeekPeriods && !isCancerPeriods) {
				$scope.patientsPageName = "18 week periods";
				$scope.patientsUrl = "patients.html";
			} else
			if (isNon18WeekPeriods) {
				$scope.patientsPageName = "Non 18 week periods";
				$scope.patientsUrl = "patients.html?non18w=1";
			} else
			if (isCancerPeriods) {
				$scope.patientsPageName = "Cancer periods";
				$scope.patientsUrl = "patients.html?cancer=1";
			}
		}
	}
]);