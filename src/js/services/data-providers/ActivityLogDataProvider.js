"use strict";

var printf = require("printf");
var angular = require("angular");

function ActivityLogDataProvider($timeout, $filter, $window, ajax) {
	this.$timeout = $timeout;
	this.$filter = $filter;
	this.$window = $window;
	this.ajax = ajax;
}

ActivityLogDataProvider.$inject = ["$timeout", "$filter", "$window", "AjaxHelper"];

ActivityLogDataProvider.prototype = {
	loadFilters: function() {
		var jsonStr = this.$window.localStorage.activityLogFilters;
		if (jsonStr) {
			return JSON.parse(jsonStr);
		}

		return {
			imports: true,
			actions: true,
			ruleViolations: true
		};
	},

	saveFilters: function(filters) {
		this.$window.localStorage.activityLogFilters = JSON.stringify(filters);
	},

	getData: function(user, callback) {
		this.items = [];
		this.getRuleViolationsItems(user, callback);
	},

	getRuleViolationsItems: function(user, callback) {
		var that = this;

		if (!user.role.permissions.ErrorsNotifications) {
			that.processFullList(callback);
			return;
		}

		this.ajax("/Notification/api/Errors").then(function(promise) {
			that.items = promise.data.map(function(item) {
				return that.getProcessedRuleViolationsItem(user, item);
			}).concat(that.items);

			that.processFullList(callback);
		});
	},

	processFullList: function(callback) {
		this.items.sort(function(a, b) {
			return a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0;
		});

		this.$timeout(callback);
	},

	getProcessedRuleViolationsItem: function(user, item) {
		if (item.CreatedAt[item.CreatedAt.length - 1] !== "Z") {
			item.CreatedAt += "Z";
		}

		var firstWord = item.Message.split(" ")[0];
		var message = item.Message.replace(firstWord, "");

		var result = {
			name: firstWord,
			text: message,
			type: "rule-violations",
			displayType: "Rule violation",
			time: this.$filter("timeAgo")(item.CreatedAt),
			timestamp: new Date(item.CreatedAt),
			url: this.getUrl(item)
		};

		return result;
	},

	getUrl: function(item) {
		return printf("patient-pathway.html?id=%s&ppiNumber=%s&periodId=%s", item.NhsNumber, item.PpiNumber, item.PeriodId);
	},
};

angular
	.module("cpms.services")
	.service("ActivityLogDataProvider", ActivityLogDataProvider);