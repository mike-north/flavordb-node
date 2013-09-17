var assert = require("assert"),
	fdb_models =	require("../flavordb-models"),
	Flavordb = require("../flavordb").Flavordb;

var Product = fdb_models.Product,
	Business = fdb_models.Business,
	ProductCategory = fdb_models.ProductCategory;

var fdb = new Flavordb();

describe('Flavordb Client', function () {
	
	describe('#getProductCategoryById()', function () {
		it('should get a specific product category with the correct id', function (done) {
			
			fdb.getProductCategoryById(16).then(
				function (product_category) {
					if (product_category && product_category instanceof ProductCategory && product_category.id === 16) {
						done();
					}
				}
			);
		});
	});
	
	describe('#getProductById()', function () {
	    it('should get a product with the correct id', function (done) {
	    	fdb.getProductById(16).then(
	    		function (product) {
	    			if (product && product instanceof Product && product.id === 16) {
	    				done();
	    			}
	    		}
	    	);
	    });
    });

	describe('#getBusinessById()', function () {
	    it('should get a business with the correct id', function (done) {
	    	fdb.getBusinessById(16).then(
	    		function (business) {
	    			if (business && business instanceof Business && business.id === 16) {
	    				done();
	    			}
	    		}
	    	);
	    });
    });

    describe('#findBusinesses()', function () {
	    it('should find businesses by name', function (done) {
	    	fdb.findBusinesses({q: 'Stone'}).then(
	    		function (businesses) {
	    			if (businesses instanceof Array && businesses[0] instanceof Business) {
	    				done();
	    			}
	    		}
	    	);
	    });
    });

    describe('#findProducts()', function () {
	    it('should find products by name', function (done) {
	    	fdb.findProducts({q: 'Moon'}).then(
	    		function (products) {
	    			if (products instanceof Array && products[0] instanceof Product) {
	    				done();
	    			}
	    		}
	    	);
	    });
    });

    describe('#findProductCategories()', function () {
	    it('should find product categories by name', function (done) {
	    	fdb.findProductCategories({q: 'Ale'}).then(
	    		function (product_categories) {
	    			if (product_categories instanceof Array && product_categories[0] instanceof ProductCategory) {
	    				done();
	    			}
	    		}
	    	);
	    });
    });
})
