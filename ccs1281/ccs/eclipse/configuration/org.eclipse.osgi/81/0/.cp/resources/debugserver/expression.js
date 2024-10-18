/**
 * Evaluate an expression.
 * @param expression an expression string.
 * @return the evaluated expression value.
 * @service DSS Debug Server Commands
 */
function eval(expression) {
	assertActiveDS();

	return activeDS.expression.evaluate(expression);
}
