
uint32_t timer_test_count = 1;
void ICACHE_RAM_ATTR timer_test_isr() {
	// if(timer_test_count > 1000) {
		// timer_test_count = 0;
		// Serial.print('b');
	// }
	
	T1L = 2000; // reset when we reach this value // 2^13 - 1 = 8388607 = max
	TEIE |= TEIE1;
}

void timer_test() {
	Serial.print("timer");
	timer1_disable();
	timer1_attachInterrupt(timer_test_isr);
	timer1_enable(TIM_DIV1, TIM_EDGE, TIM_SINGLE);
	timer1_write(1);
}

	
uint8_t get_offset(uint16_t number) {
	uint8_t i = 0;
	while(number >> (i++));
	return i - 2;
}

void speed_test() {
	uint32_t t1, t2;
	uint16_t i;
	
	volatile double a = 0;
	volatile double b = 10000;
	
	uint8_t j;
	
	// ESP
	// a += a + b; : 2005
	// a += a - b; : 2005
	// a += a * b; : 2253
	// a += a / b; : 12754
	// a += a % b; : 15049
	// a += a >> b; : 2005
	// a += a << b; : 2003
	// a += a & b; : 1878
	// a += a | b; : 2005
	// a += a ^ b; : 1881
	// digitalWrite(a, b); : 10002

	// float:
	// a += a + b; : 9175
	// a += a - b; : 9127
	// a += a * b; : 11881
	// a += a / b; : 9378
	
	// double
	// a += a + b; : 11486
	// a += a - b; : 11129
	// a += a * b; : 13882
	// a += a / b; : 11379


	
			t1 = micros();
			i = 10000;
			while(i-- > 0) {
				a += a + b;
			}
			
			t2 = micros();
			Serial.print("a += a + b; : ");
			Serial.println(t2 - t1, DEC);
		
			t1 = micros();
			i = 10000;
			while(i-- > 0) {
				a += a - b;
			}
			
			t2 = micros();
			Serial.print("a += a - b; : ");
			Serial.println(t2 - t1, DEC);
		
			t1 = micros();
			i = 10000;
			while(i-- > 0) {
				a += a * b;
			}
			
			t2 = micros();
			Serial.print("a += a * b; : ");
			Serial.println(t2 - t1, DEC);
		
			t1 = micros();
			i = 10000;
			while(i-- > 0) {
				a += a / b;
			}
			
			t2 = micros();
			Serial.print("a += a / b; : ");
			Serial.println(t2 - t1, DEC);
		

	Serial.println(a, DEC);
}


#define MOV_ACCEL 1
#define MOV_DECCEL 2
#define MOV_LINEAR 3



void _move(double nb_ticks, double steps, uint8_t movement) {
	double a, v, t, d, nb_steps_done;
	
	switch(movement) {
		case MOV_ACCEL:
			a = (steps * 2.0) / (nb_ticks * nb_ticks);
			v = 0;
		break;
		case MOV_DECCEL:
			a = (steps * 2.0) / (nb_ticks * nb_ticks);
			v = nb_ticks * a;
			a -= a;
		break;
		case MOV_LINEAR:
			a = 0;
			v = steps / nb_ticks;
		break;
	}

	double f = a / 2.0;
	
	uint32_t t1 = micros();
	nb_steps_done = 0;
	// for(t = 1.0; t <= nb_ticks; t++) { // 7.4677000046
		// d = f * t * t;
		// if((d - nb_steps_done) >= 1) {
			// count++;
			// nb_steps_done = floor(d);
		// }
	// }
	
	for(t = 1.0; t <= nb_ticks; t++) { // 7.4677000046
		v += a;
		d += v;
		if((d - nb_steps_done) >= 1) {
			nb_steps_done++;
		}
	}
	
	uint32_t t2 = micros();
	
	
		Serial.print("time: ");
		Serial.println(((float) (t2 - t1)) / ((float) nb_ticks), DEC);
		Serial.print(nb_ticks, DEC);
		Serial.print(" - ");
		Serial.print(steps, DEC);
		Serial.print(" - ");
		Serial.println(nb_steps_done, DEC);
		Serial.print(" - ");
		Serial.println(d, DEC);
	
}

void setup() {
	Serial.begin(115200);
	delay(1000);
	Serial.println("start");
	//speed_test();
	//_move(10000, 1000, MOV_ACCEL);
	timer_test();
}

void loop() {
	Serial.println("a");
	delay(1000);
}