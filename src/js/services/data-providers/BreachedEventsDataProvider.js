"use strict";

var _ = require("lodash");
var angular = require("angular");

function BreachedEventsDataProvider($timeout, ajax) {
	this.$timeout = $timeout;
	this.ajax = ajax;
}

BreachedEventsDataProvider.$inject = ["$timeout", "AjaxHelper"];

BreachedEventsDataProvider.prototype = {
	getData: function(callback) {
		var that = this;

		this.ajax("/Patient/api/CounterPerEvents").then(function(promise) {
			var completedEvents = [];
			var eventMilestones = [];

			for (var i = 0; i < promise.data.length; i++) {
				var e = promise.data[i];

				if (e.BreachedEventsNumber > 0) {
					completedEvents.push({
						name: e.EventCode,
						amount: e.BreachedEventsNumber,
						total: e.TotalEventsNumber,
					});
				}
				if (e.BreachedPlannedEventsNumber > 0) {
					eventMilestones.push({
						name: e.EventCode,
						amount: e.BreachedPlannedEventsNumber,
						total: e.TotalPlannedEventsNumber,
					});
				}
			}

			completedEvents.sort(function(a, b) {
				return b.total - a.total;
			});
			eventMilestones.sort(function(a, b) {
				return b.total - a.total;
			});

			var data = {
				completedEvents: completedEvents,
				eventMilestones: eventMilestones
			};

			that.$timeout(function() {
				callback(data);
			});
		});
	},
};

angular
	.module("cpms.services")
	.service("BreachedEventsDataProvider", BreachedEventsDataProvider);