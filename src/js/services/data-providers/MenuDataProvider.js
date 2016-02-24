"use strict";

var angular = require("angular");

angular
	.module("cpms.services")
	.service("MenuDataProvider", MenuDataProvider);

function MenuDataProvider($window, $timeout, TrustData, ajax, breachesCountDataProvider) {
	var that = this;

	initRoot();
	initTree();

	function initRoot() {
		that.root = {
			children: [
				{
					name: "Categories",
					code: "categories",
					expanded: true,
					accordion: true,
					children: [
						{
							name: "Breaches",
							code: "breaches",
							accordion: true,
							children: [
								{
									name: "18 week/cancer periods",									
									code: "periodBreaches",
									url: "period-breaches.html",
									expanded: true,
									active: true,
									children: [
										{ name: "4 weeks to breach", code: "4", url: "period-breaches.html?tab=4" },
										{ name: "3 weeks to breach", code: "3", url: "period-breaches.html?tab=3" },
										{ name: "2 weeks to breach", code: "2", url: "period-breaches.html?tab=2" },
										{ name: "1 week to breach", code: "1", url: "period-breaches.html?tab=1" },
										{ name: "Postbreach", code: "-1", url: "period-breaches.html?tab=-1" },
									]
								},
								{
									name: "Event milestones",
									code: "eventBreaches",
									url: "event-breaches.html",
									expanded: true,
									active: true,
									children: [
										{ name: "Up to 3 weeks to breach", code: "4", url: "event-breaches.html?tab=4" },
										{ name: "3 days to breach", code: "3", url: "event-breaches.html?tab=3" },
										{ name: "2 days to breach", code: "2", url: "event-breaches.html?tab=2" },
										{ name: "1 day to breach", code: "1", url: "event-breaches.html?tab=1" },
										{ name: "Breach today", code: "0", url: "event-breaches.html?tab=0" },
										{ name: "Postbreach", code: "-1", url: "event-breaches.html?tab=-1" },
									]
								}
							]
						},
						{
							name: "Reports",
							code: "reports",
							accordion: true,
							children: [
								{
									name: "Monthly 18w RTT performance",
									code: "periodBreaches",
									url: "reports.html?type=periodBreaches",
								},
								{
									name: "About to breach 18w RTT periods",
									code: "futurePeriodBreaches",
									url: "reports.html?type=futurePeriodBreaches",
								},
								{
									name: "Active periods distribution over 18w",
									code: "activePeriods",
									url: "reports.html?type=activePeriods",
								},
							]
						},
						{
							name: "Patients",
							code: "patients",
							accordion: true,
							children: [
								{
									name: "18 week periods",
									code: "patients",
									url: "patients.html",
									children: []
								},
								{
									name: "Non 18 week periods",
									code: "non18w",
									url: "patients.html?non18w=1",
									children: []
								},
								{
									name: "Cancer periods",
									code: "cancer",
									url: "patients.html?cancer=1",
									children: []
								},
							]
						},
						// {
						// 	name: "Events",
						// 	code: "events",
						// 	accordion: true,
						// 	children: []
						// },
						{
							name: "Links to online resources",
							accordion: true,
							children: [
								{
									name: "Minoxsys",
									url: "http://www.minoxsys.com/",
								},
								{
									name: "Evozon Systems",
									url: "http://www.evozon.com",
								},
							]
						},
					],
				},
				{
					name: "Trust",
					code: "trusts",
					accordion: true,
				},
			],
		};

		addParentNodes(that.root);
		addUrlOnClickHandlers(that.root.children);

		that.clearExpanded = clearExpanded;
		that.setExpanded = setExpanded;
	}

	function initTree() {
		that.tree = {};
		objectify(that.tree, that.root.children);
		
		// getEventCodes(that.tree);
		TrustData.decorateTrust(that.tree.trusts._item);

		decorateBreachesMenuItems(that.tree);
	}

	function addParentNodes(item) {
		if (!item.children) {
			return;
		}

		for (var i = 0; i < item.children.length; i++) {
			var child = item.children[i];
			child.parentItem = item;
			addParentNodes(child);
		}
	}

	function objectify(obj, list) {
		if (!list) {
			return;
		}

		for (var i = 0; i < list.length; i++) {
			var item = list[i];

			if (item.code !== undefined) {
				obj[item.code] = { 
					_item: item,
				};
				objectify(obj[item.code], item.children);
			}
		}
	}

	function addUrlOnClickHandlers(list) {
		if (!list) {
			return;
		}

		for (var i = 0; i < list.length; i++) {
			var item = list[i];
			addUrlOnClickHandler(item);
			addUrlOnClickHandlers(item.children);
		}
	}

	function addUrlOnClickHandler(item) {
		if (item.onClick) {
			return;
		}

		if (item.url) {
			item.onClick = function() {
				if (!item.active) {
					$window.location.href = item.url;
				}
			};
			return;
		}
	}

	function clearExpanded(item) {
		if (!item.children) {
			return;
		}

		for (var i = 0; i < item.children.length; i++) {
			var child = item.children[i];
			child.expanded = false;
			clearExpanded(child);
		}
	}

	function setExpanded(item) {
		item.expanded = true;

		if (item.parentItem) {
			setExpanded(item.parentItem);
		}
	}

	function getEventCodes(tree) {
		ajax("/Patient/api/EventCodes").then(function(promise) {
			$timeout(function() {
				tree.categories.events._item.children = promise.data.map(function(item) {
					return { name: item.Description };
				});
			});
		});
	}

	function decorateBreachesMenuItems(tree) {
		var top = tree.categories.breaches;

		breachesCountDataProvider.getData(function(data) {
			$timeout(function() {
				addNumber(top.periodBreaches._item, data.periodBreaches.total);
				addNumber(top.periodBreaches["4"]._item, data.periodBreaches.four);
				addNumber(top.periodBreaches["3"]._item, data.periodBreaches.three);
				addNumber(top.periodBreaches["2"]._item, data.periodBreaches.two);
				addNumber(top.periodBreaches["1"]._item, data.periodBreaches.one);
				addNumber(top.periodBreaches["-1"]._item, data.periodBreaches.postbreach);

				addNumber(top.eventBreaches._item, data.eventBreaches.total);
				addNumber(top.eventBreaches["4"]._item, data.eventBreaches.about);
				addNumber(top.eventBreaches["3"]._item, data.eventBreaches.three);
				addNumber(top.eventBreaches["2"]._item, data.eventBreaches.two);
				addNumber(top.eventBreaches["1"]._item, data.eventBreaches.one);
				addNumber(top.eventBreaches["0"]._item, data.eventBreaches.breach);
				addNumber(top.eventBreaches["-1"]._item, data.eventBreaches.postbreach);
			});
		});

		function addNumber(item, value) {
			if (value > 0) {
				item.name += " (" + value + ")";
			}
		}
	}
}

MenuDataProvider.$inject = ["$window", "$timeout", "TrustData", "AjaxHelper", "BreachesCountDataProvider"];