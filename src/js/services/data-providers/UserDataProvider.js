"use strict";

var printf = require("printf");
var angular = require("angular");

function UserDataProvider($timeout, $window, $http) {
	this.$timeout = $timeout;
	this.$window = $window;
	this.$http = $http;
}

UserDataProvider.$inject = ["$timeout", "$window", "$http"];

UserDataProvider.prototype = {
	getData: function(callback) {
		if (this.$window.sessionStorage.userInfo) {
			this.user = JSON.parse(this.$window.sessionStorage.userInfo);
			callback(this.user);
		} else {
			this.getDataFromServer(callback);
		}
	},

	getDataFromServer: function(callback) {
		var that = this;
		var refreshToken = this.$window.sessionStorage.refreshToken || this.$window.localStorage.refreshToken;

		this.$http({
			method: "post",
			url: "/User/api/Auth/GetUserInfo",
			bypassAuth: true,
			data: {
				RefreshToken: refreshToken
			}
		}).then(function(promise) {
			if (promise) {
				var result = {
					email: promise.data.Email,
					username: promise.data.Username,
					fullName: promise.data.FullName,
					role: {
						name: promise.data.Role.Name,
					}
				};

				result.role.permissions = {};
				for (var i = 0; i < promise.data.Role.Permissions.length; i++) {
					result.role.permissions[promise.data.Role.Permissions[i]] = true;
				}

				that.$window.sessionStorage.userInfo = JSON.stringify(result);
				that.user = result;
				callback(result);
			}
		});
	},
};

angular
	.module("cpms.services")
	.service("UserDataProvider", UserDataProvider);