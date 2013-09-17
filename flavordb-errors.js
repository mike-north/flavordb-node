(function() {

	"use strict";

	function APIError (message) {
		this.name = "APIError";
		this.message = message;	
	}

	APIError.prototype = new Error;

	function InvalidAPICredentialsError (message) {
		this.name = "InvalidAPICredentialsError";
		this.message = message;
	}

	InvalidAPICredentialsError.prototype = new APIError;
	
	InvalidAPICredentialsError.prototype.toString = function () {
		return "[" + this.name + "]: " + this.message;
	}

	exports.InvalidAPICredentialsError = InvalidAPICredentialsError;
	exports.APIError = APIError;
}());