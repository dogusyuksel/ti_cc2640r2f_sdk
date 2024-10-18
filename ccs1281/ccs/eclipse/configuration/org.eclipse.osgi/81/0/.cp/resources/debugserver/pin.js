/**
 * Connects an input file to an interrupt pin.
 * @param pin identifies the interrupt pin and must be one of the interrupt signals.
 * @param filename the input file name.
 * @service DSS Debug Server Commands
 */
function pinConnect(pin, filename) {
	assertActiveDS();

	activeDS.pin.connect(pin, filename);
}

/**
 * Disconnects an input file from the interrupt pin.
 * @param identifies the interrupt pin and must be one of the interrupt signals.
 * @service DSS Debug Server Commands
 */
function pinDisconnect(pin) {
	assertActiveDS();

	activeDS.pin.disconnect(pin);
}

/**
 * Displays all of the pins (unconnected pins first, followed by the connected pins). For a connected 
 * pin, the simulator displays the name of the pin and the absolute pathname of the file.
 * @service DSS Debug Server Commands
 */
function pinList() {
	assertActiveDS();

	return activeDS.pin.list();
}