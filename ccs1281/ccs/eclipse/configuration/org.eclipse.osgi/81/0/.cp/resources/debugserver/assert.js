/**
 * Assert the active debug session is not null.
 * @service DSS Debug Server Commands
 */
function assertActiveDS() {
	if (activeDS == null)
		throw "Unable to perform operation, no active debug session.\n"
}