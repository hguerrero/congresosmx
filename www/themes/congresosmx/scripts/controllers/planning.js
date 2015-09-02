'use strict';

var app = angular.module('webappApp');

app.controller('PlanesCtrl', function ($scope, Plan, $log, $location) {
	$scope.tblData = [];
	$scope.tblSelections = [];
	$scope.tblColumns = [{ field: 'clave', displayName: 'Clave' },
	                     { field: 'descripcion', displayName: 'Descripcion' },
	                     { field: 'empresa.descripcion', displayName: 'Empresa' },
	                     { field: 'fecha', displayName: 'Fecha de Entregas', cellFilter: "date:'dd-MMM-yyyy'" },
	                     { displayName: 'Acciones', 
	                    	 cellTemplate: 
	                     '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" ><i tooltip="Editar" tooltip-append-to-body="true" class="glyphicon glyphicon-pencil"></i></button>' + 
	                     '<button id="listBtn" type="button" class="btn btn-info" ng-click="listEntity(row.entity)" ><i tooltip="Entregas" tooltip-append-to-body="true" class="glyphicon glyphicon-list-alt"></i></button>' + 
	                     '<button id="unitsBtn" type="button" class="btn btn-info" ng-click="unitEntity(row.entity)" ><i tooltip="Unidades" tooltip-append-to-body="true" class="glyphicon glyphicon-plane"></i></button>' +
	                     '<button id="routeBtn" type="button" class="btn btn-warning" ng-click="routeEntity(row.entity)" ><i tooltip="Planificar" tooltip-append-to-body="true" class="glyphicon glyphicon-cog"></i></button>'}];


	$scope.gridOptions = { data: 'tblData', 
			columnDefs: 'tblColumns',
			selectedItems: $scope.tblSelections,
			multiSelect: false };
	
	$scope.add = function() {
		Plan.plan = { entregas : [] };
		$location.path("/planning/planes/add");
	};

	$scope.unitEntity = function(entity) {
		Plan.plan = entity;
		$location.path("/planning/planes/" + entity.id + "/unidades");
	};
	
	$scope.routeEntity = function(entity){
		Plan.plan = entity;
		Plan.route(entity.id, function(data){
			Plan.plan.paths = data;
			$location.path("/planning/planes/" + entity.id + "/rutas");
		});
	};

	$scope.listEntity = function(entity) {
		Plan.plan = entity;
		Plan.deliveries(entity.id, function(data){
			Plan.plan.entregas = data;
			$location.path("/planning/planes/" + entity.id + "/entregas");
		});
	};	

	$scope.editEntity = function(entity) {
		Plan.plan = entity;
		Plan.deliveries(entity.id, function(data){
			Plan.plan.entregas = data;
			$location.path("/planning/planes/" + entity.id + "/edit");
		});
	};
	
	Plan.list(1, function(data) {
		$scope.tblData = data;
	});
});

app.controller('PlanCtrl', function ($scope, Plan, Company, $log) {
	$scope.selected = Plan.plan;
	if ($scope.selected.id){
		$scope.editing = true;
	}
	$scope.companies = [];

	Company.list(1, function(data) {
		$scope.companies = data;
		if ($scope.selected.empresa) {
			$scope.selected.empresa = _.find($scope.companies, function (company) {
				return company.id === $scope.selected.empresa.id;
			});
		}
		else if ($scope.companies.length == 1) {
			$scope.selected.empresa = $scope.companies[0];
		}
	});

	$scope.save = function () {
//		Plan.save($scope.selected, function(data) {
////			$scope.tblData = data;
//		});
	};

	$scope.today = function() {
		$scope.selected.fecha = new Date();
	};
	$scope.today();

	$scope.clear = function () {
		$scope.selected.fecha = null;
	};

	$scope.minDate = new Date();

	$scope.maxDate = new Date();
	$scope.maxDate.setFullYear($scope.maxDate.getFullYear() + 3);

	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		$scope.opened = true;
	};

	$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
	};
});

