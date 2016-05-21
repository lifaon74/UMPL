##Universal Meta Programming Language (UMPL)
This project enable powerful code preprocessing for any languages simply by adding a set a tags. UMPL is here to **strongly optimize program**, **avoid repeating code**, and even **create self-programming software**. The syntax is similar to PHP and ASP.NET, but the purpose is totaly different : keep nice code but enable optimization for compiler. A well written umpl file could for example compress and merge javascript files on a web project decreasing page loading time, or write asm command  on a C project for faster execution.

###Install and test :
*current version :* **1.1.X**

`npm install umpl_compiler`

or add into your package.json :
```javacsript
"devDependencies": {
	"umpl_compiler": "latest"
 }
```
And : `npm install`

For easier developpement you could use for example [webstom](https://www.jetbrains.com/webstorm/) and create your own watcher for auto-compilation (see: umpl_compiler/readme_files/setup_watcher.pdf). Or you can manually compile umpl file with command : `node compiler.js in=umpl_file_in out=umpl_file_out`

**Soon** : *umpl watcher script*

###Syntax :
UMPL works with *every language*. It's an overlay which add tags and preprocess everything between them. Inside of these tags, you write **javascript (node.js)** code.
The force come from the fact that you can add tags *inside* of others tags : so it's possible to generate code for sub-levels and do a lot of preprocessing for strong optimization. The compiler will then start with the higher level (depending of tag nesting), and execute as many loops as necessary until nothing remains to be compiled.

![Compilation Process](readme_files/compilation_process.png)

####Nesting :
- `<% some javascript code %>` : everything between these tags will be preprocessed. It's possible to nest these tags : 
```
<%
	some code executed on the second loop
	<% some code executed on the first loop %>
%>
```

- `<%+N` (where N is a number) : increment nesting level by N. 
```
<%
	some code executed on the third loop, because it's nesting level is 1
	<%+2 some code executed on the first loop, because it's nesting level is 1 + 2 = 3 %>
%>
<%+2 some code executed on the second loop, because it's nesting level is 2 %>
```

**IMPORTANT** : you must have a white space after ```<%``` and before ```%>```

####Escape :
- `<%#` : escape the open tag. Will result in `<%`
- `#%>` : escape the close tag. Will result in `%>`

####Write some data :
- `$buffer.push(data)` :  everything written into the buffer, will be print into the sub-level.
```
<% $buffer.push("Hello world !"); %>
```
Result in :
```
Hello world !
```

####Equal :

- `=%>` to convert following raw text into js string. Useful to get a sub-level code as a string.
- `<%=` to write following javascript code directly. Faster than writing $buffer.push.

#####Example:
```javascript
<%
	// set the cpp function into cpp_string
	var cpp_string =
		=%>
			uint8_t  add(uint8_t a, uint8_t b) {
				return a + b;
			}
		<%
	;
%>

	// write cpp_string
<%= cpp_string %>
```

##### Chaining (for hardcore programmer) :  
- `=%> txt <%= js =%>` :  will be converted into `txt + " + " + js + " + "`, can be read as -- convert "txt" in javascript string, append "js" string, and append next raw text --
- `=%> txt <%= js %>` :  is invalid
- `=%> txt <% js [tag]` : will be converted into `txt + js`, can be read as -- convert "txt" in javascript string, then do whats' you want with your js code --
- `%> txt <%= js =%>` : is invalid
- `%> txt <%= js %>`:  will be converted into `"$buffer.push(" + txt + " + " + js + ");"`, can be read as -- convert "txt" in javascript string, and append your js code, then write both into the out buffer --
- `%> txt <% js [tag]` :  will be converted into `"$buffer.push(" + txt + ");" + js`, can be read as -- convert "txt" in javascript string, write it into the buffer, then do whats' you want with your js code --


####Global variables :
Global variables are available on every loops, and help developers to control the compilation process.

`$buffer` : this is a VString object which contains all the code generated on the current loop.

**INFO :** VString has exactly the same methods than a string but enable string to be passed by reference instead of copy. But instead of :
* += : `.push`
* = : `.set`
* `.get`

```$globals``` : this object must be used to store variables working on different level. Its components will not change or be erased between each loops.

```$dirname``` :  equivalent to __dirname

```$compiler``` : give you a set of methods to control the execution of the preprocessing compilation.

- ```$compiler.loop``` : tells you on which loop you are.
- ```$compiler.level``` : tells you on which level you are (according to tag nesting).
- ```$compiler.bind(eventName, callback)``` : listen for an incoming event.
	- event: 'compile_error', argument: error : triggered when an error occurs. **error** gives you mores informations about the problem.
	-  event: 'parse_loop', argument: jsCode: triggered every loop, just after the conversion from UMPL file into an executable javascript file. **jsCode** gives you the raw javacript code.
	- event: 'execute_loop', argument: code: triggered every loop, just after the execution of the previous javascript code. **code** gives you the raw output.
	- event: 'compiled', argument: outputCode: triggered at the end of the compilation. **outputCode** gives you the final output.

```$scope``` :  this object contains all global variables and can generate others. For example, if you need to have ```fs``` on every loop, you can do :
```
<%+100 // lvl 100
var fs = require('fs');
$scope['fs'] = fs;
%>
<% // lvl 1
	fs is available here
%>
```


###Examples :
see *umpl_compiler/examples/*

recursive.umpl.js
```
<%
var f = function () {
	if($compiler.loop >= 1000) {
		throw { message: "end of program after " + $compiler.loop + " loops. Output code :\n\n" + $compiler.jsCode }
	}
	
	$buffer.push(
		"<\%\n" +
			"var f = " + f.toString() + ";f();" +
		"\n%\>"
	);
};f();
%>
```
You will result in a pure recursive code generation (and an infinite loop by the way ;) , that's there is a security to stop at 1000).