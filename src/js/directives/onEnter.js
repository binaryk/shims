"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("onEnter", ["$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "A",
		scope: {
			onEnter: "&",
		},

		link: function(scope, elem, attrs) {
			if (attrs.type !== "text") {
				return;
			}

			$(elem).on("keydown", function(e) {
				if (e.keyCode === 13) {
					$timeout(function() {
						scope.onEnter();
					});
				}
			});
		}
	};
}]);