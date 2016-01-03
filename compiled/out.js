
$buffer.write(
	"ab" + "\n" + 
	"" + "\n" + 
	"<%" + "\n" + 
		"\t$buffer.write(" + "\n" + 
			"\t\t\"test\"" + "\n" + 
		"\t);" + "\n" + 
	"%>" + "\n" + 
	"" + "\n" + 
	""
);

	$buffer.write(
		"cd"
	);
	var str = "<%#";

$buffer.write(
	"" + "\n" + 
	"" + "\n" + 
	""
);

$buffer.write(str );

$buffer.write(
	"" + "\n" + 
	"" + "\n" + 
	"ef"
);
