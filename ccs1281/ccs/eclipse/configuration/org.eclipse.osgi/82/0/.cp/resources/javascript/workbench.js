/**
 * Close the console view.
  * @service CCS UI Scripting Commands
 */
function close() {
	consoleView = activeWB.openView("com.ti.ccstudio.scripting.console.ConsoleView");
	consoleView.close();
}

/**
 * Close the current workbench window.
 * @service CCS UI Scripting Commands
 */
function exit() {
	activeWB.close();
}

/**
 * Maximize the workbench window.
 * @param set [optional] true to set the workbench window maximized, otherwise restore to the previous state.
 * @service CCS UI Scripting Commands
 */
function maximize() {
	var argCount = arguments.length;

	if (argCount == 0) {
		activeWB.maximize(true);
		return;
	} else if (argCount == 1) {
		activeWB.maximize(arguments[0]);
		return;
	}
	
	throw "Invalid arguments.";
}

/**
 * Close all editor windows.
 * @service CCS UI Scripting Commands
 */
function closeAllEditor() {
	activeWB.closeAllEditor();
}

/**
 * Open a view for the given view id.
 * @param viewId one of the predefined view id.
 * @return the view.
 * @service CCS UI Scripting Commands
 */ 
function openView(viewId) {
	return activeWB.openView(viewId);
}