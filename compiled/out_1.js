$buffer.push("\r\n\r\n");
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
		
		
		// use $compiler.globals to store variables through different levels
	$compiler.globals._const = _const;
$buffer.push("\r\n\r\n");
	
	/*var tools = require('tools');
	var _ = tools._;
	
	var _const = $compiler.globals._const;
	var ATMEGA328P = $compiler.globals.ATMEGA328P;*/
	
	
	var ATMEGA328P = function() {
		var self = this;
		self._const = _const;
		
		self.cpp_functions = {
			'pinToPORTMask':
				// this special close_tag will convert following text into string instead of outputting it into buffer
				"\r\n\t\t\t\t\tunsigned char pinToPORTMask(unsigned char pin) {\r\n\t\t\t\t\t\tif((0 <= pin) && (pin < 8)) {\r\n\t\t\t\t\t\t\treturn 1 << pin;\r\n\t\t\t\t\t\t} else if((8 <= pin) && (pin < 14)) {\r\n\t\t\t\t\t\t\treturn 1 << (pin - 8);\r\n\t\t\t\t\t\t} else if((16 <= pin) && (pin < 22)) {\r\n\t\t\t\t\t\t\treturn 1 << (pin - 16);\r\n\t\t\t\t\t\t} else {\r\n\t\t\t\t\t\t\treturn NULL;\r\n\t\t\t\t\t\t}\r\n\t\t\t\t\t};\r\n\t\t\t\t",
			'pinToPORT':
				"\r\n\t\t\t\t\tvolatile unsigned char * pinToPORT(unsigned char pin) {\r\n\t\t\t\t\t\tif((0 <= pin) && (pin < 8)) {\r\n\t\t\t\t\t\t\treturn &PORTD;\r\n\t\t\t\t\t\t} else if((8 <= pin) && (pin < 14)) {\r\n\t\t\t\t\t\t\treturn &PORTB;\r\n\t\t\t\t\t\t} else if((16 <= pin) && (pin < 22)) {\r\n\t\t\t\t\t\t\treturn &PORTB;\r\n\t\t\t\t\t\t} else {\r\n\t\t\t\t\t\t\treturn NULL;\r\n\t\t\t\t\t\t}\r\n\t\t\t\t\t};\r\n\t\t\t\t"
		};
	};
	
	ATMEGA328P.prototype.getCPPFunctions = function(number) {
		var self = this;
		var string = "";
		for(fnc in self.cpp_functions) {
			string += self.cpp_functions[fnc] + "\n";
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
		if(pin instanceof VString) {
			return new VString("pinToPORTMask(" + pin.toString() + ")");
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
	
	ATMEGA328P.prototype.pinToPORT = function(pin) {
		var self = this;
		
		pin = self.tryToConvert(pin, "number");
		if(pin instanceof VString) {
			return new VString("*pinToPORT(" + pin.toString() + ")");
		} else {
			if((0 <= pin) && (pin < 8)) {
				return "PORTD";
			} else if((8 <= pin) && (pin < 14)) {
				return "PORTB";
			} else if((16 <= pin) && (pin < 22)) {
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
		if(state instanceof VString) {
			return new VString(
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
	
	var microcontroller = new ATMEGA328P();$buffer.push("\r\n\r\n/*\r\nthree ways of writing the same function :\r\n\r\n\t\r\n\t" +  microcontroller.digitalWrite('D5', 'HIGH'));$buffer.push(" // giving D5 constant as a string\r\n\t" +  microcontroller.digitalWrite(_const.pins.D5, 'HIGH'));$buffer.push(" // giving D5 constant from the _const object\r\n\t" +  microcontroller.digitalWrite(5, 'HIGH'));$buffer.push(" // giving number 5 \r\n*/\r\n\r\n");
	// why UMPL is useful ? you'll see :
	
		// we define constants here and not in the C++ code
	var ledPin	= "D13";$buffer.push("\r\n\r\n" +  microcontroller.getCPPFunctions());$buffer.push("\r\n\r\n\r\n\t// the code inside of this function is strongly optimized\r\nvoid blink_fast() {\r\n\t" +  microcontroller.digitalWrite(ledPin, 'HIGH'));$buffer.push("\r\n\t" +  microcontroller.digitalWrite(ledPin, 'LOW'));$buffer.push("\r\n};\r\n\r\n\r\n#define LED_PIN 13\r\n\r\n\t// the code inside of this function is not optimized at the best because we use a C++ constant \r\nvoid blink_slow() {\r\n\t" +  microcontroller.digitalWrite(new VString('LED_PIN'), 'HIGH'));$buffer.push("\r\n\t" +  microcontroller.digitalWrite(new VString('LED_PIN'), 'LOW'));$buffer.push("\r\n};\r\n\r\n\t// the code inside of this function is the slowest, digitalWrite is provided by the Arduino IDE\r\nvoid blink_slower() {\r\n\tdigitalWrite(LED_PIN, HIGH);\r\n\tdigitalWrite(LED_PIN, LOW);\r\n};\r\n\r\n\r\nuint32_t time_0;\r\nuint32_t time_1;\r\n\r\nvoid setup() {\r\n\tSerial.begin(115200);\r\n\t\r\n\t");

		var exec_num = 100000;
		['blink_fast', 'blink_slow', 'blink_slower'].forEach(function(fnc) {
		$buffer.push("\r\n\t\t\t\r\n\t\t\t\ttime_0 = micros();\r\n\t\t\t\tfor(uint32_t i = 0; i < " +  exec_num);$buffer.push("; i++) {\r\n\t\t\t\t\t" +  fnc);$buffer.push("();\r\n\t\t\t\t}\r\n\t\t\t\t\r\n\t\t\t\ttime_1 = micros();\r\n\t\t\t\tSerial.print(\"" +  fnc);$buffer.push(" takes \");\r\n\t\t\t\tSerial.print(((float) (time_1 - time_0)) / " +  exec_num);$buffer.push(", DEC);\r\n\t\t\t\tSerial.println(\" microseconds\");\r\n\t\t\t");
		});
$buffer.push("\r\n}\r\n\r\n\r\nvoid loop() {\r\n\t\r\n}\r\n\r\n\r\n\t");