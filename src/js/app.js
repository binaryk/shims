"use strict";

var printf = require("printf");
var $ = require("jquery");

var angular = require("angular");
require("angular-animate");
require("angular-sanitize");
require("angular-timeago");

angular.module("cpms.controllers", [ "cpms.services" ]);
angular.module("cpms.directives", [ "ngAnimate", "ngSanitize", "cpms.services" ]);
angular.module("cpms.filters", []);
angular.module("cpms.services", [ "yaru22.angular-timeago" ]);

var app = angular.module("cpms", [
	"cpms.controllers",
	"cpms.directives",
	"cpms.filters",
	"cpms.services",
]);

app.config(function($locationProvider, $httpProvider) {	
	$locationProvider.html5Mode(true);
	$httpProvider.interceptors.push("AuthorizationInterceptor");
});

app.run(function($rootScope, ThemeManager) {
	$rootScope.appTheme = printf("css/%s.css", ThemeManager.getActiveTheme().id);
	$rootScope.appTitle = "Explorator";

	addGridCellTooltip();

	function addGridCellTooltip() {
		setInterval(function() {
			$(".grid td").each(function() {
				$(this).attr("title", $(this).text().trim());
			});
		}, 1000);
	}
});
