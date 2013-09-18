var assert = require("assert"),
	should = require("should"),
	Flavordb = require("../src/flavordb").Flavordb;

var Product =		require("./../src/product").Product,
	Business = 		require("./../src/business").Business,
	ProductCategory=require("./../src/product_category").ProductCategory;

var fdb = new Flavordb();

describe('Flavordb Product', function () {
	
	describe('##count()', function () {
		it('should get the number of products in existence', function (done) {
			var old_count = Product.count();
			fdb.getProductById(16).then(
				function (product) {
					var new_count = Product.count();
					(new_count - old_count).should.eql(1)
					done();
				}
			);
		});
	});

	describe('caching', function () {
		it('should return cached objects if they\'re already in memory', function (done) {
			fdb.getProductById(16).then(
				function () {
					var old_count = Product.count();
					fdb.getProductById(16).then(
						function (product) {
							var new_count = Product.count();
							(new_count - old_count).should.eql(0)
							done();
						}
					);	
				}
			);
			
		});
	});

	describe('#getBusiness', function () {
		it('should return the business', function (done) {
			fdb.getProductById(16).then(
				function (product) {
					product.getBusiness().then(
						function (business) {
							should.exist(business);
							business.id.should.eql(product.businessId);
							done();
						}
					);	
				}
			);
			
		});
	});

	describe('#getProductCategory', function () {
		it('should return the product category', function (done) {
			fdb.getProductById(1234).then(
				function (product) {

					product.getProductCategory().then(
						function (product_category) {
							should.exist(product_category);
							product_category.id.should.eql(product.productCategoryId);
							done();
						}
					);	
				}
			);
			
		});
	});
	
	
})
