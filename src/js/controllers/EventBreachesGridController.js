"use strict";

var _ = require("lodash");
var printf = require("printf");
var angular = require("angular");

var app = angular.module("cpms.controllers");

app.controller("EventBreachesGridController", [
	"$scope", "$window", "$location", "MenuDataProvider", "GridDataProvider", "SortType", 
	"BreachesGridDropdowns", "TrustData", "BreachesCountDataProvider",

	function($scope, $window, $location, MenuDataProvider, GridDataProvider, SortType, 
			BreachesGridDropdowns, TrustData, breachesCount) {

		var menu = MenuDataProvider.tree.categories.breaches.eventBreaches;
		var menuActiveItem;
		var dropdowns;

		handleAccessDenied();
		initTabs();
		initAboutToBreachDropdown();
		initGrid();
		initBreachesCount();
		initFilters();
		modifyNavigationMenu();
		modifyFiltersMenu();

		function handleAccessDenied() {
			$scope.$on("userDataReceived", function(e, data) {
				var rights = data.role.permissions;

				if (!rights.EventBreaches) {
					redirect();
				}
			});

			function redirect() {
				$window.location.href = "./access-denied.html";
			}
		}

		function initTabs() {
			var activeTabIndex = $location.search().tab;
			if (isNaN(activeTabIndex) || activeTabIndex < -1 || activeTabIndex > 4) {
				activeTabIndex = 0;
			}
			$scope.activeTab = activeTabIndex.toString();
			modifyActiveMenuItem($scope.activeTab);

			$scope.$watch("activeTab", function(newValue, oldValue) {
				if (newValue !== oldValue) {
					modifyActiveMenuItem(newValue);
					$scope.dataProvider.getData();
				}
			});
		}

		function initGrid() {
			$scope.showPatientInfo = true;

			$scope.gridColumns = {
				breachedBy: 	{ field: "PostBreachDays" },
				nhsNo: 			{ field: "PatientNHSNumber" },
				patient: 		{ field: "PatientName" },
				lastEvent: 		{ field: "EventCode" },
				specialty: 		{ field: "Specialty" },
				clinician: 		{ field: "Clinician" },
				ppiNo: 			{ field: "PPINumber" },
				spent: 			{ field: "DaysInPeriod" },
				toGo: 			{ field: "DaysRemainingInPeriod", sort: SortType.Ascending },
				plusMinus: 		{ field: "DelayOrAdvancementDays" }
			};

			$scope.dataProvider = new GridDataProvider($scope, "/Patient/api/EventBreaches");

			$scope.dataProvider.onAddQueryParams = function(query) {
				if ($scope.activeTab !== "4") {
					query.daysToBreach = $scope.activeTab;
				} else {
					query.daysToBreach = $scope.aboutToBreachDropdownSelectedValue.value;
				}

				query.hospital = $scope.hospital;

				if ($scope.cancerPeriodsOnly) {
					query.periodType = "CancerPeriod";
				}
			};
			$scope.dataProvider.onExtractData = function(data) {
				return {
					data: data.EventsInfo,
					totalCount: data.TotalNumberOfEvents,
				};
			};

			$scope.dataProvider.init();
			$scope.dataProvider.getData();

			$scope.onRowClick = function(row) {
				var url = printf("patient-pathway.html?id=%s&ppiNumber=%s&periodId=%s", 
					row.PatientNHSNumber, row.PPINumber, row.PeriodId);

				if (row.PeriodType === "Non18WeekPeriod") {
					url += "&non18w=1";
				} else
				if (row.PeriodType === "CancerPeriod") {
					url += "&cancer=1";
				}

				$window.location.href = url;
			};
		}

		function initBreachesCount() {
			breachesCount.getData(function(data) {
				$scope.breachesCount = {};
				
				for (var i in data.eventBreaches) {
					if (data.eventBreaches[i] > 0) {
						$scope.breachesCount[i] = "(" + data.eventBreaches[i] + ")";
					}
				}
			});
		}

		function initFilters() {
			$scope.cancerPeriodsOnly = false;
			$scope.$watch("cancerPeriodsOnly", function(newValue, oldValue) {
				if (newValue !== oldValue) {
					$scope.dataProvider.getData();
				}
			});

			$scope.setHospital = function(hospitalName) {
				$scope.hospital = hospitalName;
				$scope.dataProvider.getData();
			};

			$scope.showDropdowns = false;
			$scope.$on("userDataReceived", function(e, data) {
				$scope.showDropdowns = data.role.permissions.Trust;

				if ($scope.showDropdowns) {
					dropdowns = new BreachesGridDropdowns($scope);
					dropdowns.init();
				}
				if (!data.role.permissions.Patient) {
					$scope.showPatientInfo = false;
				}
			});
		}

		function initAboutToBreachDropdown() {
			$scope.aboutToBreachDropdownValues = _.range(4, 22).map(function(item) {
				return { name: item, value: item };
			});
			$scope.aboutToBreachDropdownValues.unshift({ name: "4 to 21", value: 22 });
			$scope.aboutToBreachDropdownSelectedValue = $scope.aboutToBreachDropdownValues[0];

			$scope.onAboutToBreachDropdownChange = function() {
				$scope.dataProvider.getData();
			};
		}

		function modifyNavigationMenu() {
			MenuDataProvider.tree.categories.breaches._item.expanded = true;

			function modifyOnClickHandler(item) {
				item.onClick = function() {
					if (!item.active) {
						$scope.activeTab = item.code;
					}
				};
			}

			for (var i = 0; i < menu._item.children.length; i++) {
				var item = menu._item.children[i];
				modifyOnClickHandler(item);
			}
		}

		function modifyActiveMenuItem(id) {
			if (menuActiveItem) {
				menuActiveItem.active = false;
			}

			menuActiveItem = menu[id]._item;
			menuActiveItem.active = true;
		}

		function modifyFiltersMenu() {
			TrustData.onDecorateSpecialty = function(specialty) {
				specialty.onClick = function() {
					var hospitalId = specialty.parentItem.id;

					dropdowns.setSpecialty(hospitalId, specialty.id);
				};
			};
			TrustData.onDecorateClinician = function(clinician) {
				clinician.onClick = function() {
					var specialtyId = clinician.parentItem.id;
					var hospitalId = clinician.parentItem.parentItem.id;

					dropdowns.setClinician(hospitalId, specialtyId, clinician.id);
				};
			};
		}
	}
]);