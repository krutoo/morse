export const isFunction = value => typeof value === 'function';

export const generateId = () => Math.random().toString(16).slice(2);
