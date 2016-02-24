"use strict";

var angular = require("angular");

function LoginController($scope, $timeout, $http, $window) {
	this.$scope = $scope;
	this.$timeout = $timeout;
	this.$http = $http;
	this.$window = $window;

	this.username = "";
	this.password = "";
	this.rememberMe = true;
	this.message = "";

	this.init();
}

LoginController.$inject = ["$scope", "$timeout", "$http", "$window"];

LoginController.prototype = {
	init: function() {
		if (this.$window.sessionStorage.accessToken) {
			this.redirect();
		}
	},

	login: function() {
		var that = this;

		var request = this.$http({
			method: "post",
			url: "/User/api/Auth/GetAuthenticationInfo",
			bypassAuth: true,
			data: {
				username: this.username,
				password: this.password
			}
		});

		request.success(function(data) {
			that.$window.sessionStorage.accessToken = data.AccessToken;

			if (that.rememberMe) {
				that.$window.localStorage.refreshToken = data.RefreshToken;
			} else {
				that.$window.sessionStorage.refreshToken = data.RefreshToken;
				that.$window.localStorage.removeItem("refreshToken");
			}

			that.redirect();
		}).error(function(data) {
			that.message = data.Message;
		});
	},

	redirect: function() {
		if (this.$window.sessionStorage.redirect) {
			this.$window.location.href = this.$window.sessionStorage.redirect;
		} else {
			this.$window.location.href = "./index.html";
		}
	},
};

angular
	.module("cpms.controllers")
	.controller("LoginController", LoginController);