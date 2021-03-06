var fs 		= require("fs");
var path 	= require('path');

Object.prototype.toString = function() {
	return JSON.stringify(this);
};

Array.prototype.last = function(index) {
	index = index || -1;
	return this[this.length - index];
};

/*Object.prototype.each = function(f) {
	for(var prop in this) {
		var value = this[prop]
		f.call(value, prop, value) // calls f(prop, value), this=value
	}
};*/


String.eol = "\n";

String.tab = function(tab) {
	var str = "";
	for(var i = 0; i < tab; i++) { str += "\t"; }
	return str
};
			
String.prototype.escapeSpecialChars = function() {
	return JSON.stringify(this);
};

String.prototype.elegantLineBreak = function() {
	var str = (new RegExp("(\\\\r?\\\\n)((?:\\\\t)*)", "g")).replace(this, function(match) {
		var eol = "\"\\n\"";
		//var eol = "String.eol";
		var tabs = (new RegExp("\\\\t", "g")).replace(match.variables[1], "\t");
		//var tabs = "String.tab(" + (new RegExp("\\\\t", "g")).matchAll(match.variables[1]).length + ")";
		
		return "\" + " + eol + " + \n" + tabs + "\"" + match.variables[1] + "";
	});
	
	//str = (new RegExp(RegExp.quote('""') + "([^\\+])\\+", "g")).replace(str, "");
		
	return str;
};

String.prototype.tab = function() {
	return "\t" + ((new RegExp("(\r?\n)", "g")).replace(this, "$1\t"));
};



var Timer = function() {
	this.clear();	
};

Timer.prototype.diff = function() {
	var diff = process.hrtime(this.time);
	return diff[0] * 1e9 + diff[1];
};

Timer.prototype.disp = function(string) {
	console.log(string + " " + (this.diff() / 1e6) + "ms");
};

Timer.prototype.clear = function() {
	this.time = process.hrtime();	
};


var time_this = function(callback) {
	callback(new Timer());
};

/*time_this(function(timer) {
	var t = (new Date()).getTime();
	while(((new Date()).getTime() - t) < 1000) {
	};
	
	timer.disp("took");
});*/

/*var createClass = function(_classFunction, _className) {
	var _classWrapper = function() {
		var self = this;
		_classFunction.apply(self, arguments);
	};
	
	_classWrapper.name = _className;
	
	_classWrapper.parents = [];
	_classWrapper.extend = function() {
		for(var i = 0; i < arguments.length; i++) {
			var _parentClass = arguments[i];
			if(typeof _parentClass.name != 'undefined') {
				_classWrapper.parents[_parentClass.name] = _parentClass;
			}
			
			for(var elt in _parentClass.prototype) {
				_classWrapper.prototype[elt] = _parentClass.prototype[elt];
			}
		}
		
		return this;
	};
	
	_classWrapper.prototype.new = function() {
		return new _classWrapper();
	};

	return _classWrapper;
};*/

var createClass = function(_classFunction, _className) {
	_classFunction.name = _className;
	
	_classFunction.parents = [];
	_classFunction.extend = function() {
		for(var i = 0; i < arguments.length; i++) {
			var _parentClass = arguments[i];
			if(typeof _parentClass.name != 'undefined') {
				_classFunction.parents[_parentClass.name] = _parentClass;
			}
			
			var propertiesName;
			for(var propertiesName in _parentClass.prototype) {
				_classFunction.prototype[propertiesName] = _parentClass.prototype[propertiesName];
			}
		}
		
		return this;
	};
	
	/*_classFunction.extendNative = function() {
		for(var i = 0; i < arguments.length; i++) {
			var _parentClass = arguments[i];
			var properties = Object.getOwnPropertyNames(_parentClass.prototype)
			
			var propertiesName;
			var i = properties.length;
			for(var in properties) {
				_classFunction.prototype[propertiesName] = _parentClass.prototype[propertiesName];
			}
		}
		
		return this;
	};*/
	
	
	_classFunction.prototype.new = function() {
		return new _classFunction();
	};

	return _classFunction;
};


