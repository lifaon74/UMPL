



#define MOV_ACCEL 1
#define MOV_DECCEL 2
#define MOV_LINEAR 3




class Movement {
	public:
		uint16_t nb_ticks;
		uint16_t ticks;
		uint16_t nb_steps;
		uint16_t steps;
		uint8_t type;
		
		int32_t acceleration;
		uint32_t velocity;
		uint32_t position;
	
		Movement();
		
		void 		set(uint16_t _nb_ticks, uint16_t _nb_steps, uint8_t _type);
		boolean 	complete();
		boolean		tick();
};

Movement::Movement() {
	Movement::nb_ticks	= 0;
	Movement::ticks		= 0;
	Movement::nb_steps	= 0;
	Movement::steps		= 0;
};

void Movement::set(uint16_t _nb_ticks, uint16_t _nb_steps, uint8_t _type) {
	Movement::nb_ticks	= _nb_ticks;
	Movement::ticks		= 0;
	Movement::nb_steps	= _nb_steps;
	Movement::steps		= 0;
	Movement::type		= _type;
	
	double f;
	switch(Movement::type) {
		case MOV_ACCEL:
		case MOV_DECCEL:
			f = (((double) Movement::nb_steps) * 2.0) / (((double) Movement::nb_ticks) * ((double) Movement::nb_ticks));
			Movement::acceleration = (int32_t) floor(f * pow(2, 31));
		break;
		case MOV_LINEAR:
			Movement::acceleration = 0;
		break;
	}

	switch(Movement::type) {
		case MOV_ACCEL:
			Movement::velocity = Movement::acceleration >> 1;
		break;
		case MOV_DECCEL:
			Movement::velocity = Movement::acceleration * ((uint32_t) Movement::nb_ticks) - (Movement::acceleration >> 1);
			Movement::acceleration = -Movement::acceleration;
		break;
		case MOV_LINEAR:
			f = ((double) Movement::nb_steps) / ((double) Movement::nb_ticks);
			Movement::velocity = (uint32_t) floor(f * pow(2, 31));
		break;
	}
	
	Movement::position = 0;
	
	Serial.print("a: ");
	Serial.print(Movement::acceleration, DEC);
	
	Serial.print(" - v: ");
	Serial.print(Movement::velocity, DEC);
	Serial.println();
};

boolean Movement::complete() {
	return (Movement::steps == Movement::nb_steps);
};

	// return true if we need to step
boolean	Movement::tick() {
	if(Movement::ticks < Movement::nb_ticks) {
		Movement::ticks++;
		Movement::position += Movement::velocity;
		Movement::velocity += Movement::acceleration;
		
		if(Movement::position & 0x80000000) {
			Movement::position &= 0x7fffffff;
			Movement::steps++;
			return true;
		}
		// else
		return false;
	}
	
	Movement::steps++;
	return true;
};


class MovementsSync {
	public:
		Movement movements[8];
		uint16_t nb_ticks;
		uint8_t type;
		
		MovementsSync();
		
		void prepare(uint16_t _nb_ticks, uint8_t _type);
		void setSteps(uint8_t index, uint16_t nb_steps);
		
		boolean complete();
		uint8_t tick();
};

MovementsSync::MovementsSync() {
};

void MovementsSync::prepare(uint16_t _nb_ticks, uint8_t _type) {
	MovementsSync::nb_ticks	= _nb_ticks;
	MovementsSync::type		= _type;
}

void MovementsSync::setSteps(uint8_t index, uint16_t nb_steps) {
	// MovementsSync::movements[index].set(Movements::nb_ticks, nb_steps, Movements::type);
	// MovementsSync::_type	= _type;
}

boolean MovementsSync::complete() {
	uint8_t i = 8;
	while(i-- > 0) {
		if(!(MovementsSync::movements[i].complete())) {
			return false;
		}
	}
	return true;
};

	// return mask of steps to do
uint8_t MovementsSync::tick() {
	uint8_t mask;
	Movement * mov;
	
	uint8_t i = 8;
	while(i-- > 0) {
		mov = &(MovementsSync::movements[i]);
		if(!(mov->complete())) {
			if(mov->tick()) {
				mask |= (1 << i);
			}
		}
	}
	
	return mask;
};


MovementsSync movements[5];







/*void ICACHE_RAM_ATTR timer_test_isr() {
	
}

void timer_test() {
	Serial.print("timer");
	timer1_disable();
	timer1_attachInterrupt(timer_test_isr);
	timer1_enable(TIM_DIV1, TIM_EDGE, TIM_LOOP); // TIM_SINGLE
	timer1_write(2000);
}*/

	
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



void step() {
	digitalWrite(13, HIGH);
	delayMicroseconds(5);
	digitalWrite(13, LOW);
	delayMicroseconds(5);
}

