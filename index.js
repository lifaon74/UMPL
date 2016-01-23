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

//var fileName = "examples/test.cpp.adv";
//var fileName = "examples/recursive.adv";
//var fileName = "examples/basic.adv";
var fileName = "examples/arduino.js";
//var fileName = "examples/variables_scope.js";
//var fileName = "examples/aliments.js";
//var fileName = "examples/const.js";
//var fileName = "examples/buffer.js";

UMPLCompiler.compileFile(fileName, 'compiled/examples_arduino.js/examples_arduino.js.ino', true);
