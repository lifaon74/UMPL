

var fs = require("fs");
var recursive_regexp	= require('recursive_regexp');
var visibility_string	= require('visibility_string');
var linked_list			= require('linked_list');

var RecursiveRegExp		= recursive_regexp.RecursiveRegExp;
var VisibilityString	= visibility_string.VisibilityString;

var LinkedNode			= linked_list.LinkedNode;
var LinkedNodeIterator	= linked_list.LinkedNodeIterator;
var LinkedList			= linked_list.LinkedList;



	
/*var cout = function(arguments) {
	var str = "";
	str += "console.log(";
	
	str += "arguments.toString()";
	// for(var i = 0; i < arguments.length; i++) {
		// str += arguments[i]
	// }
	
	str += ");";
	eval(str);
}*/


Object.prototype.toString = function() {
	return JSON.stringify(this);
};


String.eol = "\n";

String.tab = function(tab) {
	var str = "";
	for(var i = 0; i < tab; i++) { str += "\t"; }
	return str
};

String.toStandardPath = function(path, isFolder) {
	var _path = (new RegExp('\\\\', 'g')).replace(path, '/');
	if(isFolder) {
		if(_path[_path.length - 1] != "/") {
			_path += "/";
		}
	}
	return _path;
};


String.parsePath = function(path, isFolder) {
	path = String.toStandardPath(path, isFolder);
	var reservedChars = "<>:\"/\\|?*";

	var match = (new RegExp("^([a-zA-Z]\:/)([^" + RegExp.quote(reservedChars) + "]+/)*$", 'g')).matchAll(path);
};	

			
String.prototype.escapeSpecialChars = function() {
	return JSON.stringify(this);
};

String.prototype.elegantLineBreak = function() {
	var str = (new RegExp("(\\\\r?\\\\n)((?:\\\\t)*)", "g")).replace(this, function(match) {
		var eol = "\"\\n\"";
		//var eol = "String.eol";
		var tabs = (new RegExp("\\\\t", "g")).replace(match.variables[1], "\t");
		//var tabs = "String.tab(" + (new RegExp("\\\\t", "g")).matchAll(match.variables[1]).length + ")";
		
		return "\" + " + eol + " + \n" + tabs + "\"" + match.variables[1] + "";
	});
	
	//str = (new RegExp(RegExp.quote('""') + "([^\\+])\\+", "g")).replace(str, "");
		
	return str;
};

String.prototype.tab = function() {
	return "\t" + ((new RegExp("(\r?\n)", "g")).replace(this, "$1\t"));
};



var Timer = function() {
	this.clear();	
};

Timer.prototype.diff = function() {
	var diff = process.hrtime(this.time);
	return diff[0] * 1e9 + diff[1];
};

Timer.prototype.disp = function(string) {
	console.log(string + " " + (this.diff() / 1e6) + "ms");
};

Timer.prototype.clear = function() {
	this.time = process.hrtime();	
};


var time_this = function(callback) {
	callback(new Timer());
};

/*time_this(function(timer) {
	var t = (new Date()).getTime();
	while(((new Date()).getTime() - t) < 1000) {
	};
	
	timer.disp("took");
});*/

var createClass = function(_classFunction, _className) {
	var _classWrapper = function() {
		var self = this;
		_classFunction.apply(self, arguments);
	};
	
	_classWrapper.name = _className;
	
	_classWrapper.parents = [];
	_classWrapper.extend = function() {
		for(var i = 0; i < arguments.length; i++) {
			var _parentClass = arguments[i];
			if(typeof _parentClass.name != 'undefined') {
				_classWrapper.parents[_parentClass.name] = _parentClass;
			}
			
			for(var elt in _parentClass.prototype) {
				_classWrapper.prototype[elt] = _parentClass.prototype[elt];
			}
		}
		
		return this;
	};

	return _classWrapper;
};


var BindClass = function() {
	this._binds = [];
};

