"use strict";

var _ = require("lodash");
var angular = require("angular");

var app = angular.module("cpms.controllers");

app.controller("PaginationController", [ "$scope", function($scope) {	
	reset();	

	$scope.$on("paginationNumPagesChange", function(e, data) {
		if (data.numPages !== $scope.numPages) {
			reset(data.numPages);
		}
	});

	$scope.$on("paginationResetActivePage", function(e, data) {
		$scope.activePage = 0;
		$scope.goToPage = $scope.activePage + 1;
	});

	$scope.setPage = function(n) {
		var oldActivePage = $scope.activePage;
		$scope.activePage = n;
		$scope.goToPage = $scope.activePage + 1;
		if (oldActivePage !== $scope.activePage) {
			$scope.$emit("paginationActivePageChange", { activePage: $scope.activePage });
		}
		buildPaginationArray();
	};
	$scope.nextPage = function() {		
		var oldActivePage = $scope.activePage;

		$scope.activePage++;
		if ($scope.activePage >= $scope.numPages) {
			$scope.activePage = $scope.numPages - 1;
		}
		$scope.goToPage = $scope.activePage + 1;

		if (oldActivePage !== $scope.activePage) {
			$scope.$emit("paginationActivePageChange", { activePage: $scope.activePage });
		}

		buildPaginationArray();
	};
	$scope.prevPage = function() {		
		var oldActivePage = $scope.activePage;

		$scope.activePage--;
		if ($scope.activePage < 0) {
			$scope.activePage = 0;			
		}		
		$scope.goToPage = $scope.activePage + 1;

		if (oldActivePage !== $scope.activePage) {
			$scope.$emit("paginationActivePageChange", { activePage: $scope.activePage });
		}

		buildPaginationArray();
	};
	$scope.onGoToPageEnter = function() {
		var n = parseInt($scope.goToPage, 10) - 1;
		if (!isNaN(n)) {
			if (n < 0) {
				n = 0;
			}
			if (n >= $scope.numPages) {
				n = $scope.numPages - 1;
			}

			$scope.setPage(n);
		}
	};

	function reset(numPages) {
		numPages = numPages || 0;

		$scope.numPages = numPages;
		$scope.activePage = 0;
		$scope.goToPage = $scope.activePage + 1;

		buildPaginationArray();
	}

	function buildPaginationArray() {
		var n = $scope.activePage;

		var min = Math.max(0, n - 2);
		var max = Math.min(n + 3, $scope.numPages);

		$scope.paginationArray = _.range(min, max);
	}
}]);