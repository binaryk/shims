"use strict";

var angular = require("angular");

function NavbarController($rootScope, $window, userDataProvider, themeManager) {	
	this.$rootScope = $rootScope;
	this.$window = $window;
	this.userDataProvider = userDataProvider;
	this.themeManager = themeManager;

	this.init();
}

NavbarController.$inject = ["$rootScope", "$window", "UserDataProvider", "ThemeManager"];

NavbarController.prototype = {
	init: function() {
		var that = this;

		this.showAdminPortal = false;

		this.userDataProvider.getData(function(data) {
			that.user = data;

			var rights = data.role.permissions;

			var hasNoRights = 
				!rights.ActionsNotifications &&
				!rights.BreachesNotifications &&
				!rights.ErrorsNotifications &&
				!rights.ImportsNotifications &&
				!rights.EventBreaches &&
				!rights.RTTPeriodBreaches &&
				!rights.Patient &&
				!rights.Reports &&
				!rights.Trust;

			if (hasNoRights) {
				that.$window.location.href = "./access-denied.html";
			} else {
				that.$rootScope.$broadcast("userDataReceived", data);

				that.showAdminPortal = 
					rights.EditRolesActivitiesMapping ||
					rights.ManagePlannedEvents ||
					rights.ManageUsers;
			}
		});

		this.initThemes();
	},	

	logout: function() {
		this.$window.sessionStorage.removeItem("accessToken");
		this.$window.localStorage.removeItem("refreshToken");
		this.$window.sessionStorage.removeItem("refreshToken");
		this.$window.sessionStorage.removeItem("userInfo");
		this.$window.location.href = "./index.html";
	},

	goToAccount: function() {
		this.$window.location.href = "./account.html";
	},

	goToManageDashboard: function() {
		this.$window.location.href = "./manage-dashboard.html";
	},

	initThemes: function() {
		this.themes = this.themeManager.getThemes();
		this.activeTheme = this.themeManager.getActiveTheme();
	},

	onThemeClick: function(theme) {
		if (theme.id !== this.activeTheme.id) {
			this.themeManager.setActiveTheme(theme);
		}
	},

	getThemeClass: function(theme) {
		if (theme.id !== this.activeTheme.id) {
			return theme.id;
		} else {
			return theme.id + " active";
		}
	}
};

angular
	.module("cpms.controllers")
	.controller("NavbarController", NavbarController);