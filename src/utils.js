export const isFunction = value => typeof value === 'function';

export const isString = value => typeof value === 'string';

export const generateId = () => Math.random().toString(16).slice(2);

export const Validator = (checker, makeErrorText) => value => {
  if (!checker(value)) {
    throw Error(makeErrorText(value));
  }
};
