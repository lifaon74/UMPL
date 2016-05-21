// node compiler.js in=../examples/basic.umpl.js out=../examples/basic.compiled.js verbose=false

first loop here :
	- nesting level : <%+50= $compiler.level %>
	- loop number	: <%+50= $compiler.loop %>

<%+2
	var str_level_2 = 'some text in string executed at loop ' + $compiler.loop;

	<%!
		here we have comments,
		nothing will be executed into these tags

		<%	-> so it's not a problem to write an open tag

	!%>

%>

<%
	// we can use $buffer.write to output data
	$buffer.push(
		// it's possible to put tags inside of string
		'<%= str_level_2 %>' + ', and written at loop ' + $compiler.loop
	);


	// here we have an example of escaping tags, after this current loop, the compiler will detect these new tags
	var str = "<%#= 'string with escaped char' +  ' written at loop ' + $compiler.loop #%>";
%>

<%= str %>

end of file