(function () {

	"use strict";

	var http = 			require("http"),
		url = 			require("url"),
		querystring =	require("querystring"),
		Q = 			require("q"),
		U = 			require("underscore"),
		winston = 		require("winston"),
		fdb_errors = 	require("./flavordb-errors"),
		Product =		require("./product").Product,
		Business = 		require("./business").Business,
		ProductCategory=require("./product_category").ProductCategory;


	var InvalidAPICredentialsError = fdb_errors.InvalidAPICredentialsError,
		APIError = fdb_errors.APIError;

	var OAUTH_PATH = "/oauth/token",
		API_ENDPOINT = "http://api.flavordb.com/api/v1";

	var logger = new (winston.Logger)({
	    transports: [
	      new (winston.transports.Console)({ level: 'warn' })
	    ]
	});
	
	function FlavordbClient (opts) {

		var options = opts || {};
		
		var api_token = null;


		var api_key = options.api_key || process.env['FLAVORDB_API_KEY'];
		var api_secret = options.api_secret || process.env['FLAVORDB_API_SECRET'];

		logger.info("API Credentials Found", {
			key: api_key ? (api_key.substring(0, 20) + '...') : '--NO VALUE-',
			secret: api_secret ? (api_secret.substring(0, 20) + '...') : '--NO VALUE-'
		});

		function getOAuthAccessToken () {
			var deferred = Q.defer();

			if(api_key == null || api_secret == null) {
				deferred.reject(new Error("API Credentials are missing!\n\t"));
			}
			
			if (api_token) {
				deferred.resolve(api_token);
			}
			else {
				logger.info("Getting OAuth Token...");

				var oauth_param_data = querystring.stringify({
					client_id: api_key,
					client_secret: api_secret,
					grant_type: 'client_credentials'
				});
				
				var oauth_token_request = http.request({
					hostname: 'www.flavordb.com',
					port: 80,
					path: OAUTH_PATH,
					method: 'POST'
				}, function(res) {
					res.setEncoding('utf8');
					
					var server_response_data = '';
					
					res.on('data', function (chunk) {
						server_response_data += chunk;
					});
					
					res.on('end', function () {
						var data = JSON.parse(server_response_data);
						if (data['error']) {
							deferred.reject(new InvalidAPICredentialsError(data['error_description']));
						}
						else {
							api_token = data['access_token'];
							logger.info("received API token \t" + api_token);
							deferred.resolve(api_token);	
						}	
					});
				});

				oauth_token_request.on('error', function(e) {
					deferred.reject(new InvalidAPICredentialsError('problem with request: ' + e.message));
				});

				// write data to request body
				oauth_token_request.write(oauth_param_data);

				oauth_token_request.end()

			}
			return deferred.promise;	
		};

		this.getResourceByURI = function (uri, args) {
			var deferred = Q.defer();

			var search_args = args || {};

			var resourceUrl = /^http:\/\//.test(uri) ? uri : (API_ENDPOINT + uri);

			getOAuthAccessToken().then(
				function (token) {
					var url_params = search_args;
					
					logger.info("GET", {url: resourceUrl, params: url_params});

					var url_as_hash = url.parse(resourceUrl);
					url_as_hash.headers = {
						'Authorization': "Bearer " + token
					};
					url_as_hash.query = url_params;
										
					http.get(url_as_hash, function (res) {
						var server_response_data = '';
						res.on('data', function (chunk) {
							server_response_data += chunk;
						});
						res.on('end', function () {
							var api_data = JSON.parse(server_response_data);
							deferred.resolve(api_data.data);
						});
					}).on('error', function (e) {
						deferred.reject(new APIError("Couldn't retrieve object at url '" + resourceUrl + "'"));
					});
					
				},
				function (error) {
					deferred.reject(error);
				}
			);

			return deferred.promise;
		};
	}
	
	FlavordbClient.prototype = new Object;

	FlavordbClient.prototype.getProductCategoryById = function (id) {
		var deferred = Q.defer(),
			client = this;
		this.getResourceByURI("/product_categories/" + id).then(
			function (data) {
				var product_category = ProductCategory.getOrCreate(data, client);
				deferred.resolve(product_category);
			},
			function (error) {
				logger.error(error.toString());
				deferred.reject(error);
			});
		return deferred.promise;
	};

	FlavordbClient.prototype.getProductById = function (id) {
		var deferred = Q.defer(),
			client = this;
		this.getResourceByURI("/products/" + id).then(
			function (data) {
				var product = Product.getOrCreate(data, client);
				deferred.resolve(product);
			},
			function (error) {
				logger.error(error.toString());
				deferred.reject(error);
			});
		return deferred.promise;
	};

	FlavordbClient.prototype.getBusinessById = function (id) {
		var deferred = Q.defer(),
			client = this;

		this.getResourceByURI("/businesses/" + id).then(
			function (data) {
				var business = Business.getOrCreate(data, client);
				deferred.resolve(business);
			},
			function (error) {
				logger.error(error.toString());
				deferred.reject(error);
			});
		return deferred.promise;
	};

	FlavordbClient.prototype.findBusinesses = function (search_params) {
		var deferred = Q.defer(),
			client = this;
		this.getResourceByURI("/businesses", search_params).then(
			function (data) {
				var businesses = [];
				for (var i in data) {
					businesses.push(Business.getOrCreate(data[i], client));
				}
				deferred.resolve(businesses);
			},
			function (error) {
				logger.error(error.toString());
				deferred.reject(error);
			});
		return deferred.promise;
	};

	FlavordbClient.prototype.findProducts = function (search_params) {
		var deferred = Q.defer(),
			client = this;
		this.getResourceByURI("/products", search_params).then(
			function (data) {
				var products = [];
				for (var i in data) {
					products.push(Product.getOrCreate(data[i], client));
				}
				deferred.resolve(products);
			},
			function (error) {
				logger.error(error.toString());
				deferred.reject(error);
			});
		return deferred.promise;
	};

	FlavordbClient.prototype.findProductCategories = function (search_params) {
		var deferred = Q.defer(),
			client = this;
		this.getResourceByURI("/product_categories", search_params).then(
			function (data) {
				var product_categories = [];
				for (var i in data) {
					product_categories.push(ProductCategory.getOrCreate(data[i], client));
				}
				deferred.resolve(product_categories);
			},
			function (error) {
				logger.error(error.toString());
				deferred.reject(error);
			});
		return deferred.promise;
	};


	exports.Flavordb = FlavordbClient;

}());