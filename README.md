##Universal Meta Programming Language (UMPL)##
This project brings you a new way of developping, by adding tags to any languages and doing some preprocessing. This way it's possible to strongly optimize program, and even create self-programming software. This project is inspired from PHP and ASP.NET, but go further.

*current version : **0.1.0*** (alpha)

###The problem :
Sometimes it appends than developpers would preffer to preprocess some code. A perfect example, is C and its derivatives : we often use macro because we need to adapt some code for a specific environment (could be a microcontroller, an OS, ...), or maybe to implement some function to generate repetitive code. But we quickly reach the limits of macros : no loops, basic functions, etc.

Moreover, sometimes we want to check if others developpers are not injecting wrong variables (types or value).  For example, we could do in javascript :

```
function parseString(string) {
		// this simple test will be executed client-side, but could be preprocessed
	if(typeof string != "string") {
		throw new Error("You must pass a string");
	}
	// continue with some code here
}
```
This is a really simple example where we're checking is a string is passed instead of something else. This code, will then be loaded and executed many times by different clients. Exept that for the client, it's a waste of computing time, because it could have been checked before by preprocessing.

In short, in all these examples, as developers, we would like sometimes be able to create some functions which will automatically generate some code for us. All of this is possible with UMPL.

###Syntax :
UMPL works with every language. It's an overlay which add tags. These tags permit to execute **javascript** code at diffrents layers, and so we are able to generate code for sublevels and do a lot of preprocessing for strong optimization.

Let's assume we have a relay dumb C++ compiler, which doesn't optimize any code. Writing ```int i = 1 + 2; ``` will result in an addition executed everytime. With UMPL we could do this :
```
<%%
	function plus(a, b) {
		if(typeof a == "number" && typeof b == "number") {
			return a + b;
		} else {
			return a + " + " + b;
		}
	}
%%>

int i = 1;
cout << <%% $buffer.write(plus(1, 2)) %%> << eol; // eq : cout << 3 << eol;
cout << <%% $buffer.write(plus('i', 2)) %%> << eol; // eq : cout << i + 2 << eol;
```

So how it works :

You can code normally with your favorite language, but everytime you'll need to do some preprocessing, you can add the tags ```<%% some code %%>```. Everything between these tags will be exected before the compiler, and will ouput some code. This is the same as PHP for example. Nothing exeptional you would say, but the true strength comes in the fact that we can nest these tags.

```
int i = <%%
	var i = <%% $buffer.write(1 + 2) %%>; // eq: var i = 3;
	$buffer.write(i + 1); // eq : int i = 4;
%%>;
```
At the end we will get ```int i = 4;```

Of course this is a really simple example, just showing how UMPL works, so this example would be realy useless into a real program. But you can really easily create self programming application with this method.

###Special tags :
```<%ESC%``` will be converted into ```<%``` => NOT IMPLEMENTED YET
```%ESC%>``` will be converted into ```%>``` => NOT IMPLEMENTED YET
You can for example do :
```
<%%
(function() {
	$buffer.write(
		"<%ESC%%" +
			"$buffer.write(\"(" + this.toString() + ")();\");" +
		"%%ESC%>"
	);
})();
%%>
```
You will result in a pure recursive code generation (and an infinite loop by the way ;) )

***Next comming soon...***