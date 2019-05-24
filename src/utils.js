const functionTags = Object.freeze([
  'Function',
  'AsyncFunction',
  'GeneratorFunction',
  'Proxy',
]);

export function isFunction (value) {
  return functionTags.includes(getTag(value));
}

export function isString (value) {
  return getTag(value) === 'String';
}

export function isSymbol (value) {
  return getTag(value) === 'Symbol';
}

export function getTag (value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}

export function isObject (value) {
  const type = typeof value;
  return Boolean(value && (type === 'object' || type === 'function'));
}
