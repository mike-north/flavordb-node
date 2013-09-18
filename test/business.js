var assert = require("assert"),
	should = require("should"),
	Flavordb = require("../src/flavordb").Flavordb;

var Product =		require("../src/product").Product,
	Business = 		require("../src/business").Business,
	ProductCategory=require("../src/product_category").ProductCategory;

var fdb = new Flavordb();

describe('Business', function () {
	
	describe('##count()', function () {
		it('should get the number of products in existence', function (done) {
			var old_count = Business.count();
			fdb.getBusinessById(16).then(
				function (product_category) {
					var new_count = Business.count();
					(new_count - old_count).should.eql(1);
					done();
				}
			);
		});
	});

	describe('caching', function () {
		it('should return cached objects if they\'re already in memory', function (done) {
			fdb.getBusinessById(16).then(
				function () {
					var old_count = Business.count();
					fdb.getBusinessById(16).then(
						function (product_category) {
							var new_count = Business.count();
							(new_count - old_count).should.eql(0);
							done();
						}
					);	
				}
			);
			
		});
	});

	describe('#getProducts', function () {
		it('should return an array of products', function (done) {
			fdb.getBusinessById(155).then(
				function (business) {
					business.getProducts().then(
						function (products) {
							should.exist(products);
							products[0].should.be.an.instanceof(Product);
							done();
						}
					);	
				}
			);
			
		});
	});
	
	
})
