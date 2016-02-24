"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("dashboard", ["$compile", "$timeout", "DashboardSettings", function($compile, $timeout, DashboardSettings) {
	return {
		restrict: "E",
		replace: true,
		transclude: true,
		template: "<div class='dashboard'></div>",

		compile: function() {
			return {
				pre: function(scope, elem, attrs) {
					var settings = DashboardSettings.settings;

					var widgetDirectives = {
						breachesChart: "<breaches-chart ng-controller='BreachesChartController as breachesChart'></breaches-chart>",

						periodBreachesChart: "<period-breaches-chart ng-controller='PeriodBreachesChartController as pbChart'>" +
							"</period-breaches-chart>",

						breachedCompletedEventsChart: 
							"<breached-completed-events-chart ng-controller='BreachedCompletedEventsChartController as bceChart'>" +
							"</breached-completed-events-chart>",

						breachedEventMilestonesChart: 
							"<breached-event-milestones-chart ng-controller='BreachedEventMilestonesChartController as bemChart'>" +
							"</breached-event-milestones-chart>",

						activityLog: "<activity-log ng-controller='ActivityLogController as activityLog'></activity-log>",

						breachesLog: "<breaches-log ng-controller='BreachesLogController as breachesLog'></breaches-log>",
					};

					scope.$on("userDataReceived", function(e, data) {
						var widgets = settings.visibleWidgets;
						if (widgets) {							
							for (var i = 0; i < widgets.length; i++) {
								if (isWidgetVisible(widgets[i], data)) {
									var el = $compile(widgetDirectives[widgets[i]])(scope);
									$(elem).append(el);
								}
							}
						}
					});

					function isWidgetVisible(widgetName, user) {
						var rights = user.role.permissions;

						switch (widgetName) {
							case "breachesChart":
								return true;

							case "periodBreachesChart":
								return rights.RTTPeriodBreaches && rights.Trust;

							case "breachedCompletedEventsChart":
								return rights.EventBreaches;

							case "breachedEventMilestonesChart":
								return rights.EventBreaches;

							case "activityLog":
								return rights.ImportsNotifications ||
									rights.BreachesNotifications ||
									rights.ActionsNotifications ||
									rights.ErrorsNotifications;

							case "breachesLog":
								return rights.BreachesNotifications;
						}

						return false;
					}
				},
				post: function(scope, elem, attrs) {
				},
			};
		},
	};
}]);