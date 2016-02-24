"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.services");

app.factory("CanvasPercentFixed", ["$window", "CanvasFixed",
	function($window, CanvasFixed) {
		function CanvasPercentFixed(container) {
			this.$container = $(container);

			this.onResize = function() {};
		}

		CanvasPercentFixed.prototype = {
			init: function() {
				var that = this;

				this.cvs = new CanvasFixed(this.$container);
				this.cvs.onResize = function(e) {
					that.width = e.width;
					that.height = e.height;
					that.onResize(e);
				};
				this.cvs.init();
			},

			clear: function() {
				this.cvs.clear();
			},

			flip: function() {
				this.cvs.flip();
			},

			line: function(params) {
				var x0 = Math.floor((params.x0 || 0) + (params.x0Percent ? ((params.x0Percent / 100) * this.width) : 0));
				var y0 = Math.floor((params.y0 || 0) + (params.y0Percent ? ((params.y0Percent / 100) * this.height) : 0));
				var x1 = Math.floor((params.x1 || 0) + (params.x1Percent ? ((params.x1Percent / 100) * this.width) : 0));
				var y1 = Math.floor((params.y1 || 0) + (params.y1Percent ? ((params.y1Percent / 100) * this.height) : 0));

				this.cvs.line(x0, y0, x1, y1, params.color, params.lineWidth, params.dashArray, params.gradient);
			},

			box: function(params) {
				var x0 = Math.floor((params.x0 || 0) + (params.x0Percent ? ((params.x0Percent / 100) * this.width) : 0));
				var y0 = Math.floor((params.y0 || 0) + (params.y0Percent ? ((params.y0Percent / 100) * this.height) : 0));
				var x1 = Math.floor((params.x1 || 0) + (params.x1Percent ? ((params.x1Percent / 100) * this.width) : 0));
				var y1 = Math.floor((params.y1 || 0) + (params.y1Percent ? ((params.y1Percent / 100) * this.height) : 0));

				this.cvs.box(x0, y0, x1, y1, params.color, params.lineWidth);
			},

			boxFill: function(params) {
				var x0 = Math.floor((params.x0 || 0) + (params.x0Percent ? ((params.x0Percent / 100) * this.width) : 0));
				var y0 = Math.floor((params.y0 || 0) + (params.y0Percent ? ((params.y0Percent / 100) * this.height) : 0));
				var x1 = Math.floor((params.x1 || 0) + (params.x1Percent ? ((params.x1Percent / 100) * this.width) : 0));
				var y1 = Math.floor((params.y1 || 0) + (params.y1Percent ? ((params.y1Percent / 100) * this.height) : 0));

				this.cvs.boxFill(x0, y0, x1, y1, params.color);
			},

			boxGradient: function(params) {
				var x0 = Math.floor((params.x0 || 0) + (params.x0Percent ? ((params.x0Percent / 100) * this.width) : 0));
				var y0 = Math.floor((params.y0 || 0) + (params.y0Percent ? ((params.y0Percent / 100) * this.height) : 0));
				var x1 = Math.floor((params.x1 || 0) + (params.x1Percent ? ((params.x1Percent / 100) * this.width) : 0));
				var y1 = Math.floor((params.y1 || 0) + (params.y1Percent ? ((params.y1Percent / 100) * this.height) : 0));

				this.cvs.boxGradient(x0, y0, x1, y1, params.gradient);
			},

			circle: function(params) {
				var x = Math.floor((params.x || 0) + (params.xPercent ? ((params.xPercent / 100) * this.width) : 0));
				var y = Math.floor((params.y || 0) + (params.yPercent ? ((params.yPercent / 100) * this.height) : 0));

				this.cvs.circle(x, y, params.radius, params.color, params.lineWidth);
			},

			circleFill: function(params) {
				var x = Math.floor((params.x || 0) + (params.xPercent ? ((params.xPercent / 100) * this.width) : 0));
				var y = Math.floor((params.y || 0) + (params.yPercent ? ((params.yPercent / 100) * this.height) : 0));

				this.cvs.circleFill(x, y, params.radius, params.color);
			},			

			text: function(params) {
				var x = Math.floor((params.x || 0) + (params.xPercent ? ((params.xPercent / 100) * this.width) : 0));
				var y = Math.floor((params.y || 0) + (params.yPercent ? ((params.yPercent / 100) * this.height) : 0));

				this.cvs.text(x, y, params.str, params.color, params.fontSize, params.textBaseline, 
					params.textAlign, params.fontFamily, params.bold, params.italic);
			},

			image: function(params) {
				var x = Math.floor((params.x || 0) + (params.xPercent ? ((params.xPercent / 100) * this.width) : 0));
				var y = Math.floor((params.y || 0) + (params.yPercent ? ((params.yPercent / 100) * this.height) : 0));

				this.cvs.image(x, y, params.image, params.scale);
			},

			getBoxBoundingBox: function(params) {
				var boundingBox = {
					x0: Math.floor((params.x0 || 0) + (params.x0Percent ? ((params.x0Percent / 100) * this.width) : 0)),
					y0: Math.floor((params.y0 || 0) + (params.y0Percent ? ((params.y0Percent / 100) * this.height) : 0)),
					x1: Math.floor((params.x1 || 0) + (params.x1Percent ? ((params.x1Percent / 100) * this.width) : 0)),
					y1: Math.floor((params.y1 || 0) + (params.y1Percent ? ((params.y1Percent / 100) * this.height) : 0)),
				};

				boundingBox.centerX = (boundingBox.x0 + boundingBox.x1) / 2;
				boundingBox.centerY = (boundingBox.y0 + boundingBox.y1) / 2;

				return boundingBox;
			},

			getCircleBoundingBox: function(params) {
				var x = Math.floor((params.x || 0) + (params.xPercent ? ((params.xPercent / 100) * this.width) : 0));
				var y = Math.floor((params.y || 0) + (params.yPercent ? ((params.yPercent / 100) * this.height) : 0));

				return {
					x0: x - params.radius,
					y0: y - params.radius,
					x1: x + params.radius,
					y1: y + params.radius,
					centerX: x,
					centerY: y,
				};
			},

			getImageBoundingBox: function(params) {
				var x = Math.floor((params.x || 0) + (params.xPercent ? ((params.xPercent / 100) * this.width) : 0));
				var y = Math.floor((params.y || 0) + (params.yPercent ? ((params.yPercent / 100) * this.height) : 0));

				var w = params.image.width * params.scale;
				var h = params.image.height * params.scale;

				return {
					x0: x - w / 2,
					y0: y - h / 2,
					x1: x + w / 2,
					y1: y + h / 2,
					centerX: x,
					centerY: y,
				};
			},

			boundingBoxContainsPoint: function(boundingBox, x, y) {
				return (x >= boundingBox.x0 && x < boundingBox.x1 && y >= boundingBox.y0 && y < boundingBox.y1);
			},

			forceResize: function() {
				this.cvs.handleResize();
			}
		};

		return CanvasPercentFixed;
	}
]);