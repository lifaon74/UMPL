var umpl_compiler		= require('umpl_compiler');
var recursive_regexp	= require('regexp_utils');
var tools				= require('./tools');

var _ 					= tools._;
var fs					= tools.fs;
var path 				= tools.path;
var UMPLCompiler		= umpl_compiler.UMPLCompiler;

// node-debug compiler.js in=projects/arduino/stepper_esp.umpl out=projects/arduino/arduino.ino verbose=true


var getCommandArguments = function() {
	var raw_args = process.argv.slice(2);
	var args = {};

	var reg = new RegExp('^([^=]+)=([^=]+)$');

	raw_args.forEach(function(value, key, array) {
		var match = reg.match(value);
		if(match !== null) {
			var value = match.variables[1];

			/*value = _.convert(value, 'number', function(value, success) {
			 if(!success) {
			 value = _.convert(value, 'boolean');
			 }
			 return value;
			 });*/

			args[match.variables[0]] = value;
		}
	});

	return args;
}

var getFormatedArguments = function() {

	var args = getCommandArguments();

	args.in = _.convert(args.in, 'string', function(value, success) {
		if(!success) {
			throw {
				code: "invalid_argument",
				message: "Invalid 'in' argument"
			};
		}
		return value;
	});

	args.out = _.convert(args.out, 'string', function(value, success) {
		if(!success) {
			throw {
				code: "invalid_argument",
				message: "Invalid 'out' argument"
			};
		}
		return value
	});

	args.verbose = _.convert(args.verbose, 'boolean', false);
	args.debug = _.convert(args.debug, 'string', null);
	args.JSONAnswer = _.convert(args.JSONAnswer, 'boolean', false);

	return args;

}

var out = function(obj) {
	var options = getFormatedArguments();

	if(options.JSONAnswer) {
		console.log(JSON.stringify(obj));
	} else {
		if(obj.status == 'ERROR') {
			console.log(JSON.stringify(obj));
			throw new Error();
		}
	}
};

var compile = function() {
	var options = getFormatedArguments();

	/*console.log(options);
	 throw new Error();
	 return;*/

	var inputFilePath	= path.norm(options.in, false);
	var inputFileFolder = path.norm(path.dirname(inputFilePath), true);

	try {
		var inputCode = fs.readFileSync(inputFilePath, 'utf8');
	} catch(e) {
		throw {
			code: "file_not_found",
			message: "file " + inputFilePath + " not found"
		};
	}

	var outputFilePath	= path.norm(options.out, false);

	var compiler = new UMPLCompiler();

	if(options.verbose) {
		var debugFolder = options.debug || path.norm(inputFileFolder + 'debug', true);

		var _return = fs.recursiveRemove(debugFolder);
		if(!_return) {
			// uncatched error
		}

		fs.mkdirSync(debugFolder);

		compiler.bind('parse_loop', function(jsCode) {
			//fs.writeFileSync(debugFolder + path.fileName(inputFilePath) + '_' + this.loop + '.js', this.jsCode.toString(), 'utf8');
			fs.writeFileSync(debugFolder + path.fileName(inputFilePath) + '_' + this.loop + '.js', this.jsCode.toString(), 'utf8');
		});

		compiler.bind('execute_loop', function(code) {
			//fs.writeFileSync(debugFolder + path.fileName(inputFilePath) + '_' + this.loop + '.txt', this.code.toString(), 'utf8');
			fs.writeFileSync(debugFolder + path.fileName(inputFilePath) + '_' + this.loop + '.txt', this.code.toString(), 'utf8');
		});
	}


	compiler.bind('compile_error', function(error) {
		switch(error.name) {
			case 'ParseError':
			case 'ExecError':
				out({
					status: 'ERROR',
					catched: true,
					error: error
				});
				break;
			default:
				out({
					status: 'ERROR',
					catched: false,
					error: {
						name: error.name,
						message: error.message,
						stack: error.stack,
						context: error.context,
						loop: error.loop
					}
				});

				throw error;
		}
	});

	compiler.bind('compiled', function(outputCode) {
		fs.writeFileSync(outputFilePath, outputCode.toString(), 'utf8');
		out({
			status: 'OK',
			outputFilePath: outputFilePath,
			inputFilePath: inputFilePath
		});
	});

	compiler.compile(inputCode, {
		root: inputFileFolder
	});

};

compile();
