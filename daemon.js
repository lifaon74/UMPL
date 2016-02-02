var umpl_compiler	= require('umpl_compiler');
var tools			= require('tools');
var exec			= require('child_process').exec;


var projectPath = 'projects/arduino';
var outputFile 	= 'arduino.ino';

var excludeList = [
	'debug/.*',
	outputFile
];


var Daemon = function(rootPath, excludeList, onchange) {
	var self = this;
	
	self.rootPath			= tools.path.norm(rootPath, true);
	self.excludeList		= excludeList;
	self.excludeListRegExp	= [];
	self.onchange			= onchange;
	self.files				= {};
	
	var espacedRootPath = RegExp.quote(tools.path.norm(self.rootPath));
	for(var i = 0; i < self.excludeList.length; i++) {
		self.excludeListRegExp.push(new RegExp('^' + tools.path.norm(espacedRootPath + self.excludeList[i]).replace(/\\/g, '\\\\') + '$'));
	}
	
	self.inspect();
};

Daemon.prototype.inspect = function() {
	var self = this;
	
	var refresh = false;
	tools.fs.recursiveExploration(projectPath, function(_path, stats) {
		for(var i = 0; i < self.excludeListRegExp.length; i++) {
			if(self.excludeListRegExp[i].match(_path)) {
				return true;
			}			
		}
	
		if(stats.isFile()) {
			var mtime = new Date(stats.mtime).getTime();
		
			if(typeof self.files[_path] == 'undefined') {
				refresh = true;
			} else {
				if(mtime > self.files[_path]) {
					console.log(_path + ' is different');
					refresh = true;
				}
			}
			
			self.files[_path] = mtime;
		}
	}, false);
	
	if(refresh) {
		self.onchange();
	}
	
	setTimeout(function() {
		self.inspect();
	}, 250);
};


var daemon = new Daemon(projectPath, excludeList, function() {
	var cmd = 'node compiler.js in=' + this.rootPath + 'main.js out=' + this.rootPath + 'arduino.ino verbose=true';
	exec(cmd, function(error, stdout, stderr) {
		if(error) {
			console.log(error.message);
		} else {
			var result = JSON.parse(stdout);
			console.log('File compiled with success. Ouput in ' + result.outputFilePath);
		}
	});
});





