import { isObject, isFunction, isString, isSymbol } from '../utils.js';

export const createTypeNameValidator = isExistingType => {
  if (!isFunction(isExistingType)) {
    throw new TypeError('First argument must be a function');
  }
  return typeName => {
    let errorMessage = '';
    if (![isString, isSymbol].some(check => check(typeName))) {
      errorMessage = 'Type name is required';
    }
    if (isExistingType(typeName)) {
      errorMessage = `Type with name "${String(typeName)}" is already registered`;
    }
    return errorMessage;
  };
};

export const createTypeCreator = ({
  typeNameKey = '$$typeof',
  createValidator = createTypeNameValidator,
} = {}) => {
  const types = new Set();
  const validateTypeName = createValidator(type => types.has(type));
  return typeName => {
    const errorMessage = validateTypeName(typeName, types);
    if (errorMessage) {
      throw new TypeError(errorMessage);
    } else {
      types.add(typeName);
    }
    return {
      typeName,
      hasType: value => Boolean(value) && value[typeNameKey] === typeName,
      applyType: value => {
        if (isObject(value)) {
          Object.defineProperty(value, typeNameKey, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: typeName,
          });
        }
        return value;
      },
    };
  };
};

export default createTypeCreator();