app.controller('EntregasCtrl', function ($scope, Plan, Client, $log, $location, $modal, Street) {
	$scope.plan = Plan.plan;	
	if ($scope.plan.id){
		$scope.editing = true;
	}

	$scope.tblData = $scope.plan.entregas ? $scope.plan.entregas : [];
	$scope.tblSelections = [];
	$scope.tblColumns = [{ field: 'cliente.clave', displayName: 'Num. Cliente' },
	                     { field: 'cliente.nombre', displayName: 'Cliente' },
	                     { displayName: 'Nivel Confianza', cellTemplate: 
	                     '<div class="{{\'custom \' + levelLabel(row.entity.level)}}"><div class="ngCellText">{{row.entity.level}}</div></div>'},
	                     { field: 'direccion.direccion', displayName: 'Calle' },
	                     { field: 'direccion.nexterior', displayName: 'Num. Exterior' },
	                     { field: 'direccion.ninterior', displayName: 'Num. Interior' },
	                     { field: 'direccion.colonia', displayName: 'Colonia' },
	                     { field: 'direccion.codigopostal', displayName: 'Codigo Postal' },

	                     { displayName: 'Acciones', 
	                    	 cellTemplate: 
	                     '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row)" ><i class="glyphicon glyphicon-pencil"></i></button>' + 
	                     '<button id="geoBtn" type="button" class="btn btn-info" ng-click="geoEntity(row.entity)" ><i class="glyphicon glyphicon-globe"></i></button>' + 
	                     '<button id="delBtn" type="button" class="btn btn-danger" ng-click="delEntity(row.entity)" ><i class="glyphicon glyphicon-trash"></i></button>'}];


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
	
	$scope.submit = function() {
		Plan.save($scope.plan, function(data) {
			$location.path("/planning/planes");
		});
	};
	
	$scope.delEntity = function(entity) {
		var entregas = $scope.plan.entregas;
		$scope.plan.entregas = _.without(entregas, entity);
		$scope.tblData = $scope.plan.entregas;
	};
	
	$scope.editEntity = function(entity) {
		$location.path("/planning/planes/" + ($scope.editing ? $scope.plan.id : 'add') + "/entregas/" + entity.rowIndex + "/edit");
	};
	
	$scope.geoEntity = function(entity) {
		var selectedEntity = entity;
		var modalInstance = $modal.open({
			templateUrl: 'views/planes/localizar.tpl.html',
			controller: 'LocateCtrl',
			size: 'lg',
			resolve: {
				item: function () {
					return angular.copy(selectedEntity);
				}
			}
		});
		modalInstance.result.then(function (selectedItem) {
			if (selectedItem.update) {
				selectedEntity.direccion.direccion = selectedItem.calle.descripcion;
				selectedEntity.direccion.colonia = selectedItem.calle.colonia.descripcion;
			}
			selectedEntity.direccion.calle = selectedItem.calle;
			selectedEntity.direccion.asentamiento = selectedItem.calle.colonia;
			selectedEntity.direccion.latitud = selectedItem.coords.lat;
			selectedEntity.direccion.longitud = selectedItem.coords.lng;
			selectedEntity.level = 'EXACT';
		}, function () {
			$log.info('Modal dismissed at: ' + new Date());
		});	
	};
	
});

