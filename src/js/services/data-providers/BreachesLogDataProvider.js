"use strict";

var printf = require("printf");
var angular = require("angular");

function BreachesLogDataProvider($timeout, $filter, $window, ajax) {
	this.$timeout = $timeout;
	this.$filter = $filter;
	this.$window = $window;
	this.ajax = ajax;
}

BreachesLogDataProvider.$inject = ["$timeout", "$filter", "$window", "AjaxHelper"];

BreachesLogDataProvider.prototype = {
	loadFilters: function() {
		var jsonStr = this.$window.localStorage.breachesLogFilters;
		if (jsonStr) {
			return JSON.parse(jsonStr);
		}

		return {
			showType: "periodBreach"
		};
	},

	saveFilters: function(filters) {
		this.$window.localStorage.breachesLogFilters = JSON.stringify(filters);
	},

	getData: function(user, callback) {
		this.items = [];
		this.getBreachesItems(user, callback);
	},

	getBreachesItems: function(user, callback) {
		var that = this;

		this.ajax("/Notification/api/Breaches").then(function(promise) {
			that.items = promise.data.EventsBreaches.map(function(item) {
				return that.getProcessedEventBreachesItem(user, item);
			}).concat(that.items);

			that.items = promise.data.PeriodsBreaches.map(function(item) {
				return that.getProcessedPeriodBreachesItem(user, item);
			}).concat(that.items);

			that.processFullList(callback);
		});
	},

	processFullList: function(callback) {
		this.$timeout(callback);
	},

	getProcessedEventBreachesItem: function(user, item) {
		var result = {
			name: item.PatientName,
			type: "eventBreach",
			displayType: "Event milestone breach",
		};

		if (item.Status === "Breached") {
			result.text = printf(" is %s postbreach on event milestone %s.", this.$filter("days")(item.DaysForStatus), item.EventCode);
		} else
		if (item.Status === "Breach") {
			result.text = printf(" is on breach date on event milestone %s.", item.EventCode);
		} else
		if (item.Status === "AboutToBreach") {
			result.text = printf(" is %s to breach on event milestone %s.", this.$filter("days")(item.DaysForStatus), item.EventCode);
		}

		this.addCommonBreachProperties(user, item, result);

		return result;
	},

	getProcessedPeriodBreachesItem: function(user, item) {
		var result = {
			name: item.PatientName,
			type: "periodBreach",
			displayType: "Period breach",
		};

		if (item.DaysToBreach > 0) {
			result.text = printf(" is %s to breach on %s.", this.$filter("days")(item.DaysToBreach), item.PeriodName);
		} else {
			result.text = printf(" is on breach date on %s.", item.PeriodName);
		}

		this.addCommonBreachProperties(user, item, result);		

		return result;
	},

	addCommonBreachProperties: function(user, item, result) {
		if (!user.role.permissions.Patient) {
			result.text = "A patient" + result.text;
			result.name = undefined;
			result.url = undefined;
		} else {
			result.url = this.getUrl(item);
		}
	},

	getUrl: function(item) {
		return printf("patient-pathway.html?id=%s&ppiNumber=%s&periodId=%s", item.NhsNumber, item.PpiNumber, item.PeriodId);
	},
};

angular
	.module("cpms.services")
	.service("BreachesLogDataProvider", BreachesLogDataProvider);