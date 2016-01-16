





/*
three ways of writing the same function :

	
	PORTD |= B00100000; // giving D5 constant as a string
	PORTD |= B00100000; // giving D5 constant from the _const object
	PORTD |= B00100000; // giving number 5 
*/



	// the code inside of this function is strongly optimized
void blink_fast() {
	PORTB |= B00100000;
	PORTB &= B11011111;
};


#define LED_PIN 13

	// the code inside of this function is not optimized at the best because we use a C++ constant 
void blink_slow() {
		// not finished
	//pinToPORT(LED_PIN) |= pinToPORTMask(LED_PIN);
	//pinToPORT(LED_PIN) &= ~(pinToPORTMask(LED_PIN));
};

	// the code inside of this function is the slowest, digitalWrite is provided by the Arduino IDE
void blink_slower() {
	digitalWrite(LED_PIN, HIGH);
	digitalWrite(LED_PIN, LOW);
};


uint32_t time_0;
uint32_t time_1;

void setup() {
	Serial.begin(115200);
	
	
			
				time_0 = micros();
				for(uint32_t i = 0; i < 100000; i++) {
					blink_fast();
				}
				
				time_1 = micros();
				Serial.print("blink_fast takes ");
				Serial.print(((float) (time_1 - time_0)) / 100000, DEC);
				Serial.println(" microseconds");
			
			
				time_0 = micros();
				for(uint32_t i = 0; i < 100000; i++) {
					blink_slow();
				}
				
				time_1 = micros();
				Serial.print("blink_slow takes ");
				Serial.print(((float) (time_1 - time_0)) / 100000, DEC);
				Serial.println(" microseconds");
			
			
				time_0 = micros();
				for(uint32_t i = 0; i < 100000; i++) {
					blink_slower();
				}
				
				time_1 = micros();
				Serial.print("blink_slower takes ");
				Serial.print(((float) (time_1 - time_0)) / 100000, DEC);
				Serial.println(" microseconds");
			
}


void loop() {
	
}
	