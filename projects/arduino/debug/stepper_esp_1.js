$buffer.push("\r\n\r\n");
	var stepPin	= "D10";
	var enPin	= "D12";
	var dirPin	= "D11";
	
	var number_of_stepper_drivers = 8;
	var precision = 32;
	var last_bit_mask = Math.pow(2, precision - 1);
	
	var CPP = {};
	
	CPP.toHex = function(number) {
		return new VString("0x" + number.toString(16));
	};
	
	CPP.toType = function(number, type) {
		switch(type) {
			case 'uint8_t':
				return number & 0xFF;
			break;
			case 'uint16_t':
				return number & 0xFFFF;
			break;
			case 'uint32_t':
				return number & 0xFFFFFFFF;
			break;
			case 'uint64_t':
				return number & 0xFFFFFFFFFFFFFFFF;
			break;
		}
	};
	
	CPP.invert = function(number) {
		if(_.isNumber(number)) {
			return (~number);
		} else if(number instanceof VString) {
			return new VString("~(" + number.toString() + ")");
		} else {
			throw {
				message: "unknow number type",
				number: number
			};
		}
	};

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
	$buffer.push("\r\n\t\t\tt1 = micros();\r\n\t\t\ti = 10000;\r\n\t\t\twhile(i-- > 0) {\r\n\t\t\t\t" + ( value));$buffer.push("\r\n\t\t\t}\r\n\t\t\t\r\n\t\t\tt2 = micros();\r\n\t\t\tSerial.print(\"" + ( value));$buffer.push(" : \");\r\n\t\t\tSerial.println(t2 - t1, DEC);\r\n\t\t");
	});
