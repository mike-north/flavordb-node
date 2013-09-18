var assert = require("assert"),
	should = require("should"),
	Flavordb = require("../src/flavordb").Flavordb;

var Product =		require("../src/product").Product,
	Business = 		require("../src/business").Business,
	ProductCategory=require("../src/product_category").ProductCategory;
var fdb = new Flavordb();

describe('ProductCategory', function () {
	
	describe('##count()', function () {
		it('should get the number of products in existence', function (done) {
			var old_count = ProductCategory.count();
			fdb.getProductCategoryById(16).then(
				function (product_category) {
					var new_count = ProductCategory.count();
					(new_count - old_count).should.eql(1)
					done();
				}
			);
		});
	});

	describe('caching', function () {
		it('should return cached objects if they\'re already in memory', function (done) {
			fdb.getProductCategoryById(16).then(
				function () {
					var old_count = ProductCategory.count();
					fdb.getProductCategoryById(16).then(
						function (product_category) {
							var new_count = ProductCategory.count();
							(new_count - old_count).should.eql(0) 
							done();
						}
					);	
				}
			);
			
		});
	});

	describe('#getProducts()', function () {
		it('should return a list of products for the category', function (done) {
			fdb.getProductCategoryById(1).then(
				function (product_category) {
					product_category.getProducts().then(
						function (products) {
							should.exist(products);
							done();
						}
					);	
				}
			);
			
		});
	});

	describe('#getParentCategory()', function () {
		it('should return the parent category', function (done) {
			fdb.getProductCategoryById(16).then(
				function (product_category) {
					product_category.getParentCategory().then(
						function (parent_category) {
							should.exist(parent_category);
							parent_category.should.be.an.instanceof(ProductCategory);
							parent_category.id.should.eql(product_category.parentCategoryId);
							done();
						}
					);	
				}
			);
			
		});
	});

	
	
	
})
