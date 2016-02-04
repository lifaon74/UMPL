##Universal Meta Programming Language (UMPL)##
This project enable powerfull code preprocessing for any languages simply by adding a set a tags. This way it's possible to **strongly optimize program**, and even create **self-programming software**. This project is inspired from PHP and ASP.NET, but go further.

*current version :* **1.0.0**

###Install and test :
Download the lib from github, open a console and type :
```node daemon.js```

###Syntax :
UMPL works with *every language*. It's an overlay which add tags and preprocess everything bettween them. Inside of these tags, you write **javascript (node.js)** code.
The force come from the fact that you can add tags *inside* of others tags : so it's possible to generate code for sublevels and do a lot of preprocessing for strong optimization. The compiler will then start with the higher level (depending of tag nesting), and execute as many loops as necessary until nothing remains to be compiled.

####Nesting :
- ```<% some javascript code %>``` : everything beetween these tags will be preprocessed. It's possible to nest these tags : 
```
<%
	some code executed on the second loop
	<% some code executed on the first loop %>
%>
```

- ```<%+N``` (where N is a number) : increment nesting level by N. 
```
<%
	some code executed on the third loop, because it's nesting level is 1
	<%+2 some code executed on the first loop, because it's nesting level is 1 + 2 = 3 %>
%>
<%+2 some code executed on the second loop, because it's nesting level is 2 %>
```

**IMPORTANT** : you must have a white space after ```<%``` and before ```%>```

####Escape :
- ```<%#``` : escape the open tag. Will result in ```<%```
- ```#%>``` : escape the closetag. Will result in ```%>```

####Write some data :
- ```$buffer.push(data)``` :  everything written into the buffer, will be print into the sublevel.
```
<% $buffer.push("Hello world !"); %>
```
Result in :
```
Hello world !
```

####Equal :

- ```=%>``` to convert following raw text into js string. Usefull to get a sublevel code as a string.
- ```<%=``` to write following javascript code directly. Faster than writing $buffer.push.

#####Chaining :
- ```=%> txt <%= js =%>``` :  will be converted into ```txt + " + " + js + " + "```, can be read as -- convert "txt" in javascript string, append "js" string, and append next raw text --
- ```=%> txt <%= js %>``` :  is invalid
- ```=%> txt <% js [tag]``` : will be converted into ```txt + js```, can be read as -- convert "txt" in javascript string, then do whats' you want with your js code --
- ```%> txt <%= js =%>``` : is invalid
- ```%> txt <%= js %>``` :  will be converted into ```"$buffer.push(" + txt + " + " + js + ");"```, can be read as -- convert "txt" in javascript string, and append your js code, then write both into the out buffer --
- ```%> txt <% js [tag]``` :  will be converted into ```"$buffer.push(" + txt + ");" + js```, can be read as -- convert "txt" in javascript string, write it into the buffer, then do whats' you want with your js code --


####Global variables :
Global variables are available on every loops, and help developpers to control the compilation process.

```$buffer``` : this is a VString object which contains all the code generated on the current loop.

```$globals``` : this object must be used to store variables working on different level. Its components will not change or be erased between each loops.

```$dirname``` :  equivalent to __dirname

```$compiler``` : give you a set of methods to control the execution of the preprocessing compilation.

- ```$compiler.loop``` : tells you on which loop you are.
- ```$compiler.level``` : tells you on which level you are (according to tag nesting).
- ```$compiler.bind(eventName, callback)``` : listen for an incomming event.
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
recursive.adv
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
You will result in a pure recursive code generation (and an infinite loop by the way ;) , that's why I stop at 1000).

***Next comming soon...***