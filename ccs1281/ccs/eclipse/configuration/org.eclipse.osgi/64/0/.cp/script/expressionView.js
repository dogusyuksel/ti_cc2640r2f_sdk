/**
 * Add an expression to the expression view.
 * @param expression the expression to add to the expression view.
 * @service CCS UI Scripting Commands
 */
function expAdd(expression) {
    ler.expAdd(expression);
}

/**
 * Add an expression to the expression view with a given format.
 * @param expression the expression to add to the expression view.
 * @param format the display format that will be tried to use (if reasonable) when the value of expression is displayed.
 *        This is an optional parameter. 
 *        The format can be obtained from getHex, getDecimal, getBinary, getNatural, and getQValue. 
 * @service GSS GUI Commands
 */
function expAdd(expression, format) {
    ler.expAdd(expression, format);
}

/**
 * Get hexadecimal format.
 * @return the format.
 * @service GSS GUI Commands
 */
function getHex() {
	return Packages.org.eclipse.cdt.dsf.debug.service.IFormattedValues.HEX_FORMAT;
}

/**
 * Get decimal format.
 * @return the format.
 * @service GSS GUI Commands
 */
function getDecimal() {
	return Packages.org.eclipse.cdt.dsf.debug.service.IFormattedValues.DECIMAL_FORMAT;
}

/**
 * Get binary format.
 * @return the format.
 * @service GSS GUI Commands
 */
function getBinary() {
	return Packages.org.eclipse.cdt.dsf.debug.service.IFormattedValues.BINARY_FORMAT;
}

/**
 * Get float format.
 * @return the format.
 * @service GSS GUI Commands
 */
function getFloat() {
	return Packages.com.ti.ccstudio.lerm.base.IExtFormattedValues.FLOAT_FORMAT;
}

/**
 * Get natural format.
 * @return the format.
 * @service GSS GUI Commands
 */
function getNatural() {
	return  Packages.org.eclipse.cdt.dsf.debug.service.IFormattedValues.NATURAL_FORMAT;
}

/**
 * Get q-value format of a given value of q.
 * @param q the q value.
 * @return the format.
 * @service GSS GUI Commands
 */
function getQValue(q) {
	return 'Q-Value('+q+')';
}

/**
 * show expression view
 * @service CCS UI Scripting Commands
 */
function showExpview() {
    ler.showExpview();
}

/**
 * Remove an expression from the expression view.
 * @param expression the expression to remove from the expression view.
 * @service CCS UI Scripting Commands
 */
function expRemove(expression) {
    ler.expRemove(expression);
}

/**
 * Remove all expressions from the expression view.
 * @service CCS UI Scripting Commands
 */
function expRemoveAll() {
    ler.expRemoveAll();
}
