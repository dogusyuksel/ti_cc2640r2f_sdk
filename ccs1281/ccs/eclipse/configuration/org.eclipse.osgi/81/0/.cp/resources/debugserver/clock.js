/**
 * Executes a specific section of code and allows you to track the number of CPU cycles
 * it takes to execute a specific section of code. Execution must be halted by a breakpoint.
 * The debugger stores the number of cycles in the CLK pseudo-register.
 * @param arg0 [optional] the event ID or the event name.
 * @return the CPU cycles.
 * @service DSS Debug Server Commands
 */
function runBenchmark() {
	assertActiveDS();
	
	var argCount = arguments.length;

	if (argCount == 1)
		return activeDS.clock.runBenchmark(arguments[0]);
	else
		return activeDS.clock.runBenchmark();
}