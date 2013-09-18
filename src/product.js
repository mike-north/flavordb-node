(function () {

	var _ = require("underscore"),
		Q = require("q");

	var BaseObject =	require("./base_object").BaseObject,
		Business = 		require("./business").Business,
		ProductCategory=require("./product_category").ProductCategory;
	
	var product_objects = {};
	
	var Product = BaseObject.extend({
		construct: function (data) {
			arguments.callee.$.construct.call(this, data);
		}
	});

	Product.count = function () {
		return _.keys(product_objects).length;
	};

	Product.getOrCreate = function (data, client) {
		var product = product_objects[data.id];
		if (!product) {
			product = new Product(data);
			product.client = client;	
			product_objects[data.id] = product;
		}
		return product;
	};

	Product.prototype.getBusiness = function () {
		return this.businessId ? this.client.getBusinessById(this.businessId) : null;
	}
	Product.prototype.getProductCategory = function () {
		return this.productCategoryId ? this.client.getProductCategoryById(this.productCategoryId) : null;
	}

	exports.Product = Product;
}());