var assert = require("assert"),
	Flavordb = require("../flavordb").Flavordb;

describe('Flavordb Client', function () {
  describe('#getProductCategoryById()', function () {
  	it('should get a product category without error', function (done) {
    	var fdb = new Flavordb();
    	fdb.getProductCategoryById(16).then(
    		function (product_category) {
    			if (product_category && product_category.name) {
    				done();
    			}
    		}
    	);
    });

    it('should get a product without error', function (done) {
    	var fdb = new Flavordb();
    	fdb.getProductById(16).then(
    		function (product) {
    			if (product && product.businessId) {
    				done();
    			}
    		}
    	);
    });

    it('should get a business without error', function (done) {
    	var fdb = new Flavordb();
    	fdb.getBusinessById(16).then(
    		function (business) {
    			if (business && business.productsResource) {
    				done();
    			}
    		}
    	);
    });


  });
})
