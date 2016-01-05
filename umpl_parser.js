

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

	// not used
TokenizedString.prototype.getTokenIndex = function(token) {
	if(typeof this.tokens[token.name] == 'undefined') {
		var tokens = this.tokens[token.name];
		for(var i = 0; i < tokens.length; i++) {
			if(tokens[i] === token) {
				return [tokens, i];
			}
		}
	}
	
	return null;
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
					throw { name: "crossing_tokens", tokens: [token, _token], message: "two tokens are crossing" };
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
	
	

function indexToLineColumn(string, index) {
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
	
	return { line: line, column: column };
};

function indexToLineColumnString(string, index) {
	var position = indexToLineColumn(string, index);
	return " at line " + position.line + ", column " + position.column;
};



/*var stringToParse = new VisibilityString("0123456789");
var tokenizedString = new TokenizedString(stringToParse);
tokenizedString.addToken(["b0"], 1, 2);
//tokenizedString.addToken(["b1"], 1, 2);
tokenizedString.addToken(["bc0"], 1, 3);
tokenizedString.addToken(["d0"], 5, 6);
tokenizedString.addToken(["abcde0"], 0, 8);
//tokenizedString.addToken(["cross"], 1, 6);
console.log(tokenizedString.toString());
console.log(tokenizedString.getChildrenRecursive().toString());
debugger;*/


var Parser = function(compiledDirectory) {
	this.compiledDirectory = compiledDirectory;
	this.openTag	= "<%";
	this.closeTag	= "%>";
	
	this.$core = {
		loop: 0,
		level: 0
	};

};

Parser.prototype.compileFile = function(fileName, callback) {
	var self = this;
	
	fs.readFile(fileName, function(err, data) {
		if(err) {
			return callback(err, null);
		}
		
		callback(null, self.compile(data.toString()));
	});
};

Parser.prototype.compile = function(string) {
	var self = this;
	
	self.$core.loop = 0;
	
	var code;
	
	var timer = new Timer();
	while(code = self.parse(string)) {
		string = self.execute(code).buffer;
		self.$core.loop++;
		timer.disp("loop time :");
		timer.clear();
	}
	
	return string;
};

Parser.prototype.parseFile = function(fileName, callback) {
	var self = this;
	
	fs.readFile(fileName, function(err, data) {
		if(err) {
			return callback(err, null);
		}
		
		callback(null, self.parse(data.toString()));
	});
};

Parser.prototype.parse = function(string) {
	var self = this;
	
	
	var tokenizedString = self._tokenize(string);
	
	//console.log(tokenizedString.toTree().toString());

	return self._parseTopLevel(tokenizedString);
};

	Parser.prototype._tokenize = function(string) {
		var self = this;
		
		var tokenizedString = new TokenizedString(new VisibilityString(string));
		
		self._tokenizeEscapedTags(tokenizedString);
		self._tokenizeRecursiveTags(tokenizedString);
		
		tokenizedString.getChildrenRecursive();
		
		return tokenizedString;
	};
	
		Parser.prototype._tokenizeEscapedTags = function(tokenizedString) {
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
		
		Parser.prototype._tokenizeRecursiveTags = function(tokenizedString) {
			var self = this;
			
			var matches = (new RecursiveRegExp(self.openTag + '([^\\s]*)\\s', 'g', function(match) {
				var matchContent = match.variables[0];
				
				var tagSettings = {};
				var _match;
				
				
				if((new RegExp('^\\!$', 'g')).match(matchContent)) { // <%!
					tagSettings.type = "comment";			
				} else {
					tagSettings.type = "execute";
					
					if((new RegExp('=$', 'g')).match(matchContent)) {
						tagSettings.directWrite = true;
						matchContent = matchContent.slice(0, matchContent.length - 1);
					} else {
						tagSettings.directWrite = false;
					}
					
					
					if((new RegExp('^(\\^)|(BEGIN)$', 'g')).match(matchContent)) {
						tagSettings.level = "begin";
					} else if((new RegExp('^(\\$)|(END)$', 'g')).match(matchContent)) {
						tagSettings.level = "end";
					} else if((new RegExp('^(\\*)|(ALL)$', 'g')).match(matchContent)) {
						tagSettings.level = "all";
					} else if(_match = (new RegExp('^(\\+\\d+)?$', 'g')).match(matchContent)) {
						tagSettings.level = "auto";
						if(_match.variables[0] !== null) {
							tagSettings.nestingIncrement = parseInt(_match.variables[0]);
						} else {
							tagSettings.nestingIncrement = 1;
						}
					} else {
						throw { name: "invalid_tag", match: match, message: "invalid tag \"" + match.matchString + "\"" + indexToLineColumnString(tokenizedString.visibilityString.string, match.position.start) };
					}
				}
				
				match.tagSettings = tagSettings;
				
				return RegExp.quote(self.closeTag);
				
			}, 'g')).matchAll(tokenizedString.visibilityString);
		
			for(var i = 0; i < matches.length; i++) {
				var match = matches[i];
				
				if(match.start === null) {
					throw { name: "close_tag_without_open", match: match, message: "found close tag without previously opening it" + indexToLineColumnString(tokenizedString.visibilityString.string, match.end.position.start) };
				}
				
				if(match.end === null) {
					throw { name: "open_tag_without_close", match: match, message: "found open tag without closing it" + indexToLineColumnString(tokenizedString.visibilityString.string, match.start.position.start) };
				}
				
				tokenizedString.addToken(["open_tag"], match.start.position.start, match.start.position.end);
				tokenizedString.addToken(["close_tag"], match.end.position.start, match.end.position.end);
				var token = tokenizedString.addToken(["tag"], match.start.position.start, match.end.position.end);
				token.match = match;
			}
		
			return tokenizedString;
		};
	
	
	Parser.prototype._parseTopLevel = function(tokenizedString) {
		var self = this;
		
		var sortedTokens = self._sortTokensByType(tokenizedString);
		
		if(sortedTokens.begin.length != 0) {
			return self._parseTokens(tokenizedString.visibilityString, sortedTokens.begin);
		} else {
			var keys = Object.keys(sortedTokens.auto);
				
			if(keys.length == 0) {
				return null;
			} else {
				var max  = Math.max.apply(null, keys);
				return self._parseTokens(tokenizedString.visibilityString, sortedTokens.auto[max]);
			}
		}
	};
	
		Parser.prototype._sortTokensByType = function(tokenizedString) {
			var tokens = {
				begin: [],
				end: [],
				all: [],
				auto: [],
				esc_open: [],
				esc_close: []
			};
		
		
			this._computeNestingLevel(tokenizedString.rootToken, 0, tokens);
			
			return tokens;
		};
		
			Parser.prototype._computeNestingLevel = function(token, nesting, tokens) {
				var self = this;
				
				if(token.names.indexOf("tag") != -1) {	
					var tagSettings = token.match.start.tagSettings
					switch(tagSettings.type) {
						case "execute":
							if(typeof nesting == "number") {
								switch(tagSettings.level) {
									case "auto":
										nesting += tagSettings.nestingIncrement;
										if(typeof tokens.auto[nesting] == "undefined") {
											tokens[tagSettings.level][nesting] = [];
										}
										
										tokens[tagSettings.level][nesting].push(token);
									break;
									
									case "begin":
									case "end":
									case "all":
										tokens[tagSettings.level].push(token);
										nesting = tagSettings.level;
									break;
								}
							} else {
								throw { name: "nesting_into_special_tag", token: token, message: "You can't nest more tags into special tag like begin (^), end ($) or all (*) " + indexToLineColumnString(stringToParse.string, token.match.start.position.start) };
							}
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
		
		Parser.prototype._parseTokens = function(visibilityString, tokens) {
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
		
			Parser.prototype._bufferWrite = function(string, rawCode) {
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

	
Parser.prototype.execute = function(code) {
	var self = this;
	self.$core.$buffer = new Buffer();
	
	(new Function('$core', '$buffer', code))(self.$core, self.$core.$buffer);
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

var parser = new Parser();
parser.compileFile(fileName, function(error, code) {
	if(error) {
		throw error;
	}

	var newFileName = "compiled/" + "out" + ".js";
	fs.writeFile(newFileName, code, 'utf8', function() {
		console.log(newFileName + ' compiled with success');
		/*console.log(newFileName + ' parsed with success');
		
		newFileName = "compiled/" + "out_comp" + ".js";
		fs.writeFile(newFileName, parser.execute(code).buffer, 'utf8', function() {
			console.log(newFileName + ' compiled with success');
		});*/
	});
	
	
});
