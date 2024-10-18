importPackage(Packages.com.ti.ccstudio.scripting.gss)

/**
 * Exports the visible contents of a DVT table view to a CSV(comma separated values) file.
 * Note: This function only works on a DVT table views currently.
 * Sample Usage:
 *    myview = openView("Raw Logs");
 *    myview.exportAll("c:/rawlogs.csv");
 * @param fileName the complete path directory path and filename of the file data will be exported to - example: 'c:/myfile.csv'
 * @service DVT Analysis UI scripting commands
 */
 function exportAll(fileName) {
 	; // this function is only provided for scripting console help purposes - the actual implementation is in Java code
 }
  
/**
 * Applies or removes a filter to/from a DVT data view.
 * Sample Usage:
 *    v = openView("Raw Logs");
 *   v.applyFilter('formattedMsg like ".*swi.*"');
 *    v.applyFilter('(seqID> 8653) && (formattedMsg like ".*swi.*")');
 *    v.applyFilter(''); //to remove filter
 *    v.applyFilter(null); // to remove filter
 * @param dvtExpression the expression to be used when filtering - please search for "DVT expression" in main CCS help for the syntax
 * @service DVT Analysis UI scripting commands
 */
 function applyFilter(dvtExpression) {
 	; // this function is only provided for scripting console help purposes - the actual implementation is in Java code
 }
 
/**
 * Get the number of records in this view
 * Sample Usage:
 *    myview = openView("Raw Logs");
 *    myview.getRecordCount();
 * @returns integer
 * @service DVT Analysis UI scripting commands
 */
 function getRecordCount() {
 	; // this function is only provided for scripting console help purposes - the actual implementation is in Java code
 }
 
 /**
 * Get the fieldNames in the buffer connected to this data view
 * Sample Usage:
 *    myview = openView("Raw Logs");
 *    myview.getFieldNames();
 * @returns String[]
 * @service DVT Analysis UI scripting commands
 */
 function getFieldNames() {
 	; // this function is only provided for scripting console help purposes - the actual implementation is in Java code
 }
 
 /**
 * Get a record in the buffer connected to this data view
 * Sample Usage:
 *    myview = openView("Raw Logs");
 *    myview.getRecord(0);
 * @param recordIndex - zero based
 * @returns Object[]
 * @service DVT Analysis UI scripting commands
 */
 function getRecord(recordIndex) {
 	; // this function is only provided for scripting console help purposes - the actual implementation is in Java code
 }
 
 /**
 * Get the value of field in a record in the buffer connected to this data view
 * Sample Usage:
 *    myview = openView("Raw Logs");
 *    myview.getValue(1, "currentThread");
 * @param rowNumber - starting from 1
 * @param columnName 
 * @returns Object
 * @service DVT Analysis UI scripting commands
 */
 function getValue(rowNumber, columnName) {
 	; // this function is only provided for scripting console help purposes - the actual implementation is in Java code
 }

 /**
 * Get the textual string value of a field in a record in the buffer connected to this data view
 * Sample Usage:
 *    myview = openView("Raw Logs");
 *    myview.getValue(2, "currentThread");
 * @param rowNumber - starting from 1
 * @param columnName 
 * @returns String
 * @service DVT Analysis UI scripting commands
 */
 function getText(rowNumber, columnName) {
 	; // this function is only provided for scripting console help purposes - the actual implementation is in Java code
 }
 
/**
 * Get the status message in the bottom left side of this data view
 * Sample Usage:
 *    myview = openView("Raw Logs");
 *    myview.getStatus();
 * @returns String
 * @service DVT Analysis UI scripting commands
 */
 function getStatus() {
 	; // this function is only provided for scripting console help purposes - the actual implementation is in Java code
 }
 
/**
 * Get the progress text in the bottom right side of this data view
 * Sample Usage:
 *    myview = openView("Raw Logs");
 *    myview.getProgress();
 * @returns String
 * @service DVT Analysis UI scripting commands
 */
 function getProgress() {
 	; // this function is only provided for scripting console help purposes - the actual implementation is in Java code
 }
 
 
/**
 * opens an Analysis View.  E.g. to open a single time graph, openAnalysisView('Single Time','C:\\abc.graphProp')
 * @param viewID Name of the view. Please see feature specific view names
 * For CCS Graphs Feature: 'Single Time', 'Dual Time',  'FFT Magnitude', 'FFT Magnitude Phase', 'Complex FFT', 'FFT Waterfall'
 * @param arg See feature specific interpretation of this argument
 *      For CCS Graphs: Used as a property file from which to load the graph property values
  * @service DVT Analysis UI scripting commands
 */
 function openAnalysisView(viewID, arg) {
 	wb = GSSScripting.getInstance().getActiveWorkbenchWindow();
	view = wb.openView(viewID, arg, 0);
	return view;
 }
 
 /**
  * Opens(/Activates) a  view using both primary and secondary IDs  
  * @param primaryID (example: com.ti.dvt.ui.views.dvtgraph )
  * @param secondaryID (example:  dvtviewname)
  * @service DVT Analysis UI scripting commands 
  */
  function openView2(primaryID, secondaryID) {
 	wb = GSSScripting.getInstance().getActiveWorkbenchWindow();
	wb.openView(primaryID,  secondaryID, 1); //1:  IWorkbenchPage.VIEW_ACTIVATE ( 2: VIEW_VISIBLE, 3:VIEW_CREATE )
 }

 
 