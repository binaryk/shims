"use strict";

var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("navbar", ["$compile", "$timeout", "PopupHelper", function($compile, $timeout, PopupHelper) {
	return {
		restrict: "E",
		replace: true,
		templateUrl: "partials/navbar.html",

		link: function(scope, elem, attrs) {
			var popupAvatar = new PopupHelper({
				elem: elem,
				top: 44,
				left: -387,
				popup: ".navbar-popup-avatar",
				popupButton: "span.avatar-container",
				anchor: "span.icon-settings-arrow"
			});
			popupAvatar.init();

			var popupSettings = new PopupHelper({
				elem: elem,
				top: 44,
				left: -136,
				popup: ".navbar-popup-settings",
				popupButton: "span.icon-options-top",				
			});
			popupSettings.init();
		}
	};
}]);