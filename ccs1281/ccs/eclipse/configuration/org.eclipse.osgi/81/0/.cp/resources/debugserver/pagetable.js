//Import the DSS packages into our namespace to save on typing
importPackage(Packages.com.ti.debug.engine.scripting)
importPackage(Packages.com.ti.ccstudio.scripting.environment)
importPackage(Packages.java.lang)
importPackage(Packages.java.math)


/**
* Summary of the mmu config and base table set up
* @return summary
* @service DSS Debug Server Commands
*/
function ptvSummary()
{
	print( activeDS.pageTable.summary() );
}
/**
* Get the current mode ( 32-bit, LPAE )
* @return The current mode
* @service DSS Debug Server Commands
*/
function ptvCurrentMode()
{
	print( activeDS.pageTable.currentMode() );
}

/**
 * Lookup a physical address based on a virtual address.
 * Provides a trace of the entire page table walk and attributes associated with the mapping from different levels of the look up
 *
 * @param address - virtual addres to look up
 * @return the physical address assocated with mapping and trace of the page table walk
 * @service DSS Debug Server Commands
 */
function ptvLookupAddress( address )
{
	var argCount = arguments.length;
	
	if ( argCount == 1 ) {
		print( activeDS.pageTable.lookupAddress( address ) );
	} else {
		throw  "Invalid number of arguments.";	
	}
}

/**
* Lists the entries in a page table within a given range.
* @param	TTBRNum - Number of the TTBR register number which is this tables root. 
* @param 	int [] parentLevelIndices - This is a list of indices described how to access the page table starting from the root page table.
* 									   Example: If you want to display entries from a L2 Page Table, you must provide the index into the L1
* 												page table that is the parent of the L2 Page Table. 
* @param    beginIndex - Index into the page table from where to start listing entries
* @param    endIndex - Index into the page table where to stop listing entries	
* @return 	The requested entries in a human readable form
* @service DSS Debug Server Commands
*/
function ptvLookupPageTableEntries(  TTBRNum, parentLevelIndices , beginIndex, endIndex )
{
	
	var argCount = arguments.length;
	
	if ( argCount != 4 ) {
		throw  "Invalid number of arguments.";
		
	}
	
	if ( Object.prototype.toString.call( parentLevelIndices ) != '[object Array]' ) {
		throw  "The argument parentLevelIndices should be an array";
    }
	
	print( activeDS.pageTable.lookupPageTableEntries( TTBRNum, parentLevelIndices, beginIndex, endIndex ) );
}

/**
 * Look up the first virtual address mapped to the physical address
 * @param physicalAddress - the physical address for which to look up the virtual address
 * @return The first virtaul address that is mapped to the provided address
 * @service DSS Debug Server Commands
 */
function ptvReverseLookup( address )
{
	
	var argCount = arguments.length;
	if ( argCount == 1 ) {
		print( activeDS.pageTable.reverseLookup( address ) );
	} else {
		throw  "Invalid number of arguments.";	
	}
}

/**
 * Look up all the virtual addresses based mapped to the physical address
 * @param physicalAddress - physical address for which to look up the virtual address mappings
 * @return  All virtual address mapped to the given physical address
 * @service DSS Debug Server Commands
 */
function ptvReverseLookupAll( address )
{
	
	var argCount = arguments.length;
	if ( argCount == 1 ) {
		print( activeDS.pageTable.reverseLookupAll( address ) );
	} else {
		throw  "Invalid number of arguments.";	
	}
}

