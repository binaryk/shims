"use strict";

var _ = require("lodash");
var angular = require("angular");

function ThemeManager($window) {
	var themes;
	var activeTheme;

	init();

	this.getThemes = function() {
		return themes;
	};
	this.getActiveTheme = function() {
		return activeTheme;
	};
	this.setActiveTheme = function(theme) {
		$window.localStorage.activeTheme = JSON.stringify(theme);
		$window.location.reload();
	};

	function init() {
		themes = [
			{ id: "navy", name: "Navy" },
			{ id: "teal", name: "Teal" },
		];

		if ($window.localStorage.activeTheme !== undefined) {
			activeTheme = JSON.parse($window.localStorage.activeTheme);
		} else {
			activeTheme = themes[1];
		}
	}
}

ThemeManager.$inject = ["$window"];

angular
	.module("cpms.services")
	.service("ThemeManager", ThemeManager);