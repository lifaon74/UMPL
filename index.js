var fs = require("fs");
var umpl_compiler	= require('umpl_compiler');

var UMPLCompiler = umpl_compiler.UMPLCompiler;

//var fileName = "examples/test.cpp.adv";
//var fileName = "examples/recursive.adv";
var fileName = "examples/basic.adv";
var compiledFolder	= "compiled";
var compiler = new UMPLCompiler();

/*var recursiveExploration = function(path, readElementCallback, readDirCallback, readAllCallback, nesting) {
	fs.stat(path, function(err, stats) {
		if(!err) {
			if(stats.isDirectory()) {
				readElementCallback(path, true, nesting);
				fs.readdir(path, function(error, elements) {
					var count = elements.length;
					
					for(var i = 0; i < elements.length; i++) {
						recursiveExploration(
							path + "/" + elements[i],
							
							function(path, isDir, nesting) {
								readElementCallback(path, isDir, nesting);
								if(--count == 0) {
									readDirCallback(path, nesting);
								}
							},
							
							function(path, nesting) {
								readDirCallback(path, nesting);
								console.log('nesting', nesting);
								if(nesting == 0) {
									readAllCallback();
								}
							},
							
							readAllCallback,
							nesting + 1
						);
					}
				});
			} else if(stats.isFile()) {
				readElementCallback(path, false, nesting);
			}
		}
	})
};


var recursiveRemove = function(path, callback) {
	var elements = [];
	recursiveExploration(path, function(path, isDir, nesting) {
		console.log(path);
		
		elements.push({
			path: path,
			isDir, isDir
		});
	}, function() {
		console.log('complete dir');
	}, function() {
		console.log('---complete all----');
	}, 0);
	console.log(elements);
};

recursiveRemove(compiledFolder);*/


compiler.bind('compile_error', function(error) {
	var ext = (error.type == "executing")? "txt" : "js";
	var debugFile = compiledFolder + '/debug.' + ext;
	
	fs.writeFileSync(debugFile, this.jsCode, 'utf8');
	console.log(error.formatedString + "\ndebug file in : " + debugFile);
	
	debugger;
});

compiler.bind('parse_loop', function(jsCode) {
	//fs.writeFileSync(compiledFolder + '/out_' + this.loop + '.js', this.jsCode, 'utf8');
});

compiler.bind('execute_loop', function(code) {
	//fs.writeFileSync(compiledFolder + '/out_' + this.loop + '.txt', this.code.buffer, 'utf8');
});

compiler.bind('compiled', function(outputCode) {
	fs.writeFileSync("compiled.txt", outputCode, 'utf8');
});

compiler.compileFile(fileName, {
	safeExecution: true
});

/*.compile({
	inputFile: fileName,
	outputFile: "compiled.txt",
	onerror: function(error) {
		console.log(error.formatedString);
	},
	onloop: function() {
	},
	debugLevel: 0
});*/

/*parser.compileFile(fileName, function(error, code) {
	if(error) {
		throw error;
	}

	var newFileName = "compiled/" + "out" + ".js";
	fs.writeFile(newFileName, code, 'utf8', function() {
		console.log(newFileName + ' compiled with success');
	});
	
	
});*/