void _move(uint16_t nb_ticks, uint16_t steps, uint8_t movement) {
	double f = 0;
	int32_t a;
	uint32_t v, d;
	
	switch(movement) {
		case MOV_ACCEL: // 0.1391000003
		case MOV_DECCEL:
			f = (steps * 2.0) / (nb_ticks * nb_ticks);
			a = (int32_t) floor(f * pow(2, 31));
		break;
		case MOV_LINEAR:
			a = 0;
		break;
	}

	switch(movement) {
		case MOV_ACCEL:
			v = a >> 1;
		break;
		case MOV_DECCEL:
			v = a * ((uint32_t) nb_ticks) - (a >> 1);
			a = -a;
		break;
		case MOV_LINEAR:
			f = ((double) steps) / ((double) nb_ticks);
			v = (uint32_t) floor(f * pow(2, 31));
		break;
	}
	
	Serial.print("a: ");
	Serial.print(a, DEC);
	
	Serial.print(" - v: ");
	Serial.print(v, DEC);
	Serial.println();
	
	d = 0;
	
	uint16_t i = nb_ticks;
	uint16_t nb_steps_done = 0;
	
	Movement mov;
	mov.set(10000, 1000, MOV_ACCEL);
	
	uint32_t t1 = micros();
	while(i-- > 0) {
		if(mov.tick()) {
			nb_steps_done++;
		}
		// d += v;
		// if(d & 0x80000000) {
			// d &= 0x7fffffff;
			// nb_steps_done++;
		// }
		// v += a;
	}
	
	uint32_t t2 = micros();
	
	Serial.print("time: ");
	Serial.println(((float) (t2 - t1)) / ((float) nb_ticks), DEC);
	Serial.print(nb_ticks, DEC);
	Serial.print(" - nb_ticks : ");
	Serial.print(steps, DEC);
	Serial.print(" - nb_steps_done: ");
	Serial.println(nb_steps_done, DEC);
	Serial.print(" - d: ");
	Serial.println(d, DEC);
	Serial.print(" - v: ");
	Serial.print(v, DEC);
	Serial.println();
}

void _move2(double nb_ticks, double steps, uint8_t movement) {
	double a, v, t, d, f, nb_steps_done;
	a = v = t = d = f = nb_steps_done = 0; // v is not speed
	
	// we start at t = 1, so v = a and d = a / 2;
	switch(movement) {
		case MOV_ACCEL:
			a = (steps * 2.0) / (nb_ticks * nb_ticks);
			v = a / 2.0;
		break;
		case MOV_DECCEL:
			a = (steps * 2.0) / (nb_ticks * nb_ticks);
			v = (nb_ticks - 0.5) * a;
			a = -a;
		break;
		case MOV_LINEAR:
			a = 0.0;
			v = steps / nb_ticks;
		break;
	}

	Serial.println(v, DEC);
	
	f = a / 2.0;
	
	uint32_t t1 = micros();
	nb_steps_done = 0;
	// for(t = 1.0; t <= nb_ticks; t++) { // 7.4677000046
		// d = f * t * t;
		// if((d - nb_steps_done) >= 1) {
			// nb_steps_done = floor(d);
		// }
	// }
	
	uint16_t j = nb_ticks;
	for(uint16_t i = 0; i < j; i++) { // 4.3702001572
		d += v;
		if((d - nb_steps_done) >= 1) {
			nb_steps_done++;
		}
		v += a;
	}
	
	// uint16_t j = nb_ticks;
	
	// uint32_t _a = (int32_t) floor(a * pow(2, 31));
	// uint32_t _v = _a >> 1;
	// uint32_t _d = 0;
	// for(uint16_t i = 0; i < j; i++) { // 4.3702001572
		// _d += _v;
		// if(_d & 0x80000000) {
			// _d &= 0x7FFFFFFF;
			// nb_steps_done++;
		// }
		// _v += _a;
	// }
	
	uint32_t t2 = micros();
	
	Serial.print("time: ");
	Serial.println(((float) (t2 - t1)) / ((float) nb_ticks), DEC);
	Serial.print(nb_ticks, DEC);
	Serial.print(" - ");
	Serial.print(steps, DEC);
	Serial.print(" - ");
	Serial.println(nb_steps_done, DEC);
	Serial.print(" - d: ");
	Serial.println(d, DEC);
	Serial.print(" - v: ");
	Serial.println(v, DEC);
	Serial.print(" - a: ");
	Serial.println(a, DEC);
}

void _move3() {
	// movements[0].prepare(10000, MOV_ACCEL);
	// movements[0].setSteps(0, 1000);
	
	uint16_t nb_ticks = 13000; // nb_tick must be at least 2 times bigger than nb_steps
	
	movements[0].movements[0].set(nb_ticks, 6400, MOV_ACCEL);
	movements[1].movements[0].set(nb_ticks, 6400, MOV_DECCEL);

	//Movement * mov = &(movements[0].movements[0]);
	MovementsSync * sync_mov = &(movements[0]);
	
	uint16_t i = 0;
	uint16_t nb_steps_done = 0;
	//ESP.wdtDisable();
	uint32_t t1 = micros();
	// while(!(mov->complete())) {
		// i++;
		// if(mov->tick()) {
			// step();
			// nb_steps_done++;
		// }
		
		// delayMicroseconds(50);
		//yield();
	// }
	uint8_t mask;
	while(!(sync_mov->complete())) {
		mask = sync_mov->tick();
		if(mask) {
			nb_steps_done++;
		}
	}
	
	uint32_t t2 = micros();
	//ESP.wdtEnable(1);
	
	Serial.print("time: ");
	Serial.println(((float) (t2 - t1)) / ((float) nb_ticks), DEC);
	Serial.print(" - nb_steps_done: ");
	Serial.println(nb_steps_done, DEC);
	Serial.print(" - i: ");
	Serial.println(i, DEC);
	Serial.println();
}

void setup() {
	Serial.begin(115200);
	delay(1000);
	pinMode(13, OUTPUT);
	Serial.println("\nstart");
	
	
	//speed_test();
	// _move2(10000, 1000, MOV_ACCEL);
	// _move2(10000, 1000, MOV_DECCEL);
	// _move2(10000, 1000, MOV_LINEAR);
	
	// _move(10000, 1000, MOV_ACCEL);
	// _move(10000, 1000, MOV_DECCEL);
	// _move(10000, 1000, MOV_LINEAR);
	//timer_test();
	
	//_move3();
	
}

void loop() {
	if(Serial.available()) {
        Serial.read();
		_move3();
    }
}
