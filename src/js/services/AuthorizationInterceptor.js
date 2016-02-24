/* global CPMS_CONFIG:false */

"use strict";

var angular = require("angular");

function AuthorizationInterceptor($injector, $q, $window) {
	var $http;
	var buffer = [];
	var numBufferItems = 0;
	var maxBufferItems = 20;

	function logout() {
		$window.sessionStorage.redirect = $window.location.href;
		$window.sessionStorage.removeItem("accessToken");
		$window.localStorage.removeItem("refreshToken");
		$window.sessionStorage.removeItem("refreshToken");
		$window.sessionStorage.removeItem("userInfo");
		$window.location.href = "./login.html";
	}

	function getAccessToken(refreshToken) {
		$http = $http || $injector.get("$http");

		var request = $http({
			method: "post",
			url: "/User/api/Auth/RefreshAuthenticationInfo",
			bypassAuth: true,
			data: {
				RefreshToken: refreshToken,
			}
		});

		request.success(function(data) {
			$window.sessionStorage.accessToken = data.AccessToken;

			while (buffer.length > 0) {
				retryRequest(buffer.pop());
			}
		}).error(function(data) {
			logout();
		});
	}

	function retryRequest(obj) {
		function successCallback(response) {
			obj.deferred.resolve(response);
		}

		function errorCallback(response) {
			obj.deferred.reject(response);
		}

		$http(obj.config).then(successCallback, errorCallback);
	}

	return {
		request: function(config) {
			if (config.url.indexOf("/api/") > -1 && config.url.indexOf(CPMS_CONFIG.baseServiceUrl) === -1) {
				config.url = CPMS_CONFIG.baseServiceUrl + config.url;
			}

			config.headers = config.headers || {};

			if ($window.sessionStorage.accessToken) {
				config.headers["cpms.access-token"] = $window.sessionStorage.accessToken;
			}

			return config;
		},
		response: function(response) {
			return response || $q.when(response);
		},
		responseError: function(rejection) {
			if (rejection.status === 401 && !rejection.config.bypassAuth) {
				numBufferItems++;
				if (numBufferItems < maxBufferItems && $window.localStorage.refreshToken) {
					var deferred = $q.defer();
					
					buffer.push({ config: rejection.config, deferred: deferred });
					getAccessToken($window.localStorage.refreshToken);

					return deferred.promise;
				} else {
					logout();
				}
			}

			return $q.reject(rejection);
		}
	};
}

AuthorizationInterceptor.$inject = ["$injector", "$q", "$window"];

angular
	.module("cpms.services")
	.factory("AuthorizationInterceptor", AuthorizationInterceptor);