"use strict";

var $ = require("jquery");
var angular = require("angular");

var app = angular.module("cpms.services");

app.factory("CanvasFixed", ["$window",
	function($window) {
		function CanvasFixed(container) {
			this.$container = $(container);

			this.onResize = function() {};
		}

		CanvasFixed.prototype = {
			init: function() {
				var that = this;

				var width = this.$container.width();
				var height = this.$container.height();

				var screenCanvas = document.createElement("canvas");
				screenCanvas.width = width;
				screenCanvas.height = height;
				this.screenCanvas = screenCanvas;

				this.$container.append(this.screenCanvas).hide().fadeIn("fast");

				var screenCtx = screenCanvas.getContext("2d");
				screenCtx.globalCompositeOperation = "source-over";
				screenCtx.save();
				this.screenCtx = screenCtx;

				var bufferCanvas = document.createElement("canvas");
				bufferCanvas.width = width;
				bufferCanvas.height = height;
				this.bufferCanvas = bufferCanvas;

				var bufferCtx = bufferCanvas.getContext("2d");
				bufferCtx.globalCompositeOperation = "source-over";
				bufferCtx.save();
				this.bufferCtx = bufferCtx;

				$($window).on("resize", function() { that.handleResize(); });
				this.handleResize();
			},

			clear: function() {
				this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
			},

			flip: function() {
				this.screenCtx.clearRect(0, 0, this.screenCanvas.width, this.screenCanvas.height);
				this.screenCtx.drawImage(this.bufferCanvas, 0, 0);
			},

			line: function(x0, y0, x1, y1, color, lineWidth, dashArray, gradient) {
				color = (color !== undefined) ? color : "#000";
				lineWidth = lineWidth || 3;

				this.bufferCtx.save();

				this.bufferCtx.lineWidth = lineWidth;

				if (dashArray) {
					this.bufferCtx.setLineDash(dashArray);
				}

				if (gradient) {
					var grad;
					if (gradient.vertical) {
						grad = this.bufferCtx.createLinearGradient(x0, y0, x0, y1);
					} else {
						grad = this.bufferCtx.createLinearGradient(x0, y0, x1, y0);
					}

					grad.addColorStop(0, gradient.start);
					grad.addColorStop(1, gradient.stop);

					this.bufferCtx.strokeStyle = grad;
				} else {
					this.bufferCtx.strokeStyle = color;
				}

				this.bufferCtx.beginPath();
				this.bufferCtx.moveTo(x0, y0);
				this.bufferCtx.lineTo(x1, y1);
				this.bufferCtx.closePath();
				this.bufferCtx.stroke();

				this.bufferCtx.restore();
			},

			box: function(x0, y0, x1, y1, color, lineWidth) {
				color = (color !== undefined) ? color : "#000";
				lineWidth = lineWidth || 3;

				var _x0 = Math.min(x0, x1);
				var _y0 = Math.min(y0, y1);
				var _x1 = Math.max(x0, x1);
				var _y1 = Math.max(y0, y1);
				var w = _x1 - _x0;
				var h = _y1 - _y0;

				this.bufferCtx.save();

				this.bufferCtx.strokeStyle = color;
				this.bufferCtx.lineWidth = lineWidth;
				this.bufferCtx.strokeRect(_x0, _y0, w, h);

				this.bufferCtx.restore();
			},

			boxFill: function(x0, y0, x1, y1, color) {
				color = (color !== undefined) ? color : "#000";

				var _x0 = Math.min(x0, x1);
				var _y0 = Math.min(y0, y1);
				var _x1 = Math.max(x0, x1);
				var _y1 = Math.max(y0, y1);
				var w = _x1 - _x0;
				var h = _y1 - _y0;

				this.bufferCtx.save();

				this.bufferCtx.fillStyle = color;
				this.bufferCtx.fillRect(_x0, _y0, w, h);

				this.bufferCtx.restore();
			},

			boxGradient: function(x0, y0, x1, y1, gradient) {
				var _x0 = Math.min(x0, x1);
				var _y0 = Math.min(y0, y1);
				var _x1 = Math.max(x0, x1);
				var _y1 = Math.max(y0, y1);
				var w = _x1 - _x0;
				var h = _y1 - _y0;

				this.bufferCtx.save();

				var grad;
				if (gradient.vertical) {
					grad = this.bufferCtx.createLinearGradient(_x0, _y0, _x0, _y1);
				} else {
					grad = this.bufferCtx.createLinearGradient(_x0, _y0, _x1, _y0);
				}

				grad.addColorStop(0, gradient.start);
				grad.addColorStop(1, gradient.stop);
				this.bufferCtx.fillStyle = grad;

				this.bufferCtx.fillRect(_x0, _y0, w, h);

				this.bufferCtx.restore();
			},

			circle: function(x, y, radius, color, lineWidth) {
				color = (color !== undefined) ? color : "#000";
				lineWidth = lineWidth || 3;

				this.bufferCtx.save();

				this.bufferCtx.beginPath();
				this.bufferCtx.arc(x, y, radius, 0, 2 * Math.PI);
				this.bufferCtx.strokeStyle = color;
				this.bufferCtx.lineWidth = lineWidth;
				this.bufferCtx.stroke();

				this.bufferCtx.restore();
			},

			circleFill: function(x, y, radius, color) {
				color = (color !== undefined) ? color : "#000";

				this.bufferCtx.save();

				this.bufferCtx.beginPath();
				this.bufferCtx.arc(x, y, radius, 0, 2 * Math.PI);
				this.bufferCtx.fillStyle = color;
				this.bufferCtx.fill();

				this.bufferCtx.restore();
			},

			text: function(x, y, str, color, fontSize, textBaseline, textAlign, fontFamily, bold, italic) {
				color = (color !== undefined) ? color : "#000";
				fontSize = (fontSize !== undefined) ? fontSize : 16;
				textBaseline = textBaseline || "top";
				textAlign = textAlign || "left";
				fontFamily = fontFamily || "app_regular, Arial, Helvetica, sans-serif";

				this.bufferCtx.save();

				this.bufferCtx.textBaseline = textBaseline;
				this.bufferCtx.textAlign = textAlign;

				var font = fontSize + "px " + fontFamily;
				if (bold) {
					font = "bold " + font;
				}
				if (italic) {
					font = "italic " + font;
				}

				this.bufferCtx.font = font;
				this.bufferCtx.fillStyle = color;
				this.bufferCtx.fillText(str, x, y);

				this.bufferCtx.restore();
			},

			image: function(x, y, img, scale) {
				scale = scale || 1;

				this.bufferCtx.save();

				var w = img.width * scale;
				var h = img.height * scale;

				this.bufferCtx.drawImage(img, x - w / 2, y - h / 2, w, h);

				this.bufferCtx.restore();
			},

			getTextWidth: function(str, fontSize, fontFamily) {
				fontSize = (fontSize !== undefined) ? fontSize : 16;
				fontFamily = fontFamily || "Arial, Helvetica, sans-serif";

				this.bufferCtx.save();

				this.bufferCtx.font = fontSize + "px '" + fontFamily + "'";
				var width = this.bufferCtx.measureText(str).width;

				this.bufferCtx.restore();

				return width;
			},

			handleResize: function() {
				var that = this;

				if (!this.$container.is(":visible")) {
					var id = setInterval(function() {
						if (that.$container.is(":visible")) {
							resize();
							clearInterval(id);
						}
					}, 20);
				} else {
					resize();
				}

				function resize() {
					if (that.oldWidth === undefined) {
						that.oldWidth = 0;
						that.oldHeight = 0;
					}

					var width = that.$container.width();
					var height = that.$container.height();

					if (width !== that.oldWidth || height !== that.oldHeight) {
						that.oldWidth = width;
						that.oldHeight = height;

						that.screenCanvas.width = width;
						that.screenCanvas.height = height;
						that.bufferCanvas.width = width;
						that.bufferCanvas.height = height;

						that.onResize({
							width: width,
							height: height
						});
					}
				}
			},
		};

		return CanvasFixed;
	}
]);