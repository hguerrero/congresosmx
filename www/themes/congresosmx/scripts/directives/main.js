var app = angular.module('webappApp');

app.directive('integer', function () {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, elem, attrs, controller) {
			controller.$parsers.push(function (viewValue) {
				return viewValue ? 1 : 0;
			});
		}
	};
});

app.directive('activeLink', ['$location', function(location) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var activeClass = attrs.activeLink;
			var path = attrs.href.substring(1);
			scope.location = location;
			scope.$watch('location.path()', function (newPath) {
				if (path === newPath) {
					setTimeout( function (){
						element.addClass(activeClass);
					});
				} else {
					element.removeClass(activeClass);

					setTimeout( function () {
						scope.$apply( function () {
							scope.$eval(attrs.remove);
						});
					}, 200);
				}
			});
		}
	};
}]);

app.filter('bytes', function() {
	return function(bytes, precision) {
		if (bytes === 0) { return '0 bytes'; }
		if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
		if (typeof precision === 'undefined') precision = 1;

		var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
		number = Math.floor(Math.log(bytes) / Math.log(1024)),
		val = (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision);

		return  (val.match(/\.0*$/) ? val.substr(0, val.indexOf('.')) : val) +  ' ' + units[number];
	};
});