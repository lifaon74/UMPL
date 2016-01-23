
/**
	Arduino optimizer
**/

var _const = {};

_const.getConstvalue = function(search_const) {
	var subConst;
	for(subConstKey in this) {
		subConst = this[subConstKey];
		if(!_.isUndefined(subConst[search_const])) {
			return subConst[search_const];
		}
	}
};

_const.microcontrollers = _.enumerate([
	"ATMEGA328P",
	"ATMEGA32U4"
]);

_const.pinState = {
	"HIGH"	: 1 ,
	"LOW"	: 0
};



_const.pins = {
	"D0"	: 0 ,
	"D1"	: 1,
	"D2"	: 2,
	"D3"	: 3,
	"D4"	: 4,
	"D5"	: 5,
	"D6"	: 6,
	"D7"	: 7,
	"D8"	: 8,
	"D9"	: 9,
	"D10"	: 10,
	"D11"	: 11,
	"D12"	: 12,
	"D13"	: 13,
	
	"A0"	: 16,
	"A1"	: 17,
	"A2"	: 18,
	"A3"	: 19,
	"A4"	: 20,
	"A5"	: 21/*,
	"A6"	: 22,
	"A7"	: 23*/
};
	
	
	// use $globals to store variables through different levels
$globals._const = _const;




var ATMEGA328P = function() {
	var self = this;
	self._const = _const;
	
};

ATMEGA328P.prototype.functions = [];

/*ATMEGA328P.prototype.getCPPFunction = function(_function) {
	
	if(_.isString(_function.outside)) {
		string += _function.outside + "\n";
	}
		
	string += _function.returnType + " " + fncName + "(";
	for(var i = 0; i < 
		
	return string;
};*/

ATMEGA328P.prototype.getCPPFunctions = function() {
	var self = this;
	var string = "";
	for(var i = 0; i < self.functions.length; i++) {
		var fncName = self.functions[i];
		var fnc = self[fncName];
		
		if(fnc.storeRAM) {
			var values = "";
			for(var j = 0; j < fnc.cppStore.size[0]; j++) {
				if(j > 0) { values += ", "; }
				var prefix = fnc.cppStore.prefix || "";
				try {
					values += prefix + fnc.apply(self, [j]);
				} catch(error) {
					values += "NULL";
				}
			}
			
			string += fnc.cppStore.type + " " + fncName + "Array[] = { " + values + "};\n\n";	
		} else {
			string += self[fncName].cpp.trim() + "\n\n";	
		}
	}
	
	return string;
};

ATMEGA328P.prototype.setup = function(number) {
};


ATMEGA328P.prototype.convertNumberToByte = function(number) {
	if(number instanceof VString) {
		return number;
	} else {
		var bitString = "B";
		for(var i = 7; i >= 0; i--) {
			bitString += (number >> i) & 1;
		}
		return bitString;
	}
};

ATMEGA328P.prototype.invert = function(number) {
	if(_.isNumber(number)) {
		return (~number & 0b11111111);
	} else if(number instanceof VString) {
		return new VString("~(" + number.toString() + ")");
	} else {
		throw {
			message: "unknow number type",
			number: number
		};
	}
};

ATMEGA328P.prototype.tryToConvert = function(_var, type) {
	var self = this;
	
	if(_var instanceof VString) {
		return _var;
	} else if(_.isString(_var)) {
		_var = _const.getConstvalue(_var);
		if(_.isUndefined(_var)) {
			throw {
				message: "unknown constant",
				_var: _var
			};
		} else {
			return self.tryToConvert(_var, type);
		}
	} else {
		return _.convert(_var, type, function(_var, success) {
			if(success) {
				return _var;
			} else {
				throw {
					message: "unknown type",
					_var: _var
				};
			}
		});
	}
		
};



	// pinToPORTMask
ATMEGA328P.prototype.pinToPORTMask = function(pin) {
	var self	= this;
	var fnc		= arguments.callee;

	pin = self.tryToConvert(pin, "number");
	if(pin instanceof VString) {
		return new VString("(1 << (" + pin.toString() + " % 8))");
	} else {
		if((0 <= pin) && (pin < 8)) {
			return 1 << pin;
		} else if((8 <= pin) && (pin < 14)) {
			return 1 << (pin - 8);
		} else if((16 <= pin) && (pin < 22)) {
			return 1 << (pin - 16);
		} else {
			throw {
				message: "unknow pin number",
				pin: pin
			};
		}
	}
};


	// pinToPORT
ATMEGA328P.prototype.functions.push('pinToPORT');
ATMEGA328P.prototype.pinToPORT = function(pin) {
	var self	= this;
	var fnc		= arguments.callee;
	
	pin = self.tryToConvert(pin, "number");
	if(pin instanceof VString) {
		return new VString("*pinToPORTArray[" + pin.toString() + " / 8]");
	} else {
		if((0 <= pin) && (pin < 8)) {
			return "PORTD";
		} else if((8 <= pin) && (pin < 14)) {
			return "PORTB";
		} else if((16 <= pin) && (pin < 22)) {
			return "PORTC";
		} else {
			throw {
				message: "unknow pin number",
				pin: pin
			};
		}
	}
};

ATMEGA328P.prototype.pinToPORT.cpp = =%>
	volatile uint8_t * pinToPORTArray[] = { &PORTD, &PORTB, &PORTC }; // 6b in RAM, it's fine
<% ;


/*
	@8Mhz
	
	default:
		const, const	: 10.8µs
		const, var		:
		var, const		: 
		var, var		: 11.9µs
	
	optimized:
		const, const	: 1.2µs (cpp const : 2.3µs);
		const, var		:
		var, const		: 
		var, var		: 3.6µs
*/

ATMEGA328P.prototype.digitalWrite = function(pin, state) {
	var self = this;
	
	state = self.tryToConvert(state, "boolean");
	if(state instanceof VString) {
		return new VString(
			"if(" + state.toString() + ") {" +
				self.digitalWrite(pin, true) +
			"} else {" +
				self.digitalWrite(pin, false) +
			"}"
		);
	} else {
		if(state) {
			return self.pinToPORT(pin).toString() + " |= " + self.convertNumberToByte(self.pinToPORTMask(pin)).toString() + ";";
		} else {
			return self.pinToPORT(pin).toString() + " &= " + self.convertNumberToByte(self.invert(self.pinToPORTMask(pin))).toString() + ";";
		}
	}
};


$globals.ATMEGA328P = ATMEGA328P;
