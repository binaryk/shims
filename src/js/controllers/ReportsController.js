/* global CPMS_CONFIG:false */

"use strict";

var _ = require("lodash");
var printf = require("printf");
var angular = require("angular");

function ReportsController($scope, $timeout, $http, $window, $location, trustData, menu) {
	var that = this;
	var reportType = $location.search().type;

	init();
	initDropdowns();
	initGranularity();
	modifyNavigationMenu();

	function init() {
		var now = CPMS_CONFIG.currentDate || new Date();

		that.weeks = [
			{ name: "7 weeks", value: 7 },
			{ name: "6 weeks", value: 6 },
			{ name: "5 weeks", value: 5 },
			{ name: "4 weeks", value: 4 },
			{ name: "3 weeks", value: 3 },
			{ name: "2 weeks", value: 2 },
			{ name: "1 week", value: 1 },
		];
		that.weeksToBreach = that.weeks[0];

		that.months = [
			{ name: "January", value: 0 },
			{ name: "February", value: 1 },
			{ name: "March", value: 2 },
			{ name: "April", value: 3 },
			{ name: "May", value: 4 },
			{ name: "June", value: 5 },
			{ name: "July", value: 6 },
			{ name: "August", value: 7 },
			{ name: "September", value: 8 },
			{ name: "October", value: 9 },
			{ name: "November", value: 10 },
			{ name: "December", value: 11 },
		];		
		that.years = [
			now.getFullYear() - 1,
			now.getFullYear(),
		];

		that.monthFrom = _.find(that.months, { value: now.getMonth() });
		that.monthTo = _.find(that.months, { value: now.getMonth() });
		that.yearFrom = now.getFullYear();
		that.yearTo = now.getFullYear();
		that.dateWeeks = 7;		
		that.layout = "tabular";

		that.showDateMonths = reportType === "periodBreaches";
		that.showDateWeeks = reportType === "futurePeriodBreaches";
		that.showDates = reportType !== "activePeriods";
		that.showTabular = true;
		that.showBarChart = reportType === "futurePeriodBreaches";
		that.showLayout = reportType === "futurePeriodBreaches";

		that.ajaxRequestPending = false;

		initFormats();

		that.setLastQuarter = function() {
			var now = CPMS_CONFIG.currentDate || new Date();
			var date = CPMS_CONFIG.currentDate || new Date();
			date.setMonth(date.getMonth() - 3);

			setDateFrom(date);
			setDateTo(now);
		};
		that.setLastHalfYear = function() {
			var now = CPMS_CONFIG.currentDate || new Date();
			var date = CPMS_CONFIG.currentDate || new Date();
			date.setMonth(date.getMonth() - 6);

			setDateFrom(date);
			setDateTo(now);
		};
		that.setLastYear = function() {
			var now = CPMS_CONFIG.currentDate || new Date();
			var date = CPMS_CONFIG.currentDate || new Date();
			date.setFullYear(date.getFullYear() - 1);

			setDateFrom(date);
			setDateTo(now);
		};

		that.generateReport = function() {
			var url = getReportUrl() + "&format=PDF";
			downloadReport(url);
		};
		that.exportResults = function() {
			var url = getReportUrl() + "&format=Excel";
			downloadReport(url);
		};
	}

	function downloadReport(url) {
		that.ajaxRequestPending = true;

		$http({
			url: url,
		}).success(function(data) {
			$window.location.href = url;
			that.ajaxRequestPending = false;
		});
	}

	function initFormats() {
		that.showPDF = true;
		that.showExcel = true;

		$scope.$watch(function() { return that.layout; }, check);

		check(that.layout);

		function check(newValue, oldValue) {
			if (newValue !== oldValue) {
				that.showPDF = newValue !== "tabular";				
			}
		}
	}

	function initDropdowns() {
		resetSpecialtyDropdown();
		resetClinicianDropdown();

		trustData.getHospitals(function(hospitals) {
			that.hospitals = getDefaultHospitals().concat(hospitals);
			that.selectedHospital = that.hospitals[0];
		});

		that.onHospitalDropdownChange = function() {
			resetSpecialtyDropdown();
			resetClinicianDropdown();

			if (that.selectedHospital.id !== null) {
				trustData.getSpecialtiesPerHospital(that.selectedHospital.id, function(specialties) {
					that.specialties = getDefaultSpecialties().concat(specialties);
					that.selectedSpecialty = that.specialties[0];
				});
			}
		};
		that.onSpecialtyDropdownChange = function() {
			resetClinicianDropdown();

			if (that.selectedHospital.id !== null && that.selectedSpecialty.id !== null) {
				trustData.getCliniciansPerSpecialty(that.selectedHospital.id, that.selectedSpecialty.id, function(clinicians) {
					that.clinicians = getDefaultClinicians().concat(clinicians);
					that.selectedClinician = that.clinicians[0];
				});
			}
		};

		function resetHospitalDropdown() {
			that.hospitals = getDefaultHospitals();
			that.selectedHospital = that.hospitals[0];
		}

		function resetSpecialtyDropdown() {
			that.specialties = getDefaultSpecialties();
			that.selectedSpecialty = that.specialties[0];
		}

		function resetClinicianDropdown() {
			that.clinicians = getDefaultClinicians();
			that.selectedClinician = that.clinicians[0];
		}

		function getDefaultHospitals() {
			return [{ name: "All hospitals", id: null }];
		}

		function getDefaultSpecialties() {
			return [{ name: "All specialties", id: null }];
		}

		function getDefaultClinicians() {
			return [{ name: "All clinicians", id: null }];
		}
	}

	function initGranularity() {
		that.granularity = "hospital";

		onGranularityChange(that.granularity);

		$scope.$watch(function() { return that.granularity; }, function(newValue, oldValue) {
			if (newValue !== oldValue) {
				onGranularityChange(newValue);
			}
		});

		function onGranularityChange(value) {
			switch (value) {
				case "hospital":
					that.specialtyDropdownDisabled = true;
					that.clinicianDropdownDisabled = true;
					break;

				case "specialty":
					that.specialtyDropdownDisabled = false;
					that.clinicianDropdownDisabled = true;
					break;

				case "clinician":
					that.specialtyDropdownDisabled = false;
					that.clinicianDropdownDisabled = false;
					break;
			}
		}
	}

	function setDateFrom(date) {
		that.monthFrom = _.find(that.months, { value: date.getMonth() });
		that.yearFrom = date.getFullYear();
	}

	function setDateTo(date) {
		that.monthTo = _.find(that.months, { value: date.getMonth() });
		that.yearTo = date.getFullYear();
	}

	function getReportUrl() {
		var url = "/Report/api/";

		if (reportType === "periodBreaches") {
			url += "PeriodBreachesFile?";
			url += printf("fromDate=%s/%s/%s", that.yearFrom, that.monthFrom.value + 1, 1);
			url += "&";
			url += printf("toDate=%s/%s/%s", that.yearTo, that.monthTo.value + 1, 1);
			url += "&";
		} else
		if (reportType === "futurePeriodBreaches") {
			url += "FuturePeriodBreachesFile?";
			url += "weeksToBreach=" + that.weeksToBreach.value;
			url += "&";
		} else
		if (reportType === "activePeriods") {
			url += "ActivePeriodsDistributionFile?";			
		}

		url += "granularity=" + that.granularity;

		switch (that.granularity) {
			case "hospital":
				if (that.selectedHospital.id !== null) {
					url += "&hospitalId=" + that.selectedHospital.id;
				}
				break;

			case "specialty":
				if (that.selectedHospital.id !== null) {
					url += "&hospitalId=" + that.selectedHospital.id;
				}
				if (that.selectedSpecialty.id !== null) {
					url += "&specialtyCode=" + that.selectedSpecialty.id;
				}
				break;

			case "clinician":
				if (that.selectedHospital.id !== null) {
					url += "&hospitalId=" + that.selectedHospital.id;
				}
				if (that.selectedSpecialty.id !== null) {
					url += "&specialtyCode=" + that.selectedSpecialty.id;
				}
				if (that.selectedClinician.id !== null) {
					url += "&clinicianId=" + that.selectedClinician.id;
				}
				break;
		}

		if (reportType === "futurePeriodBreaches") {
			url += "&layout=" + that.layout;
		}

		return url;
	}

	function modifyNavigationMenu() {
		var top = menu.tree.categories.reports;
		top._item.expanded = true;

		switch (reportType) {
			case "periodBreaches":
				top.periodBreaches._item.active = true;
				that.pageName = "Monthly 18w RTT performance";
				break;

			case "futurePeriodBreaches":
				top.futurePeriodBreaches._item.active = true;
				that.pageName = "About to breach 18w RTT periods";
				break;

			case "activePeriods":
				top.activePeriods._item.active = true;
				that.pageName = "Active periods distribution over 18w";
				break;
		}
	}
}

ReportsController.$inject = ["$scope", "$timeout", "$http", "$window", "$location", "TrustDataProvider", "MenuDataProvider"];

angular
	.module("cpms.controllers")
	.controller("ReportsController", ReportsController);