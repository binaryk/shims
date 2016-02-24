"use strict";

var $ = require("jquery");
var _ = require("lodash");
var angular = require("angular");

var app = angular.module("cpms.services");

app.factory("SceneObjectTypes", function() {
	return {
		Line: 0,
		Circle: 1,
		Box: 2,
		Text: 3,
		Image: 4,
	};
});

app.factory("ObjectCanvas", ["$window", "CanvasPercentFixed", "SceneObjectTypes",
	function($window, CanvasPercentFixed, SceneObjectTypes) {
		function ObjectCanvas(container) {
			this.$container = $(container);

			this.scene = [];

			this.hoverObject = null;

			this.onMouseOver = function() {};
			this.onMouseOut = function() {};
			this.onClick = function() {};
			this.onResize = function() {};
		}

		ObjectCanvas.prototype = {
			init: function() {
				var that = this;

				this.cvs = new CanvasPercentFixed(this.$container);
				this.cvs.onResize = function() {
					that.onResize();
					that.computeBoundingBoxes();
					that.draw();
				};
				this.cvs.init();

				this.$container.on("mousemove", function(e) {
					that.handleMouseMove(e);
				});
				this.$container.on("mouseleave", function(e) {
					that.handleContainerMouseLeave(e);
				});
				this.$container.on("click", function(e) {
					that.handleClick(e);
				});
			},

			clear: function() {
				this.scene.length = 0;
				this.draw();
			},

			draw: function() {
				this.cvs.clear();

				for (var i = 0; i < this.scene.length; i++) {
					var obj = this.scene[i];

					switch (obj.type) {
						case SceneObjectTypes.Line:
							this.cvs.line(obj);
							break;
						case SceneObjectTypes.Box:
							this.drawBox(obj);
							break;
						case SceneObjectTypes.Circle:
							this.drawCircle(obj);
							break;
						case SceneObjectTypes.Text:
							this.cvs.text(obj);
							break;
						case SceneObjectTypes.Image:
							this.cvs.image(obj);
							break;
					}
				}

				this.cvs.flip();
			},

			line: function(params) {
				var obj = _.cloneDeep(params);
				obj.type = SceneObjectTypes.Line;
				this.scene.push(obj);
				return obj;
			},

			box: function(params) {
				var obj = _.cloneDeep(params);
				obj.type = SceneObjectTypes.Box;
				this.scene.push(obj);
				return obj;
			},

			circle: function(params) {
				var obj = _.cloneDeep(params);
				obj.type = SceneObjectTypes.Circle;
				this.scene.push(obj);
				return obj;
			},

			text: function(params) {
				var obj = _.cloneDeep(params);
				obj.type = SceneObjectTypes.Text;
				this.scene.push(obj);
				return obj;
			},

			image: function(params) {
				var obj = _.cloneDeep(params);
				obj.type = SceneObjectTypes.Image;
				this.scene.push(obj);
				return obj;
			},

			drawBox: function(obj) {
				if (obj.gradient) {
					this.cvs.boxGradient(obj);
				} else
				if (obj.fill) {
					obj.color = obj.fill;
					this.cvs.boxFill(obj);
				}

				if (obj.stroke) {
					obj.color = obj.stroke;
					this.cvs.box(obj);
				}
			},

			drawCircle: function(obj) {
				if (obj.fill) {
					obj.color = obj.fill;
					this.cvs.circleFill(obj);
				}
				if (obj.stroke) {
					obj.color = obj.stroke;
					this.cvs.circle(obj);
				}
			},

			handleMouseMove: function(e) {
				var mx = e.pageX - this.$container.offset().left;
				var my = e.pageY - this.$container.offset().top;

				var hover = null;

				for (var i = 0; i < this.scene.length; i++) {
					var obj = this.scene[i];

					if (obj.selectable && obj.boundingBox) {
						if (this.cvs.boundingBoxContainsPoint(obj.boundingBox, mx, my)) {
							hover = obj;
						}
					}
				}

				if (this.hoverObject && hover !== this.hoverObject) {
					this.onMouseOut({ target: this.hoverObject });
				}
				if (hover) {
					this.onMouseOver({ target: hover });
					$(document.body).css("cursor", "pointer");
				} else {
					$(document.body).css("cursor", "default");
				}

				this.hoverObject = hover;
			},

			handleContainerMouseLeave: function(e) {
				if (this.hoverObject) {
					this.onMouseOut({ target: this.hoverObject });
				}

				$(document.body).css("cursor", "default");
				this.hoverObject = null;
			},

			handleClick: function(e) {
				if (this.hoverObject) {
					this.onClick({ target: this.hoverObject });
				}
			},

			computeBoundingBoxes: function() {
				for (var i = 0; i < this.scene.length; i++) {
					var obj = this.scene[i];

					if (obj.selectable) {
						if (!obj.customBoundingBox) {
							switch (obj.type) {
								case SceneObjectTypes.Box:
									obj.boundingBox = this.cvs.getBoxBoundingBox(obj);
									break;
								case SceneObjectTypes.Circle:
									obj.boundingBox = this.cvs.getCircleBoundingBox(obj);
									break;
								case SceneObjectTypes.Image:
									obj.boundingBox = this.cvs.getImageBoundingBox(obj);
									break;
							}
						} else {
							obj.boundingBox = this.cvs.getBoxBoundingBox(obj.customBoundingBox);
						}
					}
				}
			},

			forceResize: function() {
				this.cvs.forceResize();
			}
		};

		return ObjectCanvas;
	}
]);