BindClass.prototype.bind = function(eventName, callback) {
	var self = this;

	if(!(callback instanceof Function)) { return; }
				
	if(typeof self._binds[eventName] == 'undefined') {
		self._binds[eventName] = [];
	}
	
	var bind = {
		eventName	: eventName,
		callback	: callback
	};
	
	self._binds[eventName].push(bind);
	
	if(eventName != 'bind') {
		self.trigger('bind', bind);
	}
	
	return bind;
};

BindClass.prototype.unbind = function(eventName) {
	var self = this;

	if(typeof eventName == "string") {
		if(typeof self._binds[eventName] != 'undefined') {
			for(var i = 0; i < self._binds[eventName].length; i++) {
				self.trigger('unbind', self._binds[eventName][i]);
			}
			delete self._binds[eventName];
		}
	} else { // passed a bind object
		var bind = eventName;
		for(var i = 0; i < self._binds[bind.eventName].length; i++) {
			if(self._binds[bind.eventName][i] == bind) {
				self.trigger('unbind', self._binds[bind.eventName][i]);
				self._binds[bind.eventName].splice(i, 1);
			}
		}
	}
};

BindClass.prototype.trigger = function(eventName, params) {
	var self = this;
	
	if(typeof params == 'undefined') {
		var params =  [];
	}
	
	
	if(typeof self._binds[eventName] != 'undefined') {
		for(var i = 0; i < self._binds[eventName].length; i++) {
			self._binds[eventName][i].callback.apply(this, params);
		}
	}
	
	if(self['on' + eventName] instanceof Function) {
		self['on' + eventName].apply(this, params);
	}
};
	
	
			
var TokenTree = createClass(function(start, end, parent) {
	LinkedNode.apply(this, []);
	
	this.names	= [];
	this.start	= start;
	this.end	= end;
	this.parent	= parent;
	this.children = new LinkedList();
}, "TokenTree").extend(LinkedNode);


TokenTree.prototype.addName = function(name) {
	if(name instanceof Array) {
		for(var i =0; i < name.length; i++) {
			this.addName(name[i]);
		}
	} else {
		if(this.names.indexOf(name) == -1) {
			this.names.push(name);
		}
	}
	return this;
};

TokenTree.prototype.toString = function(name) {
	var str = "";
	str += this.names.toString();
	
	var it = this.children.iterator();
	if(it) {
		str += " : \n";
		
		do {
			str += it.getNode().toString().tab();
			str += "\n";
		} while(it.next());
	}
	
	return str;
};





var TokenizedString = function(string) {
	if(typeof string == "string") {
		this.visibilityString = new VisibilityString(string);
	} else if(string instanceof VisibilityString) {
		this.visibilityString = string;
	} else {
		throw new Error("TokenizedString receive an argument which is not a string");
	}
	
	this.length = this.visibilityString.length;
	this.tokens = [];
	
	this.rootToken = new TokenTree(0, this.length, null);
	this.rootToken.addName('root');
	
	for(var i = 0; i < this.length; i++) {
		this.tokens[i] = this.rootToken;
	}
};