var BindClass = function() {
	this._binds = [];
};

BindClass.prototype.bind = function(eventName, callback) {
	var self = this;

	if(!(callback instanceof Function)) { return; }
				
	if(typeof self._binds[eventName] == 'undefined') {
		self._binds[eventName] = [];
	}
	
	var bind = {
		eventName	: eventName,
		callback	: callback
	};
	
	self._binds[eventName].push(bind);
	
	if(eventName != 'bind') {
		self.trigger('bind', bind);
	}
	
	return bind;
};

BindClass.prototype.unbind = function(eventName) {
	var self = this;

	if(typeof eventName == "string") {
		if(typeof self._binds[eventName] != 'undefined') {
			for(var i = 0; i < self._binds[eventName].length; i++) {
				self.trigger('unbind', self._binds[eventName][i]);
			}
			delete self._binds[eventName];
		}
	} else { // passed a bind object
		var bind = eventName;
		for(var i = 0; i < self._binds[bind.eventName].length; i++) {
			if(self._binds[bind.eventName][i] == bind) {
				self.trigger('unbind', self._binds[bind.eventName][i]);
				self._binds[bind.eventName].splice(i, 1);
			}
		}
	}
	
	return self;
};

BindClass.prototype.trigger = function(eventName, params) {
	var self = this;
	
	if(typeof params == 'undefined') {
		var params =  [];
	}
	
	
	if(typeof self._binds[eventName] != 'undefined') {
		for(var i = 0; i < self._binds[eventName].length; i++) {
			self._binds[eventName][i].callback.apply(this, params);
		}
	}
	
	if(self['on' + eventName] instanceof Function) {
		self['on' + eventName].apply(this, params);
	}
	
	return self;
};
	
	
	
fs.recursiveExploration = function(_path, callback, fileFirst) {
	if(typeof fileFirst == 'undefined') { fileFirst = true; }
	try {
		var stats = fs.statSync(_path);
	} catch(e) {
		return;
	}
	
	var _return;
	
	if(stats.isDirectory()) {
		_path = path.norm(_path, true);
		var elements = fs.readdirSync(_path);
		var i = elements.length;
		
		if(!fileFirst) {
			_return = callback(_path, stats, fileFirst);
		}
		
		while(i-- > 0) {
			if(fs.recursiveExploration(_path + elements[i], callback) == false) {
				break;
			}
		}
		
		if(fileFirst) {
			_return = callback(_path, stats, fileFirst);
		}
	} else if(stats.isFile()) {
		_path = path.norm(_path, false);
		_return = callback(_path, stats, fileFirst);
	}
	
	return _return;
};

