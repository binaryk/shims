"use strict";

var angular = require("angular");

var app = angular.module("cpms.controllers");

app.factory("GridDataProvider", [ "$http", "$timeout", "SortType", "DebugHelper", 
	function($http, $timeout, SortType, DebugHelper) {
		function GridDataProvider($scope, baseUrl) {
			this.$scope = $scope;
			this.baseUrl = baseUrl;
			this.gridColumns = $scope.gridColumns;
			
			this.numPages = 0;
			this.activePage = 0;
			this.$scope.gridData = [];
			this.$scope.sortColumn = null;

			this.ajaxRequestPending = false;
			this.ajaxRequestFailed = false;

			this.maxItemsPerPage = 20;

			this.onAddQueryParams = function(query) {};
			this.onExtractData = function(data) {};
		}

		GridDataProvider.prototype = {
			init: function() {
				this.addGridMessageFuncs();
				this.attachEvents();
			},

			addGridMessageFuncs: function() {
				var that = this;

				this.$scope.showLoading = function() {
					return that.ajaxRequestPending;
				};
				this.$scope.showNoData = function() {
					return !that.ajaxRequestPending && !that.ajaxRequestFailed && that.$scope.gridData.length === 0;
				};
				this.$scope.showFail = function() {
					return that.ajaxRequestFailed;
				};
				this.$scope.showGrid = function() {
					return !that.ajaxRequestPending && !that.ajaxRequestFailed && that.$scope.gridData.length > 0;
				};
				this.$scope.showFooter = function() {
					return !that.ajaxRequestPending && !that.ajaxRequestFailed && that.numPages > 1;
				};
			},

			attachEvents: function() {
				var that = this;

				this.$scope.$on("sortChange", function(e, data) {
					that.getData();
				});				
				this.$scope.$on("searchChange", function(e, data) {
					that.$scope.$broadcast("paginationResetActivePage");
					that.activePage = 0;
					that.getData();
				});
				this.$scope.$on("gridDropdownChange", function(e, data) {
					that.getData();
				});
				this.$scope.$on("paginationActivePageChange", function(e, data) {
					that.activePage = data.activePage;
					that.getData();
				});
			},

			getData: function() {
				var that = this;

				this.ajaxRequestPending = true;
				this.ajaxRequestFailed = false;

				this.getRequest().then(function(promise) {
					that.onDataReceived(promise.data);
				}, function(promise) {
					that.onRequestFailed();
				});
			},

			getRequest: function() {
				var query = {
					index: this.activePage,
					pageCount: this.maxItemsPerPage,
				};

				this.addSearchParams(query);
				this.addSortParams(query);
				this.onAddQueryParams(query);

				var request = $http({
					url: this.baseUrl,
					params: query,
				});

				DebugHelper.printQueryString(this.baseUrl, query);

				return request;
			},

			addSearchParams: function(query) {
				for (var i in this.gridColumns) {
					var column = this.gridColumns[i];
					if (column.search && column.searchValue && column.searchValue !== "") {
						query[column.field] = column.searchValue;
					}
				}
			},

			addSortParams: function(query) {
				if (this.$scope.sortColumn) {
					var column = this.$scope.sortColumn;
					if (column.sort !== SortType.None) {
						query.orderBy = column.field;

						if (column.sort === SortType.Ascending) {
							query.orderDirection = "A";
						} else
						if (column.sort === SortType.Descending) {
							query.orderDirection = "D";
						}
					}
				}
			},

			onDataReceived: function(data) {
				var that = this;

				var result = this.onExtractData(data);

				$timeout(function() {
					that.ajaxRequestPending = false;
					that.ajaxRequestFailed = false;

					that.$scope.gridData = result.data;
					that.numPages = Math.ceil(result.totalCount / that.maxItemsPerPage);
					that.$scope.$broadcast("paginationNumPagesChange", { numPages: that.numPages });					
				});
			},

			onRequestFailed: function() {
				this.ajaxRequestPending = false;
				this.ajaxRequestFailed = true;
			},
		};

		return GridDataProvider;
	}
]);