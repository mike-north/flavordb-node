(function () {

	var _ = require("underscore");

	var BaseObject =	require("./base_object").BaseObject,
		Product = 		require("./product").Product,
		ProductCategory=require("./product_category").ProductCategory;

	var business_objects = {};
	
	var Business = BaseObject.extend({
		construct: function (data) {
			arguments.callee.$.construct.call(this, data);	
		}
	});
	
	Business.count = function () {
		return _.keys(business_objects).length;
	};

	Business.getOrCreate = function (data, client) {
		var business = business_objects[data.id];
		if (!business) {
			business = new Business(data);			
			business.client = client;
			business_objects[data.id] = business;
		}
		return business;
	};

	Business.prototype.getProducts = function () {
		return this.client.findProducts({business_id: this.id});
	};
	
	exports.Business = Business;

}());