TokenizedString.prototype.addToken = function(name, start, end) {
	var token		= new TokenTree(start, end, null);
	
	var i = start;
	
	while(i < end) {
		var _token		= this.tokens[i];
		var _lastToken	= null;
		var _position	= 0;
		var _continue	= true;
		
		while(_continue) {
			
				/**
					Get token position : crossing, inside, outside or same
				**/
			if(start > _token.start) { // start of <token> is after <_token> start, so <token> should be inside of <_token>
				if(end > _token.end) {  // end of <token> is after <_token> end, so <token> and <_token> are crossing
					_position = 0;
				} else { // <token> is inside of <_token>
					_position = 1;
				}
			} else if(start < _token.start) { // start of <token> is before <_token> start, so <token> should be outside of <_token>
				if(end < _token.end) {  // end of <token> is before <_token> end, so <token> and <_token> are crossing
					_position = 0;
				} else { // <token> is outside of <_token>
					_position = 2;
				}
			} else { // (start == _token.start) : both tokens start at the same _positions so <token> could be inside or outside of <_token>
				if(end > _token.end) { // <token> is outside of <_token>
					_position = 2;
				} else if(end < _token.end) { // <token> is inside of <_token>
					_position = 1;
				} else { // (end == _token.end) : tokens start and end at the same _position, so we merge it
					_position = 3;
				}
			}
			
				/**
					With token position we search it's parent
				**/
			switch(_position) {
				case 0: // crossing
					token.addName(name);
					throw {
						code:		"crossing_tokens",
						message:	"Found two tokens crossing",
						positions:	[token.start, _token.end],
						tokens: [token, _token]
					};
				break;
				case 1: // inside
					var _parentToken;
		
					if(_lastToken === null) { // there's no child, so <token> must be added to the tokens array
						_parentToken = _token;
						while((i < end) && (this.tokens[i] === _token)) {
							this.tokens[i] = token;
							i++;
						}
					} else { // <_lastToken> is <token> child
						_parentToken = _lastToken.parent;
						
						_lastToken.parent = token;
						//token.children.push(new LinkedNode(_lastToken));
						i = _lastToken.end;
					}
					
					if(token.parent === null) {
						token.parent = _parentToken;
					} else if(token.parent !== _parentToken) {
						throw new Error("Different parents !"); // should never happen !
					}
					
					_continue = false;
				break;
				case 2: // outside
					_lastToken	= _token;
					_token		= _token.parent;
				break;
				case 3: // both
					token	= _token;
					i		= _token.end;
					_continue = false;
				break;
			}
		}
	}

	token.addName(name);

	return token;
};

	// not used
TokenizedString.prototype.removeToken = function(token) {
	if(result = self.getTokenIndex(token)) {
		result[0].splice(result[1], 1);
	}

	return this;
};


// tree part

	// experimental
TokenizedString.prototype.getChildrenRecursive = function(token) {
	var self = this;
	if(!(token instanceof TokenTree)) {
		token = this.rootToken;
	}
	
	this.getChildrenOfToken(token);
	
	token.children.forEach(function(token) { self.getChildrenRecursive(token) });
	
	return token;
};

	// experimental
TokenizedString.prototype.getChildrenOfToken = function(token) {
	var i = token.start;
	token.children.clear();
	
	while(i < token.end) {
		var _token = this.tokens[i];
		if(_token === token) {
			i++;
		} else {
			var _continue = true;
			while(_continue) {
				if(_token.parent === token) {
					token.children.push(_token);
					i = _token.end;
					_continue = false;
				} else {
					_token = _token.parent;
					if(_token === null) {
						throw new Error("Found a token which is not included in this token, but should be !"); // should never happen !
					}
				}
			}
		}
	}
	
	return token.children;
};

	// experimental
TokenizedString.prototype.forEach = function(callback, token) {
	var self = this;
	if(!(token instanceof TokenTree)) {
		token = this.rootToken;
	}
	
	callback(token);
	
	token.children.forEach(function(token) {
		self.forEach(callback, token);
	});
	
	return this;
};

	// experimental
TokenizedString.prototype.toString = function() {
	var str = "";
	
	for(var i = 0; i < this.length; i++) {
		var token = this.tokens[i];
		while(token !== null) {
			str += token.names.toString() + " -> ";
			token = token.parent;
		}
		
		str += "\n";
	}
	
	return str;
};

	// not used
TokenizedString.prototype.toTree = function() {
	/*for(var i = 0; i < this.length; i++) {
		var _token = this.tokens[i];
	}*/
	
	return this.rootToken;
};
	
	


Parser = function() {}

