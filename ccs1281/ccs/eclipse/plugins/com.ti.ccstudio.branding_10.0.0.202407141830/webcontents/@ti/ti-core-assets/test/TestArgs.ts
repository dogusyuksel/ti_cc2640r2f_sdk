export const ARG_ENABLE_LOG     = 'enableLog';
export const ARG_DEVICE_NAME    = 'deviceName';
export const ARG_COM_NAME       = 'comName';

const filteredArgsArray = Array.prototype.slice.call(process.argv)
    .filter(e => (e.startsWith('-') || e.startsWith('--')) && !e.startsWith('---'))
    .map(e => e.split('='))
    .map(([key, val]) => {
        if (key.startsWith('--')) {
            if (!isNaN(val)) {
                val = Number(val);
            } else if (val && ['true', 'false'].includes(val.toLowerCase())) {
                val = Boolean(val.toLowerCase() === 'true');
            } else {
                val = val || true;
            }
            return { [key.substr(2)]: val };
        } else {
            const keys = key.substr(1).split('');
            return Object.assign({}, ...keys.map((k: string) => ({ [k]: true })));
        }
    });
export const processArgs: { [index: string]: boolean | string | number } = Object.assign({}, ...filteredArgsArray);
