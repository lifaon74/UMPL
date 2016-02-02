volatile uint8_t * pinToPORTArray[] = { &PORTD, &PORTB, &PORTC };

uint16_t _analogRead(uint8_t pinMask) {
			ADMUX = (ADMUX & B11110000) | pinMask;
			ADCSRA |= B01000000;
			while(((bool) (ADCSRA & B01000000)));
			return (ADCL | (ADCH << 8));
		};






/*
three ways of writing the same function :

	
	PORTD |= B00100000 // giving D5 constant as a string
	PORTD |= B00100000 // giving D5 constant from the _const object
	PORTD |= B00100000 // giving number 5 
*/



	
	
	// the code inside of this function is strongly optimized
void blink_fast() { // 2.4µs @8Mhz > 1.2µs / write
	PORTB |= B00100000;
	PORTB &= B11011111;
};


#define LED_PIN 13

	// the code inside of this function is optimized at it's maximum, be we could do better without using C++ constants
void blink_slow() { // 4.5µs @8Mhz > 2.3µs / write
	((HIGH) ? (*pinToPORTArray[LED_PIN / 8] |= (1 << (LED_PIN % 8))) : (*pinToPORTArray[LED_PIN / 8] &= ~((1 << (LED_PIN % 8)))));
	((LOW) ? (*pinToPORTArray[LED_PIN / 8] |= (1 << (LED_PIN % 8))) : (*pinToPORTArray[LED_PIN / 8] &= ~((1 << (LED_PIN % 8)))));
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
			((j) ? (*pinToPORTArray[i / 8] |= (1 << (i % 8))) : (*pinToPORTArray[i / 8] &= ~((1 << (i % 8)))));
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
	DDRB |= B00100000;
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
	
	
			
				time_0 = micros();
				for(uint32_t i = 0; i < 1000; i++) {
					blink_fast();
				}
				
				time_1 = micros();
				Serial.print("blink_fast takes ");
				Serial.print(((float) (time_1 - time_0)) / 1000, DEC);
				Serial.println(" microseconds");
			
			
				time_0 = micros();
				for(uint32_t i = 0; i < 1000; i++) {
					blink_slow();
				}
				
				time_1 = micros();
				Serial.print("blink_slow takes ");
				Serial.print(((float) (time_1 - time_0)) / 1000, DEC);
				Serial.println(" microseconds");
			
			
				time_0 = micros();
				for(uint32_t i = 0; i < 1000; i++) {
					blink_slower();
				}
				
				time_1 = micros();
				Serial.print("blink_slower takes ");
				Serial.print(((float) (time_1 - time_0)) / 1000, DEC);
				Serial.println(" microseconds");
			
			
				time_0 = micros();
				for(uint32_t i = 0; i < 1000; i++) {
					blink_fast_2();
				}
				
				time_1 = micros();
				Serial.print("blink_fast_2 takes ");
				Serial.print(((float) (time_1 - time_0)) / 1000, DEC);
				Serial.println(" microseconds");
			
			
				time_0 = micros();
				for(uint32_t i = 0; i < 1000; i++) {
					blink_slower_2();
				}
				
				time_1 = micros();
				Serial.print("blink_slower_2 takes ");
				Serial.print(((float) (time_1 - time_0)) / 1000, DEC);
				Serial.println(" microseconds");
			
			
				time_0 = micros();
				for(uint32_t i = 0; i < 1000; i++) {
					pinmode_fast();
				}
				
				time_1 = micros();
				Serial.print("pinmode_fast takes ");
				Serial.print(((float) (time_1 - time_0)) / 1000, DEC);
				Serial.println(" microseconds");
			
			
				time_0 = micros();
				for(uint32_t i = 0; i < 1000; i++) {
					pinmode_slow();
				}
				
				time_1 = micros();
				Serial.print("pinmode_slow takes ");
				Serial.print(((float) (time_1 - time_0)) / 1000, DEC);
				Serial.println(" microseconds");
			
	
	DDRB |= B00100000;
	
	ADMUX = (ADMUX & B00111111) | B01000000;	
	ADMUX &= B11011111;
	ADCSRA = (ADCSRA & B11111000) | B00000100;	
	Serial.println(_analogRead(B00100000), DEC);	
	

	/* SPI.begin() */
SREG &= B01111111;
PORTB |= B00000100;
DDRB |= 44;
SPCR |= B01010000;
SREG |= B10000000;
	
}

void loop() {
	((HIGH) ? (*pinToPORTArray[LED_PIN / 8] |= (1 << (LED_PIN % 8))) : (*pinToPORTArray[LED_PIN / 8] &= ~((1 << (LED_PIN % 8)))));
	delay(100);
	((LOW) ? (*pinToPORTArray[LED_PIN / 8] |= (1 << (LED_PIN % 8))) : (*pinToPORTArray[LED_PIN / 8] &= ~((1 << (LED_PIN % 8)))));
	delay(100);
}




	