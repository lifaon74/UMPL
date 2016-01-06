
$buffer.write(
	"\nbegin loop value is : 0\n\n\n"
);
	function ok() {
		a = new lol();
	};
	
	ok();
	
	$buffer.write(
		'some text in string executed at loop 1' + ', and writed at loop ' + $core.loop
	);
	
	var str = "<%= 'string with escaped char' +  ' writed at loop ' + $core.loop %>";
$buffer.write(
	"\n\n"
);

$buffer.write(str);

$buffer.write(
	"\n\nend of file"
);
