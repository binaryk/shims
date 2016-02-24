"use strict";

var angular = require("angular");

var app = angular.module("cpms.services");	

var DebugHelper = {
	printQueryString: function(baseUrl, params) {
		if (!window.debugLog) {
			window.debugLog = [];
		}
		if (window.debugLog.length > 10) {
			window.debugLog.shift();
		}

		var str = baseUrl + "?";
		var keys = Object.keys(params);
		for (var i = 0; i < keys.length; i++) {
			str += keys[i] + "=" + params[keys[i]];

			if (i < keys.length - 1) {
				str += "&";
			}
		}

		// console.log(str);
		window.debugLog.push(str);
	}
};

app.factory("DebugHelper", function() {
	return DebugHelper;
});
