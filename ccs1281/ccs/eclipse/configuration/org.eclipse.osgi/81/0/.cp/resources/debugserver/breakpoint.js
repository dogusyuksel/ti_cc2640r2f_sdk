/**
 * Add a software breakpoint, depends on the input argument, different type of breakpoint will be added. 
 * If arg1 is null, than it will be added as an address breakpoint or a symbolic breakpoint. If both arguments 
 * are not null, source breakpoint will be added, the first argument must be a string and the second argument 
 * must be a number.
 * @param arg0 can be address (number) or symbolic (string).
 * @param arg1 the line number, if and only if arg0 is a file.
 * @return the breakpoint index handle.
 * @service DSS Debug Server Commands
 */
function ba() {
	assertActiveDS();

	var argCount = arguments.length;
	
	if (argCount == 2) {
		// source breakpoint
		if ((typeof(arguments[0]) == "string") && (typeof(arguments[1]) == "number")) {
			return activeDS.breakpoint.add(arguments[0], arguments[1]);
		}
	} else if (argCount == 1) {
		// symbolic or address breakpoint
		if ((typeof(arguments[0]) == "string") || (typeof(arguments[0]) == "number")) {
			return activeDS.breakpoint.add(arguments[0]);
		}
	}

	throw  "Invalid arguments.";
}

/**
 * Remove a breakpoint.
 * @param index the breakpoint index handle.
 * @service DSS Debug Server Commands
 */
function br(index) {
	assertActiveDS();
	
	activeDS.breakpoint.remove(index);
}

/**
 * Remove all breakpoint.
 * @service DSS Debug Server Commands
 */
function bra() {
	assertActiveDS();

	activeDS.breakpoint.removeAll();
}

/**
 * Add a software breakpoint with refresh window action, depends on the input argument, different type of 
 * breakpoint will be added. If arg2 is null, than it will be added as an address breakpoint or a symbolic breakpoint. 
 * If arg1 and arg2 arguments are not null, source breakpoint will be added, the second argument must be a string 
 * and the third argument must be a number.
 * @param arg0 the view name.
 * @param arg1 can be address (number) or symbolic (string).
 * @param arg2 the line number, if and only if arg2 is a file.
 * @return the breakpoint index handle.
 * @service DSS Debug Server Commands
 */
function bv() {
	assertActiveDS();

	var argCount = arguments.length;
	
	if (argCount == 3) {
		// source breakpoint
		if ((typeof(arguments[1]) == "string") && (typeof(arguments[2]) == "number")) {
			var prop = activeDS.breakpoint.createProperties(0);
			prop.setSourceLocation("Hardware Configuration.Location", arguments[1], arguments[2]);
			prop.setString("Debugger Response.Action", "Update View");
			prop.setString("Debugger Response.Action.View", arguments[0]);
			return activeDS.breakpoint.add(prop);
		}
	} else if (argCount == 2) {
		// symbolic or address breakpoint
		if ((typeof(arguments[1]) == "string") || (typeof(arguments[1]) == "number")) {
			var prop = activeDS.breakpoint.createProperties(0);
			prop.setString("Hardware Configuration.Location", arguments[1]);
			prop.setString("Debugger Response.Action", "Update View");
			prop.setString("Debugger Response.Action.View", arguments[0]);
			return activeDS.breakpoint.add(prop);
		}
	}

	throw  "Invalid arguments.";	
}