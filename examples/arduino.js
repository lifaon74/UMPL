<%+1000
	$compiler.bind('execute_loop', function() {
		if($compiler.loop > 100) {
			throw "security infinite loop break";
		}
	});
%>

<%
	/**
		Arduino optimizer
	**/
	
	var tools = require('tools');
	var _ = tools._;
	
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
	
	
	var RawCode = function(code) {
		this.code = code;
	};
	
	RawCode.prototype.toString = function() {
		return this.code;
	};
	
	var rawCode = function(code) {
		return new RawCode(code);
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
		
		"A0"	: 20,
		"A1"	: 21,
		"A2"	: 22,
		"A3"	: 23,
		"A4"	: 24,
		"A5"	: 25/*,
		"A6"	: 26,
		"A7"	: 27*/
	};
		
	$compiler.global._const = _const;
%>

<%	

	/*var tools = require('tools');
	var _ = tools._;
	
	var _const = $compiler.global._const;
	var ATMEGA328P = $compiler.global.ATMEGA328P;*/
	
	
	var ATMEGA328P = function() {
		var self = this;
		self._const = _const;
	};
	
	ATMEGA328P.prototype.setup = function(number) {
	};
	
	
	ATMEGA328P.prototype.convertNumberToByte = function(number) {
		if(number instanceof RawCode) {
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
		} else if(number instanceof RawCode) {
			return rawCode("~(" + number.toString() + ")");
		} else {
			throw {
				message: "unknow number type",
				number: number
			};
		}
	};
	
	ATMEGA328P.prototype.tryToConvert = function(_var, type) {
		var self = this;
		
		if(_var instanceof RawCode) {
			return _var;
		} else {
			switch(type) {
				case "number":
					if(_.isNumber(_var)) {
						return _var * 1;
					}
				break;
				case "bool":
					if(_.isBool(_var)) {
						return _var;
					} else if(_.isNumber(_var)) {
						return _var ? true : false;
					}
				break;
			}
			
			if(_.isString(_var)) {
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
				throw {
					message: "unknown type",
					_var: _var
				};
			}
		}
	};
	
	
	ATMEGA328P.prototype.pinToPORTMask = function(pin) {
		var self = this;
	
		pin = self.tryToConvert(pin, "number");
		if(pin instanceof RawCode) {
			return rawCode("pinToPORTMask(" + pin.toString() + ")");
		} else {
			if((0 <= pin) && (pin < 8)) {
				return 1 << pin;
			} else if((8 <= pin) && (pin < 14)) {
				return 1 << (pin - 8);
			} else if((20 <= pin) && (pin < 26)) {
				return 1 << (pin - 20);
			} else {
				throw {
					message: "unknow pin number",
					pin: pin
				};
			}
		}
	};
	
	ATMEGA328P.prototype.pinToPORT = function(pin) {
		var self = this;
		
		pin = self.tryToConvert(pin, "number");
		if(pin instanceof RawCode) {
			return rawCode("pinToPORT(" + pin.toString() + ")");
		} else {
			if((0 <= pin) && (pin < 8)) {
				return "PORTD";
			} else if((8 <= pin) && (pin < 14)) {
				return "PORTB";
			} else if((20 <= pin) && (pin < 26)) {
				return "PORTB";
			} else {
				throw {
					message: "unknow pin number",
					pin: pin
				};
			}
		}
	};
	
	
	ATMEGA328P.prototype.digitalWrite = function(pin, state) {
		var self = this;
		
		state = self.tryToConvert(state, "bool");
		if(state instanceof RawCode) {
			return rawCode(
				"(" + state.toString() + " ? " +
					"(" + self.pinToPORT(pin).toString() + " |= " + self.convertNumberToByte(self.pinToPORTMask(pin)).toString() + ")" + " : " +
					"(" + self.pinToPORT(pin).toString() + " &= " + self.convertNumberToByte(self.invert(self.pinToPORTMask(pin))).toString() + ")" +
				")"
			);
		} else {
			if(state) {
				return self.pinToPORT(pin).toString() + " |= " + self.convertNumberToByte(self.pinToPORTMask(pin)).toString() + ";";
			} else {
				return self.pinToPORT(pin).toString() + " &= " + self.convertNumberToByte(self.invert(self.pinToPORTMask(pin))).toString() + ";";
			}
		}
	};
	
	var microcontroller = new ATMEGA328P();
%>

/*
three ways of writing the same function :

	
	<%= microcontroller.digitalWrite('D5', 'HIGH') %> // giving D5 constant as a string
	<%= microcontroller.digitalWrite(_const.pins.D5, 'HIGH') %> // giving D5 constant from the _const object
	<%= microcontroller.digitalWrite(5, 'HIGH') %> // giving number 5 
*/

<%
	// why UMPL is useful ? you'll see :
	
		// we define constants here and not in the C++ code
	var ledPin	= "D13";
%>

	// the code inside of this function is strongly optimized
void blink_fast() {
	<%= microcontroller.digitalWrite(ledPin, 'HIGH') %>
	<%= microcontroller.digitalWrite(ledPin, 'LOW') %>
};


#define LED_PIN 13

	// the code inside of this function is not optimized at the best because we use a C++ constant 
void blink_slow() {
		// not finished
	//<%= microcontroller.digitalWrite(rawCode('LED_PIN'), 'HIGH') %>
	//<%= microcontroller.digitalWrite(rawCode('LED_PIN'), 'LOW') %>
};

	// the code inside of this function is the slowest, digitalWrite is provided by the Arduino IDE
void blink_slower() {
	digitalWrite(LED_PIN, HIGH);
	digitalWrite(LED_PIN, LOW);
};


uint32_t time_0;
uint32_t time_1;

void setup() {
	Serial.begin(115200);
	
	<%

		var exec_num = 100000;
		['blink_fast', 'blink_slow', 'blink_slower'].forEach(function(fnc) {
			%>
			
				time_0 = micros();
				for(uint32_t i = 0; i < <%= exec_num %>; i++) {
					<%= fnc %>();
				}
				
				time_1 = micros();
				Serial.print("<%= fnc %> takes ");
				Serial.print(((float) (time_1 - time_0)) / <%= exec_num %>, DEC);
				Serial.println(" microseconds");
			<%
		});
	%>
}


void loop() {
	
}
	