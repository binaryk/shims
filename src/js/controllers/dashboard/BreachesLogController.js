"use strict";

var _ = require("lodash");
var angular = require("angular");

function BreachesLogController($scope, $timeout, dataProvider, userDataProvider) {
	this.$scope = $scope;
	this.$timeout = $timeout;
	this.dataProvider = dataProvider;
	this.user = userDataProvider.user;	

	this.ajaxRequestPending = false;
	this.isFullscreen = false;

	this.init();
}

BreachesLogController.$inject = ["$scope", "$timeout", "BreachesLogDataProvider", "UserDataProvider"];

BreachesLogController.prototype = {
	init: function() {
		var that = this;

		var filters = this.dataProvider.loadFilters();
		this.displayTypes = [
			{ name: "Period breaches", value: "periodBreach" },
			{ name: "Event milestone breaches", value: "eventBreach" },
		];
		this.selectedDisplayType = _.find(this.displayTypes, { value: filters.showType });

		this.addFiltersPersistence();
		this.getData();

		var minutes = 5;
		var ms = minutes * 60 * 1000;
		setInterval(function() {
			that.$scope.$broadcast("breachesLogFadeOut");
			that.getData();
		}, ms);

		this.$scope.$on("fullscreenChangePing", function() {
			that.$timeout(function() {
				that.isFullscreen = !that.isFullscreen;
				that.$scope.$broadcast("fullscreenChangePong", { isFullscreen: that.isFullscreen });
			});
		});
	},

	addFiltersPersistence: function() {
		var that = this;

		this.$scope.$watch(function() { return that.selectedDisplayType; }, save);

		function save(newValue, oldValue) {
			if (newValue !== oldValue) {
				that.dataProvider.saveFilters({
					showType: that.selectedDisplayType.value
				});
			}
		}
	},

	getItems: function() {
		var that = this;

		if (!this.items) {
			return;
		}

		if (this.isFullscreen) {
			return _.filter(this.items, condition);
		}

		var result = [];
		for (var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			if (condition(item)) {
				result.push(item);
			}
			
			if (result.length === 5) {
				break;
			}
		}

		function condition(item) {
			return that.selectedDisplayType.value === item.type;
		}

		return result;
	},

	getData: function() {		
		var that = this;

		this.ajaxRequestPending = true;

		this.dataProvider.getData(this.user, function() {
			that.items = that.dataProvider.items;
			that.ajaxRequestPending = false;
			that.$scope.$broadcast("breachesLogFadeIn");
		});
	},

	itemHasLink: function(item) {
		if (this.user && !this.user.role.permissions.Patient) {
			return false;
		}

		return item.name !== undefined;
	},
};

angular
	.module("cpms.controllers")
	.controller("BreachesLogController", BreachesLogController);