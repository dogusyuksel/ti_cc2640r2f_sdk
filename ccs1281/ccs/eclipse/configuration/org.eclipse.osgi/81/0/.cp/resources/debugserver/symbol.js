/*
 * Loads the symbol table of the specified object file.
 * @service DSS Debug Server Commands
 */
function symLoad(file) {
	assertActiveDS();

	activeDS.symbol.load(file);
}