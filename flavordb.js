(function () {

	"use strict";

	var restler = 		require("restler"),
		Q = 			require("q"),
		U = 			require("underscore"),
		winston = 		require("winston"),
		fdb_errors = 	require("./flavordb-errors"),
		fdb_models =	require("./flavordb-models");


	var InvalidAPICredentialsError = fdb_errors.InvalidAPICredentialsError,
		APIError = fdb_errors.APIError,
		Product = fdb_models.Product,
		Business = fdb_models.Business,
		ProductCategory = fdb_models.ProductCategory;

	var OAUTH_URL = "http://www.flavordb.com/oauth/token",
		API_ENDPOINT = "http://api.flavordb.com/api/v1",
		API_KEY = process.env['FLAVORDB_API_KEY'],
		API_SECRET = process.env['FLAVORDB_API_SECRET'];

	var logger = new (winston.Logger)({
	    transports: [
	      new (winston.transports.Console)({ level: 'info' })
	    ]
	});
	
	function FlavordbClient () {
		this.api_token = null;

		this.getOAuthAccessToken = function () {
			var deferred = Q.defer();
			
			if (false) {
				deferred.resolve(this.api_token);
			}
			else {
				logger.info("Getting OAuth Token...");
				restler.post(OAUTH_URL, {
					data: {
						client_id: API_KEY,
						client_secret: API_SECRET,
						grant_type: 'client_credentials'
					}
				}).once("complete", function (data, response) {
					if (data['error']) {
						deferred.reject(new InvalidAPICredentialsError(data['error_description']));
					}
					else {
						this.api_token = data['access_token'];
						logger.info("received API token \t" + this.api_token);
						deferred.resolve(this.api_token);	
					}
				}).once("fail", function (data, response) {
					deferred.reject(new Error("Failed to get OAuth token"));
				});
			}
			return deferred.promise;	
		};
	}
	
	FlavordbClient.prototype = new Object;

	FlavordbClient.prototype.getResourceByURI = function (uri) {
		var deferred = Q.defer();

		var resourceUrl = /^http:\/\//.test(uri) ? uri : (API_ENDPOINT + uri);

		this.getOAuthAccessToken().then(
			function (token) {
				logger.info("GET", {url: resourceUrl});
				restler.get(resourceUrl, {
					data: {
						access_token: token
					}
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

	FlavordbClient.prototype.getProductCategoryById = function (id) {
		var deferred = Q.defer();
		this.getResourceByURI("/product_categories/" + id).then(
			function (data) {
				var product_category = new ProductCategory(data);
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
				var product = new Product(data);
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
				var business = new Business(data);
				deferred.resolve(business);
			},
			function (error) {
				logger.error(error.toString());
				deferred.reject(error);
			});
		return deferred.promise;
	};


	exports.Flavordb = FlavordbClient;

}());