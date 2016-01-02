

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
			
			
String.prototype.escapeSpecialChars = function() {
	return JSON.stringify(this);
};

String.prototype.elegantLineBreak = function() {
	return (new RegExp("(\\\\r?\\\\n)((?:\\\\t)*)", "g")).replace(this, function(match) {
		var eol = "\"\\\\n\"";
		//var eol = "String.eol";
		var tabs = (new RegExp("\\\\t", "g")).replace(match.variables[1], "\t");
		//var tabs = "String.tab(" + (new RegExp("\\\\t", "g")).matchAll(match.variables[1]).length + ")";
		
		return "\" + " + eol + " + \n" + tabs +"+ \"" + match.variables[1] + "";
	});
};

String.prototype.tab = function() {
	return "\t" + ((new RegExp("(\r?\n)", "g")).replace(this, "$1\t"));
};


var Timer = function() {
	this.time = process.hrtime();	
};

Timer.prototype.diff = function() {
	var diff = process.hrtime(this.time);
	return diff[0] * 1e9 + diff[1];
};

Timer.prototype.disp = function(string) {
	console.log(string + " " + (this.diff() / 1e6) + "ms");
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
};

Parser.prototype.parseFile = function(fileName, callback) {
	var self = this;
	
	fs.readFile(fileName, function(err, data) {
		if(err) {
			return callback(err);
		}
		
		self.parse(data.toString(), callback);
	});
};

Parser.prototype.parse = function(string, callback) {
		
	var stringToParse = new VisibilityString(string);
	var tokenizedString = new TokenizedString(stringToParse);
	
	while(match = (new RegExp('<\%ESC\%', 'g')).match(stringToParse)) {
		stringToParse.setVisibility(match.position.start, match.position.end, VisibilityString.transparent);
		tokenizedString.addToken(["esc_open_tag"], match.position.start, match.position.end);
	}

	while(match = (new RegExp('\%ESC\%>', 'g')).match(stringToParse)) {
		stringToParse.setVisibility(match.position.start, match.position.end, VisibilityString.transparent);
		tokenizedString.addToken(["esc_close_tag"], match.position.start, match.position.end);
	}
	
	
	var reg = new RecursiveRegExp('<\%([^\%]*)\%', 'g', function(match) {
		var matchContent = match.variables[0];
		
		if((new RegExp('^([0-9]+)$', 'g')).match(matchContent)) {
			match.nesting = parseInt(matchContent);
			return RegExp.quote('%%>');
		}
		
		if((new RegExp('^$', 'g')).match(matchContent)) {
			return RegExp.quote('%%>');
		}
		
		throw { name: "invalid_tag", match: match, message: "invalid tag \"" + match.matchString + "\"" + indexToLineColumnString(stringToParse.string, match.position.start) };
	}, 'g');
	
	var matches = reg.matchAll(stringToParse);
	for(var i = 0; i < matches.length; i++) {
		var match = matches[i];
		
		if(match.start === null) {
			throw { name: "close_tag_without_open", match: match, message: "found close tag without previously opening it" + indexToLineColumnString(stringToParse.string, match.end.position.start) };
		}
		
		if(match.end === null) {
			throw { name: "open_tag_without_close", match: match, message: "found open tag without closing it" + indexToLineColumnString(stringToParse.string, match.start.position.start) };
		}
		
		tokenizedString.addToken(["open_tag"], match.start.position.start, match.start.position.end);
		tokenizedString.addToken(["close_tag"], match.end.position.start, match.end.position.end);
		var token = tokenizedString.addToken(["tag"], match.start.position.start, match.end.position.end);
		token.match = match;
	}
	
	time_this(function(timer) {
		tokenizedString.getChildrenRecursive();
		timer.disp("tokenizedString.getChildrenRecursive :");
	});
	
	//console.log(tokenizedString.rootToken.toString());
	
	var tagsByLevel = [];
	var escapedTag = {
		open: [],
		close: []
	};
	
	var computeNestingLevel = function(token, nesting) {
		if(token.names.indexOf("tag") != -1) {		
			if(typeof token.match.start.nesting != "undefined") {
				nesting = token.match.start.nesting;
			}
			
			if(typeof tagsByLevel[nesting] == "undefined") {
				tagsByLevel[nesting] = [];
			}
			tagsByLevel[nesting].push(token);
			nesting++;
		}
		

		if(token.names.indexOf("esc_open_tag") != -1) {
			escapedTag.open.push(token);
		}
		
		if(token.names.indexOf("esc_close_tag") != -1) {
			escapedTag.close.push(token);
		}
		
		token.children.forEach(function(token) {
			computeNestingLevel(token, nesting);
		});
	};
	
	computeNestingLevel(tokenizedString.rootToken, 0);

	var keys = Object.keys(tagsByLevel);
	if(keys.length == 0) {
		console.log('everything compiled');
	} else {
		var max  = Math.max.apply(null, keys);

		var code = "";
		var $buffer = {
			buffer: "",
			write: function(string) {
				this.buffer += string;
			}
		};
		
		var lastIndex = 0;
		for(var i = 0; i < tagsByLevel[max].length; i++) {
			var token = tagsByLevel[max][i];
			
			var start	= lastIndex;
			var end		= token.start;
			var string	= tokenizedString.visibilityString.string.slice(start, end);
			string = (new RegExp(RegExp.quote("<%ESC%"), "g")).replace(string, "<%");
			string = (new RegExp(RegExp.quote("%ESC%>"), "g")).replace(string, "%>");

			code += "$buffer.write(" + string.escapeSpecialChars().elegantLineBreak() + ");\n";
			code += tokenizedString.visibilityString.string.slice(token.match.start.position.end, token.match.end.position.start)
			
			lastIndex = token.end;
		}
		
		var start	= lastIndex;
		var end		= tokenizedString.visibilityString.string.length;
		var string	= tokenizedString.visibilityString.string.slice(start, end);

		code += "$buffer.write(" + string.escapeSpecialChars().elegantLineBreak() + ");\n";
		
		//console.log(code);
		//console.log("\n\n");
		
		
		callback(null, code);
		
		
		/*var f = new Function('$buffer', code);
		f($buffer);
		
		level++;
		var newFileName = fileName + level;
		fs.writeFile(newFileName, $buffer.buffer, 'utf8', function() {
			console.log(newFileName + ' compiled with success');
			parseFile(newFileName, level);
		});*/
	}
	

};


var fileName = "test.cpp.adv";

var parser = new Parser("compiled/");
parser.parseFile(fileName, function(error, code) {
	var newFileName = parser.compiledDirectory + fileName + ".js";
	fs.writeFile(newFileName, code, 'utf8', function() {
		console.log(newFileName + ' compiled with success');
	});
});
