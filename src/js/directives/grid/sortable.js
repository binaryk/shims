"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("sortable", [ "$compile", "$timeout", "SortType", function($compile, $timeout, SortType) {
	return {
		restrict: "A",
		scope: {
			column: "=",
		},

		link: function(scope, elem, attrs) {
			var gridScope = getGridScope();

			if (scope.column.sort === undefined) {
				scope.column.sort = SortType.None;				
			} else
			if (scope.column.sort === SortType.Ascending || scope.column.sort === SortType.Descending) {
				gridScope.sortColumn = scope.column;
				scope.$emit("sortChange");
			}
			addSortClass(scope.column.sort);

			$(elem).on("click", function() {
				scope.$apply(function() {
					if (scope.column.sort === SortType.Disabled) {
						return;
					}
					var oldSortColumn = gridScope.sortColumn;
					gridScope.sortColumn = scope.column;					

					if (oldSortColumn !== gridScope.sortColumn) {
						if (oldSortColumn !== null) {
							oldSortColumn.sort = SortType.None;
						}
						scope.column.sort = SortType.Ascending;
					} else {
						if (scope.column.sort === SortType.None) { scope.column.sort = SortType.Ascending; } else 
						if (scope.column.sort === SortType.Ascending) { scope.column.sort = SortType.Descending; } else 
						if (scope.column.sort === SortType.Descending) { scope.column.sort = SortType.None; }
					}

					scope.$emit("sortChange");
				});
			});

			scope.$watch(function() { return scope.column.sort; }, function(newValue, oldValue) {
				if (newValue !== oldValue) {
					addSortClass(newValue);		
				}
			});

			function addSortClass(sortType) {
				switch (sortType) {
					case SortType.None:
						$(elem).removeClass("sort sort-asc sort-desc").addClass("sort sort-none");
						break;

					case SortType.Ascending:
						$(elem).removeClass("sort sort-none sort-desc").addClass("sort sort-asc");
						break;

					case SortType.Descending:
						$(elem).removeClass("sort sort-none sort-asc").addClass("sort sort-desc");
						break;

					case SortType.Disabled:
						$(elem).removeClass("sort sort-none sort-asc sort-desc");
						break;
				}
			}

			// hack
			function getGridScope() {
				var i = 0;
				var max = 5;
				var current = scope;

				while (current && i < max) {
					if (current.hasOwnProperty("sortColumn")) {
						return current;
					}

					current = current.$parent;
					i++;
				}

				throw "no sort column found in scope";
			}
		}
	};
}]);