const TYPE_KEY = '$$typeof';

export const Type = typeName => ({
  is: value => value ? value[TYPE_KEY] === typeName : false,
  apply: object => {
    Object.defineProperty(object, TYPE_KEY, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: typeName,
    });

    return object;
  },
});
