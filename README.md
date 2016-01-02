## Universal Meta Programming Language (UMPL) ##
This project brings you a new way of developping. Sometimes it appends than developpers would preffer to preprocess some code. A perfect example, is C and its derivatives : we often use macro because we need to adapt some codes for a specific environment (could be a microcontroller, an OS, ...), or maybe to implement some function to generate repetitive code. But we quickly reach the limits of macros : no loops, basis functions, etc.

Another problem appends sometimes when we want to check if others developpers are not injecting wrong variables (types or value).  For example, we could do in javascript :

```function parseString(string) {
	if(typeof string != "string") {
		throw new Error("You must pass a string");
	}
	// continue with some code here
}```