"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("tab", [ "$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "E",
		replace: true,
		transclude: true,
		require: "^tabs",
		scope: {
			value: "@"
		},
		template: "<li class='tab' ng-transclude></li>",

		link: function(scope, elem, attrs, tabsCtrl) {
			var tabs = $(elem).siblings(".tab");

			if (attrs.active !== undefined) {
				makeActive();
			} else
			if (tabsCtrl.getActiveTab() === scope.value) {
				addActiveClass();
			}

			scope.$watch(function() { return tabsCtrl.getActiveTab(); }, function(newValue, oldValue) {
				if (newValue !== oldValue && newValue === scope.value) {
					addActiveClass();
				}
			});

			$(elem).on("click", function() {
				makeActive();
			});

			function makeActive() {
				$timeout(function() {
					tabsCtrl.changeTab(scope.value);
					addActiveClass();
				});
			}

			function addActiveClass() {
				tabs.removeClass("tab-active");
				$(elem).addClass("tab-active");
			}
		}
	};
}]);