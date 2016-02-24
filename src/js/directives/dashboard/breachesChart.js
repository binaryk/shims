"use strict";

var $ = require("jquery");
var _ = require("lodash");
var printf = require("printf");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("breachesChart", ["$compile", "$timeout", "$window", "ObjectCanvas", "ThemeManager",
	function($compile, $timeout, $window, ObjectCanvas, themeManager) {
		return {
			restrict: "E",
			replace: true,
			templateUrl: "partials/dashboard/breaches-chart.html",

			link: function(scope, elem, attrs) {				
				var chartElem = $(".chart", elem);

				var firstUpdate = true;

				var cvs;
				var dataReceived;

				var theme = themeManager.getActiveTheme();
				var colors;				
				if (theme.id === "navy") {
					colors = {
						text: "#000",
						gradientStart: "#179C8C",
						gradientEnd: "#F16981",
						fadedText: "#C7D2D8",
						border: "#A3B0B9",
					};
				} else
				if (theme.id === "teal") {
					colors = {
						text: "#000",
						gradientStart: "#179C8C",
						gradientEnd: "#F16981",
						fadedText: "#C7D2D8",
						border: "#A3B0B9",
					};
				}

				var fontSize = 18;
				var xPos = 80;
				var xEndPos = 96;
				var xOffsetStep = 90;

				init();

				function init() {
					scope.$on("pageLoad", function() {
						cvs = getObjectCanvas(chartElem);
						scope.$emit("breachesChartReady");
					});

					scope.$on("updateChart", function(e, data) {
						dataReceived = data;
						updateCharts(dataReceived);
					});
				}

				function getObjectCanvas(chartElem) {
					var cvs = new ObjectCanvas(chartElem);

					cvs.onResize = function() {
						if (dataReceived) {
							updateCharts(dataReceived);
						}
					};

					cvs.onMouseOver = function(e) {
						if (!e.target.hover) {
							e.target.hover = true;
							e.target.oldRadius = e.target.radius;
							e.target.radius = e.target.radius * 1.15;
							cvs.draw();
						}
					};

					cvs.onMouseOut = function(e) {
						if (e.target.hover) {
							e.target.hover = false;
							e.target.radius = e.target.oldRadius;
							cvs.draw();
						}
					};

					cvs.onClick = function(e) {
						$window.location.href = e.target.url;
					};

					cvs.init();

					return cvs;
				}

				function updateCharts(data) {
					if (firstUpdate) {
						chartElem.hide();
					}

					cvs.clear();

					updatePeriodChart(data.periodBreaches);
					updateEventChart(data.eventBreaches);
					addLines();

					cvs.computeBoundingBoxes();
					cvs.draw();

					if (firstUpdate) {
						chartElem.fadeIn("fast");
						firstUpdate = false;
					}
				}

				function updatePeriodChart(data) {
					var yText = 3;
					var yChartLine = 27;

					cvs.box({
						x0Percent: 22,
						x1Percent: xPos,
						y0Percent: yChartLine,
						y1Percent: yChartLine,
						y0: -2,
						y1: 2,
						gradient: {
							start: colors.gradientStart,
							stop: colors.gradientEnd
						},
					});

					cvs.box({
						x0Percent: xPos,
						x1Percent: xEndPos,
						y0Percent: yChartLine,
						y1Percent: yChartLine,
						y0: -2,
						y1: 2,
						fill: colors.fadedText,
					});

					var totalText = printf("18 weeks/cancer (%s)", data.total);
					addText(22, -20, yChartLine, totalText, colors.text, fontSize, "middle", "right");

					addText(xPos, -xOffsetStep * 2.8, yText, "4 weeks");
					addText(xPos, -xOffsetStep * 1.9, yText, "3 weeks");
					addText(xPos, -xOffsetStep, yText, "2 weeks");
					addText(xPos, 0, yText - 2, "1 week", colors.gradientEnd);
					addText(xEndPos, 15, yText, "Postbreach", colors.fadedText, fontSize, "top", "right");

					addClock(xPos, -xOffsetStep * 2.8, yChartLine, 0.65, "period-breaches.html?tab=4", data.clickable, colors.gradientEnd);
					addClock(xPos, -xOffsetStep * 1.9, yChartLine, 0.80, "period-breaches.html?tab=3", data.clickable, colors.gradientEnd);
					addClock(xPos, -xOffsetStep, yChartLine, 0.95, "period-breaches.html?tab=2", data.clickable, colors.gradientEnd);
					addClock(xPos, 0, yChartLine, 1.1, "period-breaches.html?tab=1", data.clickable, colors.gradientEnd);
					addClock(xEndPos, 0, yChartLine, 0.5, "period-breaches.html?tab=-1", data.clickable);

					addText(xPos, -xOffsetStep * 2.8, yChartLine, data.four, colors.text, fontSize + 1, "middle");
					addText(xPos, -xOffsetStep * 1.9, yChartLine, data.three, colors.text, fontSize + 2, "middle");
					addText(xPos, -xOffsetStep, yChartLine, data.two, colors.text, fontSize + 3, "middle");
					addText(xPos, 0, yChartLine, data.one, colors.gradientEnd, fontSize + 4, "middle");
					addText(xEndPos, 0, yChartLine, data.postbreach, colors.text, fontSize, "middle");
				}

				function updateEventChart(data) {
					var yText = 51;
					var yChartLine = 75;

					cvs.box({
						x0Percent: 31,
						x1Percent: xPos,
						y0Percent: yChartLine,
						y1Percent: yChartLine,
						y0: -2,
						y1: 2,
						gradient: {
							start: colors.gradientStart,
							stop: colors.gradientEnd
						},
					});

					cvs.box({
						x0Percent: xPos,
						x1Percent: xEndPos,
						y0Percent: yChartLine,
						y1Percent: yChartLine,
						y0: -2,
						y1: 2,
						fill: colors.fadedText,
					});

					var totalText = printf("Event milestones (%s)", data.total);
					addText(31, -20, yChartLine, totalText, colors.text, fontSize, "middle", "right");

					addText(xPos, -xOffsetStep * 4.2, yText, "Up to 3 weeks");
					addText(xPos, -xOffsetStep * 2.8, yText, "3 days");
					addText(xPos, -xOffsetStep * 1.9, yText, "2 days");
					addText(xPos, -xOffsetStep, yText, "1 day");
					addText(xPos, 0, yText - 2, "Breach today", colors.gradientEnd);
					addText(xEndPos, 15, yText, "Postbreach", colors.fadedText, fontSize, "top", "right");

					addClock(xPos, -xOffsetStep * 4.2, yChartLine, 0.5, "event-breaches.html?tab=4", data.clickable, colors.gradientEnd);
					addClock(xPos, -xOffsetStep * 2.8, yChartLine, 0.65, "event-breaches.html?tab=3", data.clickable, colors.gradientEnd);
					addClock(xPos, -xOffsetStep * 1.9, yChartLine, 0.80, "event-breaches.html?tab=2", data.clickable, colors.gradientEnd);
					addClock(xPos, -xOffsetStep, yChartLine, 0.95, "event-breaches.html?tab=1", data.clickable, colors.gradientEnd);
					addClock(xPos, 0, yChartLine, 1.1, "event-breaches.html?tab=0", data.clickable, colors.gradientEnd);
					addClock(xEndPos, 0, yChartLine, 0.5, "event-breaches.html?tab=-1", data.clickable);

					addText(xPos, -xOffsetStep * 4.2, yChartLine, data.about, colors.text, fontSize, "middle");
					addText(xPos, -xOffsetStep * 2.8, yChartLine, data.three, colors.text, fontSize + 1, "middle");
					addText(xPos, -xOffsetStep * 1.9, yChartLine, data.two, colors.text, fontSize + 2, "middle");
					addText(xPos, -xOffsetStep, yChartLine, data.one, colors.text, fontSize + 3, "middle");
					addText(xPos, 0, yChartLine, data.breach, colors.gradientEnd, fontSize + 4, "middle");
					addText(xEndPos, 0, yChartLine, data.postbreach, colors.text, fontSize, "middle");
				}

				function addLines() {
					// 18 weeks

					cvs.line({
						x0: 24,
						x1: 24,
						y0Percent: 0,
						y1Percent: 27,
						lineWidth: 1,
						color: colors.border,
					});
					cvs.line({
						x0: 24,
						x1Percent: 22,
						x1: -170,
						y0Percent: 27,
						y1Percent: 27,
						lineWidth: 1,
						color: colors.border,
					});

					// event milestones

					cvs.line({
						x0Percent: 22,
						x0: -100,
						x1Percent: 22,
						x1: -100,
						y0Percent: 27,
						y0: 20,
						y1Percent: 75,
						lineWidth: 1,
						color: colors.border,
					});
					cvs.line({
						x0Percent: 22,
						x0: -100,
						x1Percent: 31,
						x1: -175,
						y0Percent: 75,
						y1Percent: 75,
						lineWidth: 1,
						color: colors.border,
					});
				}

				function addText(xPercent, x, y, str, color, size, textBaseline, textAlign) {
					color = color || colors.text;
					size = size || fontSize;
					textBaseline = textBaseline || "top";
					textAlign = textAlign || "center";					

					cvs.text({
						xPercent: xPercent,
						x: x,
						yPercent: y,
						y: -2,
						str: str,
						fontSize: size,
						textBaseline: textBaseline,
						textAlign: textAlign,				
						color: color,
					});
				}

				function addClock(xPercent, x, y, scale, url, clickable, stroke) {
					stroke = stroke || colors.border;

					var circle = cvs.circle({
						xPercent: xPercent,
						x: x,
						yPercent: y,
						radius: 28 * scale,
						fill: "#fff",
						stroke: stroke,
						lineWidth: 2,
						selectable: clickable,
					});
					circle.url = url;
				}
			}
		};
	}
]);