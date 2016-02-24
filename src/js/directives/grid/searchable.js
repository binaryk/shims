"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("searchable", [ "$compile", "$timeout", function($compile, $timeout) {
	return {
		restrict: "A",
		scope: {
			column: "=",
		},
		template: "<div class='search'><input type='text' /></div>",

		link: function(scope, elem, attrs) {
			scope.column.search = true;
			var input = $("input[type=text]", elem);

			scope.$watch(function() { return scope.column.searchValue; }, function(newValue, oldValue) {
				if (newValue !== oldValue) {
					if (newValue === "") {
						input.parent().removeClass("no-image");
					} else {
						input.parent().addClass("no-image");
					}

					input.val(scope.column.searchValue);
					scope.$emit("searchChange");
				}
			});

			$timeout(function() {
				input.on("focus", function() {
					$(this).parent().addClass("no-image");
				});
				input.on("blur", function() {
					if ($(this).val() === "") {
						input.parent().removeClass("no-image");
					} else {
						input.parent().addClass("no-image");
					}
				});
				input.on("keydown", function(e) {			
					if (e.keyCode === 13) {
						scope.$apply(function() { 
							var value = input.val();
							
							if (attrs.numeric !== undefined) {
								value = value.replace(/[^0-9]/g, ""); 
							}

							scope.column.searchValue = value;
						});
					}
				});
			});
		}
	};
}]);