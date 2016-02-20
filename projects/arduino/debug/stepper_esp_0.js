$buffer.push("\r\nuint32_t timer_test_count = 1;\r\nvoid ICACHE_RAM_ATTR timer_test_isr() {\r\n\t// if(timer_test_count > 1000) {\r\n\t\t// timer_test_count = 0;\r\n\t\t// Serial.print('b');\r\n\t// }\r\n\t\r\n\tT1L = 2000; // reset when we reach this value // 2^13 - 1 = 8388607 = max\r\n\tTEIE |= TEIE1;\r\n}\r\n\r\nvoid timer_test() {\r\n\tSerial.print(\"timer\");\r\n\ttimer1_disable();\r\n\ttimer1_attachInterrupt(timer_test_isr);\r\n\ttimer1_enable(TIM_DIV1, TIM_EDGE, TIM_SINGLE);\r\n\ttimer1_write(1);\r\n}\r\n\r\n\t\r\nuint8_t get_offset(uint16_t number) {\r\n\tuint8_t i = 0;\r\n\twhile(number >> (i++));\r\n\treturn i - 2;\r\n}\r\n\r\nvoid speed_test() {\r\n\tuint32_t t1, t2;\r\n\tuint16_t i;\r\n\t\r\n\tvolatile double a = 0;\r\n\tvolatile double b = 10000;\r\n\t\r\n\tuint8_t j;\r\n\t\r\n\t// ESP\r\n\t// a += a + b; : 2005\r\n\t// a += a - b; : 2005\r\n\t// a += a * b; : 2253\r\n\t// a += a / b; : 12754\r\n\t// a += a % b; : 15049\r\n\t// a += a >> b; : 2005\r\n\t// a += a << b; : 2003\r\n\t// a += a & b; : 1878\r\n\t// a += a | b; : 2005\r\n\t// a += a ^ b; : 1881\r\n\t// digitalWrite(a, b); : 10002\r\n\r\n\t// float:\r\n\t// a += a + b; : 9175\r\n\t// a += a - b; : 9127\r\n\t// a += a * b; : 11881\r\n\t// a += a / b; : 9378\r\n\t\r\n\t// double\r\n\t// a += a + b; : 11486\r\n\t// a += a - b; : 11129\r\n\t// a += a * b; : 13882\r\n\t// a += a / b; : 11379\r\n\r\n\r\n\t");[
		'a += a + b;',
		'a += a - b;',
		'a += a * b;',
		'a += a / b;'/*,
		'a += a % b;',
		'a += a >> b;',
		'a += a << b;',
		'a += a & b;',
		'a += a | b;',
		'a += a ^ b;',
		'digitalWrite(a, b);'*/
	].forEach(function(value) {
	$buffer.push("\r\n\t\t\tt1 = micros();\r\n\t\t\ti = 10000;\r\n\t\t\twhile(i-- > 0) {\r\n\t\t\t\t" +  value);$buffer.push("\r\n\t\t\t}\r\n\t\t\t\r\n\t\t\tt2 = micros();\r\n\t\t\tSerial.print(\"" +  value);$buffer.push(" : \");\r\n\t\t\tSerial.println(t2 - t1, DEC);\r\n\t\t");
	});
$buffer.push("\r\n\r\n\tSerial.println(a, DEC);\r\n}\r\n\r\n\r\n#define MOV_ACCEL 1\r\n#define MOV_DECCEL 2\r\n#define MOV_LINEAR 3\r\n\r\n");var mode = 'print';$buffer.push("\r\n\r\nvoid _move(double nb_ticks, double steps, uint8_t movement) {\r\n\tdouble a, v, t, d, nb_steps_done;\r\n\t\r\n\tswitch(movement) {\r\n\t\tcase MOV_ACCEL:\r\n\t\t\ta = (steps * 2.0) / (nb_ticks * nb_ticks);\r\n\t\t\tv = 0;\r\n\t\tbreak;\r\n\t\tcase MOV_DECCEL:\r\n\t\t\ta = (steps * 2.0) / (nb_ticks * nb_ticks);\r\n\t\t\tv = nb_ticks * a;\r\n\t\t\ta -= a;\r\n\t\tbreak;\r\n\t\tcase MOV_LINEAR:\r\n\t\t\ta = 0;\r\n\t\t\tv = steps / nb_ticks;\r\n\t\tbreak;\r\n\t}\r\n\r\n\tdouble f = a / 2.0;\r\n\t\r\n\tuint32_t t1 = micros();\r\n\tnb_steps_done = 0;\r\n\t// for(t = 1.0; t <= nb_ticks; t++) { // 7.4677000046\r\n\t\t// d = f * t * t;\r\n\t\t// if((d - nb_steps_done) >= 1) {\r\n\t\t\t// count++;\r\n\t\t\t// nb_steps_done = floor(d);\r\n\t\t// }\r\n\t// }\r\n\t\r\n\tfor(t = 1.0; t <= nb_ticks; t++) { // 7.4677000046\r\n\t\tv += a;\r\n\t\td += v;\r\n\t\tif((d - nb_steps_done) >= 1) {\r\n\t\t\tnb_steps_done++;\r\n\t\t}\r\n\t}\r\n\t\r\n\tuint32_t t2 = micros();\r\n\t\r\n\t");if(mode == 'print') {$buffer.push("\r\n\t\tSerial.print(\"time: \");\r\n\t\tSerial.println(((float) (t2 - t1)) / ((float) nb_ticks), DEC);\r\n\t\tSerial.print(nb_ticks, DEC);\r\n\t\tSerial.print(\" - \");\r\n\t\tSerial.print(steps, DEC);\r\n\t\tSerial.print(\" - \");\r\n\t\tSerial.println(nb_steps_done, DEC);\r\n\t\tSerial.print(\" - \");\r\n\t\tSerial.println(d, DEC);\r\n\t");} else {$buffer.push("\r\n\t\t//Serial.println(t2 - t1, DEC);\r\n\t");}$buffer.push("\r\n}\r\n\r\nvoid setup() {\r\n\tSerial.begin(115200);\r\n\tdelay(1000);\r\n\tSerial.println(\"start\");\r\n\t//speed_test();\r\n\t//_move(10000, 1000, MOV_ACCEL);\r\n\ttimer_test();\r\n}\r\n\r\nvoid loop() {\r\n\tSerial.println(\"a\");\r\n\tdelay(1000);\r\n}");