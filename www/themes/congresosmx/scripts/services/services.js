var app = angular.module('webappApp.services',[]);

app.factory('Results', ['$resource', function($resource){
	return $resource("application/services/loader/results",{});
}]);

app.factory('Application', ['$resource', function($resource){
	return {
		logout: function(callback) {
			var api = $resource("application/services/logout/",{});

			api.query({}, function(response){
				callback(response);
			});
		}
	};
}]);


app.factory('Country', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/country/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
		save: function(data, callback) {
			var api = $resource("application/admin/country/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Region', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/region/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
		
		search: function(id, callback) {
			var api = $resource("application/admin/region/country/:key", { key : id });

			api.query({}, function(response){
				callback(response);
			});
		},
				
		save: function(data, callback) {
			var api = $resource("application/admin/region/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);


app.factory('County', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/county/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},

		search: function(id, callback) {
			var api = $resource("application/admin/county/region/:key", { key : id });

			api.query({}, function(response){
				callback(response);
			});
		},
				
		save: function(data, callback) {
			var api = $resource("application/admin/county/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Vicinity', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/vicinity/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
				
		search: function(text, callback) {
			var api = $resource("application/admin/vicinity/:desc", { desc : text });

			api.query({}, function(response){
				callback(response);
			});
		},
		
		search: function(id, callback) {
			var api = $resource("application/admin/vicinity/county/:key", { key : id });

			api.query({}, function(response){
				callback(response);
			});
		},
		
					
		save: function(data, callback) {
			var api = $resource("application/admin/vicinity/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Street', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/street/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
		
		search: function(id, callback) {
			var api = $resource("application/admin/street/vicinity/:key", { key : id });

			api.query({}, function(response){
				callback(response);
			});
		},
		
		save: function(data, callback) {
			var api = $resource("application/admin/street/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Unit', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/units/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
				
		save: function(data, callback) {
			var api = $resource("application/admin/units/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Brand', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/brands/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
				
		save: function(data, callback) {
			var api = $resource("application/admin/brands/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Zone', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/zones/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
				
		save: function(data, callback) {
			var api = $resource("application/admin/zones/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Deposit', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/deposits/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
				
		save: function(data, callback) {
			var api = $resource("application/admin/deposits/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Client', ['$resource', function($resource){
	return {
		validate: function(client, callback) {
			var api = $resource("application/planner/client/validate",{});

			api.save(client, function(response){
				callback(response);
			});
		},

		list: function(status, callback) {
			var api = $resource("application/planning/client/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
				
		save: function(data, callback) {
			var api = $resource("application/planning/client/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Plan', ['$resource', function($resource){
	return {
		plan: { entregas : [] },
		
		route: function(id, callback) {
			var api = $resource("application/planner/route");
			
			api.query( { "planId" : id }, function(response){
				callback(response);
			});
		},
		
		list: function(status, callback) {
			var api = $resource("application/planner/plan/");

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
				
		deliveries: function(id, callback) {
			var api = $resource("application/planner/plan/:planId/entregas");

			api.query( { "planId" : id }, function(response){
				callback(response);
			});
		},
				
		save: function(data, callback) {
			var api = $resource("application/planner/plan/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Box', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/boxes/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
				
		save: function(data, callback) {
			var api = $resource("application/admin/boxes/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Company', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/companies/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
				
		save: function(data, callback) {
			var api = $resource("application/admin/companies/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Branch', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/branches/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
				
		save: function(data, callback) {
			var api = $resource("application/admin/branches/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Brandcomp', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/brandscomp/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
				
		save: function(data, callback) {
			var api = $resource("application/admin/brandscomp/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
	};
}]);

app.factory('Address', ['$resource', function($resource){
	return {
		validate: function(address, callback) {
			var api = $resource("application/planner/address/validate",{});

			api.save(address, function(response){
				callback(response);
			});
		}
	};
}]);

app.factory('Client', ['$resource', function($resource){
	return {
		list: function(status, callback) {
			var api = $resource("application/admin/clients/",{});

			api.query({ "status" : status }, function(response){
				callback(response);
			});
		},
		
		search: function(clave, callback) {
			var api = $resource("application/admin/clients/clave/:clave", {});

			api.get({ "clave" : clave}, function(response){
				callback(response);
			});
		},
		
		save: function(data, callback) {
			var api = $resource("application/admin/clients/",{});

			api.save(data, function(value, response){
				api.query(function(response){
					callback(response);
				});
			});
		}
		
	};
	
}]);
//app.factory('Client', ['$resource', function($resource){
//	return {
//		validate: function(client, callback) {
//			var api = $resource("application/planner/client/validate",{});
//
//			api.save(client, function(response){
//				callback(response);
//			});
//		},
//
//		list: function(status, callback) {
//			var api = $resource("application/planning/client/",{});
//
//			api.query({ "status" : status }, function(response){
//				callback(response);
//			});
//		},
//				
//		save: function(data, callback) {
//			var api = $resource("application/planning/client/",{});
//
//			api.save(data, function(value, response){
//				api.query(function(response){
//					callback(response);
//				});
//			});
//		}
//	};
//}]);