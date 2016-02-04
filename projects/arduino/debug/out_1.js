$buffer.push("\r\n\r\n\r\n<%\t\r\n\r\n\t" + 
		fs.readFileSync($dirname + 'ATMEGA328P/ATMEGA328P.js')
);$buffer.push("\r\n\t\r\n\tvar microcontroller = ATMEGA328P;\r\n\t\r\n\tvar raw = function(string) {\r\n\t\treturn new VString(string);\r\n\t};\r\n%>\r\n\r\n\r\n/*\r\nthree ways of writing the same function :\r\n\r\n\t\r\n\t<%= microcontroller.digitalWrite('D5', 'HIGH') %> // giving D5 constant as a string\r\n\t<%= microcontroller.digitalWrite(_const.pins.D5, 'HIGH') %> // giving D5 constant from the _const object\r\n\t<%= microcontroller.digitalWrite(5, 'HIGH') %> // giving number 5 \r\n*/\r\n\r\n\r\n<%\r\n\t/**\r\n\t\tWhy UMPL is useful ? you'll see :\r\n\t**/\r\n\t\r\n\t\t// we define constants here and not in the C++ code\r\n\tvar ledPin\t= \"D13\";\r\n%>\r\n\t\r\n\t\r\n\t// the code inside of this function is strongly optimized\r\nvoid blink_fast() { // 2.4µs @8Mhz > 1.2µs / write\r\n\t<%= microcontroller.digitalWrite(ledPin, 'HIGH') %>;\r\n\t<%= microcontroller.digitalWrite(ledPin, 'LOW') %>;\r\n};\r\n\r\n\r\n#define LED_PIN 13\r\n\r\n\t// the code inside of this function is optimized at it's maximum, be we could do better without using C++ constants\r\nvoid blink_slow() { // 4.5µs @8Mhz > 2.3µs / write\r\n\t<%= microcontroller.digitalWrite(raw('LED_PIN'), raw('HIGH')) %>;\r\n\t<%= microcontroller.digitalWrite(raw('LED_PIN'), raw('LOW')) %>;\r\n};\r\n\r\n\t// the code inside of this function is the slowest, digitalWrite is provided by the Arduino IDE\r\nvoid blink_slower() { // 21.6µs @8Mhz  > 10.8µs / write\r\n\tdigitalWrite(LED_PIN, HIGH);\r\n\tdigitalWrite(LED_PIN, LOW);\r\n};\r\n\r\n\r\n/**\r\n\tThe following code can't be optimized by the c++ compiler, so it will only show the arduino.js optimizations.\r\n**/\r\n\r\nvoid blink_fast_2() { // 94.7µs @8Mhz > 3.6µs / write\r\n\tfor(uint8_t i = 0; i < 13; i++) {\r\n\t\tfor(uint8_t j = 0; j < 2; j++) {\r\n\t\t\t<%= microcontroller.digitalWrite(raw('i'), raw('j')) %>;\r\n\t\t}\r\n\t}\r\n};\r\n\r\nvoid blink_slower_2() { // 309.2µs @8Mhz > 11.9µs / write\r\n\tfor(uint8_t i = 0; i < 13; i++) {\r\n\t\tfor(uint8_t j = 0; j < 2; j++) {\r\n\t\t\tdigitalWrite(i, j);\r\n\t\t}\r\n\t}\r\n};\r\n\r\n\r\n/**\r\n\tVerdict : if you use arduino.js methods instead of native Arduino IDE function,\r\n\tyou'll reduce a least the process time by 3.3 and at the best 9 times faster !\r\n\tWorth it no ?\r\n**/\r\n\r\n\r\n\r\n\r\nvoid pinmode_fast() { // 2.3µs @8Mhz\r\n\t<%= microcontroller.pinMode(ledPin, 'OUTPUT') %>;\r\n};\r\n\r\n\r\nvoid pinmode_slow() { // 10µs @8Mhz\r\n\tpinMode(LED_PIN, OUTPUT);\r\n};\r\n\r\n\r\n\r\nuint32_t time_0;\r\nuint32_t time_1;\r\n\r\nvoid setup() {\r\n\tSerial.begin(115200);\r\n\t\r\n\t/*Serial.println(INPUT, DEC);\r\n\tSerial.println(INPUT_PULLUP, DEC);\r\n\tSerial.println(OUTPUT, DEC);*/\r\n\t\r\n\t<%\r\n\r\n\t\tvar exec_num = 1000;\r\n\t\t['blink_fast', 'blink_slow', 'blink_slower', 'blink_fast_2', 'blink_slower_2', 'pinmode_fast', 'pinmode_slow'].forEach(function(fnc) {\r\n\t\t\t%>\r\n\t\t\t\r\n\t\t\t\ttime_0 = micros();\r\n\t\t\t\tfor(uint32_t i = 0; i < <%= exec_num %>; i++) {\r\n\t\t\t\t\t<%= fnc %>();\r\n\t\t\t\t}\r\n\t\t\t\t\r\n\t\t\t\ttime_1 = micros();\r\n\t\t\t\tSerial.print(\"<%= fnc %> takes \");\r\n\t\t\t\tSerial.print(((float) (time_1 - time_0)) / <%= exec_num %>, DEC);\r\n\t\t\t\tSerial.println(\" microseconds\");\r\n\t\t\t<%\r\n\t\t});\r\n\t%>\r\n\t\r\n\t<%= microcontroller.pinMode(ledPin, 'OUTPUT') %>;\r\n\t\r\n\t<%= microcontroller.analogReference('DEFAULT') %>;\t\r\n\t<%= microcontroller.analog10Bits() %>;\r\n\t<%= microcontroller.analogPrescaler(4) %>;\t\r\n\tSerial.println(<%= microcontroller.analogRead(5) %>, DEC);\t\r\n\t\r\n\r\n\t<%= microcontroller.SPI.begin() %>\r\n\t\r\n}\r\n\r\nvoid loop() {\r\n\t<%= microcontroller.digitalWrite(raw('LED_PIN'), raw('HIGH')) %>;\r\n\tdelay(100);\r\n\t<%= microcontroller.digitalWrite(raw('LED_PIN'), raw('LOW')) %>;\r\n\tdelay(100);\r\n}\r\n\r\n\r\n<%\r\n\t// I'm injecting here the necessaries functions\r\n\t$buffer.set(microcontroller.getCPPFunctions() + $buffer.toString());\r\n%>\r\n\r\n\t");