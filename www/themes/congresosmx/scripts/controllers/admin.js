'use strict';

var app = angular.module('webappApp');

app
		.controller(
				'PaisesCtrl',
				function($scope, Country, $modal, $log) {
					$scope.tblData = [];
					$scope.tblSelections = [];
					$scope.tblColumns = [
							{
								field : 'clave',
								displayName : 'Clave'
							},
							{
								field : 'descripcion',
								displayName : 'Pais'
							},
							{
								field : 'latitud',
								displayName : 'Latitud'
							},
							{
								field : 'longitud',
								displayName : 'Longitud'
							},
							{
								field : 'status',
								displayName : 'Estatus'
							},
							{
								displayName : 'Edit',
								cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row)" ><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></button>'
							} ];

					$scope.gridOptions = {
						data : 'tblData',
						columnDefs : 'tblColumns',
						selectedItems : $scope.tblSelections,
						multiSelect : false
					};

					Country.list(null, function(data) {
						$scope.tblData = data;
					});

					$scope.editEntity = function(entity) {
						var modalInstance = $modal.open({
							templateUrl : 'views/pais/pais_edit.tpl.html',
							controller : 'PaisCtrl',
							size : 'lg',
							resolve : {
								item : function() {
									return angular.copy(entity);
								}
							}
						});
						modalInstance.result.then(function(selectedItem) {
							$scope.selected = selectedItem;
							Country.save($scope.selected, function(data) {
								$scope.tblData = data;
							});
						}, function() {
							$log.info('Modal dismissed at: ' + new Date());
						});
					};
				});

