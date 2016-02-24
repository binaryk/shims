"use strict";

var angular = require("angular");

function BreachesCountDataProvider($timeout, ajax) {
	this.$timeout = $timeout;
	this.ajax = ajax;

	this.callbackQueue = [];
	this.init();
}

BreachesCountDataProvider.$inject = ["$timeout", "AjaxHelper"];

BreachesCountDataProvider.prototype = {
	init: function(callback) {
		var that = this;

		this.ajax("/Patient/api/PeriodEvents").then(function(promise) {
			var periodBreaches = promise.data.PeriodsBreachesCountViewModel;
			var eventBreaches = promise.data.EventsBreachesCountViewModel;

			var data = {
				periodBreaches: {
					four: periodBreaches.FourWeeks,
					three: periodBreaches.ThreeWeeks,
					two: periodBreaches.TwoWeeks,
					one: periodBreaches.OneWeek,
					postbreach: periodBreaches.PostBreach,
				},
				eventBreaches: {
					about: eventBreaches.AboutToBreach,
					three: eventBreaches.ThreeDays,
					two: eventBreaches.TwoDays,
					one: eventBreaches.OneDays,
					breach: eventBreaches.Breach,
					postbreach: eventBreaches.PostBreach,
				},
			};

			data.periodBreaches.total = 
				data.periodBreaches.four + 
				data.periodBreaches.three + 
				data.periodBreaches.two + 
				data.periodBreaches.one +
				data.periodBreaches.postbreach;

			data.eventBreaches.total = 
				data.eventBreaches.about + 
				data.eventBreaches.three + 
				data.eventBreaches.two + 
				data.eventBreaches.one +
				data.eventBreaches.breach +
				data.eventBreaches.postbreach;

			that.data = data;

			that.iterateCallbackQueue();
		});
	},

	getData: function(callback) {
		this.callbackQueue.push(callback);

		if (this.data) {
			this.iterateCallbackQueue();
		}
	},

	iterateCallbackQueue: function() {
		var that = this;

		this.$timeout(function() {
			while (that.callbackQueue.length > 0) {
				var callback = that.callbackQueue.pop();
				callback(that.data);
			}
		});
	}
};

angular
	.module("cpms.services")
	.service("BreachesCountDataProvider", BreachesCountDataProvider);