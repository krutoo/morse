const TYPE_KEY = '$$typeof';

export const Type = typeName => ({
  is: value => value?.[TYPE_KEY] === typeName,
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
