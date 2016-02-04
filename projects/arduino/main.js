<%+1000

		// here I put a security : if we loop more than 1000 times, we stop all
	$compiler.bind('execute_loop', function() {
		if($compiler.loop > 100) {
			throw "security infinite loop break";
		}
	});
	
	var fs = require('fs');
	var tools = require('tools');
		// use $scope to have the variable _ on all the following loops, this way, it's possible to require just one time 'tools'
	$scope['_'] = tools._;
	$scope['fs'] = fs;
%>


<%	

	<%=
		fs.readFileSync($dirname + 'ATMEGA328P/ATMEGA328P.js')
	%>
	
	var microcontroller = ATMEGA328P;
	
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
	
	
	// the code inside of this function is strongly optimized
void blink_fast() { // 2.4µs @8Mhz > 1.2µs / write
	<%= microcontroller.digitalWrite(ledPin, 'HIGH') %>;
	<%= microcontroller.digitalWrite(ledPin, 'LOW') %>;
};


#define LED_PIN 13

	// the code inside of this function is optimized at it's maximum, be we could do better without using C++ constants
void blink_slow() { // 4.5µs @8Mhz > 2.3µs / write
	<%= microcontroller.digitalWrite(raw('LED_PIN'), raw('HIGH')) %>;
	<%= microcontroller.digitalWrite(raw('LED_PIN'), raw('LOW')) %>;
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
			<%= microcontroller.digitalWrite(raw('i'), raw('j')) %>;
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




void pinmode_fast() { // 2.3µs @8Mhz
	<%= microcontroller.pinMode(ledPin, 'OUTPUT') %>;
};


void pinmode_slow() { // 10µs @8Mhz
	pinMode(LED_PIN, OUTPUT);
};



uint32_t time_0;
uint32_t time_1;

void setup() {
	Serial.begin(115200);
	
	/*Serial.println(INPUT, DEC);
	Serial.println(INPUT_PULLUP, DEC);
	Serial.println(OUTPUT, DEC);*/
	
	<%

		var exec_num = 1000;
		['blink_fast', 'blink_slow', 'blink_slower', 'blink_fast_2', 'blink_slower_2', 'pinmode_fast', 'pinmode_slow'].forEach(function(fnc) {
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
	
	<%= microcontroller.pinMode(ledPin, 'OUTPUT') %>;
	
	<%= microcontroller.analogReference('DEFAULT') %>;	
	<%= microcontroller.analog10Bits() %>;
	<%= microcontroller.analogPrescaler(4) %>;	
	Serial.println(<%= microcontroller.analogRead(5) %>, DEC);	
	

	<%= microcontroller.SPI.begin() %>
	
}

void loop() {
	<%= microcontroller.digitalWrite(raw('LED_PIN'), raw('HIGH')) %>;
	delay(100);
	<%= microcontroller.digitalWrite(raw('LED_PIN'), raw('LOW')) %>;
	delay(100);
}


<%
	// I'm injecting here the necessaries functions
	$buffer.set(microcontroller.getCPPFunctions() + $buffer.toString());
%>

	