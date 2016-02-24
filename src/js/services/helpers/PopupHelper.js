"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.services");

app.factory("PopupHelper", ["$timeout", function($timeout) {
	function PopupHelper(params) {
		this.offsetTop = params.top;
		this.offsetLeft = params.left;
		this.rootElement = params.elem;		
		this.popupSelector = params.popup || ".popup";
		this.popupButtonSelector = params.popupButton;
		this.popupAnchor = params.anchor || params.popupButton;
	}

	PopupHelper.prototype = {
		init: function() {
			var that = this;

			this.popup = $(this.popupSelector, this.rootElement);
			this.btnPopup = $(this.popupButtonSelector, this.rootElement);
			this.popupAnchor = $(this.popupAnchor, this.rootElement);

			$timeout(function() {
				$(document).on("mouseup", function(e) {
					if (!that.popup.is(e.target) &&
						that.popup.has(e.target).length === 0) {
						that.popup.fadeOut("fast");
					}
				});

				that.btnPopup.on("click", function() {
					var popupVisible = that.popup.is(":visible");
					if (!popupVisible) {
						$(".popup").fadeOut("fast");
						that.onResize();
						that.popup.fadeIn("fast");
					} else {
						that.popup.fadeOut("fast");
					}
				});
				$(window).on("resize", function() { that.onResize(); });
			});
		},

		onResize: function() {
			var offset = this.popupAnchor.offset();
			$(this.popup).css("top", (offset.top + this.offsetTop) + "px");
			$(this.popup).css("left", (offset.left + this.offsetLeft) + "px");
		},
	};

	return PopupHelper;
}]);