app.controller('EntregaCtrl', function ($scope, Plan, Client, Address, Region, County, $log, $location, $routeParams) {
	$scope.plan = Plan.plan;
	$scope.selected = $scope.plan.entregas[$routeParams.id];
	if ($scope.selected) {
		$scope.estado = $scope.selected.direccion.estado;
		$scope.municipio = $scope.selected.direccion.municipio;
		$scope.editing = true;
	}

	$scope.regions = [];
	$scope.counties = [];

	Region.list(1, function(data) {
		$scope.regions = data;
		if ($scope.estado) {
			$scope.estado = _.find($scope.regions, function (region) {
				return region.descripcion === $scope.estado.descripcion;
			});
			$scope.regionChanged();
		}
	});

	$scope.regionChanged = function() {
		var key = $scope.estado.id;
		County.search(key, function(data) {
			$scope.counties = data;
			if ($scope.editing) {
				$scope.municipio = _.find($scope.counties, function (county) {
					return county.descripcion === $scope.municipio.descripcion;
				});
			}
		});
	};
	
	$scope.$watchCollection('selected.cliente.clave', function(newValue, oldValue) {
		if (newValue === oldValue) return;
		
		var client = $scope.selected.cliente;
		
		if (client && client.clave) {
			Client.validate(client, function(data){
				if (data.trustLevel === 'EXACT') {
					$scope.cliente = data.matches[0];				
				}
			});			
		}
	});
	
	$scope.add = function () 
	{
		var address = $scope.selected.direccion;
		
		address.estado = $scope.estado;
		address.municipio = $scope.municipio;
		
		address.asentamiento = {
				estado : address.estado, 
				municipio : address.municipio
		};
		
		Address.validate(address, function(data){
			$scope.selected.level = data.trustLevel;
			$scope.selected.matches = data.matches;
			if (!$scope.editing) {
				$scope.plan.entregas.push($scope.selected);				
			}
			$location.path("/planning/planes/" + ($scope.plan.id ? $scope.plan.id : 'add') + "/entregas");
		});		
	};
	
		$scope.add1 = function(entity) {
			var selectedEntity = entity;
			var modalInstance = $modal.open({
				templateUrl: 'views/cliente/buscar.html',
				controller: 'EntregasCtrl',
				size: 'lg',
				resolve: {
					item: function () {
						return angular.copy(selectedEntity);
					}
				}
			});
			$log.info('Modal dismissed at: ' + new Date());
		};

	
	$scope.tblData = $scope.selected;
	$scope.tblSelections = [];
	$scope.tblColumns = [{ field: 'descripcion', displayName: 'Num Clinte' },
	                     { field: 'colonia.descripcion', displayName: 'Nombre Cliente' },
	                     ];

	$scope.gridOptions = { data: 'tblData', 
			columnDefs: 'tblColumns',
			selectedItems: $scope.tblSelections,
			multiSelect: false };

	$scope.direccion = {};

	$scope.$watchCollection('tblSelections', function() {
		if ($scope.tblSelections[0]) {
			$scope.direccion = $scope.tblSelections[0];
		}
	});
	
	$scope.tblData = $scope.selected;
	$scope.tblSelections = [];
	$scope.tblColumns = [{ field: 'descripcion', displayName: 'Dirección' },
	                     { field: 'colonia.descripcion', displayName: 'Estatus' },
	                     {
	                    	 displayName : 'Acciones',
							cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" >Edit</button> ',
							width : 'auto'
						} ];

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
});


