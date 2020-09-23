export const isFunction = (value: any): value is Function => typeof value === 'function';

export const isString = (value: any): value is string => typeof value === 'string';

export const isObject = (value: any): value is Record<string, unknown> => Object(value) === value;

export const generateId = () => Math.random().toString(16).slice(2);

export const Validator = <T>(
  check: (value: T) => boolean,
  makeErrorText: (value: T) => string
) => (value: T) => {
    if (!check(value)) {
      throw Error(makeErrorText(value));
    }
  };
