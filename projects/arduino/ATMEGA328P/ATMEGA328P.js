
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

_const.status = {
	"DISABLE"		: 0,
	"ENABLE"		: 1
};

_const.pinMode = {
	"INPUT"			: 0,
	"OUTPUT"		: 1,
	"INPUT_PULLUP"	: 2
};

_const.pinState = {
	"LOW"	: 0,
	"HIGH"	: 1 
};

_const.interruptMode = {
	"NONE"		: 0,
	"CHANGE"	: 1,
	"FALLING"	: 2,
	"RISING"	: 3 
};

_const.analogReference = {
	"DEFAULT"	: 0,
	"EXTERNAL"	: 1,
	"INTERNAL"	: 2
};


/*#define SPI_CLOCK_DIV4 0x00
#define SPI_CLOCK_DIV16 0x01
#define SPI_CLOCK_DIV64 0x02
#define SPI_CLOCK_DIV128 0x03
#define SPI_CLOCK_DIV2 0x04
#define SPI_CLOCK_DIV8 0x05
#define SPI_CLOCK_DIV32 0x06*/

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
	"A5"	: 21,
	"A6"	: 22,
	"A7"	: 23,
	
	"SS"	: 10,
	"MOSI"	: 11,
	"MISO"	: 12,
	"SCK"	: 13
};
	
	
	// use $globals to store variables through different levels
$globals._const = _const;




var ATMEGA328P = {};

ATMEGA328P.functions = [];
ATMEGA328P._const = _const;

/*ATMEGA328P.getCPPFunction = function(_function) {
	
	if(_.isString(_function.outside)) {
		string += _function.outside + "\n";
	}
		
	string += _function.returnType + " " + fncName + "(";
	for(var i = 0; i < 
		
	return string;
};*/

ATMEGA328P.getCPPFunctions = function() {
	var self = this;
	var string = "";
	for(var i = 0; i < self.functions.length; i++) {
		var fncName = self.functions[i];
		var fnc = self[fncName];
		
		if(self[fncName].cpp.used) {
			string += self[fncName].cpp.code.trim() + "\n\n";
		}
	}
	
	return string;
};

ATMEGA328P.setup = function(number) {
};


ATMEGA328P.convertNumberToByte = function(number) {
	if(number instanceof VString) {
		return number;
	} else {
		var bitString = "B";
		for(var i = 7; i >= 0; i--) {
			bitString += (number >> i) & 1;
		}
		return new VString(bitString);
	}
};

ATMEGA328P.invert = function(number) {
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

ATMEGA328P.tryToConvert = function(_var, type) {
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


	// _pinToIOMask
ATMEGA328P._pinToIOMask = function(pin) {
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
		} else if((16 <= pin) && (pin < 24)) {
			return 1 << (pin - 16);
		} else {
			throw {
				message: "unknow pin number",
				pin: pin
			};
		}
	}
};

	// _pinToIOPort
ATMEGA328P._pinToIOPort = function(pin, port, _function) {
	var self	= this;
	var fnc		= arguments.callee;
	
	pin = self.tryToConvert(pin, "number");
	if(pin instanceof VString) {
		_function.cpp.used = true;
		return new VString("*pinTo" + port + "Array[" + pin.toString() + " / 8]");
	} else {
		if((0 <= pin) && (pin < 8)) {
			return new VString(port + "D");
		} else if((8 <= pin) && (pin < 14)) {
			return new VString(port + "B");
		} else if((16 <= pin) && (pin < 24)) {
			return new VString(port + "C");
		} else {
			throw {
				message: "unknow pin number",
				pin: pin
			};
		}
	}
};



/***
	DIGITAL IO
***/

/** pinMode **/
	
	// pinToDDRMask
ATMEGA328P.pinToDDRMask = function(pin) {
	return this._pinToIOMask(pin);
};

	// pinToDDR
ATMEGA328P.functions.push('pinToDDR');
ATMEGA328P.pinToDDR = function(pin) {
	return this._pinToIOPort(pin, 'DDR', arguments.callee);
};

