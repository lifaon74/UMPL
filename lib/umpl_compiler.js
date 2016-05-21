
var recursive_regexp	= require('regexp_utils');
var visibility_string	= require('visibility_string');
var linked_list			= require('linked_list');
var tools				= require('./tools');


var RecursiveRegExp		= recursive_regexp.RecursiveRegExp;
var VisibilityString	= visibility_string.VisibilityString;

var LinkedNode			= linked_list.LinkedNode;
var LinkedNodeIterator	= linked_list.LinkedNodeIterator;
var LinkedList			= linked_list.LinkedList;

var BindClass			= tools.BindClass;
var createClass			= tools.createClass;
var Timer				= tools.Timer;
var _					= tools._;
var VString				= tools.VString;
var fs					= tools.fs;
var path 				= tools.path;


var _Error = function(obj, message, code, positions, other) {
	obj.message	= message || "";
	obj.code		= code || "";
	
	positions 		= positions || [];
	if(!_.isArray(positions)) {
		positions = [positions];
	}
	
	obj.positions	= positions;
	
	other			= other || {};
	for(key in other) {
		obj[key] = other[key];
	}
};

var ParseError = function(message, code, positions, other) {
    this.name		= "ParseError";
    _Error(this, message, code, positions, other);
};
ParseError.prototype = Error.prototype;


var ExecError = function(message, code, positions, other) {
    this.name		= "ExecError";
    _Error(this, message, code, positions, other);
};
ExecError.prototype = Error.prototype;


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

TokenTree.prototype.toString = function() {
	var str = "";
	str += this.names.toString() + " [" + this.start + "-" + this.end + "]";
	
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
					throw new ParseError("Found two tokens crossing", "crossing_tokens", [token.start, _token.end], { tokens: [token, _token] });
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
	
	


var UMPLCompiler = createClass(function(settings) {
	var self = this;
	
	BindClass.apply(self, []);

	self.openTag		= "<%";
	self.closeTag		= "%>";
	
	self.execModes = _.enumerate([
		"EVAL",
		"FUNCTION",
		"REQUIRE"
	]);
	
	self.scope = {
		'$compiler': self,
		'$buffer': null,
		'$globals': {},
		'require': require,
		'VString': VString
	};
	
	self.execMode = self.execModes.REQUIRE;
	
}, "UMPLCompiler").extend(BindClass);


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
	return UMPLCompiler.lineColumnToString(position.line, position.column);
};

UMPLCompiler.lineColumnToString = function(line, column) {
	return "( line : " + line + ", column : " + column + " )";
};


// TODO : stop use string, use buffer instead
UMPLCompiler.prototype.compile = function(inputCode, config) {
	var self = this;
	
	if(!self.compiling) {
		if(typeof config == "undefined") { var config = {}; }
		
		self.compiling 	= true;
		self.code		= new VString();
			self.code.push(inputCode);
			
		config.root = config.root || '';
		var rootModule = module;
		while(rootModule.parent !== null) {
			rootModule = rootModule.parent;
		}

		//self.scope['$dirname']	= path.norm(path.norm(path.dirname(rootModule.filename), true) + config.root, true);
		self.scope['$dirname']	= path.norm(config.root, true);

		self.jsCode		= new VString();
		self.loop		= 0;
		self.level		= 0;
		
		self.errorOccured = false;
		
		self.compileLoop();
		
		if(!self.errorOccured) {
			self.trigger('compiled', [self.code]);
		}
		
		self.compiling 	= false;
	}
};

UMPLCompiler.prototype.compileLoop = function() {
	var self = this;

	while(true) {
		try {
			self.jsCode = self.convertToJS(self.code);
		} catch(error) {
			self._on_compile_error(error, self.code, self.loop, 'parsing');
			self.errorOccured = true;
		}
		
		if(self.errorOccured) { break; }
		
		if(self.jsCode === null) {
			break;
		} else {
			self.trigger('parse_loop', [self.jsCode]);
			
			try {
				self.code = self.execute(self.jsCode);
			} catch(error) {
				self._on_compile_error(error, self.jsCode, self.loop, 'executing');
				self.errorOccured = true;
			}
		}
		
		if(self.errorOccured) { break; }
		
		self.trigger('execute_loop', [self.code]);
		
		self.loop++;
	}
};


	// convert UMPL code into js executable code
