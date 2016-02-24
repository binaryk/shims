"use strict";

var _ = require("lodash");
var angular = require("angular");

function PeriodBreachesChartController($scope, $timeout, dataProvider) {
	this.$scope = $scope;
	this.$timeout = $timeout;
	this.dataProvider = dataProvider;
	this.ajaxRequestPending = false;

	this.isFullscreen = false;

	this.init();
}

PeriodBreachesChartController.$inject = ["$scope", "$timeout", "PeriodBreachesChartDataProvider"];

PeriodBreachesChartController.prototype = {
	init: function() {
		var that = this;

		this.$scope.$on("periodBreachesChartReady", function() {
			that.getData();
		});

		this.$scope.$on("fullscreenChangePing", function() {
			that.$timeout(function() {
				that.isFullscreen = !that.isFullscreen;
				that.$scope.$broadcast("fullscreenChangePong", { isFullscreen: that.isFullscreen });
			});
		});

		this.initBreadcrumbs();
	},

	initBreadcrumbs: function() {
		this.breadcrumbs = [
			{ name: "Trust", trust: true },
		];
	},

	getData: function() {
		var that = this;

		this.ajaxRequestPending = true;

		var bc = _.last(this.breadcrumbs);

		if (bc.trust) {
			this.dataProvider.getHospitalData(function(data) {
				for (var i = 0; i < data.items.length; i++) {
					data.items[i].hospital = true;
				}

				assimilateData(data);
			});
		} else 
		if (bc.hospital) {
			this.dataProvider.getSpecialtyData(bc.id, function(data) {
				for (var i = 0; i < data.items.length; i++) {
					data.items[i].specialty = true;
					data.items[i].hospitalId = bc.id;
				}

				assimilateData(data);
			});
		} else
		if (bc.specialty) {
			this.dataProvider.getClinicianData(bc.hospitalId, bc.id, function(data) {
				for (var i = 0; i < data.items.length; i++) {
					data.items[i].noChildren = true;
				}

				assimilateData(data);
			});
		}

		function assimilateData(data) {
			that.data = data;
			that.$scope.$broadcast("updateChart", data);
			that.ajaxRequestPending = false;
		}
	},

	getItems: function() {
		if (!this.data) {
			return;
		}

		if (this.isFullscreen) {
			return this.data.items;
		}

		return _.first(this.data.items, 5);
	},

	addBreadcrumb: function(item) {
		if (!item.noChildren) {
			this.breadcrumbs.push(item);
			this.getData();
		}
	},

	changeBreadcrumb: function(item) {
		var index = this.breadcrumbs.indexOf(item);

		if (index < this.breadcrumbs.length - 1) {
			this.breadcrumbs.splice(index + 1, this.breadcrumbs.length - index - 1);
			this.getData();
		}
	}
};

angular
	.module("cpms.controllers")
	.controller("PeriodBreachesChartController", PeriodBreachesChartController);