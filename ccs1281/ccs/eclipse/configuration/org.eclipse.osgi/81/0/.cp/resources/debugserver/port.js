/**
 * portConnect/portDisconnect accessType - PORT_EXTEN.
 * @service DSS Debug Server Commands
 */
var PORT_EXTERN = 16;

/*
 * portConnect/portDisconnect accessType - PORT_NOREWIND.
 * @service DSS Debug Server Commands
 */
var PORT_NOREWIND = 4;

/*
 * portConnect/portDisconnect accessType - PORT_READ.
 * @service DSS Debug Server Commands
 */
var PORT_READ = 1;

/*
 * portConnect/portDisconnect accessType - PORT_UPDATE.
 * @service DSS Debug Server Commands
 */
var PORT_UPDATE = 8;

/*
 * portConnect/portDisconnect accessType - PORT_WRITE.
 * @service DSS Debug Server Commands
 */
var PORT_WRITE = 2;

/**
 * Connects a memory address to an input file or an output file to simulate an I/O port.
 * @param address defines the starting address in terms of words.
 * @param page a one-digit number that identifies the type of memory: 0 - Program, 1 - Data, 2 - I/O
 * @param length defines the length of the range.
 * @param accessType defines how the file is to be used. Use one of the following, PORT_EXTERN, PORT_NOREWIND, PORT_READ, PORT_UPDATE, and PORT_WRITE.
 * @param filename specifies the input file or output file to connect.
 * @service DSS Debug Server Commands
 */
function portConnect(address, page, length, accessType, filename) {
	assertActiveDS();

	activeDS.port.connect(address, page, length, accessType, filename);
}

/**
 * Disconnect a memory address from its associated input or output file.
 * @param address identifies the address of the simulated I/O port as previously defined with the portConnect command.
 * @param page a one-digit number that identifies the type of memory: 0 - Program, 1 - Data, 2 - I/O
 * @param length defines the length of the range.
 * @param accessType defines how the file is to be used. Use one of the following,  PORT_EXTERN, PORT_NOREWIND, PORT_READ, PORT_UPDATE, and PORT_WRITE.
 * @service DSS Debug Server Commands
 */
function portDisconnect(address, page, length, accessType) {
	assertActiveDS();

	activeDS.port.disconnect(address, page, length, accessType);
}

/**
 * List all memory address that have been previously connected to a data files using portConnect.
 * @param the list of connected data files.
 * @service DSS Debug Server Commands
 */
function portList() {
	assertActiveDS();

	return activeDS.port.list();
}