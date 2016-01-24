#define STATUS_0 1000
#define STATUS_1 999
// ...

// to much to write for me :(
<%
	for(var i = 2; i <= 1000; i++) {
%>
#define STATUS_<%= i %> <%= 1000 - i %> 
<%
	}
%>