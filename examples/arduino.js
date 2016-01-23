<%+1000

		// here I put a security : if we loop more than 1000 times, we stop all
	$compiler.bind('execute_loop', function() {
		if($compiler.loop > 100) {
			throw "security infinite loop break";
		}
	});
	
	var tools = require('tools');
		// use $scope to have the variable _ on all the following loops, this way, it's possible to require just one time 'tools'
	$scope['_'] = tools._;
%>

<%
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

%>

<%
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
	
	var microcontroller = new ATMEGA328P();
	
	var raw = function(string) {
		return new VString(string);
	};
%>

/*
three ways of writing the same function :

	
	<%= microcontroller.digitalWrite('D5', 'HIGH') %> // giving D5 constant as a string
	<%= microcontroller.digitalWrite(_const.pins.D5, 'HIGH') %> // giving D5 constant from the _const object
	<%= microcontroller.digitalWrite(5, 'HIGH') %> // giving number 5 
*/

<%
	/**
		Why UMPL is useful ? you'll see :
	**/
	
		// we define constants here and not in the C++ code
	var ledPin	= "D13";
%>

	// we need it a the beginning of our program to setup some functions
<%= microcontroller.getCPPFunctions() %>


	// the code inside of this function is strongly optimized
void blink_fast() { // 2.4µs @8Mhz > 1.2µs / write
	<%= microcontroller.digitalWrite(ledPin, 'HIGH') %>
	<%= microcontroller.digitalWrite(ledPin, 'LOW') %>
};


#define LED_PIN 13

	// the code inside of this function is not optimized at the best because we use a C++ constant 
void blink_slow() { // 4.5µs @8Mhz > 2.3µs / write
	<%= microcontroller.digitalWrite(raw('LED_PIN'), raw('HIGH')) %>
	<%= microcontroller.digitalWrite(raw('LED_PIN'), raw('LOW')) %>
};

	// the code inside of this function is the slowest, digitalWrite is provided by the Arduino IDE
void blink_slower() { // 21.6µs @8Mhz  > 10.8µs / write
	digitalWrite(LED_PIN, HIGH);
	digitalWrite(LED_PIN, LOW);
};


/**
	The following code can't be optimized by the c++ compiler, so it will only show the arduino.js optimizations.
**/

void blink_fast_2() { // 94.7µs @8Mhz > 3.6µs / write
	for(uint8_t i = 0; i < 13; i++) {
		for(uint8_t j = 0; j < 2; j++) {
			<%= microcontroller.digitalWrite(raw('i'), raw('j')) %>
		}
	}
};

void blink_slower_2() { // 309.2µs @8Mhz > 11.9µs / write
	for(uint8_t i = 0; i < 13; i++) {
		for(uint8_t j = 0; j < 2; j++) {
			digitalWrite(i, j);
		}
	}
};


/**
	Verdict : if you use arduino.js methods instead of native Arduino IDE function,
	you'll reduce a least the process time by 3.3 and at the best 9 times faster !
	Worth it no ?
**/



uint32_t time_0;
uint32_t time_1;

void setup() {
	Serial.begin(115200);
	
	<%

		var exec_num = 10000;
		['blink_fast', 'blink_slow', 'blink_slower', 'blink_fast_2', 'blink_slower_2'].forEach(function(fnc) {
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
	
	<%= microcontroller.digitalWrite(ledPin, 'HIGH') %>
	<%= microcontroller.digitalWrite(ledPin, 'LOW') %>
}


void loop() {
	<%= microcontroller.digitalWrite(raw('LED_PIN'), raw('HIGH')) %>
	delay(100);
	<%= microcontroller.digitalWrite(raw('LED_PIN'), raw('LOW')) %>
	delay(100);
}


	