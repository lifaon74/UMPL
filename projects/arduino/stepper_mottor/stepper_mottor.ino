
	

#define MOV_ACCEL 1
#define MOV_DECCEL 2
#define MOV_LINEAR 3



uint8_t get_offset(uint16_t number) {
	uint8_t i = 0;
	while(number >> (i++));
	return i - 2;
}

void speed_test() {
	uint32_t t1 = micros();
	uint16_t i = 10000;
	
	Serial.println(get_offset(8), DEC);
	volatile uint32_t a = 0;
	volatile uint32_t b = 10000;
	
	uint8_t j;
	
	while(i-- > 0) {
		//a += a + b; // 5.6632
		//a += a - b; // 5.6632
		//a += a * b; // 14.3416
		//a += a / b; // 77.2232
		//a += a % b; // 77.2208
		//a += a >> b; // 6.5440
		//a += a << b; // 6.5440
		//a += a & b; // 5.6632
		//a += a | b; // 5.6632
		//a += a ^ b; // 5.6632
		
		//j = 0;
		// while(b >> j) {j++;} // 26.4368
		// a += j - 1;
		
		// while(b >> (j++)); // 26.0592
		// a += j - 2;
		
		
			j = 0;
			while((b >> (j++)) & 1);
			j -= 2;
		
		a += j; // 25.8088
	}
	
	uint32_t t2 = micros();
	Serial.println(t2 - t1, DEC);
	Serial.println(a, DEC);
}

void _move(uint16_t nb_ticks, uint16_t steps, uint8_t movement) {
	int32_t a = 0;
	uint32_t v = 0;
	uint32_t d = 0;
   
	float f;
	
	switch(movement) {
		case MOV_ACCEL:
			/*f = ((float) steps * 2.0) / ((float) nb_ticks * (float) nb_ticks);
			f = f * 4294967296.0; // eq :  << 32
			a = (int32_t) round(f);*/
			
			a = (((uint32_t) steps) << 17) / ((uint32_t)nb_ticks);
			a = (a << 16) / ((uint32_t) nb_ticks); // uint16_t || << 32
		break;
		case MOV_DECCEL:
			/*f = ((float) steps * 2.0) / ((float) nb_ticks * (float) nb_ticks);
			f = f * 4294967296.0; // eq :  << 32
			a = (int32_t) round(f);*/
			a = (((uint32_t) steps) << 17) / ((uint32_t)nb_ticks);
			a = (a << 16) / ((uint32_t) nb_ticks); // uint16_t || << 32
		break;
		case MOV_LINEAR:
			a = 0;
		break;
	}

	switch(movement) {
		case MOV_ACCEL:
			v = a >> 1; // eq :  / 2
		break;
		case MOV_DECCEL:
			v = (((float) nb_ticks) - 0.5) * a;
			Serial.println(v, DEC);
			a = -a;
		break;
		case MOV_LINEAR:
			f = ((float) steps) / ((float) nb_ticks);
			f = f * 4294967296.0; // eq :  << 32
			v = f;
		break;
	}
	
	//Serial.println(f, DEC);



	uint32_t t1 = micros();
	uint16_t b = 0;
	uint16_t i = nb_ticks;
	uint16_t j = 0;
	while(i-- > 0) { // 10.3248
		d += (v >> 16);
		if(d >= 65536) { // step
			b++;
			
			
			d -= 65536;
		} else {
			
		}
		v += a;
		j++;
	}
	
	//Serial.println(b, DEC);
	/*while(b++ < steps) {
		PORTB |= B00000100;
delayMicroseconds(2);
PORTB &= B11111011;
delayMicroseconds(2);

		//Serial.println(b, DEC);
		delayMicroseconds(20);
	}*/

	uint32_t t2 = micros();
	
	Serial.println(v, DEC);
	
		Serial.print("time: ");
		Serial.println(((float) (t2 - t1)) / ((float) nb_ticks), DEC);
		Serial.print(nb_ticks, DEC);
		Serial.print(" - ");
		Serial.print(steps, DEC);
		Serial.print(" - ");
		/*Serial.print(j, DEC);
		Serial.print(" - ");*/
		Serial.println(b, DEC);
	
	
};


void setup() {
	Serial.begin(115200);
	
	DDRB |= B00000100;
	DDRB |= B00001000;
	DDRB |= B00010000;
	PORTB &= B11110111;
	PORTB &= B11101111;

    Serial.println("start");
    randomSeed(analogRead(0));

	speed_test();
}

void loop() {
	#define MICROSTEP 32 // best 137ms / turn
    
    if(Serial.available()) {
        Serial.read();
        /*uint32_t t1 = micros();
        for(uint32_t i = 0; i < 200 * MICROSTEP; i++) {
            step();
            delayMicroseconds(16); // 1280 / MICROSTEP
        }
        uint32_t t2 = micros();*/
        //Serial.println(t2 - t1, DEC);
		
		uint16_t nb_ticks  = random(64000, 64000);
		uint16_t steps     = random(6400*4, 6400*4);
		_move(nb_ticks, steps, MOV_ACCEL);
		_move(nb_ticks, steps, MOV_DECCEL);
    }
    
    //delay(10);
    //delayMicroseconds(100);
    /*Serial.println("ok");
    delay(1000);*/
}




	