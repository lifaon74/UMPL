$buffer.write("#include <SPI.h>" + "\\n" + 
+ "" + "\\n" + 
+ "#define OUT_PIN 16" + "\\n" + 
+ "#define SS_PIN 0" + "\\n" + 
+ "" + "\\n" + 
+ "<%%" + "\\n" + 
	+ "\tfunction sendSPI(byte) {" + "\\n" + 
		+ "\t\t$buffer.write(`" + "\\n" + 
			+ "\t\t\tdigitalWrite(SS_PIN, LOW);" + "\\n" + 
			+ "\t\t\tSPI.transfer(` + byte + `);" + "\\n" + 
			+ "\t\t\tdigitalWrite(SS_PIN, HIGH);" + "\\n" + 
		+ "\t\t`);" + "\\n" + 
	+ "\t}" + "\\n" + 
	+ "\t" + "\\n" + 
	+ "\t");

		$buffer.write('sendSPI(14);');
	$buffer.write("" + "\\n" + 
	+ "\t" + "\\n" + 
+ "%%>" + "\\n" + 
+ "" + "\\n" + 
+ "" + "\\n" + 
+ "/*extern \"C\" {" + "\\n" + 
+ "#include \"c_types.h\"" + "\\n" + 
+ "#include \"ets_sys.h\"" + "\\n" + 
+ "#include \"os_type.h\"" + "\\n" + 
+ "#include \"osapi.h\"" + "\\n" + 
+ "#include \"spi_flash.h\"" + "\\n" + 
+ "}*/" + "\\n" + 
+ "" + "\\n" + 
+ "" + "\\n" + 
+ "void setup() {" + "\\n" + 
	+ "\tSerial.begin(250000);" + "\\n" + 
	+ "\tpinMode(SS_PIN, OUTPUT);" + "\\n" + 
	+ "\t" + "\\n" + 
	+ "\tSPI.begin();" + "\\n" + 
	+ "\tdelay(500);" + "\\n" + 
	+ "\tSerial.println(\"" + "\\n" + 
+ "ready\");" + "\\n" + 
+ "}" + "\\n" + 
+ "" + "\\n" + 
+ "void loop() {" + "\\n" + 
+ "" + "\\n" + 
	+ "\tfor(uint16_t i = 0; i < 8; i++) {" + "\\n" + 
		+ "\t\t<%% sendSPI(3); %%>" + "\\n" + 
		+ "\t\tdelay(500);" + "\\n" + 
	+ "\t}" + "\\n" + 
+ "}" + "\\n" + 
+ "");