ATMEGA328P.pinToDDR.cpp = {
	code: =%>
		volatile uint8_t * pinToDDRArray[] = { &DDRD, &DDRB, &DDRC }; 
	<% ,
	ram: 6, // 6b in RAM, it's fine
	used: false
};

	
ATMEGA328P.pinMode = function(pin, mode) {
	var self = this;
	
	mode = self.tryToConvert(mode, "number");
	if(mode instanceof VString) {
		return new VString(
			=%>
				switch(<%= mode =%>) {
					case <%= self._const.pinMode.INPUT =%> :
						<%= self.pinMode(pin, self._const.pinMode.INPUT) =%>;
					break;
					case <%= self._const.pinMode.OUTPUT =%> :
						<%= self.pinMode(pin, self._const.pinMode.OUTPUT) =%>;
					break;
					case <%= self._const.pinMode.INPUT_PULLUP =%> :
						<%= self.pinMode(pin, self._const.pinMode.INPUT_PULLUP) =%>;
					break;
				}
			<%
		);
	} else {
		switch(mode) {
			case self._const.pinMode.INPUT:
				return new VString(self.pinToDDR(pin).toString() + " &= " + self.convertNumberToByte(self.invert(self.pinToDDRMask(pin))).toString());
			break;
			case self._const.pinMode.OUTPUT:
				return new VString(self.pinToDDR(pin).toString() + " |= " + self.convertNumberToByte(self.pinToDDRMask(pin)).toString());
			break;
			case self._const.pinMode.INPUT_PULLUP:
				return new VString(self.pinMode(pin, self._const.pinMode.INPUT).toString() + "; " + self.digitalWrite(pin, self._const.pinState.HIGH).toString());
			break;
		}
	}
};


/** digitalWrite **/

	// pinToPORTMask
ATMEGA328P.pinToPORTMask = function(pin) {
	return this._pinToIOMask(pin);
};


	// pinToPORT
ATMEGA328P.functions.push('pinToPORT');
ATMEGA328P.pinToPORT = function(pin) {
	return this._pinToIOPort(pin, 'PORT', arguments.callee);
};

ATMEGA328P.pinToPORT.cpp = {
	code: =%>
		volatile uint8_t * pinToPORTArray[] = { &PORTD, &PORTB, &PORTC };
	<% ,
	ram: 6,
	used: false
};


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

ATMEGA328P.digitalWrite = function(pin, state) {
	var self = this;
	
	state = self.tryToConvert(state, "boolean");
	if(state instanceof VString) {
		return new VString(
			"(" +
				"(" + state.toString() + ") ? " +
					"(" + self.digitalWrite(pin, true) + ")" +
				" : " +
					"(" + self.digitalWrite(pin, false) + ")" +
			")"
		);
	} else {
		if(state) {
			return new VString(self.pinToPORT(pin).toString() + " |= " + self.convertNumberToByte(self.pinToPORTMask(pin)).toString());
		} else {
			return new VString(self.pinToPORT(pin).toString() + " &= " + self.convertNumberToByte(self.invert(self.pinToPORTMask(pin))).toString());
		}
	}
};


/** digitalRead **/

	// pinToPINMask
ATMEGA328P.pinToPINMask = function(pin) {
	return this._pinToIOMask(pin);
};

	// pinToPIN
ATMEGA328P.functions.push('pinToPIN');
ATMEGA328P.pinToPIN = function(pin) {
	return this._pinToIOPort(pin, 'PIN', arguments.callee);
};

ATMEGA328P.pinToPIN.cpp = {
	code: =%>
		volatile uint8_t * pinToPINArray[] = { &PIND, &PINB, &PINC };
	<% ,
	ram: 6,
	used: false
};

	
ATMEGA328P.digitalRead = function(pin) {
	var self = this;
	return new VString("((bool) (" + self.pinToPIN(pin).toString() + " & " + self.convertNumberToByte(self.pinToPINMask(pin)).toString() + "))");
};


/***
	ANALOG
***/

ATMEGA328P.functions.push('analogReferenceToADMUXMask');
ATMEGA328P.analogReferenceToADMUXMask = function(reference) {
	var self	= this;
	var fnc		= arguments.callee;
	
	reference = self.tryToConvert(reference, "number");
	if(reference instanceof VString) {
		fnc.cpp.used = true;
		return new VString('analogReferenceToADMUXMaskArray[' + reference.toString() + ']');
	} else {
		switch(reference) {
			case self._const.analogReference.DEFAULT:
				return 0b01000000;
			break;
			case self._const.analogReference.INTERNAL:
				return 0b11000000;;
			break;
			case self._const.analogReference.EXTERNAL:
				return 0b00000000;
			break;
		}
	}
};

