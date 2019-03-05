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
	return functionTags.includes(classOf(value));
}

/**
 * Return a class of input value (true way to get it).
 * @param  {*} value Value to define it class.
 * @return {string} Name of class.
 */
export function classOf (value) {
	return Object.prototype.toString.call(value).slice(8, -1);
}
