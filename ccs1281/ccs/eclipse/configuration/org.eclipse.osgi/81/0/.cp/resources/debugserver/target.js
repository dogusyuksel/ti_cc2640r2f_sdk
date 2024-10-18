/**
 * Run the target asynchronously.
 * @service DSS Debug Server Commands
 */
function run() {
	assertActiveDS();

	activeDS.target.runAsynch();
}

/** 
 * Run the target synchronously.
 * @service DSS Debug Server Commands
 */
function runSync() {
	assertActiveDS();

	activeDS.target.run();
}

/** 
 * Halt the target.
 * @service DSS Debug Server Commands
 */
function halt() {
	assertActiveDS();

	activeDS.target.halt();
}

/**
 * Performs a software target reset target.
 * @service DSS Debug Server Commands
 */
function reset() {
	assertActiveDS();

	activeDS.target.reset();
}

/**
 * Resets the program to its entry point, assuming you have already used on of the loaded commands to
 * load a program into memory.
 * @service DSS Debug Server Commands
 */
function restart() {
	assertActiveDS();

	activeDS.target.restart();
}

/**
 * Source step over.
 * @param count [optional] number of time to step over.
 * @service DSS Debug Server Commands
 */
function srcStepOver() {
	assertActiveDS();

	var argCount = arguments.length;
	
	if (argCount == 0) {
		activeDS.target.sourceStep.over();
		return;
	}
	else if (argCount == 1) {
		if (typeof(arguments[0]) == "number") {
			for (var i = 0; i < arguments[0]; ++i)
				activeDS.target.sourceStep.over();
			return;
		} else {
			throw "Invalid argument type.";
		}
	}
	
	throw "Invalid arguments.";
}

/**
 * Source step in.
 * @param count [optional] number of time to step over.
 * @service DSS Debug Server Commands
 */
function srcStepIn() {
	assertActiveDS();

	var argCount = arguments.length;
	
	if (argCount == 0) {
		activeDS.target.sourceStep.into();
		return;
	}
	else if (argCount == 1) {
		if (typeof(arguments[0]) == "number") {
			for (var i = 0; i < arguments[0]; ++i)
				activeDS.target.sourceStep.into();
			return;
		} else {
			throw "Invalid argument type.";
		}
	}
	
	throw "Invalid arguments.";
}

/**
 * Source step out.
 * @param count [optional] number of time to step out.
 * @service DSS Debug Server Commands
 */
function srcStepOut() {
	assertActiveDS();

	var argCount = arguments.length;
	
	if (argCount == 0) {
		activeDS.target.sourceStep.out();
		return;
	}
	else if (argCount == 1) {
		if (typeof(arguments[0]) == "number") {
			for (var i = 0; i < arguments[0]; ++i)
				activeDS.target.sourceStep.out();
			return;
		} else {
			throw "Invalid argument type.";
		}
	}
	
	throw "Invalid arguments.";
}

/**
 * Assembly step over.
 * @param count [optional] number of time to step over.
 * @service DSS Debug Server Commands
 */
function asmStepOver() {
	assertActiveDS();

	var argCount = arguments.length;
	
	if (argCount == 0) {
		activeDS.target.asmStep.over();
		return;
	}
	else if (argCount == 1) {
		if (typeof(arguments[0]) == "number") {
			for (var i = 0; i < arguments[0]; ++i)
				activeDS.target.asmStep.over();
			return;
		} else {
			throw "Invalid argument type.";
		}
	}
	
	throw "Invalid arguments.";
}

/**
 * Assembly step in.
 * @param count [optional] number of time to step over.
 * @service DSS Debug Server Commands
 */
function asmStepIn() {
	assertActiveDS();

	var argCount = arguments.length;
	
	if (argCount == 0) {
		activeDS.target.asmStep.into();
		return;
	}
	else if (argCount == 1) {
		if (typeof(arguments[0]) == "number") {
			for (var i = 0; i < arguments[0]; ++i)
				activeDS.target.asmStep.into();
			return;
		} else {
			throw "Invalid argument type.";
		}
	}
	
	throw "Invalid arguments.";
}

/**
 * Connect/reconnect the debugger to the target.
 * @service DSS Debug Server Commands
 */
function connect() {
	assertActiveDS();

	activeDS.target.connect();
}

/**
 * Disconnect the debugger from the target.
 * @service DSS Debug Server Commands
 */
function disconnect() {
	assertActiveDS();

	activeDS.target.disconnect();
}