var UMPLCompiler = createClass(function(settings) {
	var self = this;
	
	BindClass.apply(self, []);

	self.compiledFolder	= "compiled/";
	self.openTag		= "<%";
	self.closeTag		= "%>";
	
	self.settings = settings;
	self.$core = {};
	
	self.bind('error', function(error, string, loop) {
		var errorString = "";
	
		if(typeof error.type != "undefined") {
			var extension = "txt";
			
			switch(error.type) {
				case "parsing":
					errorString += "[ERROR (COMPILATION)] ";
					
					if(typeof error.positions == "undefined") {
						error.positions = [error.position];
					}
		
					for(var i = 0; i < error.positions.length; i++) {
						if(i > 0) { errorString += ", "; }
						errorString += UMPLCompiler.indexToLineColumnString(string, error.positions[i]);
					}
			
				break;
				case "executing":
					errorString	+= "[ERROR (EXECUTION)] ";
					errorString	+= "( line : " + error.line + ", column : " + error.column + " )";
					extension	= "js";
				break;
			}
			
			var debugFilePath = self.compiledFolder + "debug." + extension;
			
			errorString += " loop " + loop;
			errorString += " : " + error.message;
			errorString += "\noutput file : " + debugFilePath;
			
			console.log(errorString);
			fs.writeFileSync(debugFilePath, string, 'utf8');
			
		} else {
			errorString += "undetermined error"
			console.log(errorString, error);
		}
		

		
		
		
	});
	
	
	if(typeof self.settings.onerror != 'function') {
		self.settings.onerror = function(error) {
			throw error;
		};
	}
	
	if(typeof self.settings.inputFile == 'string') {
		try {
			self.settings.inputCode = fs.readFileSync(self.settings.inputFile, 'utf8');
		} catch(e) {
			self.settings.onerror({
				code: "file_not_found",
				message: "file " + self.settings.inputFile + " not found"
			});
		}
	}
		
		
	if(typeof self.settings.inputCode == 'string') {
		self.$core.loop = 0;
		
		var code			= self.settings.inputCode;
		var jsCode			= true;
		var errorOccured	= false; 
		
		while(true) {
			try {
				jsCode = self.convertToJS(code);
			} catch(error) {
				error.type = "parsing";
				self.trigger('error', [error, code, self.$core.loop]);
				errorOccured = true;
				break;
			}
			
			if(jsCode === null) {
				break;
			} else {
				try {
					code = self.execute(jsCode).buffer;
				} catch(error) {
					error.type = "executing";
					self.trigger('error', [error, jsCode, self.$core.loop]);
					errorOccured = true;
					break;
				}
			
				self.$core.loop++
			}
		}
		
		if(!errorOccured) {
			if(typeof self.settings.outputFile == 'string') {
				fs.writeFileSync(self.settings.outputFile, code, 'utf8');
			}
		}
	}
	
}, "UMPLCompiler").extend(BindClass);


UMPLCompiler.compile = function($core) {
	return new UMPLCompiler($core);
};

UMPLCompiler.indexToLineColumn = function(string, index) {
	var line = 1;
	var column = 1;
	
	for(var i = 0; i < index; i++) {
		switch(string[i]) {
			case "\n":
				line++;
				column = 0;
			break;
		}
		
		column++;
	}
	
	return {
		line	: line,
		column	: column
	};
};

UMPLCompiler.indexToLineColumnString = function(string, index) {
	var position = UMPLCompiler.indexToLineColumn(string, index);
	return "( line : " + position.line + ", column : " + position.column + " )";
};



	// convert UMPL code into js executable code