app.controller('LocateCtrl', function ($scope, Address, $window, $modalInstance, $modal, item, Plan) {
	$scope.selected = item;
	
	$scope.tblData = $scope.selected.matches;
	$scope.tblSelections = [];
	$scope.tblColumns = [{ field: 'descripcion', displayName: 'Calle' },
	                     { field: 'colonia.descripcion', displayName: 'Colonia' },
	                     { field: 'municipio.descripcion', displayName: 'Municipio' },
	                     { field: 'estado.descripcion', displayName: 'Estado' },
	                     { field: 'colonia.codigopostal', displayName: 'Codigo Postal' }];

	$scope.gridOptions = { data: 'tblData', 
			columnDefs: 'tblColumns',
			selectedItems: $scope.tblSelections,
			multiSelect: false };

	// Validate addresses again if no matches loaded
	if ($scope.selected.matches === undefined || $scope.selected.matches.length === 0) 
	{
		Address.validate($scope.selected.direccion, function(data){
			$scope.selected.level = data.trustLevel;
			$scope.selected.matches = data.matches;
			$scope.tblData = $scope.selected.matches;
		});
	}

	$scope.calle = {};

	$scope.$watchCollection('tblSelections', function() {
		if ($scope.tblSelections[0]) {
			$scope.calle = $scope.tblSelections[0];
			$scope.coords = convertCoords($scope.calle);
		}
	});
	
	$scope.coords = convertCoords($scope.selected.direccion);

	$scope.submit = function () {
		var result = { calle: $scope.calle, coords: $scope.coords, update : false } ;

		var resp = $window.confirm( "¿Desea ocupar los datos de la calle selecionada?" );
		if (resp) {
			result.update = true;
		}

		$modalInstance.close( result );			
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.loadMap = function() {
		if (document.getElementById('map_gelocate')) {
			var coords = convertCoords($scope.calle.id ? $scope.calle : $scope.selected.direccion);
		
			$scope.coords = coords;
			
			if ($scope.map === undefined) {
				$scope.map = mapConfig(coords, 16);				
			}
		
			$scope.$watchCollection('calle', function() {
				if ($scope.map != undefined) {
					var map = $scope.map;
					var coords = convertCoords($scope.calle.id ? $scope.calle : $scope.selected.direccion);
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

app.controller('ArchivoCtrl', function ($scope, $upload, $timeout, $log) {
	$scope.progress = 0;
	$scope.onFileSelect = function($files) {
		$scope.selectedFiles = [];
		$scope.progress = [];
		if ($scope.upload && $scope.upload.length > 0) {
			for (var i = 0; i < $scope.upload.length; i++) {
				if ($scope.upload[i] != null) {
					$scope.upload[i].abort();
				}
			}
		}
		$scope.upload = [];
		$scope.uploadResult = [];
		$scope.selectedFiles = $files;
		$scope.dataUrls = [];
		for (var i = 0; i < $files.length; i++) {
			var $file = $files[i];
			if ($scope.fileReaderSupported && $file.type.indexOf('image') > -1) {
				var fileReader = new FileReader();
				fileReader.readAsDataURL($files[i]);
				var loadFile = function(fileReader, index) {
					fileReader.onload = function(e) {
						$timeout(function() {
							$scope.dataUrls[index] = e.target.result;
						});
					};
				};
				loadFile(fileReader, i);
			}
			$scope.progress[i] = -1;
		}
	};
	$scope.start = function(index) {
		$scope.progress[index] = 0;
		$scope.errorMsg = null;
		$scope.upload[index] = $upload.upload({
			url: 'upload',
			method: 'POST',
			file: $scope.selectedFiles[index]
		}).progress(function(evt) {
			$scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
			console.log('percent: ' + $scope.progress[index]);
		}).success(function(data, status, headers, config) {
			// file is uploaded successfully
			$timeout(function() {
				$scope.uploadResult.push(data);
			});
			console.log(data);
		});
	};
});

app.controller('RutasCtrl', function ($scope, Plan, $log, $location) {
	$scope.plan = Plan.plan;
	
	$scope.paths = $scope.plan.paths;
	
	$scope.route = $scope.paths[0];
	$scope.distance = createDistanceString($scope.route.distance);
	$scope.time = createTimeString($scope.route.time);	
	
	$scope.vehicleChanged = function() {
		$scope.distance = createDistanceString($scope.route.distance);
		$scope.time = createTimeString($scope.route.time);	
		mapPath($scope.route);
	};
	
	var loadMap = function() {
		if (document.getElementById('map_gelocate')) {
			var coords = retrieveCoords($scope.selected);
			$scope.coords = coords;
			$scope.map = mapConfig(coords, 14);

			mapPath($scope.route);

//			$scope.$watchCollection('selected', function() {
//				if ($scope.map != undefined) {
//					var map = $scope.map;
//					var coords = retrieveCoords($scope.selected);
//					$scope.coords = coords;
//					clearMap(map);
//					focusMap(coords, map);
//				}
//			});
		}
	};
	
	var mapPath = function(path) {
		var geojsonFeature = path.points;
		
		if ($scope.routingLayer) {
			$scope.map.removeLayer($scope.routingLayer);
		}

		$scope.routingLayer = L.geoJson(geojsonFeature, {  
			onEachFeature: function (feature, layer) {
			    // does this feature have a property named popupContent?
			    if (feature.properties && feature.properties.popupContent) {
			        layer.bindPopup(feature.properties.popupContent);
			    }
			}
		}).addTo($scope.map);			

		$scope.routingLayer.addData(path.customers);
		
		var bounds = {
				minLon: path.bbox[0],
                minLat: path.bbox[1],
                maxLon: path.bbox[2],
                maxLat: path.bbox[3]
		};
		
		$scope.map.fitBounds(new L.LatLngBounds(new L.LatLng(bounds.minLat, bounds.minLon),
	            new L.LatLng(bounds.maxLat, bounds.maxLon)));
	};

	$scope.$on('$viewContentLoaded', loadMap);
});


app.controller('VehiculosCtrl', function ($scope, Plan, Unit, $log, $location) {
	$scope.plan = Plan.plan;	
	if ($scope.plan.id){
		$scope.editing = true;
	}

	$scope.tblData = $scope.plan.unidades ? $scope.plan.unidades : [];
	$scope.tblSelections = [];
	$scope.tblColumns = [{ field: 'enabled', displayName: 'Seleccionado', 
							cellTemplate: '<input type="checkbox" ng-model="row.entity.enabled">'},
	                     { field: 'clave', displayName: 'Clave' },
	                     { field: 'cubicaje', displayName: 'Cubicaje' },
	                     { field: 'marca.descripcion', displayName: 'Marca' },
	                     { field: 'tipoCaja.descripcion', displayName: 'Tipo Caja' },
	                     { field: 'zona.descripcion', displayName: 'Zona' },
	                     { field: 'encierro.descripcion', displayName: 'Encierro' }];


	$scope.gridOptions = { data: 'tblData', 
			columnDefs: 'tblColumns',
			selectedItems: $scope.tblSelections,
			multiSelect: false };
	
	Unit.list(1, function(data) {
		data.forEach(function(element){
			if ($scope.tblData.length > 0) {
				var item = _.find($scope.tblData, function (unidad) {
					return unidad.id === element.id;
				});
				element.enabled = item ? true : false;
			}
			else {
//				element.enabled = true;
			}
		});			
		$scope.tblData = data;
	});

	$scope.save = function () {
		$scope.plan.unidades = $scope.tblData.filter(function (unidad){
			return unidad.enabled;
		});
		Plan.save($scope.plan, function(data) {
			$location.path("/planning/planes");
		});
	};


});

app.controller('AddCallePlanCtrl', function($scope, Region, County, Vicinity,
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
			$location.path("#/planning/planes/1/entregas");
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

app.controller('ClienteCtrl', function ($scope, Client, $log, $modal) {
$scope.tblData = [];
	
	$scope.tblSelections = [];
	$scope.tblColumns = [{ field: 'clave', displayName: 'Num Cliente' },
	                     { field: 'nombre', displayName: 'Nombre Cliente' },
	                     ];
	
	
	$scope.clients = [];
	$scope.cliente = {};
	
	Client.list(1, function(data) {
		$scope.tblData = data;;
	});
	
	$scope.gridOptions = { data: 'tblData', 
			columnDefs: 'tblColumns',
			selectedItems: $scope.tblSelections,
			multiSelect: false };
	
	
	
	
});

//$scope.tblData = $scope.selected;
//
//$scope.tblData = $scope.selected;
//$scope.tblSelections = [];
//$scope.tblColumns = [{ field: 'descripcion', displayName: 'Dirección' },
//                     { field: 'colonia.descripcion', displayName: 'Estatus' },
//                     {
//                    	 displayName : 'Acciones',
//						cellTemplate : '<button id="editBtn" type="button" class="btn btn-primary" ng-click="editEntity(row.entity)" >Edit</button> ',
//						width : 'auto'
//					} ];
//
//$scope.gridOptions = { data: 'tblData', 
//		columnDefs: 'tblColumns1',
//		selectedItems: $scope.tblSelections,
//		multiSelect: false };
//
//$scope.calle = {};
//
//
//
//
//
//$scope.add1 = function(entity) {
//	var selectedEntity = entity;
//	var modalInstance = $modal.open({
//		templateUrl: 'views/cliente/buscar.html',
//		controller: 'ClienteCtrl',
//		size: 'lg',
//		resolve: {
//			item: function () {
//				return angular.copy(selectedEntity);
//			}
//		}
//	});
//		$log.info('Modal dismissed at: ' + new Date());
//};
