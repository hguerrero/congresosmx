var app = angular.module('congresosApp', []);

app.config(function($httpProvider) {
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

app.controller('mainCtrl', function($scope, $http, $log)
{
	$scope.post = function() {
		var url = $scope.url;
		var user = $scope.username;
		var pass = $scope.password;

		$http({
		    method: 'POST',
		    url: url,
		    params: { 'username': user, 'password': pass },
		    headers: {
		    	'Content-Type': 'application/x-www-form-urlencoded'
		    	},
		    cache: false,
		    withCredentials: true
		}).then(function (data) {
			$log.log(data);
		},function (data) {
			$log.log(data);
		});
	};
});
