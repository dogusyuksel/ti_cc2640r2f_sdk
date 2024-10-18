import { QualifierFactoryMap } from './QualifierFactoryMap';
import { AbstractDataFormatter } from './AbstractDataFormatter';
;
const nullConverter = {
    convert: function (input) {
        return input;
    }
};
function jsonStringifyConverter(input) {
    try {
        return JSON.stringify(input);
    }
    catch (e) {
        return '' + input;
    }
}
;
const converters = {
    'string': {
        any: {
            convert: function (input) {
                return '' + input;
            }
        },
        'object': { convert: jsonStringifyConverter }
    },
    'boolean': {
        any: {
            convert: function (input) {
                return !!input;
            }
        },
        'string': {
            convert: function (input) {
                return isNaN(+input) ? input.toLowerCase().trim() === 'true' : +input !== 0;
            }
        }
    },
    'number': {
        any: {
            convert: function (input) {
                return +input;
            }
        }
    },
    'array': {
        any: {
            convert: function (input) {
                return input ? ('' + input).split(',').map(function (e) {
                    return +e;
                }) : [];
            }
        }
    }
};
/**
 * Singleton Class to register data converters that will be used by the DataBinder to
 * convert data between bindings of different types.
 *
 */
export class DataConverter {
    /**
     * Method to register custom data converters to be used by the DataBindiner singleton
     * to convert data between bindings of different types.
     *
     * @static
     * @param {gc.databind.IDataConverter} converter - data converter to use to convert between the srcType and destType.
     * @param {string} [srcType] - the type of the source that this converter is to be used on.  If not supplied, then it will
     * be the default converter for all source types if a specific one cannot be found.
     * @param {string} destType - the type of the output value from this converter.
     */
    static register(converter, destType, srcType = 'any') {
        if (destType !== null) {
            let destConverters = converters[destType];
            if (!destConverters) {
                destConverters = {};
                converters[destType] = destConverters;
            }
            destConverters[srcType] = converter;
        }
    }
    ;
    /**
     * Method to retrieve the converter for converting one source type to another destination type.
     *
     * @static
     * @param {string} [srcType] - the type of the source that this converter is to be used on.  If not supplied, then it will
     * be the default converter for all source types if a specific one cannot be found.
     * @param {string} destType - the type of the output value from this converter.
     * @return {gc.databind.IDataConverter} - the converter found or undefined if not found.
     */
    static getConverter(srcType, destType) {
        let converter = nullConverter;
        const destConverters = converters[destType];
        if (destConverters !== undefined) {
            converter = destConverters[srcType || 'any'];
            if (converter === undefined) {
                converter = destConverters.any;
            }
        }
        return converter;
    }
    ;
    /**
     * Method to convert an element of data from one data type to another.
     *
     * @static
     * @param {string} [srcType] - the type of the source that this converter is to be used on.  If not supplied, then it will
     * be the default converter for all source types if a specific one cannot be found.
     * @param {string} destType - the type of the output value required from this conversion.
     * @param {number} param - optional numeric parameter to control the conversion like the precision for decimal and q values.
     * @return {*} - the converted data or undefined if no converter found.
     */
    static convert(data, srcType, destType, param) {
        if (data === null || data === undefined) {
            return data; // null is null independent of type, so no conversion required.
        }
        srcType = srcType || typeof data;
        let converter;
        if (srcType !== destType && destType !== undefined && destType !== null) {
            converter = this.getConverter(srcType, destType);
        }
        return converter ? converter.convert(data, param) : data;
    }
    ;
}
;
function doPrecision(value, precision = 0) {
    if (precision > 0) {
        if (value.length > precision) {
            value = value.substring(value.length - precision);
        }
        else {
            for (let len = value.length; len < precision; len++) {
                value = '0' + value;
            }
        }
    }
    return value;
}
;
class HexFormatter extends AbstractDataFormatter {
    constructor(operand, precision) {
        super(operand);
        this.precision = precision;
        this.operator = 'hex';
    }
    static create(operand, precision) {
        return new HexFormatter(operand, precision);
    }
    formatValue(input, precision) {
        input = +input;
        if (isNaN(input)) {
            return '0x' + input;
        }
        if (input < 0) {
            input = 0xFFFFFFFF + input + 1;
        }
        input = input.toString(16).toUpperCase();
        return '0x' + doPrecision(input, precision);
    }
    ;
}
;
DataConverter.register({ convert: HexFormatter.prototype.formatValue }, 'hex');
QualifierFactoryMap.add('hex', HexFormatter);
class DecimalFormatter extends AbstractDataFormatter {
    constructor(operand, precision) {
        super(operand);
        this.precision = precision;
        this.operator = 'dec';
    }
    ;
    static create(operand, precision) {
        return new DecimalFormatter(operand, precision);
    }
    ;
    formatValue(input, precision = 0) {
        input = +input;
        if (isNaN(input)) {
            return '' + input;
        }
        return input.toFixed(precision);
    }
    ;
}
;
DataConverter.register({ convert: DecimalFormatter.prototype.formatValue }, 'dec');
QualifierFactoryMap.add('dec', DecimalFormatter);
class ScientificFormatter extends AbstractDataFormatter {
    constructor(operand, precision) {
        super(operand);
        this.precision = precision;
        this.operator = 'exp';
    }
    ;
    static create(operand, precision) {
        return new ScientificFormatter(operand, precision);
    }
    ;
    formatValue(input, precision) {
        input = +input;
        if (isNaN(input)) {
            return '' + input;
        }
        return input.toExponential(precision);
    }
    ;
}
;
DataConverter.register({ convert: ScientificFormatter.prototype.formatValue }, 'exp');
QualifierFactoryMap.add('exp', ScientificFormatter);
class BinaryFormatter extends AbstractDataFormatter {
    constructor(operand, precision) {
        super(operand);
        this.precision = precision;
        this.operator = 'binary';
        this.unFormattedType = 'number';
    }
    ;
    static create(operand, precision) {
        return new BinaryFormatter(operand, precision);
    }
    ;
    formatValue(input, precision) {
        input = +input;
        if (isNaN(input)) {
            return '' + input;
        }
        if (input < 0) {
            input = 0xFFFFFFFF + input + 1;
        }
        return doPrecision(input.toString(2), precision);
    }
    ;
    unFormatValue(input) {
        return Number.parseInt(input, 2);
    }
    ;
}
;
DataConverter.register({ convert: BinaryFormatter.prototype.formatValue }, 'binary');
DataConverter.register({ convert: BinaryFormatter.prototype.unFormatValue }, 'number', 'binary');
QualifierFactoryMap.add('binary', BinaryFormatter);
//# sourceMappingURL=DataConverter.js.map