"use strict";

var angular = require("angular");

function AccessDeniedController($window) {
	this.logout = function() {
		$window.sessionStorage.removeItem("accessToken");
		$window.localStorage.removeItem("refreshToken");
		$window.sessionStorage.removeItem("refreshToken");
		$window.sessionStorage.removeItem("userInfo");
		$window.location.href = "./index.html";
	};
}

AccessDeniedController.$inject = ["$window"];

angular
	.module("cpms.controllers")
	.controller("AccessDeniedController", AccessDeniedController);