$buffer.push("\r\n\r\n\tSerial.println(a, DEC);\r\n}\r\n\r\n\r\n\r\nvoid step() {\r\n\tdigitalWrite(13, HIGH);\r\n\tdelayMicroseconds(5);\r\n\tdigitalWrite(13, LOW);\r\n\tdelayMicroseconds(5);\r\n}\r\n\r\nvoid _move(uint16_t nb_ticks, uint16_t steps, uint8_t movement) {\r\n\tdouble f = 0;\r\n\tint" + ( precision.toString()));$buffer.push("_t a;\r\n\tuint" + ( precision.toString()));$buffer.push("_t v, d;\r\n\t\r\n\tswitch(movement) {\r\n\t\tcase MOV_ACCEL: // 0.1391000003\r\n\t\tcase MOV_DECCEL:\r\n\t\t\tf = (steps * 2.0) / (nb_ticks * nb_ticks);\r\n\t\t\ta = (int" + ( precision.toString()));$buffer.push("_t) floor(f * pow(2, " + ( precision - 1));$buffer.push("));\r\n\t\tbreak;\r\n\t\tcase MOV_LINEAR:\r\n\t\t\ta = 0;\r\n\t\tbreak;\r\n\t}\r\n\r\n\tswitch(movement) {\r\n\t\tcase MOV_ACCEL:\r\n\t\t\tv = a >> 1;\r\n\t\tbreak;\r\n\t\tcase MOV_DECCEL:\r\n\t\t\tv = a * ((uint32_t) nb_ticks) - (a >> 1);\r\n\t\t\ta = -a;\r\n\t\tbreak;\r\n\t\tcase MOV_LINEAR:\r\n\t\t\tf = ((double) steps) / ((double) nb_ticks);\r\n\t\t\tv = (uint" + ( precision.toString()));$buffer.push("_t) floor(f * pow(2, " + ( precision - 1));$buffer.push("));\r\n\t\tbreak;\r\n\t}\r\n\t\r\n\tSerial.print(\"a: \");\r\n\tSerial.print(a, DEC);\r\n\t\r\n\tSerial.print(\" - v: \");\r\n\tSerial.print(v, DEC);\r\n\tSerial.println();\r\n\t\r\n\td = 0;\r\n\t\r\n\tuint16_t i = nb_ticks;\r\n\tuint16_t nb_steps_done = 0;\r\n\t\r\n\tMovement mov;\r\n\tmov.set(10000, 1000, MOV_ACCEL);\r\n\t\r\n\tuint32_t t1 = micros();\r\n\twhile(i-- > 0) {\r\n\t\tif(mov.tick()) {\r\n\t\t\tnb_steps_done++;\r\n\t\t}\r\n\t\t// d += v;\r\n\t\t// if(d & " + ( CPP.toHex(last_bit_mask)));$buffer.push(") {\r\n\t\t\t// d &= " + ( CPP.toHex(CPP.toType(CPP.invert(last_bit_mask), 'uint' + precision + '_t'))));$buffer.push(";\r\n\t\t\t// nb_steps_done++;\r\n\t\t// }\r\n\t\t// v += a;\r\n\t}\r\n\t\r\n\tuint32_t t2 = micros();\r\n\t\r\n\tSerial.print(\"time: \");\r\n\tSerial.println(((float) (t2 - t1)) / ((float) nb_ticks), DEC);\r\n\tSerial.print(nb_ticks, DEC);\r\n\tSerial.print(\" - nb_ticks : \");\r\n\tSerial.print(steps, DEC);\r\n\tSerial.print(\" - nb_steps_done: \");\r\n\tSerial.println(nb_steps_done, DEC);\r\n\tSerial.print(\" - d: \");\r\n\tSerial.println(d, DEC);\r\n\tSerial.print(\" - v: \");\r\n\tSerial.print(v, DEC);\r\n\tSerial.println();\r\n}\r\n\r\nvoid _move2(double nb_ticks, double steps, uint8_t movement) {\r\n\tdouble a, v, t, d, f, nb_steps_done;\r\n\ta = v = t = d = f = nb_steps_done = 0; // v is not speed\r\n\t\r\n\t// we start at t = 1, so v = a and d = a / 2;\r\n\tswitch(movement) {\r\n\t\tcase MOV_ACCEL:\r\n\t\t\ta = (steps * 2.0) / (nb_ticks * nb_ticks);\r\n\t\t\tv = a / 2.0;\r\n\t\tbreak;\r\n\t\tcase MOV_DECCEL:\r\n\t\t\ta = (steps * 2.0) / (nb_ticks * nb_ticks);\r\n\t\t\tv = (nb_ticks - 0.5) * a;\r\n\t\t\ta = -a;\r\n\t\tbreak;\r\n\t\tcase MOV_LINEAR:\r\n\t\t\ta = 0.0;\r\n\t\t\tv = steps / nb_ticks;\r\n\t\tbreak;\r\n\t}\r\n\r\n\tSerial.println(v, DEC);\r\n\t\r\n\tf = a / 2.0;\r\n\t\r\n\tuint32_t t1 = micros();\r\n\tnb_steps_done = 0;\r\n\t// for(t = 1.0; t <= nb_ticks; t++) { // 7.4677000046\r\n\t\t// d = f * t * t;\r\n\t\t// if((d - nb_steps_done) >= 1) {\r\n\t\t\t// nb_steps_done = floor(d);\r\n\t\t// }\r\n\t// }\r\n\t\r\n\tuint16_t j = nb_ticks;\r\n\tfor(uint16_t i = 0; i < j; i++) { // 4.3702001572\r\n\t\td += v;\r\n\t\tif((d - nb_steps_done) >= 1) {\r\n\t\t\tnb_steps_done++;\r\n\t\t}\r\n\t\tv += a;\r\n\t}\r\n\t\r\n\t// uint16_t j = nb_ticks;\r\n\t\r\n\t// uint32_t _a = (int32_t) floor(a * pow(2, 31));\r\n\t// uint32_t _v = _a >> 1;\r\n\t// uint32_t _d = 0;\r\n\t// for(uint16_t i = 0; i < j; i++) { // 4.3702001572\r\n\t\t// _d += _v;\r\n\t\t// if(_d & 0x80000000) {\r\n\t\t\t// _d &= 0x7FFFFFFF;\r\n\t\t\t// nb_steps_done++;\r\n\t\t// }\r\n\t\t// _v += _a;\r\n\t// }\r\n\t\r\n\tuint32_t t2 = micros();\r\n\t\r\n\tSerial.print(\"time: \");\r\n\tSerial.println(((float) (t2 - t1)) / ((float) nb_ticks), DEC);\r\n\tSerial.print(nb_ticks, DEC);\r\n\tSerial.print(\" - \");\r\n\tSerial.print(steps, DEC);\r\n\tSerial.print(\" - \");\r\n\tSerial.println(nb_steps_done, DEC);\r\n\tSerial.print(\" - d: \");\r\n\tSerial.println(d, DEC);\r\n\tSerial.print(\" - v: \");\r\n\tSerial.println(v, DEC);\r\n\tSerial.print(\" - a: \");\r\n\tSerial.println(a, DEC);\r\n}\r\n\r\nvoid _move3() {\r\n\t// movements[0].prepare(10000, MOV_ACCEL);\r\n\t// movements[0].setSteps(0, 1000);\r\n\t\r\n\tuint16_t nb_ticks = 13000; // nb_tick must be at least 2 times bigger than nb_steps\r\n\t\r\n\tmovements[0].movements[0].set(nb_ticks, 6400, MOV_ACCEL);\r\n\tmovements[1].movements[0].set(nb_ticks, 6400, MOV_DECCEL);\r\n\r\n\t//Movement * mov = &(movements[0].movements[0]);\r\n\tMovementsSync * sync_mov = &(movements[0]);\r\n\t\r\n\tuint16_t i = 0;\r\n\tuint16_t nb_steps_done = 0;\r\n\t//ESP.wdtDisable();\r\n\tuint32_t t1 = micros();\r\n\t// while(!(mov->complete())) {\r\n\t\t// i++;\r\n\t\t// if(mov->tick()) {\r\n\t\t\t// step();\r\n\t\t\t// nb_steps_done++;\r\n\t\t// }\r\n\t\t\r\n\t\t// delayMicroseconds(50);\r\n\t\t//yield();\r\n\t// }\r\n\tuint8_t mask;\r\n\twhile(!(sync_mov->complete())) {\r\n\t\tmask = sync_mov->tick();\r\n\t\tif(mask) {\r\n\t\t\tnb_steps_done++;\r\n\t\t}\r\n\t}\r\n\t\r\n\tuint32_t t2 = micros();\r\n\t//ESP.wdtEnable(1);\r\n\t\r\n\tSerial.print(\"time: \");\r\n\tSerial.println(((float) (t2 - t1)) / ((float) nb_ticks), DEC);\r\n\tSerial.print(\" - nb_steps_done: \");\r\n\tSerial.println(nb_steps_done, DEC);\r\n\tSerial.print(\" - i: \");\r\n\tSerial.println(i, DEC);\r\n\tSerial.println();\r\n}\r\n\r\nvoid setup() {\r\n\tSerial.begin(115200);\r\n\tdelay(1000);\r\n\tpinMode(13, OUTPUT);\r\n\tSerial.println(\"\\nstart\");\r\n\t\r\n\t\r\n\t//speed_test();\r\n\t// _move2(10000, 1000, MOV_ACCEL);\r\n\t// _move2(10000, 1000, MOV_DECCEL);\r\n\t// _move2(10000, 1000, MOV_LINEAR);\r\n\t\r\n\t// _move(10000, 1000, MOV_ACCEL);\r\n\t// _move(10000, 1000, MOV_DECCEL);\r\n\t// _move(10000, 1000, MOV_LINEAR);\r\n\t//timer_test();\r\n\t\r\n\t//_move3();\r\n\t\r\n}\r\n\r\nvoid loop() {\r\n\tif(Serial.available()) {\r\n        Serial.read();\r\n\t\t_move3();\r\n    }\r\n}\r\n");