var recursive_regexp	= require('recursive_regexp');
var tools				= require('tools');
var exec				= require('child_process').exec;
var fs					= tools.fs;
var path				= tools.path;

var projectPath = 'projects/arduino';
var outputFile 	= 'arduino.ino';

var Daemon = function(rootPath, onchange) {
	var self = this;
	
	self.rootPath			= tools.path.norm(rootPath, true);
	self.onchange			= onchange;
	self.files				= {};
	
	self.inspect();
};

Daemon.prototype.inspect = function() {
	var self = this;

	tools.fs.recursiveExploration(projectPath, function(_path, stats) {
		if(stats.isFile()) {
			var ext = path.extname(_path);
			switch(ext) {
				case '.umpl':
					var mtime = new Date(stats.mtime).getTime();
			
					if(typeof self.files[_path] == 'undefined') {
						self.onchange(_path);
					} else {
						if(mtime > self.files[_path]) {
							//console.log(_path + ' is different');
							self.onchange(_path);
						}
					}
					
					self.files[_path] = mtime;
				break;
			}
		}
	}, false);
	
	
	setTimeout(function() {
		self.inspect();
	}, 250);
};
	
var daemon = new Daemon(projectPath, function(_path) {
	var root = this.rootPath;
	var dir = root + path.norm(path.fileName(_path), true);
	fs.mkdir(dir, function() {
		var cmd = 'node compiler.js in=' + _path + ' out=' + dir + path.fileName(_path) + '.ino verbose=true';
	
		exec(cmd, function(error, stdout, stderr) {
			try {
				var result = JSON.parse(stdout);
			} catch(error) {
				console.log(error, stdout, stderr);
				throw 'end';
			}
			switch(result.status) {
				case 'OK':
					console.log('File compiled with success : ' + result.inputFilePath + ' - ' + result.outputFilePath);
					return;
				break;
				case 'ERROR':
					if(!result.catched) {
						if(match = (new RegExp('([\\d]+)\\r?\\n', 'g')).match(stderr)) { // we have a lineNumber !
							var lineNumber = parseInt(match.variables[0]) - 1;
							result.error.formatedString = "[ERROR (" + result.error.name + ")] ( line : " + lineNumber +  " ) loop " + result.error.loop + ": " + result.error.message;
						} else {
							console.log("UNCATCHED ERROR", stderr);
						}

					}
					
					console.log(result.error.formatedString);
				break;
				default:
					console.log("UNCATCHED ERROR", stderr);
			}
		});
	});
	
});





