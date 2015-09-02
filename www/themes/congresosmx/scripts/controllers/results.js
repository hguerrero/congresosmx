'use strict';

var app = angular.module('webappApp');

app.controller('MessageBoxController', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
	  $scope.close = function (result) { $modalInstance.close(result); };
	}]);

app.controller('ResultsCtrl', function ($scope, Results, $modal, $log, Plan, Poblation) {
	$scope.tblData = [];	

	$scope.tblData = $scope.plan.entregas ? $scope.plan.entregas : [];
	$scope.tblData = [];
	$scope.tblSelections = [];
	$scope.tblColumns = [{ field: 'txId', displayName: 'TxID' },
	                     { displayName: 'Nivel Confianza', cellTemplate: 
	                     '<span class="{{\'center-block label label-\' + levelLabel(row.entity.level)}}">{{row.entity.level}}</span>'},
	                     { field: 'numCliente', displayName: 'Num. Cliente' },
	                     { field: 'cliente', displayName: 'Cliente' },
	                     { field: 'calle', displayName: 'Direccion' },
	                     { field: 'colonia', displayName: 'Colonia' },
	                     { field: 'delegacion', displayName: 'Municipio/Delegacion' },
	                     { field: 'estado', displayName: 'Estado' },
	                     { field: 'cpostal', displayName: 'CP' },
	                     { displayName: 'Acciones', cellTemplate: 
	                     '<button id="geoBtn" type="button" class="btn btn-primary" ng-click="geoEntity(row.entity)" ><i class="glyphicon glyphicon-globe"></i></button>'}];

	$scope.gridOptions = { data: 'tblData', 
			columnDefs: 'tblColumns',
			selectedItems: $scope.tblSelections,
			multiSelect: false };

	$scope.levelLabel = function(level) {
		if (level === 'NO_MATCHES') {
			return "danger";
		}
		else if (level === 'LOW' || level === 'MIDDLE') {
			return "warning";			
		}
		else {
			return "success";			
		}
	};
	
	Results.query(function(data) {
		$scope.tblData = data;
	});

	$scope.geoEntity = function(entity) {
		var selectedEntity = entity;
		var modalInstance = $modal.open({
			templateUrl: 'views/resultados/result_geo.tpl.html',
			controller: 'ResultCtrl',
			size: 'lg',
			resolve: {
				item: function () {
					return angular.copy(selectedEntity);
				}
			}
		});
		modalInstance.result.then(function (selectedItem) {
			if (selectedItem.update) {
				selectedEntity.direccion.calle = selectedItem.descripcion;
				selectedEntity.direccion.colonia.descripcion = selectedItem.colonia.descripcion;
			}
//			$scope.selected = selectedItem;
//			Poblation.save($scope.selected, function(data) {
//				$scope.tblData = data;
//			});
		}, function () {
			$log.info('Modal dismissed at: ' + new Date());
		});	
	};

});

app.controller('ResultCtrl', function ($scope, $window, $modalInstance, $modal, item, Plan) {
	$scope.selected = item;

	$scope.tblData = $scope.selected.matches;
	$scope.tblSelections = [];
	$scope.tblColumns = [{ field: 'descripcion', displayName: 'Calle' },
	                     { field: 'colonia.descripcion', displayName: 'Colonia' },
	                     { field: 'colonia.municipio.descripcion', displayName: 'Municipio' },
	                     { field: 'colonia.estado.descripcion', displayName: 'Estado' },
	                     { field: 'colonia.codigopostal', displayName: 'Codigo Postal' }];

	$scope.gridOptions = { data: 'tblData', 
			columnDefs: 'tblColumns',
			selectedItems: $scope.tblSelections,
			multiSelect: false };

	$scope.calle = {};

	$scope.$watchCollection('tblSelections', function() {
		if ($scope.tblSelections[0]) {
			$scope.calle = $scope.tblSelections[0];
		}
	});
	
	$scope.coords = {};

	$scope.submit = function () {
		var resp = $window.confirm( "¿Desea ocupar los datos de la calle selecionada?" );
		if (resp) {
			$modalInstance.close( { calle: $scope.calle, update : true } );			
		}
		else {
			$modalInstance.close( { calle: $scope.calle, update : false } );
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.loadMap = function() {
		if (document.getElementById('map_gelocate')) {
			var coords = convertCoords($scope.calle);
		
			$scope.coords = coords;
			$scope.map = mapConfig(coords, 16);
		
			$scope.$watchCollection('calle', function() {
				if ($scope.map != undefined) {
					var map = $scope.map;
					var coords = convertCoords($scope.calle);
					$scope.coords = coords;
					clearMap(map);
					focusMap(coords, map);
				}
			});
		}
	};
	
	var focusMap = function(coords, map) {
		map.panTo(new L.LatLng(coords.lat, coords.lng), 16);
		var spot = addMarker(coords, map);
		spot.marker.on('dragend', function(event){
			var marker = event.target;
			var coords = marker.getLatLng();
			$scope.coords = coords;
			$scope.$apply();
			clearMap(map);
			focusMap(coords, map);
		});
		spot.marker.on('dragstart', function(event){
			map.removeLayer(spot.circle);
		});
		$scope.spot = spot;
	};

	var clearMap = function(map) {
		if ($scope.spot != undefined){
			map.removeLayer($scope.spot.marker);
			map.removeLayer($scope.spot.circle);
		}
	};

	var addCircle = function(coords, map) {
		var circle = L.circle(coords, 250, {
			color: 'red',
			fillColor: '#f03',
			fillOpacity: 0.2,
			weight: 2
		}).addTo(map);
		return circle;
	};

	var addMarker = function(coords, map) {
		var marker = L.marker(coords, { draggable : true, riseOnHover : true }).addTo(map);
		var circle = addCircle(coords, map);
		return { 'marker' : marker, 'circle' : circle };
	};
});

var convertCoords = function(model) {
	if (model == undefined) {
		return { "lat" : 0, "lng" : 0 };
	}
	
	if (model.latitud == undefined && model.longitud == undefined) {
		if (model.calle == undefined) {
			model = model.colonia;
		}
		else {
			model = model.calle;
		}

		return convertCoords(model);
	}
	
	return { lat: model.latitud == undefined ? 0 : model.latitud, 
			lng: model.longitud == undefined ? 0 : model.longitud };
};

var createDistanceString = function(dist) {
    if (dist < 900)
        return round(dist, 1) + "m";

    dist = round(dist / 1000, 100);
    if (dist > 100)
        dist = round(dist, 1);
    return dist + "Kms";
};

var createTimeString = function(time) {
    var tmpTime = round(time / 60 / 1000, 1000);
    var resTimeStr;
    if (tmpTime > 60) {
        if (tmpTime / 60 > 24) {
            resTimeStr = floor(tmpTime / 60 / 24, 1) + " dias";
            tmpTime = floor(((tmpTime / 60) % 24), 1);
            if (tmpTime > 0)
                resTimeStr += " " + tmpTime + "hrs";
        } else {
            resTimeStr = floor(tmpTime / 60, 1) + "hrs";
            tmpTime = floor(tmpTime % 60, 1);
            if (tmpTime > 0)
                resTimeStr += " " + tmpTime + "mins";
        }
    } else
        resTimeStr = round(tmpTime % 60, 1) + "mins";
    return resTimeStr;
};

var floor = function(val, precision) {
    if (!precision)
        precision = 1e6;
    return Math.floor(val * precision) / precision;
};

var round = function(val, precision) {
    if (precision === undefined)
        precision = 1e6;
    return Math.round(val * precision) / precision;
};