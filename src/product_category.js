(function () {

	var _ = require("underscore");

	var BaseObject =	require("./base_object").BaseObject,
		Product = 		require("./product").Product;

	var product_category_objects = {};
	
	var ProductCategory = BaseObject.extend({
		construct: function (data) {
			arguments.callee.$.construct.call(this, data);	
		}
	});
	
	ProductCategory.getOrCreate = function (data, client) {
		var product_category = product_category_objects[data.id];
		if (!product_category) {
			product_category = new ProductCategory(data);
			product_category.client = client;	
			product_category_objects[data.id] = product_category;
		}
		return product_category;
	};
	
	ProductCategory.count = function () {
		return _.keys(product_category_objects).length;
	};

	ProductCategory.prototype.getProducts = function () {
		return this.client.findProducts({product_category_id: this.id});
	};

	ProductCategory.prototype.getParentCategory = function () {
		return this.parentCategoryId ? this.client.getProductCategoryById(this.parentCategoryId) : nil;
	}

	exports.ProductCategory = ProductCategory;

}());