fs.recursiveRemove = function(_path) {
	return fs.recursiveExploration(_path, function(_path, stats) {
		if(stats.isDirectory()) {
			fs.rmdirSync(_path);
			return true;
		} else if(stats.isFile()) {
			fs.unlinkSync(_path);
			return true;
		}
	});
};
	
	
path.norm = function(_path, isDir) {
	_path = path.normalize(_path);
	
	_path = _path.replace(/\\|\//g, path.sep);
	if(isDir) {
		if(_path[_path.length - 1] != path.sep) {
			_path += path.sep;
		}
	}
	
	return _path;
};

path.fileName = function(_path) {
	return path.basename(_path).replace(/([^\.]+)\.[^\.]+$/g, '$1');

};

	
var _ = {};

_.isUndefined = function(_var) {
	return (_var === void 0);
};

_.isNull = function(_var) {
	return (_var === null);
};

_.isBoolean = function(_var) {
	return (typeof _var == "boolean");
};

_.isString = function(_var) {
	return (typeof _var == "string");
};

_.isNumber = function(_var, strict) {
	if(strict) {
		return (typeof _var == "number");
	} else {
		return !isNaN(_var);
	}
};

_.isArray = function(_var) {
	return (_var instanceof Array);
	// return toString.call(_var) === '[object Array]';
};

_.convert = function(_var, type, callback) {
	if(typeof callback == 'undefined') {
		callback = function(_var, success) {
			return _var;
		};
	} else if(typeof callback != 'function') {
		var _defautValue = callback;
		callback = function(_var, success) {
			if(success) {
				return _var;
			} else {
				return _defautValue;
			}
		};
	}
	
	switch(type) {
		case 'boolean':
			switch(typeof _var) {
				case 'boolean':
					return callback(_var, true);
				break;
				case 'number':
					return callback((_var ? true : false), true);
				break;
				case 'string':
					if(_var == "true" || _var == "1") {
						return callback(true, true);
					} else if(_var == "false" || _var == "1") {
						return callback(false, true);
					} else {
						return callback(_var, false);
					}
				break;
			}
		break;
		case 'number':
			switch(typeof _var) {
				case 'boolean':
					return callback((_var ? 1 : 0), true);
				break;
				case 'number':
					return callback(_var, true);
				break;
				case 'string':
					var _float = parseFloat(_var);
					if(isNaN(_float)) {
						return callback(_var, false);
					} else {
						return callback(_float, true);
					}
				break;
			}
		break;
		case 'string':
			if((typeof _var != 'undefined') && (typeof _var.toString == 'function')) {
				return callback(_var.toString(), true);
			} else {
				return callback(_var, false);
			}
		break;	
	}
	
	return callback(_var, false);
};

 _.enumerate = function(constArray) {
	var constObj = {};
	
	var j = 0;
	var _const;
	for(var i = 0; i < constArray.length; i++) {
		_const = constArray[i];
		if(_.isArray(_const)) {
			j = _const[1];
			_const = _const[0];
		}
		
		constObj[_const] = j++;
	}
	
	return constObj;
};
			

_.closure = function(callback, args, separateArgs) {
	if(!_.isArray(args)) { args = [args]; }
	if(!_.isBoolean(separateArgs)) { var separateArgs = false; }
	
	return function() {
		if(separateArgs) {
			return callback.apply(this, [arguments, args]);
		} else {
			var _args = [];

			var i = arguments.length;
			while(i-- > 0) {
				_args.push(arguments[i]);
			}
			
			i = args.length;
			while(i-- > 0) {
				_args.push(args[i]);
			}
			
			return callback.apply(this, _args);
		}
		
		
	};
};
	
	
/***
	VString
***/

var VString = createClass(function(string) {
	string = string || "";
	this.set(string);
	
	var self = this;
	Object.defineProperty(this, "length", {
		get : function() { return self.string.length; },
		set : function() { return -1; },
		enumerable : true,
		configurable : true
	});
							   
}, "String");

(function() {
	var properties = Object.getOwnPropertyNames(String.prototype)		
	var propertiesName;
	var i = properties.length;
	while(i-- > 0) {
		propertyName = properties[i];
		VString.prototype[propertyName] = _.closure(function(defaultArgs, closureArgs) {
			var property = closureArgs[0];
			
			var result = property.apply(this.string, defaultArgs);
			if(_.isString(result)) {
				return new VString(result);
			} else {
				return result;
			}
		}, [String.prototype[propertyName]], true);
	}
})();

VString.prototype.push = function(string) {
	this.string		+= string.toString();
	return this;
};

VString.prototype.set = function(string) {
	this.string		= string.toString();
	return this;
};

VString.prototype.get = function() {
	return this.string;
};

VString.prototype.toString = function() {
	return this.string;
};


module.exports = {
  BindClass: BindClass,
  createClass: createClass,
  Timer: Timer,
  VString: VString,
  _: _,
  fs: fs,
  path: path
};