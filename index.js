var umpl_compiler	= require('umpl_compiler');
var tools			= require('tools');

var UMPLCompiler	= umpl_compiler.UMPLCompiler;


var projectPath = 'projects/arduino';
var outputFile 	= 'arduino.ino';
UMPLCompiler.compileProject(projectPath, 'arduino.ino', true);

