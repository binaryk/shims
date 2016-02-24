"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.services");

app.factory("FullscreenHelper", ["$timeout", function($timeout) {
	function FullscreenHelper(params) {
		this.rootElement = $(params.elem);
		this.buttonSelector = params.button;
	}

	FullscreenHelper.prototype = {
		init: function() {
			var that = this;

			var body = $(document.body);
			var iconFullscreen = $(this.buttonSelector, this.rootElement);

			$timeout(function() {
				iconFullscreen.on("click", function() {
					that.rootElement.toggleClass("fullscreen");
					body.toggleClass("body-fullscreen");
				});
			});
		},
	};

	return FullscreenHelper;
}]);

