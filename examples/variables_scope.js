<%
	/**
		This example show you how you can pass variables to sub level
	**/
	
	<%
			// var_to_display is only visible at this level
		var var_to_display = "Hello World !";
	%>
	
		// we can output the content of var_to_display onto the sublevel
	var var_0 = "<%= var_to_display %>" + "\n";
	
	$buffer.write(var_0);
	
	
		// OR we can use $compiler.global to store global variables available at all levels
	<% $compiler.global.var_to_display = var_to_display; %>
	var var_1 = $compiler.global.var_to_display;
	
	$buffer.write(var_1);
	
%>