UMPLCompiler.prototype.convertToJS = function(vstring) {
	var self = this;
	
	var tokenizedString = self._tokenize(vstring);
	//console.log(tokenizedString.toTree().toString());
	
	var jsString = self._parseTopLevel(tokenizedString);
	if(jsString === null) {
		return null;
	} else {
		return new VString(jsString);
	}
};

		// generate tokenizedTree from UMPL code
	UMPLCompiler.prototype._tokenize = function(vstring) {
		var self = this;
		
		var tokenizedString = new TokenizedString(new VisibilityString(vstring.get()));
		
		self._tokenizeEscapedTags(tokenizedString);
		self._tokenizeCommentTags(tokenizedString);
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
		
		UMPLCompiler.prototype._tokenizeCommentTags = function(tokenizedString) {
			var self = this;
			
			(new RecursiveRegExp(RegExp.quote(self.openTag + '!'), 'g', RegExp.quote('!' + self.closeTag), 'g')).matchAll(tokenizedString.visibilityString).forEach(function(match) {
				debugger;
				self._detectCrossingTagsInMatch(match);
				tokenizedString.visibilityString.setVisibility(match.start.position.start, match.end.position.end, VisibilityString.invisible);
				var token = tokenizedString.addToken(["comment_tag"], match.start.position.start, match.end.position.end);
				token.match = match;
			});
			
			return tokenizedString;
		};
		
		UMPLCompiler.prototype._tokenizeRecursiveTags = function(tokenizedString) {
			var self = this;
			
			// '([^\\s]*)\\s'
			(new RecursiveRegExp(RegExp.quote(self.openTag) + '([^\\=\\s]*)((?:\\=)|(?:\\s))', 'g', function(match) {
				var tagSettings = {};
				var _match;
				
				if(_match = (new RegExp('^(\\+\\d+)?$', 'g')).match(match.variables[0])) {
					if(_match.variables[0] !== null) {
						tagSettings.nestingIncrement = parseInt(_match.variables[0]);
					} else {
						tagSettings.nestingIncrement = 1;
					}
				} else {
					throw new ParseError("Invalid UMPL tag \"" + match.matchString + "\"", "invalid_umpl_tag", [match.position.start], { match: match });
				}
				
				match.tagSettings = tagSettings;
				
				return "((?:\\=)|(?:\\s))" + RegExp.quote(self.closeTag);
				
			}, 'g'))
			
			.matchAll(tokenizedString.visibilityString).forEach(function(match) {
				self._detectCrossingTagsInMatch(match);
				var token = tokenizedString.addToken(["execute_tag"], match.start.position.start, match.end.position.end);
				token.match = match;
			});
			
			 
			/*var matches = (new RecursiveRegExp(self.openTag + '([^\\s]*)\\s', 'g', function(match) {
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
				
				
				
				tokenizedString.addToken(["open_tag"], match.start.position.start, match.start.position.end);
				tokenizedString.addToken(["close_tag"], match.end.position.start, match.end.position.end);
				var token = tokenizedString.addToken(["tag"], match.start.position.start, match.end.position.end);
				token.match = match;
			}*/
		
			return tokenizedString;
		};
	
			UMPLCompiler.prototype._detectCrossingTagsInMatch = function(match) {
				if(match.start === null) {
					throw new ParseError("Found close tag without any corresponding open tag", "close_umpl_tag_without_open", [match.end.position.start], { match: match });
				}
				
				if(match.end === null) {
					throw new ParseError("Found open tag without any corresponding close tag", "open_umpl_tag_without_close", [match.start.position.start], { match: match });
				}
			};
	
	
	UMPLCompiler.prototype._parseTopLevel = function(tokenizedString) {
		var self = this;
		
		var sortedTokens = self._sortTokensByType(tokenizedString);
		
		var keys = Object.keys(sortedTokens.execute);
			
		if(keys.length == 0) {
			return null;
		} else {
			var max  = Math.max.apply(null, keys);
			self.level = max;
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
				
				if(token.names.indexOf("execute_tag") != -1) {
				
					var tagSettings = token.match.start.tagSettings;
					nesting += tagSettings.nestingIncrement;
					if(typeof tokens.execute[nesting] == "undefined") {
						tokens.execute[nesting] = [];
					}	
					tokens.execute[nesting].push(token);
					
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
			
			var open_token = null;
			for(var i = 0; i < tokens.length; i++) {
				var close_token = tokens[i];
				code += self._catchRawText(open_token, close_token, visibilityString);
				open_token = close_token;
			}
			
			code += self._catchRawText(open_token, null, visibilityString);
			
			return code;
		};
			
			UMPLCompiler.prototype._catchRawText = function(open_token, close_token, visibilityString) {
				var self = this;
				
				var getVirtualTag = function(_position) {
					return {
						match: {
							start: {
								position: {
									start: _position,
									end: _position
								},
								variables: ["", ""]
							},
							end: {
								position: {
									start: _position,
									end: _position
								},
								variables: [""]
							}
						}
					};
				};
				
				if(open_token === null) {
					open_token = getVirtualTag(0);
				}
				
				if(close_token === null) {
					close_token = getVirtualTag(visibilityString.string.length);
				}
				
				var rawText = visibilityString.slice(open_token.match.end.position.end, close_token.match.start.position.start, VisibilityString.transparent).escapeSpecialChars();
				
				var jsCode = visibilityString.string.slice(close_token.match.start.position.end, close_token.match.end.position.start);
				jsCode = (new RegExp(RegExp.quote(self.openTag + "#"), "g")).replace(jsCode, self.openTag);
				jsCode = (new RegExp(RegExp.quote("#" + self.closeTag), "g")).replace(jsCode, self.closeTag);
				
				
				if(open_token.match.end.variables[0] == "=") {  // =%> txt [tag] js [tag]
					if(close_token.match.start.variables[1] == "=") {  // =%> txt <%= js [tag]
						if(close_token.match.end.variables[0] == "=") { // =%> txt <%= js =%>
							return rawText + " + (" + jsCode + ") + ";
						} else { // =%> txt <%= js %>
							throw new ParseError("Invalid chaining =%> tx t<%= js %> , the last close tag must be =%> in this situation", "invalid_tags_chain", [close_token.match.end.position.start], { token: close_token });
						}
					} else { // =%> txt <% js [tag]
						return rawText + jsCode;
					}
				} else { // %> txt [tag] js [tag]
					if(close_token.match.start.variables[1] == "=") {  // %> txt <%= js [tag]
						if(close_token.match.end.variables[0] == "=") { // %> txt <%= js =%>
							throw new ParseError("Invalid chaining %> tx t<%= js =%> , the last close tag must be %> in this situation", "invalid_tags_chain", [close_token.match.end.position.start], { token: close_token });
						} else { // %> txt <%= js %>
							return "$buffer.push(" + rawText + " + (" + jsCode + "));";
						}
					} else { // %> txt <% js [tag]
						return "$buffer.push(" + rawText + ");" + jsCode;
					}
				}
			};

	
UMPLCompiler.prototype.execute = function(code) {
	var self = this;
	
	self.scope['$buffer']	= new VString();
	var scopeVars = "";
	for(varName in self.scope) {
		scopeVars += "var " + varName + " = $scope['" + varName + "'];";
	}
	self.buffer = self.scope['$buffer'];
	
				
				
				
	switch(self.execMode) {
		case self.execModes.REQUIRE:
			var filePath = __dirname + '/temp' + Math.floor(Math.random() * 10e12) + '.js';
			var jsCode = "module.exports.run = function($scope) {" + scopeVars + "\n" + code + " };"
			fs.writeFileSync(filePath, jsCode);
		break;
	}
		
	try {
		switch(self.execMode) {
			case self.execModes.EVAL:
				/*var $compiler		= self;
				var $buffer			= self.$buffer;	
				eval(code);*/
			break;
			case self.execModes.FUNCTION:
				(new Function('$scope', scopeVars + code))(self.scope);
			break;
			case self.execModes.REQUIRE:		
				var debug = require(filePath);
				debug.run(self.scope);
			break;
		}
	
	} catch(error) {
		switch(self.execMode) {
			case self.execModes.REQUIRE:
				fs.unlinkSync(filePath);
			break;
		}
		throw error;
	}
	
	switch(self.execMode) {
		case self.execModes.REQUIRE:
			fs.unlinkSync(filePath);
		break;
	}
		
	return self.scope['$buffer'];
};


	UMPLCompiler.prototype._on_compile_error = function(error, vstring, loop, context) {
		var self = this;
		var string = vstring.toString();
		
		switch(context) {
			case 'parsing':
			break;
			case 'executing':
				if(error.name != 'SyntaxError') {
					var match	= (new RegExp('at UMPLCompiler.execute([^\\n]*)\\n', 'g')).match(error.stack);
					if(match) {
						var stack = error.stack.slice(0, match.position.start);
						stack = stack.split('at').splice(1);
						stack.forEach(function(value, key, array) {
							value = value.trim();
							
							var fnc_name;
							var file_name;
							
							var match	= (new RegExp('^([^ ]+) \\(([^\\)]+)\\)$', 'g')).match(value);
							if(match === null) {
								match	= (new RegExp('^([^\\)]+)$', 'g')).match(value);
								fnc_name = '';
								file_name = match.variables[0];
							} else {
								fnc_name = match.variables[0];
								file_name = match.variables[1];
							}
							
							var splitted = file_name.split(':');
							
							var stackLine = {
								'function': fnc_name,
								file: splitted.slice(0, -2).join(':'),
								line: parseInt(splitted[splitted.length - 2]) - 1,
								column: parseInt(splitted[splitted.length - 1])
							};
			
							array[key] = stackLine;
						});
						
						
						var lastStack = stack[0];
						
						var match;
						var line	= 0;
						var reg = new RegExp('\\n', 'g');
						while(true) {
							line++;
							if(line >= lastStack.line) {
								break;
							}
							match = reg.match(string);
						};
						
						var index	= match ?  match.position.end : 0;
						index += lastStack.column - 1;
						
						var originalError = error;
						error = new ExecError(originalError.message, "execution_error", [index], {
							stack: stack,
							originalError: originalError
						});
						
						
					}
				}
			break;
		}
		
		error.context	= context;
		error.loop		= loop;
		
		switch(error.name) {
			case 'ParseError':
			case 'ExecError':
				error.formatedString = "[ERROR (" + ((error.name == 'ParseError') ? "COMPILATION" : "EXECUTION") + ")] ";
				
				for(var i = 0; i < error.positions.length; i++) {
					if(i > 0) { error.formatedString += ", "; }
					error.formatedString += UMPLCompiler.indexToLineColumnString(string, error.positions[i]);
				}
				
				error.formatedString += " loop " + loop;
				error.formatedString += " : " + error.message;
			break;
		}
		
		self.trigger('compile_error', [error]);
	};



module.exports = {
  UMPLCompiler: UMPLCompiler
};
