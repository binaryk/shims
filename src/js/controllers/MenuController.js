"use strict";

var _ = require("lodash");
var angular = require("angular");

function MenuController($scope, $timeout, MenuDataProvider, userDataProvider) {
	var that = this;
	var handledUserPermissions = false;

	this.items = MenuDataProvider.root.children;

	$scope.$on("userDataReceived", function(e, data) {
		handleUserPermissions(data);
	});

	handleUserPermissions(userDataProvider.user);

	this.itemHasChildren = function(item) {
		return item.children !== undefined && item.children.length > 0;
	};
	this.onExpandCollapseClick = function(item) {
		if (typeof item.lazyLoad === "function") {
			var lazyLoad = item.lazyLoad;
			item.lazyLoad = true;
			lazyLoad(function() {
				item.lazyLoad = undefined;
				$timeout(toggleExpandCollapse);
			});
		} else
		if (!item.lazyLoad) {
			toggleExpandCollapse();
		}

		function toggleExpandCollapse() {
			if (item.accordion && item.parentItem) {
				collapseAllExcept(item.parentItem.children, item);
			}
			item.expanded = !item.expanded;
		}
	};
	this.onClick = function(item) {
		if (item.onClick) {
			item.onClick();
		}
	};

	function collapseAllExcept(items, item) {
		for (var i = 0; i < items.length; i++) {
			if (items[i] !== item) {
				items[i].expanded = false;
			}
		}
	}

	function handleUserPermissions(user) {
		if (!user || handledUserPermissions) {
			return;
		}

		handledUserPermissions = true;

		var rights = user.role.permissions;
		var tree = MenuDataProvider.tree;

		if (!rights.RTTPeriodBreaches) {
			removeMenuItem(tree.categories.breaches._item.children, "periodBreaches");
		}

		if (!rights.EventBreaches) {
			removeMenuItem(tree.categories.breaches._item.children, "eventBreaches");
		}

		if (!rights.RTTPeriodBreaches && !rights.EventBreaches) {
			removeMenuItem(tree.categories._item.children, "breaches");
		}

		if (!rights.Patient) {
			removeMenuItem(tree.categories._item.children, "patients");
		}

		if (!rights.Reports) {
			removeMenuItem(tree.categories._item.children, "reports");	
		}

		if (!rights.Trust) {
			removeMenuItem(that.items, "trusts");
		}

		function removeMenuItem(items, code) {
			_.remove(items, function(item) {
				return item.code === code;
			});
		}
	}
}

MenuController.$inject = ["$scope", "$timeout", "MenuDataProvider", "UserDataProvider"];

angular
	.module("cpms.controllers")
	.controller("MenuController", MenuController);