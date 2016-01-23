




/*
three ways of writing the same function :

	
	PORTD |= B00100000; // giving D5 constant as a string
	PORTD |= B00100000; // giving D5 constant from the _const object
	PORTD |= B00100000; // giving number 5 
*/



	// we need it a the beginning of our program to setup some functions
volatile uint8_t * pinToPORTArray[] = { &PORTD, &PORTB, &PORTC }; // 6b in RAM, it's fine




	// the code inside of this function is strongly optimized
void blink_fast() { // 2.4µs @8Mhz > 1.2µs / write
	PORTB |= B00100000;
	PORTB &= B11011111;
};


#define LED_PIN 13

	// the code inside of this function is not optimized at the best because we use a C++ constant 
void blink_slow() { // 4.5µs @8Mhz > 2.3µs / write
	if(HIGH) {*pinToPORTArray[LED_PIN / 8] |= (1 << (LED_PIN % 8));} else {*pinToPORTArray[LED_PIN / 8] &= ~((1 << (LED_PIN % 8)));}
	if(LOW) {*pinToPORTArray[LED_PIN / 8] |= (1 << (LED_PIN % 8));} else {*pinToPORTArray[LED_PIN / 8] &= ~((1 << (LED_PIN % 8)));}
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
			if(j) {*pinToPORTArray[i / 8] |= (1 << (i % 8));} else {*pinToPORTArray[i / 8] &= ~((1 << (i % 8)));}
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
	
	
			
				time_0 = micros();
				for(uint32_t i = 0; i < 10000; i++) {
					blink_fast();
				}
				
				time_1 = micros();
				Serial.print("blink_fast takes ");
				Serial.print(((float) (time_1 - time_0)) / 10000, DEC);
				Serial.println(" microseconds");
			
			
				time_0 = micros();
				for(uint32_t i = 0; i < 10000; i++) {
					blink_slow();
				}
				
				time_1 = micros();
				Serial.print("blink_slow takes ");
				Serial.print(((float) (time_1 - time_0)) / 10000, DEC);
				Serial.println(" microseconds");
			
			
				time_0 = micros();
				for(uint32_t i = 0; i < 10000; i++) {
					blink_slower();
				}
				
				time_1 = micros();
				Serial.print("blink_slower takes ");
				Serial.print(((float) (time_1 - time_0)) / 10000, DEC);
				Serial.println(" microseconds");
			
			
				time_0 = micros();
				for(uint32_t i = 0; i < 10000; i++) {
					blink_fast_2();
				}
				
				time_1 = micros();
				Serial.print("blink_fast_2 takes ");
				Serial.print(((float) (time_1 - time_0)) / 10000, DEC);
				Serial.println(" microseconds");
			
			
				time_0 = micros();
				for(uint32_t i = 0; i < 10000; i++) {
					blink_slower_2();
				}
				
				time_1 = micros();
				Serial.print("blink_slower_2 takes ");
				Serial.print(((float) (time_1 - time_0)) / 10000, DEC);
				Serial.println(" microseconds");
			
	
	PORTB |= B00100000;
	PORTB &= B11011111;
}


void loop() {
	if(HIGH) {*pinToPORTArray[LED_PIN / 8] |= (1 << (LED_PIN % 8));} else {*pinToPORTArray[LED_PIN / 8] &= ~((1 << (LED_PIN % 8)));}
	delay(100);
	if(LOW) {*pinToPORTArray[LED_PIN / 8] |= (1 << (LED_PIN % 8));} else {*pinToPORTArray[LED_PIN / 8] &= ~((1 << (LED_PIN % 8)));}
	delay(100);
}


	