UMPLCompiler.prototype.convertToJS = function(string) {
	var self = this;
	
	var tokenizedString = self._tokenize(string);
	//console.log(tokenizedString.toTree().toString());
	return self._parseTopLevel(tokenizedString);
};

		// generate tokenizedTree from UMPL code
	UMPLCompiler.prototype._tokenize = function(string) {
		var self = this;
		
		var tokenizedString = new TokenizedString(new VisibilityString(string));
		
		self._tokenizeEscapedTags(tokenizedString);
		self._tokenizeRecursiveTags(tokenizedString);
		
		tokenizedString.getChildrenRecursive();
		
		return tokenizedString;
	};
	
		UMPLCompiler.prototype._tokenizeEscapedTags = function(tokenizedString) {
			var self = this;
			
			while(match = (new RegExp(RegExp.quote(self.openTag + '#'), 'g')).match(tokenizedString.visibilityString)) {
				tokenizedString.visibilityString.setVisibility(match.position.start, match.position.end, VisibilityString.transparent);
				tokenizedString.addToken(["esc_open_tag"], match.position.start, match.position.end);
			}

			while(match = (new RegExp(RegExp.quote('#' + self.closeTag), 'g')).match(tokenizedString.visibilityString)) {
				tokenizedString.visibilityString.setVisibility(match.position.start, match.position.end, VisibilityString.transparent);
				tokenizedString.addToken(["esc_close_tag"], match.position.start, match.position.end);
			}
			
			return tokenizedString;
		};
		
		UMPLCompiler.prototype._tokenizeRecursiveTags = function(tokenizedString) {
			var self = this;
			
			var matches = (new RecursiveRegExp(self.openTag + '([^\\s]*)\\s', 'g', function(match) {
				var matchContent = match.variables[0];
				
				var endPattern = "";
				var tagSettings = {};
				var _match;
				
				
				if((new RegExp('^\\!$', 'g')).match(matchContent)) { // <%!
					tagSettings.type = "comment";
					endPattern = "\\!";
				} else {
					tagSettings.type = "execute";
					endPattern = "[^\\!]";
					
					if((new RegExp('=$', 'g')).match(matchContent)) {
						tagSettings.directWrite = true;
						matchContent = matchContent.slice(0, matchContent.length - 1);
					} else {
						tagSettings.directWrite = false;
					}
					
					if(_match = (new RegExp('^(\\+\\d+)?$', 'g')).match(matchContent)) {
						if(_match.variables[0] !== null) {
							tagSettings.nestingIncrement = parseInt(_match.variables[0]);
						} else {
							tagSettings.nestingIncrement = 1;
						}
					} else {
						throw {
							code:		"invalid_umpl_tag",
							message:	"invalid UMPL tag \"" + match.matchString + "\"",
							position:	match.position.start,
							match: match
						};
					}
				}
				
				match.tagSettings = tagSettings;
				
				return endPattern + RegExp.quote(self.closeTag);
				
			}, 'g')).matchAll(tokenizedString.visibilityString);
		
			for(var i = 0; i < matches.length; i++) {
				var match = matches[i];
				
				if(match.start === null) {
					throw {
						code:		"close_umpl_tag_without_open",
						message:	"Found close tag without any corresponding open tag",
						position:	match.end.position.start,
						match: match
					};	
				}
				
				if(match.end === null) {
					throw {
						code:		"open_umpl_tag_without_close",
						message:	"Found open tag without any corresponding close tag",
						position:	match.start.position.start,
						match: match
					};
				}
				
				tokenizedString.addToken(["open_tag"], match.start.position.start, match.start.position.end);
				tokenizedString.addToken(["close_tag"], match.end.position.start, match.end.position.end);
				var token = tokenizedString.addToken(["tag"], match.start.position.start, match.end.position.end);
				token.match = match;
			}
		
			return tokenizedString;
		};
	
	
	
	UMPLCompiler.prototype._parseTopLevel = function(tokenizedString) {
		var self = this;
		
		var sortedTokens = self._sortTokensByType(tokenizedString);
		
		var keys = Object.keys(sortedTokens.execute);
			
		if(keys.length == 0) {
			return null;
		} else {
			var max  = Math.max.apply(null, keys);
			return self._parseTokens(tokenizedString.visibilityString, sortedTokens.execute[max]);
		}
	};
	
		UMPLCompiler.prototype._sortTokensByType = function(tokenizedString) {
			var tokens = {
				execute: [],
				esc_open: [],
				esc_close: []
			};
		
		
			this._computeNestingLevel(tokenizedString.rootToken, 0, tokens);
			
			return tokens;
		};
		
			UMPLCompiler.prototype._computeNestingLevel = function(token, nesting, tokens) {
				var self = this;
				
				if(token.names.indexOf("tag") != -1) {	
					var tagSettings = token.match.start.tagSettings
					switch(tagSettings.type) {
						case "execute":
							nesting += tagSettings.nestingIncrement;
							if(typeof tokens.execute[nesting] == "undefined") {
								tokens.execute[nesting] = [];
							}
							
							tokens.execute[nesting].push(token);
						break;
						case "comment":
							return;
						break;
					}
					
			
				} else if(token.names.indexOf("esc_open_tag") != -1) {
					tokens.esc_open.push(token);
				} else if(token.names.indexOf("esc_close_tag") != -1) {
					tokens.esc_close.push(token);
				}
				
				token.children.forEach(function(token) {
					self._computeNestingLevel(token, nesting, tokens);
				});
			};
		
		UMPLCompiler.prototype._parseTokens = function(visibilityString, tokens) {
			var self = this;
			
			var code = "";
			var lastIndex = 0;
			
			for(var i = 0; i < tokens.length; i++) {
				var token = tokens[i];
				
				code += self._bufferWrite(
					visibilityString.string.slice(lastIndex, token.start)
				);
				
				var intructions = visibilityString.string.slice(token.match.start.position.end, token.match.end.position.start);
				intructions = (new RegExp(RegExp.quote(self.openTag + "#"), "g")).replace(intructions, self.openTag);
				intructions = (new RegExp(RegExp.quote("#" + self.closeTag), "g")).replace(intructions, self.closeTag);
				
				if(token.match.start.tagSettings.directWrite) {
					code += self._bufferWrite(intructions, true);
				} else {
					code += intructions;
				}
				
				lastIndex = token.end;
			}
			
			code += self._bufferWrite(
				visibilityString.string.slice(lastIndex, visibilityString.string.length)
			);
			
			return code;
		};
		
			UMPLCompiler.prototype._bufferWrite = function(string, rawCode) {
				if(string == "") {
					return "";
				}
				
				if(typeof rawCode != "boolean") {
					var rawCode = false;
				}
				
				if(!rawCode) {
					string = "\n" + string.escapeSpecialChars().elegantLineBreak().tab() + "\n";
				}
				
				return "\n$buffer.write(" + string + ");\n";
			};

	
