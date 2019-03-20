/**
 * Functions class names.
 * @type {Array<string>}
 */
const functionTags = Object.freeze([
    'Function',
    'AsyncFunction',
    'GeneratorFunction',
    'Proxy',
]);

/**
 * Check that value is a function.
 * @param {*} value Value.
 * @return {boolean} Is it a function?
 */
export function isFunction (value) {
    return functionTags.includes(getTag(value));
}

/**
 * Return a tag of input value.
 * @param  {*} value Value to define it class.
 * @return {string} Name of class.
 */
export function getTag (value) {
    return Object.prototype.toString.call(value).slice(8, -1);
}
