"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("linkTab", [ "$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "E",
		replace: true,
		transclude: true,
		require: "^linkTabs",
		scope: {
			value: "@"
		},
		template: "<span class='link-tab' ng-transclude></span>",

		link: function(scope, elem, attrs, linkTabsCtrl) {
			var linkTabs = $(elem).siblings(".link-tab");

			if ($(elem).nextAll(".link-tab").length > 0) {
				$("<span class='breadcrumb-separator'>|</span>").insertAfter($(elem));
			}

			if (attrs.active !== undefined) {
				makeActive();
			}

			$(elem).on("click", function() {
				makeActive();
			});

			function makeActive() {
				$timeout(function() {
					linkTabsCtrl.changeTab(scope.value);
					linkTabs.removeClass("active");
					$(elem).addClass("active");
				});
			}
		}
	};
}]);