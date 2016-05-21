<%
var f = function () {
	if($compiler.loop >= 1000) {
		throw { message: "end of program after " + $compiler.loop + " loops. Output code :\n\n" + $compiler.jsCode }
	}

	$buffer.push(
		"<\%\n" +
		"var f = " + f.toString() + ";f();" +
		"\n%\>"
	);
};f();
%>