/**
 * memSave IOFormat - COFF format.
 * @service DSS Debug Server Commands
 */
var IOMEMORY_COFF = 5;

/**
 * memSave IOFormat - FLOAT format.
 * @service DSS Debug Server Commands
 */
var IOMEMORY_FLOAT = 4;

/**
 * memSave IOFormat - HEX format.
 * @service DSS Debug Server Commands
 */
var IOMEMORY_HEX =  1;

/**
 * memSave IOFormat - INT  format.
 * @service DSS Debug Server Commands
 */
var IOMEMORY_INT = 2;

/**
 * memSave IOFormat - LONG format.
 * @service DSS Debug Server Commands
 */
var IOMEMORY_LONG = 3;  

/**
 * Program memory page.
 * @service DSS Debug Server Commands
 */
var PAGE_PROGRAM = 0;

/**
 * Data memory page.
 * @service DSS Debug Server Commands
 */
var PAGE_DATA = 1;

/**
 * IO page.
 * @service DSS Debug Server Commands
 */
var PAGE_IO = 2;

/**
 * Data byte page (C55+ Only).
 * @service DSS Debug Server Commands
 */
var PAGE_DATA_BYTE = 3;

/**
 * IO byte page (C55+ Only).
 * @service DSS Debug Server Commands
 */
var PAGE_IO_BYTE = 4;

/**
 * Add read or write permission for a range of target memory to the memory map.
 * @param address the starting address of the range of memory.
 * @param page a one-digit number that identifies the type of memory: 0 - Program, 1 - Data, 2 - I/O
 * @param length the length of the range.
 * @param readable specifies read-only memory.
 * @param writeonly specifies write-only memory. 
 * @service DSS Debug Server Commands
 */
function mmAdd(address, page, length, readable, writable) {
	activeDS.memory.map.add(address, page, length, readable, writable);
}

/**
 * Enables or disables memory mapping.
 * @param enable true to enable, otherwise false.
 * @service DSS Debug Server Commands
 */
function mmEnable(enable) {
	activeDS.memory.map.enable(enable);
}

/**
 * Removes a range of memory from the target's memory map.
 * @param address the starting address of the range of memory.
 * @param page a one-digit number that identifies the type of memory: 0 - Program, 1 - Data, 2 - I/O
 * @service DSS Debug Server Commands
 */
function mmRemove(address, page) {
	activeDS.memory.map.remove(address, page);	
}

/**
 * Resets the target's memory map by deleting all defined memory ranges from the map.
 * @service DSS Debug Server Commands
 */
function mmReset() {
	activeDS.memory.map.reset();
}

/**
 * Read multiple words (of the default word-size) from the target and return
 * the result as an array of integers.
 * @param address the starting.
 * @param page a one-digit number that identifies the type of memory: 0 - Program, 1 - Data, 2 - I/O
 * @param numWords number of words to read.
 * @param signed whether the returned words are signed or unsinged.
 * @return an array of target words.
 * @service DSS Debug Server Commands
 */
function readWord(address, page, numWords, signed) {
	assertActiveDS();

	return activeDS.memory.readWord(page, address, numWords, signed);
}

/**
 * Fills a block of memory word by word with a specified value.
 * @param address Specifies the first address in the block.
 * @param page [optional] a one-digit number that identifies the type of memory: 0 - Program, 1 - Data, 2 - I/O
 * @param length defines the number of words to fill.
 * @param data Specifies the value is placed in each word in the block.
 * @service DSS Debug Server Commands
 */
function memFill() {
	assertActiveDS();

	var argCount = arguments.length;
	
	if (argCount == 3) {
		activeDS.memory.fill(arguments[0], 0, arguments[1], arguments[2]);
	} else if (argCount == 4) {
		activeDS.memory.fill(arguments[0], arguments[1], arguments[2], arguments[3]);
	} else {
		throw "Invalid arguments.";
	}
}

/**
 * Loads an object file and its associated symbol table into memory, and pass an array of arguments to main()
 * @param file an executable file.
 * @param args [optional] an object array of arguments.
 * @service DSS Debug Server Commands
 */
function loadProg(file, args) {
	assertActiveDS();

	if (args != null)
		activeDS.memory.loadProgram(file, args);
	else 
		activeDS.memory.loadProgram(file);
}

/**
 * Reload the currently loaded program.
 * @service DSS Debug Server Commands
 */
function reload() {
	assertActiveDS();

	activeDS.memory.reloadProgram();
}

/**
 * Load a raw file from the host to target memory. Filesize is automatically determinated and the entire file is loaded.
 * @param address the first address in the block.
 * @param page the memory page, use one of PAGE_X constant.
 * @param filename specifies the name of the file that store the target data.
 * @param typeSize specifies the type size of the data.
 * @param byteSwap force a byte swap of the data before writing to target memory.
 * @service DSS Debug Server Commands
 */
function loadRaw(address, page, filename, typeSize, byteSwap) {
	assertActiveDS();
	
	activeDS.memory.loadRaw(page, address, filename, typeSize, byteSwap);
}

/**
 * Load a coff file from the host to target memory.
 * @param address the first address in the block.
 * @param page the memory page, use one of the PAGE_X constant.
 * @param filename specifies the name of the file that store the target data.
 * @param length defines the number of words to fill.
 * @service DSS Debug Server Commands
 */
function loadCoff(address, page, filename, length) {
	assertActiveDS();

	activeDS.memory.loadCoff(page, address, filename, length);
}

/**
 * Load a data file from the host to target memory.
 * @param address the first address in the block.
 * @param page the memory page, use one of the PAGE_X constant.
 * @param filename specifies the name of the file that store the target data.
 * @param length defines the number of words to fill.
 * @service DSS Debug Server Commands
 */
function loadData(address, page, filename, length) {
	assertActiveDS();

	activeDS.memory.loadData(page, address, filename, length);
}

/**
 * Save a block of target memory to a raw binary file.
 * @param page the memory page, use one of PAGE_X constant.
 * @param address the first address in the block. 
 * @param filename specifies the name of the file that store the target data.
 * @param length the number of bytes to save.
 * @param typeSize specifies the type size of the data.
 * @param byteSwap force a byte swap of the data before writing to target memory. 
 * @service DSS Debug Server Commands
 */
function saveRaw(page, address, filename, length, typeSize, byteSwap) {
	assertActiveDS();

	activeDS.memory.saveRaw(page, address, filename, length, typeSize, byteSwap);
}

/**
 * Save a block of target memory to a coff file format.
 * @param address the first address in the block.
 * @param page the memory page, use one of the PAGE_X constant.
 * @param filename specifies the name of the file that store the target data.
 * @param length defines the number of words to store.
 * @service DSS Debug Server Commands
 */
function saveCoff(address, page, filename, length) {
	assertActiveDS();

	activeDS.memory.saveCoff(page, address, filename, length);
}

/**
 * Save a block of target memory to a data file format.
 * @param address the first address in the block.
 * @param page the memory page, use one of the PAGE_X constant.
 * @param filename specifies the name of the file that store the target data.
 * @param length defines the number of words to store.
 * @param IOFormat Specifies the format in which memory words will be written to the output file. Use one of the IOMEMORY_X constant.
 * @param append true to append to an existing file, false to overwrite. Note: append is not supported for COFF formatted files. 
 * @service DSS Debug Server Commands
 */
function saveData(address, page, filename, length, IOFormat, append) {
	assertActiveDS();

	activeDS.memory.saveData(page, address, filename, length, IOFormat, append);
}