(function () {

	"use strict";

	var restler = 		require("restler"),
		Q = 			require("q"),
		U = 			require("underscore"),
		winston = 		require("winston"),
		fdb_errors = 	require("./flavordb-errors"),
		Product =		require("./product").Product,
		Business = 		require("./business").Business,
		ProductCategory=require("./product_category").ProductCategory;


	var InvalidAPICredentialsError = fdb_errors.InvalidAPICredentialsError,
		APIError = fdb_errors.APIError;

	var OAUTH_URL = "http://www.flavordb.com/oauth/token",
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
			
			if (false) {
				deferred.resolve(api_token);
			}
			else {
				logger.info("Getting OAuth Token...");
				restler.post(OAUTH_URL, {
					data: {
						client_id: api_key,
						client_secret: api_secret,
						grant_type: 'client_credentials'
					}
				}).once("complete", function (data, response) {
					if (data['error']) {
						deferred.reject(new InvalidAPICredentialsError(data['error_description']));
					}
					else {
						api_token = data['access_token'];
						logger.info("received API token \t" + api_token);
						deferred.resolve(api_token);	
					}
				}).once("fail", function (data, response) {
					deferred.reject(new Error("Failed to get OAuth token"));
				});
			}
			return deferred.promise;	
		};

		this.getResourceByURI = function (uri, args) {
			var deferred = Q.defer();

			var search_args = args || {};

			var resourceUrl = /^http:\/\//.test(uri) ? uri : (API_ENDPOINT + uri);

			getOAuthAccessToken().then(
				function (token) {
					logger.info("GET", {url: resourceUrl});
					restler.get(resourceUrl, {
					
						data: U.extend({ access_token: token}, search_args)
					
					}).once("complete", function (api_data, response) {
						deferred.resolve(api_data.data);
					}).once("fail", function (api_data, response) {
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
		var deferred = Q.defer();
		this.getResourceByURI("/product_categories/" + id).then(
			function (data) {
				var product_category = ProductCategory.getOrCreate(data, this);
				deferred.resolve(product_category);
			},
			function (error) {
				logger.error(error.toString());
				deferred.reject(error);
			});
		return deferred.promise;
	};

	FlavordbClient.prototype.getProductById = function (id) {
		var deferred = Q.defer();
		this.getResourceByURI("/products/" + id).then(
			function (data) {
				var product = Product.getOrCreate(data, this);
				deferred.resolve(product);
			},
			function (error) {
				logger.error(error.toString());
				deferred.reject(error);
			});
		return deferred.promise;
	};

	FlavordbClient.prototype.getBusinessById = function (id) {
		var deferred = Q.defer();
		this.getResourceByURI("/businesses/" + id).then(
			function (data) {
				var business = Business.getOrCreate(data, this);
				deferred.resolve(business);
			},
			function (error) {
				logger.error(error.toString());
				deferred.reject(error);
			});
		return deferred.promise;
	};

	FlavordbClient.prototype.findBusinesses = function (search_params) {
		var deferred = Q.defer();
		this.getResourceByURI("/businesses", search_params).then(
			function (data) {
				var businesses = [];
				for (var i in data) {
					businesses.push(Business.getOrCreate(data[i], this));
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
		var deferred = Q.defer();
		this.getResourceByURI("/products", search_params).then(
			function (data) {
				var products = [];
				for (var i in data) {
					products.push(Product.getOrCreate(data[i], this));
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
		var deferred = Q.defer();
		this.getResourceByURI("/product_categories", search_params).then(
			function (data) {
				var product_categories = [];
				for (var i in data) {
					product_categories.push(ProductCategory.getOrCreate(data[i], this));
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