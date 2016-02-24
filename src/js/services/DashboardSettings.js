"use strict";

var angular = require("angular");

function DashboardSettings($window) {
	this.$window = $window;
	this.load();

	if (!this.settings) {
		this.settings = {
			availableWidgets: [],
			visibleWidgets: [
				"breachesChart",
				"periodBreachesChart",
				"breachedCompletedEventsChart",
				"breachedEventMilestonesChart",
				"activityLog",
				"breachesLog",
			],
		};
	}
}

DashboardSettings.$inject = ["$window"];

DashboardSettings.prototype = {
	load: function() {
		var jsonStr = this.$window.localStorage.dashboardSettings;
		if (jsonStr) {
			this.settings = JSON.parse(jsonStr);
		}
	},

	save: function() {
		this.$window.localStorage.dashboardSettings = JSON.stringify(this.settings);
	},
};

angular
	.module("cpms.services")
	.service("DashboardSettings", DashboardSettings);