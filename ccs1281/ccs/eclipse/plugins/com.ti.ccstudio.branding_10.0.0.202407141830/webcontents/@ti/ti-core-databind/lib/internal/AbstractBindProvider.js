import { ExpressionParser } from './expressionParser/ExpressionParser';
/**
 * Abstract class that provides default implementation of IBindFactory.  This class
 * implements the getName() method for IBindFactory.
 *
 * @constructor
 * @implements gc.databind.IBindFactory
 * @param {string} name - uniquely identifiable name for this bind factory.
*/
export class AbstractBindProvider {
    constructor() {
        this.expressionParser = new ExpressionParser(this);
    }
    ;
    /**
     * If the cache contains an object with the given name, this method will
     * returns it. Otherwise the binding is created by first evaluating any
     * expression then by using the registered models to create the appropriate
     * bindings to satisfy the binding expression.
     *
     * @param {string} name - the name of the bindable object.
     * @return {gc.databind.IBind} the object if found in the cache or created,
     *         null otherwise.
     */
    getBinding(name) {
        return this.expressionParser.parseExpression(name);
    }
    ;
    dispose() {
        this.expressionParser.dispose();
    }
    ;
    getBindingCount() {
        return this.expressionParser.getBindingCount();
    }
}
;
//# sourceMappingURL=AbstractBindProvider.js.map