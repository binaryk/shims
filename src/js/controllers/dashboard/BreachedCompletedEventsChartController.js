"use strict";

var _ = require("lodash");
var angular = require("angular");

function BreachedCompletedEventsChartController($scope, $timeout, dataProvider) {
	this.$scope = $scope;
	this.$timeout = $timeout;
	this.dataProvider = dataProvider;

	this.isFullscreen = false;

	this.init();
}

BreachedCompletedEventsChartController.$inject = ["$scope", "$timeout", "BreachedEventsDataProvider"];

BreachedCompletedEventsChartController.prototype = {
	init: function() {
		var that = this;

		this.$scope.$on("breachedEventsChartReady", function() {
			that.dataProvider.getData(function(data) {
				that.data = data.completedEvents;
				that.dataReceived = true;
				that.$scope.$broadcast("updateChart", that.data);
			});
		});

		this.$scope.$on("fullscreenChangePing", function() {
			that.$timeout(function() {
				that.isFullscreen = !that.isFullscreen;
				that.$scope.$broadcast("fullscreenChangePong", { isFullscreen: that.isFullscreen });
			});
		});
	},

	getItems: function() {
		if (!this.data) {
			return;
		}

		if (this.isFullscreen) {
			return this.data;
		}

		return _.first(this.data, 5);
	}
};

angular
	.module("cpms.controllers")
	.controller("BreachedCompletedEventsChartController", BreachedCompletedEventsChartController);