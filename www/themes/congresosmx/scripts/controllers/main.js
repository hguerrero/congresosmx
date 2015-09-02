'use strict';

var app = angular.module('webappApp');

app.controller('AppCtrl', function ($scope, $log, $location) {
	$scope.sucursales = function(data) {
		$location.path("/sucursales");
	};
});


app.controller('MainCtrl', function ($scope) {
});

app.controller('SucursalesCtrl', function ($scope) {
});