UMPLCompiler.prototype.execute = function(code) {
	var self = this;
	self.$core.$buffer = new Buffer();
	
	try {
		(new Function('$core', '$buffer', code))(self.$core, self.$core.$buffer);
	} catch(error) {
		var matches			= (new RegExp('at eval (.*)\\)\\n', 'g')).matchAll(error.stack);
		var match			= matches[matches.length - 1];
		var matchLineColumn	= (new RegExp('(\\d+)\\:(\\d+)$', 'g')).match(match.variables[0]);
		
		throw {
			originalError: error,
			line: parseInt(matchLineColumn.variables[0]),
			column: parseInt(matchLineColumn.variables[1]),
			stack: error.stack.slice(0, match.position.end),
			message: error.message
		};
	}
	
	return self.$core.$buffer;
};



var Buffer = function() {
	this.buffer = "";
};

Buffer.prototype.write = function(string) {
	this.buffer += string;
};


//var fileName = "examples/test.cpp.adv";
//var fileName = "examples/recursive.adv";
var fileName = "examples/basic.adv";

var compiler = UMPLCompiler.compile({
	inputFile: fileName,
	outputFile: "compiled.txt"
});

/*parser.compileFile(fileName, function(error, code) {
	if(error) {
		throw error;
	}

	var newFileName = "compiled/" + "out" + ".js";
	fs.writeFile(newFileName, code, 'utf8', function() {
		console.log(newFileName + ' compiled with success');
	});
	
	
});*/