ATMEGA328P.analogReferenceToADMUXMask.cpp = {
	code: =%>
		uint8_t analogReferenceToADMUXMaskArray[] = { B01000000, B11000000, B00000000 }; 
	<% ,
	ram: 3,
	used: false
};


ATMEGA328P.analogReference = function(reference) {
	var self	= this;
	return new VString('ADMUX = (ADMUX & B00111111) | ' + self.convertNumberToByte(self.analogReferenceToADMUXMask(reference))).toString();
};


ATMEGA328P.analog8Bits = function() {
	return new VString('ADMUX |= B00100000');
};

ATMEGA328P.analog10Bits = function() {
	return new VString('ADMUX &= B11011111');
};


	// [0->7] = { 2, 2, 4, 8, 16, 32, 64, 128 }
ATMEGA328P.analogPrescaler = function(prescaler) {
	var self	= this;
	return new VString('ADCSRA = (ADCSRA & B11111000) | ' +  self.convertNumberToByte(prescaler).toString());
};


ATMEGA328P.analogPinToADMUXMask = function(pin) {
	return ATMEGA328P._pinToIOMask(pin);
};

ATMEGA328P.analogPin = function(pin) {
	var self	= this;
	return new VString('ADMUX = (ADMUX & B11110000) | ' +  self.convertNumberToByte(self.analogPinToADMUXMask(pin)).toString());
};


ATMEGA328P.analogStartConversion = function() {
	return new VString('ADCSRA |= B01000000');
};

ATMEGA328P.analogConversionIsIncomplete = function() {
	return new VString('((bool) (ADCSRA & B01000000))');
};

ATMEGA328P.analogReadValue = function(bits8) {
	if(!_.isBoolean(bits8)) { bits8 = false; }
	if(bits8) {
		return new VString('ADCH');
	} else {
		return new VString('(ADCL | (ADCH << 8))');
	}
};


ATMEGA328P.functions.push('analogRead');
ATMEGA328P.analogRead = function(pin) {
	var self	= this;
	var fnc		= arguments.callee;
	fnc.cpp.used = true;
	return new VString('_analogRead(' + self.convertNumberToByte(self.analogPinToADMUXMask(pin)).toString() + ')');
};

ATMEGA328P.analogRead.cpp = {
	code: =%>
		uint16_t _analogRead(uint8_t pinMask) {
			ADMUX = (ADMUX & B11110000) | pinMask;
			<%= ATMEGA328P.analogStartConversion() =%>;
			while(<%= ATMEGA328P.analogConversionIsIncomplete() =%>);
			return <%= ATMEGA328P.analogReadValue() =%>;
		};
	<% ,
	ram: 0,
	used: false
};

	


/***
	INTERRUPTS
***/

ATMEGA328P.enableInterrupts = function(enable) {
	var self = this;
	
	if(_.isUndefined(enable)) { enable = true; }
	enable = self.tryToConvert(enable, "boolean");
	
	if(enable instanceof VString) {
		return new VString(
			"/* enableInterrupts(" + enable.toString() + ") */" +
			"(" +
				"(" + enable.toString() + ") ? " +
					"(" + self.enableInterrupts(true) + ")" +
				" : " +
					"(" + self.enableInterrupts(false) + ")" +
			")"
		);
	} else {
		if(enable) {
			return new VString("SREG |= B10000000");
		} else {
			return new VString("SREG &= B01111111");
		}
	}
};


	// enable group interrupt
ATMEGA328P.functions.push('pinToPCICRMask');
ATMEGA328P.pinToPCICRMask = function(pin) {
	var self	= this;
	var fnc		= arguments.callee;

	pin = self.tryToConvert(pin, "number");
	if(pin instanceof VString) {
		fnc.cpp.used = true;
		return new VString("pinToPCICRMaskArray[" + pin.toString() + " / 8]");
	} else {
		if((0 <= pin) && (pin < 8)) {
			return 0b00000100;
		} else if((8 <= pin) && (pin < 14)) {
			return 0b00000001;
		} else if((16 <= pin) && (pin < 24)) {
			return 0b00000010;
		} else {
			throw {
				message: "unknow pin number",
				pin: pin
			};
		}
	}
};

