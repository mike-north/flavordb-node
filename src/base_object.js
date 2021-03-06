(function () {

	var _ = require("underscore");

	function Class() { }
	
	Class.prototype.construct = function() {};
	
	Class.extend = function(def) {
		var classDef = function() {
			if (arguments[0] !== Class) {
				this.construct.apply(this, arguments);
			}
		};
	 
	  	var proto = new this(Class);
	  	var superClass = this.prototype;

	  	for (var n in def) {
	  		var item = def[n];
	  		if (item instanceof Function)
	  			item.$ = superClass;
	  		proto[n] = item;
	  	}

	  	classDef.prototype = proto;

	  	//Give this new class the same static extend method

	  	classDef.extend = this.extend;
	  	return classDef;
	};


	var BaseObject = Class.extend({
		construct: function (data) {
			_.extend(this, data);	
		}
	});

	exports.BaseObject = BaseObject;

}());