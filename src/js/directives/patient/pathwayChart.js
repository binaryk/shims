/* global CPMS_CONFIG:false */

"use strict";

var $ = require("jquery");
var _ = require("lodash");
var printf = require("printf");
var angular = require("angular");

var app = angular.module("cpms.directives");

app.directive("pathwayChart", ["$compile", "$timeout", "$filter", "$window", "ObjectCanvas", "PopupHelper", "ThemeManager",
	function($compile, $timeout, $filter, $window, ObjectCanvas, PopupHelper, themeManager) {
		return {
			restrict: "E",
			replace: true,
			templateUrl: "partials/patient/pathway-chart.html",

			link: function(scope, elem, attrs) {
				var chartElem = $(".chart", elem);
				var popupElem = $(".popup", elem);
				var popupContent = $(".content", popupElem);

				var cvs;
				var dataReceived;
				var dataProcessed;

				var colors = {
					aboutToBreach: "#F16981",
					onSchedule: "#179C8C",
					pathwayBackground: "#F8F9FD",
					pathwayBorder: "#CAD8E1",
					periodBorder: "#F37D75",
					periodBackground: "#fff",
				};
				var theme = themeManager.getActiveTheme();
				if (theme.id === "navy") {
					colors.pathwayBackground = "#F8F9FD";
					colors.pathwayBorder = "#CAD8E1";
				} else
				if (theme.id === "teal") {
					colors.pathwayBackground = "#F6FDFC";
					colors.pathwayBorder = "#A6CEC9";
				}

				var pauseImg;

				var eventCircleRadius = 7;
				var eventCircleHoverRadius = 9;
				var fontSize = 18;
				var pathwayLineYPercent = 23.75;
				var periodLineYPercent = 76.25;

				init();

				function init() {
					pauseImg = new Image();
					pauseImg.src = "img/pause_chart.png";

					scope.$on("pageLoad", function() {
						cvs = new ObjectCanvas(chartElem);
						initPopup();

						cvs.onResize = function() {
							if (dataReceived) {
								updateChart(dataReceived);
							}
						};

						cvs.init();

						if (dataReceived) {
							updateChart(dataReceived);
						}

						scope.$on("fullscreenChangePong", function() {
							cvs.forceResize();
						});
					});

					scope.$on("updateChart", function(e, data) {
						dataReceived = data;

						if (cvs) {
							updateChart(dataReceived);
						}
					});
				}

				function initPopup() {
					var popupArrow = $(".popup-arrow", popupElem);

					cvs.onMouseOver = function(e) {
						if (!e.target.hover && e.target.eventData) {
							e.target.hover = true;
							e.target.radius = eventCircleHoverRadius;
							cvs.draw();

							popupElem.hide();
							updatePopupContent(e.target);
							resetPopupPosition(e.target);
							popupElem.show();
						}
					};
					cvs.onMouseOut = function(e) {
						if (e.target.hover && e.target.eventData) {
							e.target.hover = false;
							e.target.radius = eventCircleRadius;
							cvs.draw();
								
							popupElem.hide();
						}
					};
					cvs.onClick = function(e) {
						if (e.target.periodData) {
							scope.$emit("chartPeriodClick", { index: e.target.periodData.index });
						}
					};

					function updatePopupContent(obj) {
						var html = "";

						for (var i = 0; i < obj.eventData.events.length; i++) {
							var e = obj.eventData.events[i];

							html +=	printf("<div class='content-row'>");
							html +=	printf(		"<span class='icon icon-date'></span>");

							if (!e.plannedEventAfterPause) {
								html +=	printf(		"<span class='text-date'>%s</span>", $filter("customDate")(e.date));
							}

							html += printf(		"<span class='text-event%s'>%s</span>", e.breach ? " breach" : "", e.name);
							html += printf("</div>");
						}

						popupContent.html(html);
					}

					function resetPopupPosition(obj) {
						var offset = chartElem.offset();

						var minWidth = 400;
						var left = obj.boundingBox.centerX + offset.left;
						if ($($window).width() - left < minWidth) {
							popupArrow.removeClass("left");
							popupElem.css("left", left - popupElem.width() - 13);
						} else {
							popupArrow.addClass("left");
							popupElem.css("left", left - 19);
						}

						if (obj.eventData) {						
							popupElem.css("top", obj.boundingBox.centerY + offset.top + 23);
						} else {
							popupElem.css("top", obj.boundingBox.centerY + offset.top + 70);
						}
					}
				}

				function updateChart(data) {
					var periodChartData = getPeriodChartData(data);
					var pathwayChartData = getPathwayChartData(data.periods);

					cvs.clear();

					addPathway(pathwayChartData);
					addPeriodEvents(periodChartData);
					addExtraInfo(pathwayChartData, periodChartData);

					cvs.computeBoundingBoxes();
					cvs.draw();
				}

				function getPeriodChartData(data) {
					var chartData = {
						startDate: data.startDate,
						events: _.cloneDeep(data.events),
						totalWidth: chartElem.width()
					};

					chartData.events.sort(function(a, b) {
						return a.date - b.date;
					});

					if (data.endDate) {
						chartData.endDate = data.endDate;
						chartData.showEndDate = true;
					} else {
						chartData.endDate = _.last(chartData.events).date;
					}

					chartData.totalDays = daysBetweenDates(chartData.startDate, chartData.endDate);

					for (var i = 0; i < chartData.events.length; i++) {
						var e = chartData.events[i];
						if (chartData.totalDays !== 0) {
							e.pos = Math.floor(daysBetweenDates(chartData.startDate, e.date) * 100 / chartData.totalDays);
						} else {
							e.pos = 0;
						}
						e.pixelPos = Math.floor(chartData.totalWidth * e.pos / 100);
					}

					combineOverlappingEvents(chartData);

					return chartData;
				}

				function combineOverlappingEvents(chartData) {
					if (chartData.length <= 2) {
						return;
					}

					var combinedEvents = [];

					var baseEvent = chartData.events[0];
					var combinedEvent = {						
						pos: baseEvent.pos,
						breach: baseEvent.breach,
						planned: baseEvent.planned,
						events: [baseEvent]
					};
					combinedEvents.push(combinedEvent);

					var i = 1;
					while (i < chartData.events.length) {
						var compareEvent = chartData.events[i];

						if (!compareEvent.combined) {
							if (eventsOverlap(baseEvent, compareEvent)) {
								compareEvent.combined = true;
								combinedEvent.events.push(compareEvent);

								if (compareEvent.breach) {
									combinedEvent.breach = true;
								}
							} else {
								baseEvent = compareEvent;
								combinedEvent = {
									pos: baseEvent.pos,
									breach: baseEvent.breach,
									planned: baseEvent.planned,
									events: [baseEvent]
								};
								combinedEvents.push(combinedEvent);
							}
						}

						i++;
					}

					chartData.combinedEvents = combinedEvents;
				}

				function eventsOverlap(e1, e2) {
					return (Math.abs(e1.pixelPos - e2.pixelPos) < eventCircleRadius * 2);
				}

				function daysBetweenDates(date1, date2) {
					var oneDay = 24 * 60 * 60 * 1000;
					return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
				}

				function addPathway(data) {
					cvs.box({
						x0: 1,
						y0: 1,
						x0Percent: 0,
						y0Percent: 0,
						x1: -1,
						y1: -1,
						x1Percent: 100,
						y1Percent: 47.5,
						fill: colors.pathwayBackground,
						stroke: colors.pathwayBorder,
						lineWidth: 1,
					});

					addCurrentPeriodIndicator(data);

					for (var i = 0; i < data.periods.length; i++) {
						var period = data.periods[i];

						var box = cvs.box({
							x0Percent: 2 + period.startPos * 0.96,
							y0: -2,
							y0Percent: pathwayLineYPercent,
							x1Percent: 2 + period.endPos * 0.96,
							y1Percent: pathwayLineYPercent,
							y1: 2,
							fill: colors.onSchedule,
							lineWidth: 2,
							selectable: true,
						});
						box.periodData = period.periodData;
						box.customBoundingBox = {
							x0Percent: period.boxCoords.xStart,
							x1Percent: period.boxCoords.xEnd,
							y0Percent: period.boxCoords.yStart,
							y1Percent: period.boxCoords.yEnd,
						};

						addPathwayPeriodMilestones(period, data);

						if (box.periodData.IsBreached) {
							box.fill = colors.aboutToBreach;
						}
					}			
				}

				function addPathwayPeriodMilestones(period, data) {
					var color = period === data.selectedPeriod ? colors.periodBorder : colors.onSchedule;

					cvs.text({
						xPercent: period.boxCoords.xCenter,
						y: 5,
						color: color,
						str: period.periodData.name,
						textAlign: "center",
						fontSize: 22,
					});

					var startDate = period.periodData.startDate;					
					var expectedBreachDate = new Date(period.periodData.ExpectedBreachDate);
					var now = CPMS_CONFIG.currentDate || new Date();
					var currentDate = (period.periodData.StopDate === null) ? now : new Date(period.periodData.StopDate);

					var maxDate = (expectedBreachDate > currentDate) ? expectedBreachDate : currentDate;
					var minDate = (expectedBreachDate < currentDate) ? expectedBreachDate : currentDate;
					var totalDays = daysBetweenDates(startDate, maxDate);

					addMilestone(minDate);

					function addMilestone(date) {
						var pos = daysBetweenDates(startDate, date) / totalDays;
						pos = period.startPos + (period.endPos - period.startPos) * pos;

						var circle = cvs.circle({
							xPercent: 2 + pos * 0.96,
							yPercent: pathwayLineYPercent,
							radius: eventCircleRadius,
							fill: period.periodData.IsBreached ? colors.aboutToBreach : colors.onSchedule,
						});
					}

					var txtStartDate = $filter("customDate")(period.periodData.startDate);
					var txtEndDate = "present";
					if (period.periodData.StopDate !== null) {
						txtEndDate = $filter("customDate")(period.periodData.endDate);
					}
					var str = printf("%s – %s", txtStartDate, txtEndDate);

					cvs.text({
						xPercent: period.boxCoords.xCenter,
						yPercent: period.boxCoords.yEnd,
						y: -35,
						str: str,
						color: color,
						textAlign: "center",
						fontSize: fontSize,
					});

					var txtExpectedBreachDate = $filter("customDate")(expectedBreachDate);
					cvs.text({
						xPercent: 2 + period.endPos * 0.96,
						y: 5,
						color: color,
						str: txtExpectedBreachDate,
						textAlign: "right",
						fontSize: fontSize,
					});

					// present / clock stop legend
					cvs.circle({
						x: 100,
						xPercent: period.boxCoords.xCenter,
						yPercent: period.boxCoords.yEnd,
						y: -22,
						radius: eventCircleRadius,
						fill: colors.onSchedule,
					});

					// 18w RTT end legend
					cvs.circle({
						x: -90,
						xPercent: 2 + period.endPos * 0.96,
						y: 19,
						radius: eventCircleRadius,
						fill: colors.aboutToBreach,
					});

					var endCircleColor = period.periodData.IsBreached ? colors.onSchedule : colors.aboutToBreach;
					cvs.circle({
						xPercent: 2 + period.endPos * 0.96,
						yPercent: pathwayLineYPercent,
						radius: eventCircleRadius,
						fill: endCircleColor,
					});
				}

				function addCurrentPeriodIndicator(data) {
					var period = data.selectedPeriod;

					cvs.box({
						x0: 1,
						y0: 1,						
						x0Percent: period.boxCoords.xStart,
						y0Percent: 0,
						x1: -1,
						y1: -1,
						x1Percent: period.boxCoords.xEnd,
						y1Percent: 47.5,
						fill: colors.periodBackground,
						stroke: colors.periodBorder,
						lineWidth: 1,
					});

					cvs.box({
						x0: -15,						
						x0Percent: period.boxCoords.xCenter,
						x1: 15,
						x1Percent: period.boxCoords.xCenter,
						y0: -3,
						y0Percent: period.boxCoords.yEnd,
						y1Percent: period.boxCoords.yEnd,
						y1: 2,
						fill: colors.periodBackground,
					});

					cvs.line({
						x0: -15,
						x0Percent: period.boxCoords.xCenter,
						x1Percent: period.boxCoords.xCenter,
						y0Percent: period.boxCoords.yEnd,
						y0: -1,
						y1Percent: 52.5,
						lineWidth: 1,
						color: colors.periodBorder,
					});
					cvs.line({
						x0: 15,
						x0Percent: period.boxCoords.xCenter,
						x1Percent: period.boxCoords.xCenter,
						y0Percent: period.boxCoords.yEnd,
						y0: -1,
						y1Percent: 52.5,
						lineWidth: 1,
						color: colors.periodBorder,
					});
				}

				function getPeriodBoxCoords(period) {
					var xStart = 0;
					if (period.startPos > 0) {
						xStart = 2 + period.startPos * 0.96;
					}
					var xEnd = 100;
					if (period.endPos < 100) {
						xEnd = 2 + period.endPos * 0.96;
					}

					return {
						xStart: xStart,
						xEnd: xEnd,
						xCenter: (xStart + xEnd) / 2,
						yStart: 0,
						yEnd: 47.5,						
					};
				}

				function getPathwayChartData(periods) {
					var i, period;

					var data = {
						periods: [],
					};

					for (i = 0; i < periods.length; i++) {
						period = periods[i];
						period.days = daysBetweenDates(period.startDate, period.endDate);
						if (period.days === 0) {
							period.days = 1;
						}
					}

					var days = 0;
					for (i = 0; i < periods.length; i++) {
						period = periods[i];

						var newPeriod = {
							startPos: Math.floor(i * 100 / periods.length),
							endPos: Math.floor((i + 1) * 100 / periods.length),
							periodData: period,
						};
						newPeriod.boxCoords = getPeriodBoxCoords(newPeriod);
						data.periods.push(newPeriod);

						if (period.selected) {
							data.selectedPeriod = newPeriod;
						}

						days += period.days;
					}

					var padding = 1;
					for (i = 0; i < data.periods.length; i++) {
						period = data.periods[i];

						if (i > 0) {
							period.startPos += padding / 2;
						}

						if (i < data.periods.length - 1) {
							period.endPos -= padding / 2;
						}
					}

					return data;
				}

				function addPeriodEvents(data) {
					var i, e, prev, lineOptions;

					for (i = 1; i < data.combinedEvents.length; i++) {
						e = data.combinedEvents[i];
						prev = data.combinedEvents[i - 1];

						if (e.breach && !e.planned) {
							cvs.box({
								x0Percent: 2 + prev.pos * 0.96,
								y0: -2,
								y0Percent: periodLineYPercent,
								x1Percent: 2 + e.pos * 0.96,
								y1: 2,
								y1Percent: periodLineYPercent,
								fill: colors.aboutToBreach
							});
						} else {
							lineOptions = {
								x0Percent: 2 + prev.pos * 0.96,
								y0Percent: periodLineYPercent,
								x1Percent: 2 + e.pos * 0.96,
								y1Percent: periodLineYPercent,
								lineWidth: 4,
								color: colors.onSchedule,
							};

							if (e.planned) {
								lineOptions.dashArray = [20];
								lineOptions.lineWidth = 4;
							} else {
								lineOptions.dashArray = undefined;
								lineOptions.lineWidth = 4;
							}

							if (e.breach) {
								lineOptions.color = colors.aboutToBreach;
							}

							cvs.line(lineOptions);
						}
					}

					for (i = 0; i < data.combinedEvents.length; i++) {
						e = data.combinedEvents[i];

						var circle = cvs.circle({
							xPercent: 2 + e.pos * 0.96,
							yPercent: periodLineYPercent,
							radius: eventCircleRadius,
							fill: e.breach ? colors.aboutToBreach : colors.onSchedule,
							selectable: true,
						});
						circle.eventData = e;

						if (hasPausedEvents(e)) {
							cvs.image({
								xPercent: 2 + e.pos * 0.96,
								yPercent: periodLineYPercent,
								y: -20,
								image: pauseImg
							});
						}
					}
				}

				function hasPausedEvents(combinedEvent) {
					return _.find(combinedEvent.events, { paused: true }) !== undefined;
				}

				function addExtraInfo(pathwayData, periodData) {
					cvs.text({
						xPercent: 2,
						x: -11,
						yPercent: periodLineYPercent,
						y: -50,
						color: colors.periodBorder,
						str: pathwayData.selectedPeriod.periodData.name,
						fontSize: 22,
					});

					cvs.text({
						xPercent: 2,
						x: -10,
						yPercent: periodLineYPercent,
						y: 10,
						str: $filter("customDate")(periodData.startDate),
						color: colors.onSchedule,
						fontSize: fontSize,
					});

					if (periodData.showEndDate) {
						var isBreached = pathwayData.selectedPeriod.periodData.IsBreached;

						cvs.text({
							xPercent: 98,
							x: 10,
							yPercent: periodLineYPercent,
							y: 10,
							str: $filter("customDate")(periodData.endDate),
							fontSize: fontSize,
							color: isBreached ? colors.aboutToBreach : colors.onSchedule,
							textAlign: "right",
						});						
					}
				}
			}
		};
	}
]);

app.animation(".pathway-chart-body", slideAnimation);

function slideAnimation() {
	return {
		beforeAddClass: function(element, className, done) {
			$(element).slideUp("fast", done);

			return function(isCancelled) {
				if (isCancelled) {
					$(element).stop();
				}
			};
		},
		removeClass: function(element, className, done) {
			$(element).slideDown("fast", done);

			return function(isCancelled) {
				if (isCancelled) {
					$(element).stop();
				}
			};
		}
	};
}