app.controller('PaisCtrl', function($scope, $modalInstance, item, $timeout) {
	$scope.selected = item;
	$scope.coords = {};

	$scope.submit = function() {
		$modalInstance.close($scope.selected);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	$scope.loadMap = function() {
		if (document.getElementById('map_gelocate')) {
			var coords = {
				lat : $scope.selected.latitud == undefined ? 0
						: $scope.selected.latitud,
				lng : $scope.selected.longitud == undefined ? 0
						: $scope.selected.longitud
			};
			$scope.coords = coords;
			$scope.map = mapConfig(coords, 5);

			$scope.$watchCollection('selected', function() {
				if ($scope.map != undefined) {
					var map = $scope.map;
					var coords = {
						lat : $scope.selected.latitud == undefined ? 0
								: $scope.selected.latitud,
						lng : $scope.selected.longitud == undefined ? 0
								: $scope.selected.longitud
					};
					$scope.coords = coords;
					clearMap(map);
					focusMap(coords, map);
				}
			});
		}
	};

	var focusMap = function(coords, map) {
		map.panTo(new L.LatLng(coords.lat, coords.lng), 5);
		var spot = addMarker(coords, map);
		spot.marker.on('dragend', function(event) {
			var marker = event.target;
			var coords = marker.getLatLng();
			$scope.selected.latitud = coords.lat;
			$scope.selected.longitud = coords.lng;
			$scope.$apply();
		});
		spot.marker.on('dragstart', function(event) {
			map.removeLayer(spot.circle);
		});
		$scope.spot = spot;
	};

	var clearMap = function(map) {
		if ($scope.spot != undefined) {
			map.removeLayer($scope.spot.marker);
			map.removeLayer($scope.spot.circle);
		}
	};

	var addCircle = function(coords, map) {
		var circle = L.circle(coords, 500000, {
			color : 'red',
			fillColor : '#f03',
			fillOpacity : 0.2,
			weight : 2
		}).addTo(map);
		return circle;
	};

	var addMarker = function(coords, map) {
		var marker = L.marker(coords, {
			draggable : true,
			riseOnHover : true
		}).addTo(map);
		var circle = addCircle(coords, map);
		return {
			'marker' : marker,
			'circle' : circle
		};
	};
});

app
		.controller(
				'MunicipiosCtrl',
				function($scope, County, Country, Region, $modal, $log) {
					$scope.tblData = [];
					$scope.tblSelections = [];
					$scope.tblColumns = [
							{
								field : 'clave',
								displayName : 'Clave'
							},
							{
								field : 'descripcion',
								displayName : 'Municipio'
							},
							{
								field : 'latitud',
								displayName : 'Latitud'
							},
							{
								field : 'longitud',
								displayName : 'Longitud'
							},
							{
								field : 'zonaRoja',
								displayName : 'Zona Roja'
							},
							{
								field : 'status',
								displayName : 'Estatus'
							},
							{
								field : 'estado.descripcion',
								displayName : 'Estado'
							},
							{
								displayName : 'Acciones',
								cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" ><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></button>'
							} ];

					$scope.countries = [];
					$scope.pais = {};
					$scope.regions = [];

					$scope.regions = [];
					$scope.estado = {};
					$scope.county = [];

					Country.list(1, function(data) {
						$scope.countries = data;
						$scope.pais = data[146];
					});

					$scope.paisChanged = function() {
						var key = $scope.pais.id;
						Region.search(key, function(data) {
							$scope.regions = data;
						});
					};

					Region.list(1, function(data) {
						$scope.regions = data;
						$scope.estado = data[0];
					});

					$scope.estadoChanged = function() {
						var key = $scope.estado.id;
						County.search(key, function(data) {
							$scope.counties = data;
						});
					};

					$scope.gridOptions = {
						data : 'counties',
						columnDefs : 'tblColumns',
						selectedItems : $scope.tblSelections,
						multiSelect : false
					};

					County.list(null, function(data) {
						$scope.tblData = data;
					});

					$scope.editEntity = function(entity) {
						var modalInstance = $modal
								.open({
									templateUrl : 'views/municipio/municipio_edit.tpl.html',
									controller : 'MunicipioCtrl',
									size : 'lg',
									resolve : {
										item : function() {
											return angular.copy(entity);
										}
									}
								});
						modalInstance.result.then(function(selectedItem) {
							$scope.selected = selectedItem;
							County.save($scope.selected, function(data) {
								$scope.tblData = data;
							});
						}, function() {
							$log.info('Modal dismissed at: ' + new Date());
						});
					};
				});

app.controller('MunicipioCtrl', function($scope, Region, Country,
		$modalInstance, item, $timeout) {
	$scope.selected = item;
	$scope.regions = [];

	Region.list(1, function(data) {
		$scope.regions = data;
		$scope.selected.estado = _.find($scope.regions, function(region) {
			return region.id === $scope.selected.estado.id;
		});
	});

	$scope.submit = function() {
		$modalInstance.close($scope.selected);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	$scope.loadMap = function() {
		if (document.getElementById('map_gelocate')) {
			var coords = {
				lat : $scope.selected.latitud == undefined ? 0
						: $scope.selected.latitud,
				lng : $scope.selected.longitud == undefined ? 0
						: $scope.selected.longitud
			};
			$scope.coords = coords;
			$scope.map = mapConfig(coords, 10);

			$scope.$watchCollection('selected', function() {
				if ($scope.map != undefined) {
					var map = $scope.map;
					var coords = {
						lat : $scope.selected.latitud == undefined ? 0
								: $scope.selected.latitud,
						lng : $scope.selected.longitud == undefined ? 0
								: $scope.selected.longitud
					};
					$scope.coords = coords;
					clearMap(map);
					focusMap(coords, map);
				}
			});
		}
	};

	var focusMap = function(coords, map) {
		map.panTo(new L.LatLng(coords.lat, coords.lng), 10);
		var spot = addMarker(coords, map);
		spot.marker.on('dragend', function(event) {
			var marker = event.target;
			var coords = marker.getLatLng();
			$scope.selected.latitud = coords.lat;
			$scope.selected.longitud = coords.lng;
			$scope.$apply();
		});
		spot.marker.on('dragstart', function(event) {
			map.removeLayer(spot.circle);
		});
		$scope.spot = spot;
	};

	var clearMap = function(map) {
		if ($scope.spot != undefined) {
			map.removeLayer($scope.spot.marker);
			map.removeLayer($scope.spot.circle);
		}
	};

	var addCircle = function(coords, map) {
		var circle = L.circle(coords, 5000, {
			color : 'red',
			fillColor : '#f03',
			fillOpacity : 0.2,
			weight : 2
		}).addTo(map);
		return circle;
	};

	var addMarker = function(coords, map) {
		var marker = L.marker(coords, {
			draggable : true,
			riseOnHover : true
		}).addTo(map);
		var circle = addCircle(coords, map);
		return {
			'marker' : marker,
			'circle' : circle
		};
	};
});

app
		.controller(
				'EstadosCtrl',
				function($scope, Region, Country, $modal, $log) {
					$scope.tblData = [];
					$scope.tblSelections = [];
					$scope.tblColumns = [
							{
								field : 'clave',
								displayName : 'Clave'
							},
							{
								field : 'descripcion',
								displayName : 'Estado'
							},
							{
								field : 'latitud',
								displayName : 'Latitud'
							},
							{
								field : 'longitud',
								displayName : 'Longitud'
							},
							{
								field : 'status',
								displayName : 'Estatus'
							},
							{
								field : 'pais.descripcion',
								displayName : 'Pais'
							},
							{
								displayName : 'Edit',
								cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" ><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></button>'
							} ];

					$scope.countries = [];
					$scope.pais = {};
					$scope.regions = [];

					$scope.regions = [];
					$scope.estado = {};
					$scope.county = [];

					Country.list(1, function(data) {
						
						$scope.paises = data;
						$scope.pais = data[146];
					});

					$scope.paisChanged = function() {
						var key = $scope.pais.id;
						Region.search(key, function(data) {
							$scope.regions = data;
						});
					};

					$scope.gridOptions = {
						data : 'regions',
						columnDefs : 'tblColumns',
						selectedItems : $scope.tblSelections,
						multiSelect : false
					};

					$scope.editEntity = function(entity) {
						var modalInstance = $modal.open({
							templateUrl : 'views/estado/estado_edit.tpl.html',
							controller : 'EstadoCtrl',
							size : 'lg',
							resolve : {
								item : function() {
									return angular.copy(entity);
								}
							}
						});
						modalInstance.result.then(function(selectedItem) {
							$scope.selected = selectedItem;
							Region.save($scope.selected, function(data) {
								$scope.tblData = data;
							});
						}, function() {
							$log.info('Modal dismissed at: ' + new Date());
						});
					};
				});

app.controller('EstadoCtrl', function($scope, Country, $modalInstance, item,
		$timeout) {
	$scope.selected = item;
	$scope.coords = {};

	$scope.countries = [];

	Country.list(1, function(data) {
		$scope.countries = data;
		$scope.selected.pais = _.find($scope.countries, function(country) {
			return country.id === $scope.selected.pais.id;
			
			
		});
	});

	$scope.submit = function() {
		$modalInstance.close($scope.selected);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	$scope.loadMap = function() {
		if (document.getElementById('map_gelocate')) {
			var coords = {
				lat : $scope.selected.latitud == undefined ? 0
						: $scope.selected.latitud,
				lng : $scope.selected.longitud == undefined ? 0
						: $scope.selected.longitud
			};
			$scope.coords = coords;
			$scope.map = mapConfig(coords, 10);

			$scope.$watchCollection('selected', function() {
				if ($scope.map != undefined) {
					var map = $scope.map;
					var coords = {
						lat : $scope.selected.latitud == undefined ? 0
								: $scope.selected.latitud,
						lng : $scope.selected.longitud == undefined ? 0
								: $scope.selected.longitud
					};
					$scope.coords = coords;
					clearMap(map);
					focusMap(coords, map);
				}
			});
		}
	};

	var focusMap = function(coords, map) {
		map.panTo(new L.LatLng(coords.lat, coords.lng), 10);
		var spot = addMarker(coords, map);
		spot.marker.on('dragend', function(event) {
			var marker = event.target;
			var coords = marker.getLatLng();
			$scope.selected.latitud = coords.lat;
			$scope.selected.longitud = coords.lng;
			$scope.$apply();
		});
		spot.marker.on('dragstart', function(event) {
			map.removeLayer(spot.circle);
		});
		$scope.spot = spot;
	};

	var clearMap = function(map) {
		if ($scope.spot != undefined) {
			map.removeLayer($scope.spot.marker);
			map.removeLayer($scope.spot.circle);
		}
	};

	var addCircle = function(coords, map) {
		var circle = L.circle(coords, 5000, {
			color : 'red',
			fillColor : '#f03',
			fillOpacity : 0.2,
			weight : 2
		}).addTo(map);
		return circle;
	};

	var addMarker = function(coords, map) {
		var marker = L.marker(coords, {
			draggable : true,
			riseOnHover : true
		}).addTo(map);
		var circle = addCircle(coords, map);
		return {
			'marker' : marker,
			'circle' : circle
		};
	};
});

app
		.controller(
				'AsentamientosCtrl',
				function($scope, Vicinity, County, Region, Country, $modal,
						$log) {
					$scope.tblData = [];
					$scope.tblSelections = [];
					$scope.tblColumns = [
							{
								field : 'clave',
								displayName : 'Clave'
							},
							{
								field : 'descripcion',
								displayName : 'Colonia'
							},
							{
								field : 'codigopostal',
								displayName : 'Codigo Postal'
							},
							{
								field : 'latitud',
								displayName : 'Latitud'
							},
							{
								field : 'longitud',
								displayName : 'Longitud'
							},
							{
								field : 'zonaRoja',
								displayName : 'Zona Roja'
							},
							{
								field : 'status',
								displayName : 'Estatus'
							},
							{
								field : 'municipio.descripcion',
								displayName : 'Municipio'
							},
							{
								displayName : 'Acciones',
								cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" ><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></button>'
							} ];

					$scope.countries = [];
					$scope.pais = {};
					$scope.regions = [];

					$scope.regions = [];
					$scope.estado = {};
					$scope.county = [];

					Country.list(1, function(data) {
						$scope.countries = data;
						$scope.pais = data[146];
					});

					$scope.paisChanged = function() {
						var key = $scope.pais.id;
						Region.search(key, function(data) {
							$scope.regions = data;
						});
					};

					Region.list(1, function(data) {
						$scope.regions = data;
						$scope.estado = data[0];
					});

					$scope.estadoChanged = function() {
						var key = $scope.estado.id;
						County.search(key, function(data) {
							$scope.counties = data;
						});
					};

					County.list(1, function(data) {
						$scope.municipio = data[0];
					});

					$scope.municipioChanged = function() {
						var key = $scope.municipio.id;
						Vicinity.search(key, function(data) {
							$scope.vicinities = data;
						});
					};

					$scope.gridOptions = {
						data : 'vicinities',
						columnDefs : 'tblColumns',
						selectedItems : $scope.tblSelections,
						multiSelect : false
					};

					Vicinity.list(null, function(data) {
						$scope.tblData = data;
					});

					$scope.editEntity = function(entity) {
						var modalInstance = $modal
								.open({
									templateUrl : 'views/asentamiento/asentamiento_edit.tpl.html',
									controller : 'AsentamientoCtrl',
									size : 'lg',
									resolve : {
										item : function() {
											return angular.copy(entity);
										}
									}
								});
						modalInstance.result.then(function(selectedItem) {
							$scope.selected = selectedItem;
							Vicinity.save($scope.selected, function(data) {
								$scope.tblData = data;
							});
						}, function() {
							$log.info('Modal dismissed at: ' + new Date());
						});
					};
				});

app.controller('AsentamientoCtrl', function($scope, County, Region, Country,
		$modalInstance, item, $timeout) {
	$scope.selected = item;
	$scope.poblations = [];

	County.list(1, function(data) {
		$scope.poblations = data;
		$scope.selected.municipio = _.find($scope.poblations, function(
				poblation) {
			return poblation.id === $scope.selected.municipio.id;
		});
	});

	$scope.submit = function() {
		$modalInstance.close($scope.selected);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	$scope.loadMap = function() {
		if (document.getElementById('map_gelocate')) {
			var coords = {
				lat : $scope.selected.latitud == undefined ? 0
						: $scope.selected.latitud,
				lng : $scope.selected.longitud == undefined ? 0
						: $scope.selected.longitud
			};
			$scope.coords = coords;
			$scope.map = mapConfig(coords, 10);

			$scope.$watchCollection('selected', function() {
				if ($scope.map != undefined) {
					var map = $scope.map;
					var coords = {
						lat : $scope.selected.latitud == undefined ? 0
								: $scope.selected.latitud,
						lng : $scope.selected.longitud == undefined ? 0
								: $scope.selected.longitud
					};
					$scope.coords = coords;
					clearMap(map);
					focusMap(coords, map);
				}
			});
		}
	};

	var focusMap = function(coords, map) {
		map.panTo(new L.LatLng(coords.lat, coords.lng), 10);
		var spot = addMarker(coords, map);
		spot.marker.on('dragend', function(event) {
			var marker = event.target;
			var coords = marker.getLatLng();
			$scope.selected.latitud = coords.lat;
			$scope.selected.longitud = coords.lng;
			$scope.$apply();
		});
		spot.marker.on('dragstart', function(event) {
			map.removeLayer(spot.circle);
		});
		$scope.spot = spot;
	};

	var clearMap = function(map) {
		if ($scope.spot != undefined) {
			map.removeLayer($scope.spot.marker);
			map.removeLayer($scope.spot.circle);
		}
	};

	var addCircle = function(coords, map) {
		var circle = L.circle(coords, 5000, {
			color : 'red',
			fillColor : '#f03',
			fillOpacity : 0.2,
			weight : 2
		}).addTo(map);
		return circle;
	};

	var addMarker = function(coords, map) {
		var marker = L.marker(coords, {
			draggable : true,
			riseOnHover : true
		}).addTo(map);
		var circle = addCircle(coords, map);
		return {
			'marker' : marker,
			'circle' : circle
		};
	};
});

app
		.controller(
				'CallesCtrl',
				function($scope, Street, Region, Country, County, Vicinity,
						$modal, $log) {
					$scope.tblData = [];
					$scope.tblSelections = [];
					$scope.tblColumns = [
							{
								field : 'descripcion',
								displayName : 'Calle'
							},
							{
								field : 'latitud',
								displayName : 'Latitud'
							},
							{
								field : 'longitud',
								displayName : 'Longitud'
							},
							{
								field : 'zonaRoja',
								displayName : 'Zona Roja'
							},
							{
								field : 'status',
								displayName : 'Estatus'
							},
							{
								field : 'colonia.descripcion',
								displayName : 'Colonia'
							},
							{
								displayName : 'Acciones',
								cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" ><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></button>'
							} ];

					$scope.countries = [];
					$scope.pais = {};
					$scope.regions = [];

					$scope.regions = [];
					$scope.estado = {};
					$scope.county = [];

					Country.list(1, function(data) {
						$scope.countries = data;
						$scope.pais = data[146];
					});

					$scope.paisChanged = function() {
						var key = $scope.pais.id;
						Region.search(key, function(data) {
							$scope.regions = data;
						});
					};

					Region.list(1, function(data) {
						$scope.regions = data;
						$scope.estado = data[0];
					});

					$scope.estadoChanged = function() {
						var key = $scope.estado.id;
						County.search(key, function(data) {
							$scope.counties = data;
						});
					};

					County.list(1, function(data) {
						$scope.municipio = data[0];
					});

					$scope.municipioChanged = function() {
						var key = $scope.municipio.id;
						Vicinity.search(key, function(data) {
							$scope.vicinities = data;
						});
					};

					Vicinity.list(1, function(data) {
						$scope.asentamiento = data[0];
					});

					$scope.coloniaChanged = function() {
						var key = $scope.colonia.id;
						Street.search(key, function(data) {
							$scope.streets = data;
						});
					};

					$scope.gridOptions = {
						data : 'streets',
						columnDefs : 'tblColumns',
						selectedItems : $scope.tblSelections,
						multiSelect : false
					};

					Street.list(null, function(data) {
						$scope.tblData = data;
					});

					$scope.editEntity = function(entity) {
						var modalInstance = $modal.open({
							templateUrl : 'views/calle/calle_edit.tpl.html',
							controller : 'CalleCtrl',
							size : 'lg',
							resolve : {
								item : function() {
									return angular.copy(entity);
								}
							}
						});
						modalInstance.result.then(function(selectedItem) {
							$scope.selected = selectedItem;
							Street.save($scope.selected, function(data) {
								$scope.tblData = data;
							});
						}, function() {
							$log.info('Modal dismissed at: ' + new Date());
						});
					};
				});

app.controller('CalleCtrl', function($scope, Vicinity, County, $modalInstance,
		item, $timeout, $http) {
	$scope.selected = item;
	$scope.asentams = [];

	$scope.LoadVicinities = function(text) {
		return $http.get(
				'http://localhost:8080/rplanner/application/admin/vicinity/'
						+ text).then(function(res) {
			$scope.asentams = res.data;
			return res.data;
		});
	};

	$scope.submit = function() {
		$modalInstance.close($scope.selected);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	$scope.loadMap = function() {
		if (document.getElementById('map_gelocate')) {
			var coords = retrieveCoords($scope.selected);
			$scope.coords = coords;
			$scope.map = mapConfig(coords, 16);

			$scope.$watchCollection('selected', function() {
				if ($scope.map != undefined) {
					var map = $scope.map;
					var coords = retrieveCoords($scope.selected);
					$scope.coords = coords;
					clearMap(map);
					focusMap(coords, map);
				}
			});
		}
	};

	var focusMap = function(coords, map) {
		map.panTo(new L.LatLng(coords.lat, coords.lng), 10);
		var spot = addMarker(coords, map);
		spot.marker.on('dragend', function(event) {
			var marker = event.target;
			var coords = marker.getLatLng();
			$scope.selected.latitud = coords.lat;
			$scope.selected.longitud = coords.lng;
			$scope.$apply();
		});
		spot.marker.on('dragstart', function(event) {
			map.removeLayer(spot.circle);
		});
		$scope.spot = spot;
	};

	var clearMap = function(map) {
		if ($scope.spot != undefined) {
			map.removeLayer($scope.spot.marker);
			map.removeLayer($scope.spot.circle);
		}
	};

	var addCircle = function(coords, map) {
		var circle = L.circle(coords, 100, {
			color : 'red',
			fillColor : '#f03',
			fillOpacity : 0.2,
			weight : 2
		}).addTo(map);
		return circle;
	};

	var addMarker = function(coords, map) {
		var marker = L.marker(coords, {
			draggable : true,
			riseOnHover : true
		}).addTo(map);
		var circle = addCircle(coords, map);
		return {
			'marker' : marker,
			'circle' : circle
		};
	};
});

var mapConfig = function(coords, z) {
	var map = L.map('map_gelocate', {
		center : coords,
		zoom : z
	});
	var MapQuestOpen_OSM = L
			.tileLayer(
					'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg',
					{
						maxZoom : 18,
						minZoom : 1,
						attribution : 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
						subdomains : '1234'
					});
	var Esri_WorldStreetMap = L
			.tileLayer(
					'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
					{
						maxZoom : 18,
						minZoom : 1,
						attribution : 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
					});
	var HERE_normalDay = L
			.tileLayer(
					'http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/normal.day/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}',
					{
						attribution : 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
						subdomains : '1234',
						mapID : 'newest',
						app_id : 'WbMmbR2AlyrHMPip4rhV',
						app_code : 'wTBZHQZOy02FilC6zNyMWA',
						base : 'base',
						minZoom : 0,
						maxZoom : 20
					});
	HERE_normalDay.addTo(map);
	L.control.scale().addTo(map);
	return map;
};

var retrieveCoords = function(model) {
	if (model == undefined) {
		return {
			"lat" : 0,
			"lng" : 0
		};
	}

	if (model.latitud == undefined && model.longitud == undefined) {
		return retrieveCoords(model.colonia);
	}

	return {
		lat : model.latitud == undefined ? 0 : model.latitud,
		lng : model.longitud == undefined ? 0 : model.longitud
	};
};

app
		.controller(
				'UnidadesCtrl',
				function($scope, Unit, $modal, $log) {
					$scope.tblData = [];
					$scope.tblSelections = [];
					$scope.tblColumns = [
							{
								field : 'clave',
								displayName : 'Clave'
							},
							{
								field : 'largo',
								displayName : 'Largo'
							},
							{
								field : 'alto',
								displayName : 'Alto'
							},
							{
								field : 'ancho',
								displayName : 'Ancho'
							},
							{
								field : 'cubicaje',
								displayName : 'Cubicaje'
							},
							{
								field : 'marca.descripcion',
								displayName : 'Marca'
							},
							{
								field : 'tipoCaja.descripcion',
								displayName : 'TipoCaja'
							},
							{
								field : 'encierro.descripcion',
								displayName : 'Encierro'
							},
							{
								field : 'status',
								displayName : 'Estatus'
							},
							{
								displayName : 'Acciones',
								cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)"><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></button> ',
								width : 'auto'
							} ];

					$scope.gridOptions = {
						data : 'tblData',
						columnDefs : 'tblColumns',
						selectedItems : $scope.tblSelections,
						multiSelect : false
					};

					Unit.list(null, function(data) {
						$scope.tblData = data;
					});

					$scope.editEntity = function(entity) {
						var modalInstance = $modal
								.open({
									templateUrl : 'views/unidades/unidades_edit.tpl.html',
									controller : 'CalleCtrl',
									size : 'lg',
									resolve : {
										item : function() {
											return angular.copy(entity);
										}
									}
								});
						modalInstance.result.then(function(selectedItem) {
							$scope.selected = selectedItem;
							Unit.save($scope.selected, function(data) {
								$scope.tblData = data;
							});
						}, function() {
							$log.info('Modal dismissed at: ' + new Date());
						});
					};

				});

app
		.controller(
				'MarcasCtrl',
				function($scope, Brand, $modal, $log) {
					$scope.tblData = [];
					$scope.tblSelections = [];
					$scope.tblColumns = [
							{
								field : 'clave',
								displayName : 'Clave'
							},
							{
								field : 'descripcion',
								displayName : 'Marca'
							},
							{
								field : 'status',
								displayName : 'Estatus'
							},
							{
								displayName : 'Acciones',
								cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" ><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></button> ',
								width : 'auto'
							} ];

					$scope.gridOptions = {
						data : 'tblData',
						columnDefs : 'tblColumns',
						selectedItems : $scope.tblSelections,
						multiSelect : false
					};

					Brand.list(null, function(data) {
						$scope.tblData = data;
					});

					$scope.editEntity = function(entity) {
						var modalInstance = $modal.open({
							templateUrl : 'views/marcas/marcas_edit.tpl.html',
							controller : 'CalleCtrl',
							size : 'lg',
							resolve : {
								item : function() {
									return angular.copy(entity);
								}
							}
						});
						modalInstance.result.then(function(selectedItem) {
							$scope.selected = selectedItem;
							Brands.save($scope.selected, function(data) {
								$scope.tblData = data;
							});
						}, function() {
							$log.info('Modal dismissed at: ' + new Date());
						});
					};

				});

app
		.controller(
				'ZonasCtrl',
				function($scope, Zone, $modal, $log) {
					$scope.tblData = [];
					$scope.tblSelections = [];
					$scope.tblColumns = [
							{
								field : 'clave',
								displayName : 'Clave'
							},
							{
								field : 'descripcion',
								displayName : 'Zona'
							},
							{
								field : 'status',
								displayName : 'Estatus'
							},
							{
								displayName : 'Acciones',
								cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" ><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></button> ',
								width : 'auto'
							} ];

					$scope.gridOptions = {
						data : 'tblData',
						columnDefs : 'tblColumns',
						selectedItems : $scope.tblSelections,
						multiSelect : false
					};

					Zone.list(null, function(data) {
						$scope.tblData = data;
					});

					$scope.editEntity = function(entity) {
						var modalInstance = $modal.open({
							templateUrl : 'views/zona/zonas_edit.tpl.html',
							controller : 'CalleCtrl',
							size : 'lg',
							resolve : {
								item : function() {
									return angular.copy(entity);
								}
							}
						});
						modalInstance.result.then(function(selectedItem) {
							$scope.selected = selectedItem;
							Zone.save($scope.selected, function(data) {
								$scope.tblData = data;
							});
						}, function() {
							$log.info('Modal dismissed at: ' + new Date());
						});
					};

				});

app
		.controller(
				'TipoCajaCtrl',
				function($scope, Box, $modal, $log) {
					$scope.tblData = [];
					$scope.tblSelections = [];
					$scope.tblColumns = [
							{
								field : 'clave',
								displayName : 'Clave'
							},
							{
								field : 'descripcion',
								displayName : 'TipoCaja'
							},
							{
								field : 'status',
								displayName : 'Estatus'
							},
							{
								displayName : 'Acciones',
								cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" ><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></button> ',
								width : 'auto'
							} ];

					$scope.gridOptions = {
						data : 'tblData',
						columnDefs : 'tblColumns',
						selectedItems : $scope.tblSelections,
						multiSelect : false
					};

					Box.list(null, function(data) {
						$scope.tblData = data;
					});

					$scope.editEntity = function(entity) {
						var modalInstance = $modal
								.open({
									templateUrl : 'views/tipocaja/tipocaja_edit.tpl.html',
									controller : 'CalleCtrl',
									size : 'lg',
									resolve : {
										item : function() {
											return angular.copy(entity);
										}
									}
								});
						modalInstance.result.then(function(selectedItem) {
							$scope.selected = selectedItem;
							Box.save($scope.selected, function(data) {
								$scope.tblData = data;
							});
						}, function() {
							$log.info('Modal dismissed at: ' + new Date());
						});
					};

				});

app
		.controller(
				'EncierroCtrl',
				function($scope, Deposit, $modal, $log) {
					$scope.tblData = [];
					$scope.tblSelections = [];
					$scope.tblColumns = [
							{
								field : 'clave',
								displayName : 'Clave'
							},
							{
								field : 'descripcion',
								displayName : 'Encierro'
							},
							{
								field : 'status',
								displayName : 'Estatus'
							},
							{
								displayName : 'Acciones',
								cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" ><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></i></button>'
							} ];

					$scope.gridOptions = {
						data : 'tblData',
						columnDefs : 'tblColumns',
						selectedItems : $scope.tblSelections,
						multiSelect : false
					};

					Deposit.list(null, function(data) {
						$scope.tblData = data;
					});

					$scope.editEntity = function(entity) {
						var modalInstance = $modal
								.open({
									templateUrl : 'views/encierro/encierro_edit.tpl.html',
									controller : 'MunicipioCtrl',
									size : 'lg',
									resolve : {
										item : function() {
											return angular.copy(entity);
										}
									}
								});
						modalInstance.result.then(function(selectedItem) {
							$scope.selected = selectedItem;
							Deposit.save($scope.selected, function(data) {
								$scope.tblData = data;
							});
						}, function() {
							$log.info('Modal dismissed at: ' + new Date());
						});
					};
				});

app
		.controller(
				'EmpresasCtrl',
				function($scope, Company, $modal, $log) {
					$scope.tblData = [];
					$scope.tblSelections = [];
					$scope.tblColumns = [
							{
								field : 'clave',
								displayName : 'Clave'
							},
							{
								field : 'descripcion',
								displayName : 'Empresa'
							},
							{
								field : 'status',
								displayName : 'Estatus'
							},
							{
								displayName : 'Acciones',
								cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" ><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></button> ',
								width : 'auto'
							} ];

					$scope.gridOptions = {
						data : 'tblData',
						columnDefs : 'tblColumns',
						selectedItems : $scope.tblSelections,
						multiSelect : false
					};

					Company.list(null, function(data) {
						$scope.tblData = data;
					});

					$scope.editEntity = function(entity) {
						var modalInstance = $modal
								.open({
									templateUrl : 'views/empresa/empresa_edit.tpl.html',
									controller : 'EmpresaCtrl',
									size : 'lg',
									resolve : {
										item : function() {
											return angular.copy(entity);
										}
									}
								});
						modalInstance.result.then(function(selectedItem) {
							$scope.selected = selectedItem;
							Company.save($scope.selected, function(data) {
								$scope.tblData = data;
							});
						}, function() {
							$log.info('Modal dismissed at: ' + new Date());
						});
					};

				});

app.controller('EmpresaCtrl', function($scope, $modalInstance, item, $timeout) {
	$scope.selected = item;
	$scope.coords = {};

	$scope.submit = function() {
		$modalInstance.close($scope.selected);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');

	};

});

app
		.controller(
				'MarcasEmpCtrl',
				function($scope, Brandcomp, $modal, $log) {
					$scope.tblData = [];
					$scope.tblSelections = [];
					$scope.tblColumns = [
							{
								field : 'clave',
								displayName : 'Clave'
							},
							{
								field : 'descripcion',
								displayName : 'Marca'
							},
							{
								field : 'status',
								displayName : 'Estatus'
							},
							{
								field : 'empresa.descripcion',
								displayName : 'Empresa'
							},
							{
								displayName : 'Acciones',
								cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" ><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></button> ',
								width : 'auto'
							} ];

					$scope.gridOptions = {
						data : 'tblData',
						columnDefs : 'tblColumns',
						selectedItems : $scope.tblSelections,
						multiSelect : false
					};

					Brandcomp.list(null, function(data) {
						$scope.tblData = data;
					});

					$scope.editEntity = function(entity) {
						var modalInstance = $modal
								.open({
									templateUrl : 'views/marcaemp/marcaemp_edit.tpl.html',
									controller : 'MarcaEmpCtrl',
									size : 'lg',
									resolve : {
										item : function() {
											return angular.copy(entity);
										}
									}
								});
						modalInstance.result.then(function(selectedItem) {
							$scope.selected = selectedItem;
							Brandcomp.save($scope.selected, function(data) {
								$scope.tblData = data;
							});
						}, function() {
							$log.info('Modal dismissed at: ' + new Date());
						});
					};

				});

app.controller('MarcaEmpCtrl',
		function($scope, $modalInstance, item, $timeout) {
			$scope.selected = item;
			$scope.coords = {};

			$scope.submit = function() {
				$modalInstance.close($scope.selected);
			};

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');

			};

		});

app
		.controller(
				'RegionesCtrl',
				function($scope, Branch, $modal, $log) {
					$scope.tblData = [];
					$scope.tblSelections = [];
					$scope.tblColumns = [
							{
								field : 'clave',
								displayName : 'Clave'
							},
							{
								field : 'region.descripcion',
								displayName : 'Empresa'
							},
							{
								field : 'status',
								displayName : 'Estatus'
							},
							{
								field : 'empresa.descripcion',
								displayName : 'Empresa'
							},
							{
								displayName : 'Acciones',
								cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" ><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></button> ',
								width : 'auto'
							} ];

					$scope.gridOptions = {
						data : 'tblData',
						columnDefs : 'tblColumns',
						selectedItems : $scope.tblSelections,
						multiSelect : false
					};

					Branch.list(null, function(data) {
						$scope.tblData = data;
					});

					$scope.editEntity = function(entity) {
						var modalInstance = $modal.open({
							templateUrl : 'views/region/region_edit.tpl.html',
							controller : 'RegionCtrl',
							size : 'lg',
							resolve : {
								item : function() {
									return angular.copy(entity);
								}
							}
						});
						modalInstance.result.then(function(selectedItem) {
							$scope.selected = selectedItem;
							Branch.save($scope.selected, function(data) {
								$scope.tblData = data;
							});
						}, function() {
							$log.info('Modal dismissed at: ' + new Date());
						});
					};

				});

app.controller('RegionCtrl', function($scope, $modalInstance, item, $timeout) {
	$scope.selected = item;
	$scope.coords = {};

	$scope.submit = function() {
		$modalInstance.close($scope.selected);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');

	};

});

app.controller('AddMunicipioCtrl', function($scope, Country, Region, County,
		$log, $location, $timeout) {
	$scope.selected = {};
	$scope.coords = {};

	$scope.countries = [];
	$scope.pais = {};
	$scope.regions = [];

	$scope.regions = [];
	$scope.estado = {};

	Country.list(1, function(data) {
		$scope.countries = data;
		$scope.pais = data[146];
		
	});

	$scope.paisChanged = function() {
		var key = $scope.pais.id;
		Region.search(key, function(data) {
			$scope.regions = data;
		});
	};
	
	
	Region.list(1, function(data) {
		$scope.regions = data;
		$scope.estado = data[0];
				
	});

	$scope.add = function() {
		$scope.selected.estado = $scope.estado;
		County.save($scope.selected, function(data) {
			$location.path("/admin/municipios");
		});

	};

	$scope.loadMap = function() {
		if (document.getElementById('map_gelocate')) {
			var coords = {
				lat : $scope.selected.latitud == undefined ? 0
						: $scope.selected.latitud,
				lng : $scope.selected.longitud == undefined ? 0
						: $scope.selected.longitud
			};
			$scope.coords = coords;
			$scope.map = mapConfig(coords, 5);

			$scope.$watchCollection('selected', function() {
				if ($scope.map != undefined) {
					var map = $scope.map;
					var coords = {
						lat : $scope.selected.latitud == undefined ? 0
								: $scope.selected.latitud,
						lng : $scope.selected.longitud == undefined ? 0
								: $scope.selected.longitud
					};
					$scope.coords = coords;
					clearMap(map);
					focusMap(coords, map);
				}
			});
		}
	};

	var focusMap = function(coords, map) {
		map.panTo(new L.LatLng(coords.lat, coords.lng), 5);
		var spot = addMarker(coords, map);
		spot.marker.on('dragend', function(event) {
			var marker = event.target;
			var coords = marker.getLatLng();
			$scope.selected.latitud = coords.lat;
			$scope.selected.longitud = coords.lng;
			$scope.$apply();
		});
		spot.marker.on('dragstart', function(event) {
			map.removeLayer(spot.circle);
		});
		$scope.spot = spot;
	};

	var clearMap = function(map) {
		if ($scope.spot != undefined) {
			map.removeLayer($scope.spot.marker);
			map.removeLayer($scope.spot.circle);
		}
	};

	var addCircle = function(coords, map) {
		var circle = L.circle(coords, 500000, {
			color : 'red',
			fillColor : '#f03',
			fillOpacity : 0.2,
			weight : 2
		}).addTo(map);
		return circle;
	};

	var addMarker = function(coords, map) {
		var marker = L.marker(coords, {
			draggable : true,
			riseOnHover : true
		}).addTo(map);
		var circle = addCircle(coords, map);
		return {
			'marker' : marker,
			'circle' : circle
		};
	};
});

app.controller('AddAsentamientoCtrl', function($scope, Country, Region, County,
		Vicinity, $log, $location, $timeout) {
	$scope.selected = {};
	$scope.coords = {};

	$scope.countries = [];
	$scope.pais = {};
	$scope.regions = [];

	$scope.regions = [];
	$scope.estado = {};
	$scope.counties = [];

	Country.list(1, function(data) {
		$scope.countries = data;
		$scope.pais = data[146];
	});

	$scope.paisChanged = function() {
		var key = $scope.pais.id;
		Region.search(key, function(data) {
			$scope.regions = data;
		});
	};

	Region.list(1, function(data) {
		$scope.regions = data;
		$scope.estado = data[0];
	});

	$scope.estadoChanged = function() {
		var key = $scope.estado.id;
		County.search(key, function(data) {
			$scope.counties = data;
		});
	};

	$scope.add = function() {
		$scope.selected.pais = $scope.pais;
		$scope.selected.estado = $scope.estado;
		$scope.selected.municipio = $scope.municipio;
		Vicinity.save($scope.selected, function(data) {
			$location.path("/admin/colonias");
		});

	};

	$scope.loadMap = function() {
		if (document.getElementById('map_gelocate')) {
			var coords = {
				lat : $scope.selected.latitud == undefined ? 0
						: $scope.selected.latitud,
				lng : $scope.selected.longitud == undefined ? 0
						: $scope.selected.longitud
			};
			$scope.coords = coords;
			$scope.map = mapConfig(coords, 5);

			$scope.$watchCollection('selected', function() {
				if ($scope.map != undefined) {
					var map = $scope.map;
					var coords = {
						lat : $scope.selected.latitud == undefined ? 0
								: $scope.selected.latitud,
						lng : $scope.selected.longitud == undefined ? 0
								: $scope.selected.longitud
					};
					$scope.coords = coords;
					clearMap(map);
					focusMap(coords, map);
				}
			});
		}
	};

	var focusMap = function(coords, map) {
		map.panTo(new L.LatLng(coords.lat, coords.lng), 5);
		var spot = addMarker(coords, map);
		spot.marker.on('dragend', function(event) {
			var marker = event.target;
			var coords = marker.getLatLng();
			$scope.selected.latitud = coords.lat;
			$scope.selected.longitud = coords.lng;
			$scope.$apply();
		});
		spot.marker.on('dragstart', function(event) {
			map.removeLayer(spot.circle);
		});
		$scope.spot = spot;
	};

	var clearMap = function(map) {
		if ($scope.spot != undefined) {
			map.removeLayer($scope.spot.marker);
			map.removeLayer($scope.spot.circle);
		}
	};

	var addCircle = function(coords, map) {
		var circle = L.circle(coords, 500000, {
			color : 'red',
			fillColor : '#f03',
			fillOpacity : 0.2,
			weight : 2
		}).addTo(map);
		return circle;
	};

	var addMarker = function(coords, map) {
		var marker = L.marker(coords, {
			draggable : true,
			riseOnHover : true
		}).addTo(map);
		var circle = addCircle(coords, map);
		return {
			'marker' : marker,
			'circle' : circle
		};
	};
});

app.controller('AddCalleCtrl', function($scope, Region, County, Vicinity,
		Street, $log, $location, $timeout) {
	$scope.selected = {};
	$scope.coords = {};

	$scope.regions = [];

	$scope.regions = [];
	$scope.estado = {};
	$scope.counties = [];

	$scope.municipio = {};
	$scope.vicinities = [];

	Region.list(1, function(data) {
		$scope.regions = data;
		$scope.estado = data[0];
		
	});

	$scope.estadoChanged = function() {
		var key = $scope.estado.id;
		County.search(key, function(data) {
			$scope.counties = data;
		});
	};

	County.list(1, function(data) {
		$scope.municipio = data[0];
	});

	$scope.municipioChanged = function() {
		var key = $scope.municipio.id;
		Vicinity.search(key, function(data) {
			$scope.vicinities = data;
		});
	};

	$scope.add = function() {
		$scope.selected.estado = $scope.estado;
		$scope.selected.municipio = $scope.municipio;
		$scope.selected.colonia = $scope.colonia;
		Street.save($scope.selected, function(data) {
			$location.path("/admin/calles");
		});
		$modalInstance.close( { calle: $scope.calle, update : true } );

	};

	$scope.loadMap = function() {
		if (document.getElementById('map_gelocate')) {
			var coords = {
				lat : $scope.selected.latitud == undefined ? 0
						: $scope.selected.latitud,
				lng : $scope.selected.longitud == undefined ? 0
						: $scope.selected.longitud
			};
			$scope.coords = coords;
			$scope.map = mapConfig(coords, 5);

			$scope.$watchCollection('selected', function() {
				if ($scope.map != undefined) {
					var map = $scope.map;
					var coords = {
						lat : $scope.selected.latitud == undefined ? 0
								: $scope.selected.latitud,
						lng : $scope.selected.longitud == undefined ? 0
								: $scope.selected.longitud
					};
					$scope.coords = coords;
					clearMap(map);
					focusMap(coords, map);
				}
			});
		}
	};

	var focusMap = function(coords, map) {
		map.panTo(new L.LatLng(coords.lat, coords.lng), 5);
		var spot = addMarker(coords, map);
		spot.marker.on('dragend', function(event) {
			var marker = event.target;
			var coords = marker.getLatLng();
			$scope.selected.latitud = coords.lat;
			$scope.selected.longitud = coords.lng;
			$scope.$apply();
		});
		spot.marker.on('dragstart', function(event) {
			map.removeLayer(spot.circle);
		});
		$scope.spot = spot;
	};

	var clearMap = function(map) {
		if ($scope.spot != undefined) {
			map.removeLayer($scope.spot.marker);
			map.removeLayer($scope.spot.circle);
		}
	};

	var addCircle = function(coords, map) {
		var circle = L.circle(coords, 500000, {
			color : 'red',
			fillColor : '#f03',
			fillOpacity : 0.2,
			weight : 2
		}).addTo(map);
		return circle;
	};

	var addMarker = function(coords, map) {
		var marker = L.marker(coords, {
			draggable : true,
			riseOnHover : true
		}).addTo(map);
		var circle = addCircle(coords, map);
		return {
			'marker' : marker,
			'circle' : circle
		};
	};
	
});


app.controller('AddCallePlanCtrl', function($scope, Region, County, Vicinity,
		Street, $log, $location, $timeout ) {
	$scope.selected = {};
	$scope.coords = {};

	$scope.regions = [];

	$scope.regions = [];
	$scope.estado = {};
	$scope.counties = [];

	$scope.municipio = {};
	$scope.vicinities = [];

	Region.list(1, function(data) {
		$scope.regions = data;
		$scope.estado = data[0];
		
	});

	$scope.estadoChanged = function() {
		var key = $scope.estado.id;
		County.search(key, function(data) {
			$scope.counties = data;
		});
	};

	County.list(1, function(data) {
		$scope.municipio = data[0];
	});

	$scope.municipioChanged = function() {
		var key = $scope.municipio.id;
		Vicinity.search(key, function(data) {
			$scope.vicinities = data;
		});
	};

	
	$scope.adds = function() {
		$scope.selected.estado = $scope.estado;
		$scope.selected.municipio = $scope.municipio;
		$scope.selected.colonia = $scope.colonia;
		Street.save($scope.selected, function(data) {
			$location.path("planning/planes/add/entregas");
		
	
		$modalInstance.close( { calle: $scope.calle, update : true } );			

		selectedEntity.direccion.direccion = selectedItem.calle.descripcion;
		selectedEntity.direccion.colonia = selectedItem.calle.colonia.descripcion;
		selectedEntity.direccion.asentamiento = selectedItem.calle.colonia;
			
		selectedEntity.direccion.calle = selectedItem.calle;
		selectedEntity.level = 'EXACT';
		
		});

	$scope.loadMap = function() {
		if (document.getElementById('map_gelocate')) {
			var coords = {
				lat : $scope.selected.latitud == undefined ? 0
						: $scope.selected.latitud,
				lng : $scope.selected.longitud == undefined ? 0
						: $scope.selected.longitud
			};
			$scope.coords = coords;
			$scope.map = mapConfig(coords, 5);

			$scope.$watchCollection('selected', function() {
				if ($scope.map != undefined) {
					var map = $scope.map;
					var coords = {
						lat : $scope.selected.latitud == undefined ? 0
								: $scope.selected.latitud,
						lng : $scope.selected.longitud == undefined ? 0
								: $scope.selected.longitud
					};
					$scope.coords = coords;
					clearMap(map);
					focusMap(coords, map);
				}
			});
		}
	};

	var focusMap = function(coords, map) {
		map.panTo(new L.LatLng(coords.lat, coords.lng), 5);
		var spot = addMarker(coords, map);
		spot.marker.on('dragend', function(event) {
			var marker = event.target;
			var coords = marker.getLatLng();
			$scope.selected.latitud = coords.lat;
			$scope.selected.longitud = coords.lng;
			$scope.$apply();
		});
		spot.marker.on('dragstart', function(event) {
			map.removeLayer(spot.circle);
		});
		$scope.spot = spot;
	};

	var clearMap = function(map) {
		if ($scope.spot != undefined) {
			map.removeLayer($scope.spot.marker);
			map.removeLayer($scope.spot.circle);
		}
	};

	var addCircle = function(coords, map) {
		var circle = L.circle(coords, 500000, {
			color : 'red',
			fillColor : '#f03',
			fillOpacity : 0.2,
			weight : 2
		}).addTo(map);
		return circle;
	};

	var addMarker = function(coords, map) {
		var marker = L.marker(coords, {
			draggable : true,
			riseOnHover : true
		}).addTo(map);
		var circle = addCircle(coords, map);
		return {
			'marker' : marker,
			'circle' : circle
		};
	}};
	});
	
app.controller(
		'ClientesCtrl',
		function($scope, $modal, $log, Client) {
			$scope.tblData = [];
			$scope.tblSelections = [];
			$scope.tblColumns = [
{ field: 'direccionPrincipal.direccion', displayName: 'Calle' },
{ field: 'direccionPrincipal.nexterior', displayName: 'Num. Exterior' },
{ field: 'direccionPrincipal.ninterior', displayName: 'Num. Interior' },
{ field: 'direccionPrincipal.colonia', displayName: 'Colonia' },
{ field: 'direccionPrincipal.codigopostal', displayName: 'Codigo Postal' },
{ field: 'enabled', displayName: 'Seleccionado', 
		cellTemplate: '<input type="checkbox" ng-model="row.entity.enabled">'},

];

			$scope.gridOptions = {
				data : 'tblData',
				columnDefs : 'tblColumns',
				selectedItems : $scope.tblSelections,
				multiSelect : false
			};
			Client.list(1, function(data) {
				$scope.tblData = data;
			});

		});

app.controller('AddClientCtrl', function($scope, Client,Address, Region, County, $log, $location, $timeout) {
	$scope.selected = {};
	
	$scope.regions = [];
	$scope.counties = [];

	$scope.municipio = [];
	$scope.estado = {};
	
	
	Region.list(1, function(data) {
		$scope.regions = data;
		$scope.estado = data;
		
	});

	$scope.regionChanged = function() {
		var key = $scope.estado.id;
		County.search(key, function(data) {
			$scope.counties = data;
		});
	};

	County.list(1, function(data) {
		$scope.municipio = data;
	});
	
	Client.list(1, function(data) {
		$scope.cliente = data;
	});

	
	$scope.add = function() {
				
		$scope.selected.clave;
		$scope.selected.nombre;
		$scope.selected.calle;
		$scope.selected.ninterior;
		$scope.selected.nexterior;
		$scope.selected.colonia;
		$scope.selected.codigopostal;
		$scope.selected.telefono;
		$scope.selected.estado = $scope.estado;
		$scope.selected.municipio = $scope.municipio;
		$scope.cliente;
		
		//
		Address.save($scope.selected, function(data) {
			
		});
		var key = $scope.address.id;
		$scope.cliente.direccion_id;
		Address.search(key, function(data) {
			$scope.client = data;
		});
	};
		 
		Client.save($scope.selected, function(data){
			$location.path("/admin/clientes");
			
		});
		
//	$scope.add = function () 
//	{
//		var address = $scope.selected.direccion;
//		
//		address.estado = $scope.estado;
//		address.municipio = $scope.municipio;
//		
//		address.asentamiento = {
//				estado : address.estado, 
//				municipio : address.municipio
//		};
//		
//	};
		

});



