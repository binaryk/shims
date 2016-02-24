"use strict";

var _ = require("lodash");
var angular = require("angular");

function ManageDashboardController(dashboardSettings) {
	this.dashboardSettings = dashboardSettings;

	this.widgetNames = {
		breachesChart: "Breaches chart",
		periodBreachesChart: "Period breaches",
		breachedCompletedEventsChart: "Breached completed events",
		breachedEventMilestonesChart: "Breached event milestones",
		activityLog: "Activity log",
		breachesLog: "Breaches log"
	};

	this.init();
}

ManageDashboardController.$inject = ["DashboardSettings"];

ManageDashboardController.prototype = {
	init: function() {
		var that = this;

		this.availableWidgets = this.getDecoratedWidgetArray(this.dashboardSettings.settings.availableWidgets);
		this.selectedAvailableWidget = null;
		if (this.availableWidgets.length > 0) {
			this.selectedAvailableWidget = this.availableWidgets[0];
		}

		this.visibleWidgets = this.getDecoratedWidgetArray(this.dashboardSettings.settings.visibleWidgets);
		this.selectedVisibleWidget = null;
		if (this.visibleWidgets.length > 0) {
			this.selectedVisibleWidget = this.visibleWidgets[0];
		}
	},

	getDecoratedWidgetArray: function(widgetIds) {
		var that = this;

		if (!widgetIds) {
			return;
		}

		return widgetIds.map(function(id) {
			return { id: id, name: that.widgetNames[id] };
		});
	},

	getWidgetIdArray: function(widgets) {
		if (!widgets) {
			return;
		}

		return widgets.map(function(widget) {
			return widget.id;
		});
	},

	save: function() {
		this.dashboardSettings.settings.availableWidgets = this.getWidgetIdArray(this.availableWidgets);
		this.dashboardSettings.settings.visibleWidgets = this.getWidgetIdArray(this.visibleWidgets);
		this.dashboardSettings.save();
	},

	moveLeft: function() {
		if (!this.selectedVisibleWidget) {
			return;
		}

		_.pull(this.visibleWidgets, this.selectedVisibleWidget);

		this.availableWidgets.push(this.selectedVisibleWidget);
		if (this.availableWidgets.length === 1) {
			this.selectedAvailableWidget = this.availableWidgets[0];
		}
		if (this.visibleWidgets.length > 0) {
			this.selectedVisibleWidget = this.visibleWidgets[0];
		} else {
			this.selectedVisibleWidget = null;
		}

		this.save();
	},

	moveRight: function() {
		if (!this.selectedAvailableWidget) {
			return;
		}

		_.pull(this.availableWidgets, this.selectedAvailableWidget);

		this.visibleWidgets.push(this.selectedAvailableWidget);
		if (this.visibleWidgets.length === 1) {
			this.selectedVisibleWidget = this.visibleWidgets[0];
		}
		if (this.availableWidgets.length > 0) {
			this.selectedAvailableWidget = this.availableWidgets[0];
		} else {
			this.selectedAvailableWidget = null;
		}

		this.save();
	},

	moveUp: function() {
		if (!this.selectedVisibleWidget) {
			return;
		}

		var index = _.indexOf(this.visibleWidgets, this.selectedVisibleWidget);
		if (index > 0) {
			var aux = this.visibleWidgets[index];
			this.visibleWidgets[index] = this.visibleWidgets[index - 1];
			this.visibleWidgets[index - 1] = aux;
		}

		this.save();
	},

	moveDown: function() {
		if (!this.selectedVisibleWidget) {
			return;
		}

		var index = _.indexOf(this.visibleWidgets, this.selectedVisibleWidget);
		if (index < this.visibleWidgets.length - 1) {
			var aux = this.visibleWidgets[index];
			this.visibleWidgets[index] = this.visibleWidgets[index + 1];
			this.visibleWidgets[index + 1] = aux;
		}

		this.save();
	},

	setSelectedAvailableWidget: function(item) {
		this.selectedAvailableWidget = item;
	},

	setSelectedVisibleWidget: function(item) {
		this.selectedVisibleWidget = item;
	},
};

angular
	.module("cpms.controllers")
	.controller("ManageDashboardController", ManageDashboardController);