ATMEGA328P.pinToPCICRMask.cpp = {
	code: =%>
		uint8_t pinToPCICRMaskArray[] = { B00000100, B00000001, B00000010 };
	<% ,
	ram: 3,
	used: false
};


ATMEGA328P.enableInterruptOnGroup = function(pin, enable) {
	var self = this;
	
	if(_.isUndefined(enable)) { enable = true; }
	enable = self.tryToConvert(enable, "boolean");
	
	if(enable instanceof VString) {
		return new VString(
			"/* enableInterruptOnGroup(" + enable.toString() + ") */" +
			"(" +
				"(" + enable.toString() + ") ? " +
					"(" + self.enableInterruptOnGroup(pin, true) + ")" +
				" : " +
					"(" + self.enableInterruptOnGroup(pin, false) + ")" +
			")"
		);
	} else {
		if(enable) {
			return new VString("PCICR |= " + self.convertNumberToByte(self.pinToPCICRMask(pin)).toString());
		} else {
			return new VString("PCICR &= " + self.convertNumberToByte(self.invert(self.pinToPCICRMask(pin))).toString());
		}
	}
};


	// enable pin interrupt
ATMEGA328P.pinToPCMSKMask = function(pin) {
	return this._pinToIOMask(pin);
};


ATMEGA328P.functions.push('pinToPCMSK');
ATMEGA328P.pinToPCMSK = function(pin) {
	var self	= this;
	var fnc		= arguments.callee;

	pin = self.tryToConvert(pin, "number");
	if(pin instanceof VString) {
		fnc.cpp.used = true;
		return new VString("pinToPCMSKArray[" + pin.toString() + " / 8]");
	} else {
		if((0 <= pin) && (pin < 8)) {
			return new VString("PCMSK2");
		} else if((8 <= pin) && (pin < 14)) {
			return new VString("PCMSK0");
		} else if((16 <= pin) && (pin < 24)) {
			return new VString("PCMSK1");
		} else {
			throw {
				message: "unknow pin number",
				pin: pin
			};
		}
	}
};

ATMEGA328P.pinToPCMSK.cpp = {
	code: =%>
		volatile uint8_t * pinToPCMSKArray[] = { &PCMSK2, &PCMSK0, &PCMSK1 };
	<% ,
	ram: 6,
	used: false
};


ATMEGA328P.enableInterruptOnPin = function(pin, enable) {
	var self = this;
	
	if(_.isUndefined(enable)) { enable = true; }
	enable = self.tryToConvert(enable, "boolean");
	
	if(enable instanceof VString) {
		return new VString(
			"/* enableInterruptOnPin(" + enable.toString() + ") */" +
			"(" +
				"(" + enable.toString() + ") ? " +
					"(" + self.enableInterruptOnPin(pin, true) + ")" +
				" : " +
					"(" + self.enableInterruptOnPin(pin, false) + ")" +
			")"
		);
	} else {
		if(enable) {
			return new VString(self.pinToPCMSK(pin).toString() + " |= " + self.convertNumberToByte(self.pinToPCMSKMask(pin)).toString());
		} else {
			return new VString(self.pinToPCMSK(pin).toString() + "PCICR &= " + self.convertNumberToByte(self.invert(self.pinToPCMSKMask(pin))).toString());
		}
	}
};


/***
	SPI
***/
ATMEGA328P.SPI = {};
ATMEGA328P.SPI.begin = function() {
	return new VString(
		"/* SPI.begin() */\n" +
		ATMEGA328P.enableInterrupts(false) + ";\n" +
		ATMEGA328P.digitalWrite('SS', 'HIGH') + ";\n" +
		ATMEGA328P.pinToDDR('SS') + " |= " + (ATMEGA328P.pinToDDRMask('SS') | ATMEGA328P.pinToDDRMask('SCK') | ATMEGA328P.pinToDDRMask('MOSI')) + ";\n" +
		//ATMEGA328P.pinMode('SS', 'OUTPUT') + ";\n" +
		"SPCR |= B01010000;\n" +
		//ATMEGA328P.digitalWrite('SCK', 'OUTPUT') + ";\n" +
		//ATMEGA328P.digitalWrite('MOSI', 'OUTPUT') + ";\n" +
		ATMEGA328P.enableInterrupts(true) + ";"
		
	);
};



$globals.ATMEGA328P = ATMEGA328P;
