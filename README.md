##Universal Meta Programming Language (UMPL)##
This project enable powerfull code preprocessing for any languages simply by adding a set a tags. This way it's possible to **strongly optimize program**, and even create self-programming software. This project is inspired from PHP and ASP.NET, but go further.

*current version :* **0.1.0** (work in progress)

###The problem :
Sometimes it appends than developpers would prefer to preprocess some code. A perfect example, is C and its derivatives (C++, C#,...) : we often use macro because we need to adapt some code to a specific environment (could be a microcontroller, an OS, a specific processor, ...), or occasionally to implement some function to generate repetitive code. But we quickly reach the limits of macros : no loops, realy basic instructions, etc.

Moreover, often we need to check if other developpers are using correctly our methods/functions.  For example, to check is a variable type is correct, we could do this in javascript :

```
function toUpperCase()(string) {
		// this simple test will be executed client-side, but could be preprocessed
	if(typeof string != "string") {
		throw new Error("You must pass a string");
	}
	return string.toUpperCase();
}
```
This is a really simple example where we're checking if a string is passed instead of something else, and then we uppercase it. Now, imagine this code is a part of a bigger library you created and you puted online . It will probably be used by differents developpers on their websites and never edited. Now what will append : this code, will be downloaded and executed many times by different clients, and maybe this function will be called millions of times. However, the variable type could have been checked once for all by a compiler (meaning preprocessing) rather than asking the customer to perform this task each time...

In short, in all these examples, as developers, we would like sometimes be able to create some preprocessing functions which will automatically generate some code for us. All of this is possible and easy to setup with UMPL.

###Syntax :
UMPL works with every language. It's an overlay which add tags. These tags permit to execute **javascript** code at diffrents layers, and so we are able to generate code for sublevels and do a lot of preprocessing for strong optimization.

**<%** *some code* **%>** : everything beetween this tags will be preprocessed. It's possible to nest these tags : 
```
<%
	some code executed on the second stage
	<% some code executed on the first stage %>
%>
```

**<%+N** (where N is a number) : increment code execution level by N. 
```
<%
	some code executed on the second stage, because it's execution level is 1
	<%+2 some code executed on the first stage, because it's execution level is 1 + 2 = 3 %>
%>
```

**<%=** or **<%+N=** : execute following code and write the result.
```
<% var i = "Hello world !"; %>
<%= i %>
```
Result in :
```
Hello world !
```

**<%#** : escape the open tag. Will result in **<%**
**#%>** : escape the closetag. Will result in **%>**

###Simple examples :
Let's assume we have a realy dumb C++ compiler, which doesn't optimize any code. Writing ```int i = 1 + 2; ``` will result in an addition executed everytime we launch the executable. With UMPL we could do this :
```
<%
	function plus(a, b) {
		if(typeof a == "number" && typeof b == "number") {
			return a + b;
		} else {
			return a + " + " + b;
		}
	}
%>

int i = 1;
<% var i = 1; %>
cout << <%= plus(i, 2) %> << eol;
cout << <%= plus('i', 2) %> << eol;
```
The output will be :
```
int i = 1;
cout << 3 << eol; 
cout << i + 2 << eol;
```
So how to devellop ?

You can code normally with your favorite language, but everytime you'll need to do some preprocessing, you can add the tags ```<% some code %>```. Everything between these tags will be exected before the compiler, and will be able to generate some code if needed. This is the same as PHP for example. Nothing exeptional you would say, but the true strength comes in the fact that we can nest these tags.

```
int i = <%
	var i = <%= 1 + 2 %>;
	$buffer.write(i + 1);
%>;
```
First stage :
```
int i = <%
	var i = 3;
	$buffer.write(i + 1);
%>;
```
Second and final stage :
```
int i = 4;
```
First of all the parser will search the higher level to execute. Here it's  ```<%= 1 + 2 %>```. It will execute the code and output the result into the sublevel (see first stage). Next, the parser will redo the exact thing : find the higher level, execute the code and we will get the second stage as result. Then there'se nothing more to parse, so the parser stop its job.

Of course this is a really simple example, just showing how UMPL works (this example would be realy useless into a real program). But you can really easily create self programming application with this method.




###Special tags :
```<%ESC%``` will be converted into ```<%``` => NOT IMPLEMENTED YET

```%ESC%>``` will be converted into ```%>``` => NOT IMPLEMENTED YET

You can for example do :
```
<%
var f = function () {
	$buffer.write(
		"<\%\n" +
			"var f = " + f.toString() + ";f();" +
		"\n%\>"
	);
};f();
%>
```
You will result in a pure recursive code generation (and an infinite loop by the way ;) )

***Next comming soon...***