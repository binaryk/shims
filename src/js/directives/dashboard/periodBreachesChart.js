"use strict";

var $ = require("jquery");
var printf = require("printf");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("periodBreachesChart", [
	"$compile", "$timeout", "$window", "ObjectCanvas",  "ThemeManager",

	function($compile, $timeout, $window, ObjectCanvas, themeManager) {
		return {
			restrict: "E",
			replace: true,
			templateUrl: "partials/dashboard/period-breaches-chart.html",

			link: function(scope, elem, attrs) {
				var contentSectionHeader = $(".content-section-header", elem);
				var chartLegend = $(".chart-legend-outer", elem);
				var chartContainer = $(".chart-container", elem);
				var chartElem = $(".chart-column-right", elem);

				var minRows = 5;
				var rowHeight = 59;
				var isFullscreen = false;
				var firstUpdate = true;
				var fontSize = 18;
				var contentSectionPadding = 16;

				var cvs;
				var dataReceived;

				var theme = themeManager.getActiveTheme();

				var barItems = [
					{ name: "onSchedule", color: "#179C8C" }, 
					{ name: "aboutToBreach", color: "#F16981" },
					{ name: "breached", color: "#C7D2D8" }
				];

				var colors;				
				if (theme.id === "navy") {
					colors = {
						text: "#000",
						border: "#E9EEF1",
						foregroundAlt: "#F8F9FD",
					};
				} else
				if (theme.id === "teal") {
					colors = {
						text: "#000",
						border: "#D9EBE8",
						foregroundAlt: "#F6FDFC",
					};
				}

				initCanvas();

				function initCanvas() {
					scope.$on("pageLoad", function() {
						chartElem.outerHeight(minRows * rowHeight);

						cvs = new ObjectCanvas(chartElem);

						cvs.onResize = function() {
							if (dataReceived) {
								updateChart(dataReceived);
							}
						};

						cvs.init();

						scope.$on("fullscreenChangePong", function(e, data) {
							isFullscreen = data.isFullscreen;

							if (isFullscreen) {
								var height = $($window).height() - contentSectionHeader.outerHeight() - chartLegend.outerHeight();								
								chartContainer.css("overflow", "auto");
								chartContainer.css("height", height + "px");
								chartElem.css("height", (rowHeight * dataReceived.items.length) + "px");
							} else {
								chartContainer.css("height", "auto");
								chartContainer.css("overflow", "hidden");
								chartElem.css("height", (rowHeight * minRows) + "px");
							}

							setTimeout(function() {
								cvs.forceResize();
							}, 50);
						});

						$($window).on("resize", function(e) {
							if (isFullscreen) {
								var height = $($window).height() - contentSectionHeader.outerHeight() - chartLegend.outerHeight();
								chartContainer.css("overflow", "auto");
								chartContainer.css("height", height + "px");

								setTimeout(function() {
									cvs.forceResize();
								}, 50);
							}
						});

						scope.$emit("periodBreachesChartReady");
					});

					scope.$on("updateChart", function(e, data) {						
						dataReceived = data;
						updateChart(dataReceived);
					});
				}

				function updateChart(data) {
					if (firstUpdate) {
						chartContainer.css("visibility", "hidden");
					}
					chartContainer.removeClass("loading");

					cvs.clear();

					addRows(data);

					cvs.computeBoundingBoxes();
					cvs.draw();

					if (firstUpdate) {
						chartContainer.css("visibility", "visible").hide().fadeIn("fast");
						firstUpdate = false;
					}
				}

				function addRows(data) {
					var n;
					if (isFullscreen) {
						n = data.items.length;
					} else {
						n = Math.min(data.items.length, minRows);
					}

					for (var i = 0; i < n; i++) {
						var topY = i * rowHeight;
						var bottomY = rowHeight + i * rowHeight - 1;

						if (i % 2 !== 0) {
							cvs.box({
								x0Percent: 0,
								x1Percent: 100,
								y0: topY,
								y1: bottomY,
								fill: colors.foregroundAlt
							});
						}

						cvs.line({
							x0Percent: 0,
							x1Percent: 100,
							y0: bottomY,
							y1: bottomY,
							lineWidth: 1,
							color: colors.border,
						});

						addBar(data, i, topY, bottomY);
					}
				}

				function addBar(data, index, topY, bottomY) {
					var row = data.items[index];
					var middle = (topY + bottomY) / 2;
					
					var leftX = 0;
					var rightX = 0;

					for (var i = 0; i < barItems.length; i++) {
						var item = barItems[i];

						leftX = rightX;
						rightX = leftX + 100 * row[item.name] / row.total;

						if (leftX !== rightX) {
							cvs.box({
								x0: -contentSectionPadding,
								x0Percent: leftX,
								x1: -contentSectionPadding,
								x1Percent: rightX,
								y0: middle - 2,
								y1: middle + 2,
								fill: item.color,
							});

							var str = printf("%s (%s%%)", row[item.name], parseFloat((100 * row[item.name] / row.total).toFixed(1)));
							addIndicator(str, (leftX + rightX) / 2);
						}
					}

					function addIndicator(str, pos) {
						cvs.text({
							x: -contentSectionPadding,
							xPercent: pos,
							y: middle - 5,
							str: str,
							textAlign: "center",
							textBaseline: "bottom",
							fontSize: fontSize,
							color: colors.text,
						});
					}
				}
			}
		};
	}
]);

app.animation(".period-breaches-chart-container", fadeAnimation);

function fadeAnimation() {
	return {
		beforeAddClass: function(element, className, done) {
			$(element).fadeOut("fast", done);

			return function(isCancelled) {
				if (isCancelled) {
					$(element).stop();
				}
			};
		},
		removeClass: function(element, className, done) {
			$(element).fadeIn("fast", done);

			return function(isCancelled) {
				if (isCancelled) {
					$(element).stop();
				}
			};
		}
	};
}