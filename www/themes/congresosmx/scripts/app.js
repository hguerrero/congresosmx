'use strict';

var app = angular.module('webappApp', [
                                       'ngCookies',
                                       'ngResource',
                                       'ngSanitize',
                                       'ngRoute',
                                       'ngGrid',
                                       'ui.bootstrap',
                                       'angularFileUpload'
                                       ]);

app.config(function ($routeProvider, $logProvider) {
	$logProvider.debugEnabled(true);
	$routeProvider
	.when('/main', {
		templateUrl: 'views/main.html',
		controller: 'MainCtrl'
	})
	.when('/sucursales', {
		templateUrl: 'views/sucursales.html',
		controller: 'SucursalesCtrl'
	})
	.otherwise({
		redirectTo: '/'
	});
});
