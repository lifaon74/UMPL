var fs = require("fs");
//var requireStack = require('require-stack')

/*try{
  var umpl_compiler =require('umpl_compiler');
}catch(e){
	debugger;
console.log('[OOOOOOK]');	
  console.log(e.stack)
}

debugger;*/
var umpl_compiler	= require('umpl_compiler');
var UMPLCompiler = umpl_compiler.UMPLCompiler;




var compileFile = function(fileName, verbose) {
	if(typeof verbose != "boolean") { var verbose = false; }
	
	var compiledFolder	= "compiled";
	var compiler = new UMPLCompiler();

	var recursiveExploration = function(path, callback) {
		try {
			var stats = fs.statSync(path);
		} catch(e) {
			return;
		}
		
		if(stats.isDirectory()) {
			var elements = fs.readdirSync(path);
			var i = elements.length;
			while(i-- > 0) {
				recursiveExploration(path + "/" + elements[i], callback);
			}
			
			callback(path, true);
		} else if(stats.isFile()) {
			callback(path, false);
		}
	};

	var recursiveRemove = function(path) {
		recursiveExploration(path, function(path, isDir) {
			if(isDir) {
				fs.rmdirSync(path);
			} else {
				fs.unlinkSync(path);
			}
		});
	};


		// clear compiled folder
	recursiveRemove(compiledFolder);
	fs.mkdir(compiledFolder);


	compiler.bind('compile_error', function(error) {
		var ext = (error.type == "executing")? "txt" : "js";
		var debugFile = compiledFolder + '/debug.' + ext;
		
		fs.writeFileSync(debugFile, this.jsCode, 'utf8');
		console.log(error.formatedString + "\ndebug file in : " + debugFile);
		//console.log(error.originalError.stack);
		throw error.originalError;
	});

	compiler.bind('parse_loop', function(jsCode) {
		if(verbose) {
			fs.writeFileSync(compiledFolder + '/out_' + this.loop + '.js', this.jsCode, 'utf8');
		}
	});

	compiler.bind('execute_loop', function(code) {
		if(verbose) {
			fs.writeFileSync(compiledFolder + '/out_' + this.loop + '.txt', this.code.get(), 'utf8');
		}
	});

	compiler.bind('compiled', function(outputCode) {
		var filePath = compiledFolder + "/compiled.ino";
		console.log('Final code in ' + filePath);
		fs.writeFileSync(filePath, outputCode, 'utf8');
	});
	
	compiler.compileFile(fileName, {
		safeExecution: true
	})
};



//var fileName = "examples/test.cpp.adv";
//var fileName = "examples/recursive.adv";
//var fileName = "examples/basic.adv";
var fileName = "examples/arduino.js";
//var fileName = "examples/variables_scope.js";
//var fileName = "examples/aliments.js";
//var fileName = "examples/const.js";
//var fileName = "examples/buffer.js";

compileFile(fileName, true);
