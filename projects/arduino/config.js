<%+1000

		// here I put a security : if we loop more than 1000 times, we stop all
	$compiler.bind('execute_loop', function() {
		if($compiler.loop > 100) {
			throw "security infinite loop break";
		}
	});
	
	var tools = require('tools');
		// use $scope to have the variable _ on all the following loops, this way, it's possible to require just one time 'tools'
	$scope['_'] = tools._;
	$scope['fs'] = tools.fs;
%>



<%=
	fs.readFileSync($dirname + 'ATMEGA328P/ATMEGA328P.js')
%>

var microcontroller = ATMEGA328P;

var raw = function(string) {
	return new VString(string);
};
