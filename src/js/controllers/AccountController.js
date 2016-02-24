"use strict";

var angular = require("angular");

function AccountController($scope, $http, $window) {
	var that = this;

	this.oldPassword = "";
	this.newPassword = "";
	this.repeatNewPassword = "";
	this.changePasswordMessage = "";
	this.isChangePasswordMessageBad = false;

	$scope.$on("userDataReceived", function(e, data) {
		that.user = data;

		that.changePassword = function() {
			if (that.newPassword !== that.repeatNewPassword) {
				that.changePasswordMessage = "New passwords don't match.";
				that.isChangePasswordMessageBad = true;
			} else {
				sendChangePasswordRequest();
			}
		};
	});

	function sendChangePasswordRequest() {
		$http({
			method: "post",
			url: "/User/api/Auth/ChangePassword",
			bypassAuth: true,
			data: {
				Username: that.user.username,
				OldPassword: that.oldPassword,
				NewPassword: that.newPassword,
			}
		}).success(function(data) {
			that.oldPassword = "";
			that.newPassword = "";
			that.repeatNewPassword = "";
			that.changePasswordMessage = "Password changed successfully.";
			that.isChangePasswordMessageBad = false;
		}).error(function(data) {
			that.changePasswordMessage = data.Message;
			that.isChangePasswordMessageBad = true;
		});
	}
}

AccountController.$inject = ["$scope", "$http", "$window"];

angular
	.module("cpms.controllers")
	.controller("AccountController", AccountController);