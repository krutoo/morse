import { isString, isSymbol } from '../utils.js';

export const createTypeNameValidator = types => typeName => {
  let error = '';
  if (![isString, isSymbol].some(check => check(typeName))) {
    error = 'Type name is required';
  }
  if (types instanceof Set && types.has(typeName)) {
    error = `Type with name "${String(typeName)}" is already registered`;
  }
  return error;
};

export const createTypeCreator = () => {
  const types = new Set();
  const typeNameKey = '$$typeof';
  const validateTypeName = createTypeNameValidator(types);
  return typeName => {
    const error = validateTypeName(typeName, types);
    if (error) {
      throw new TypeError(error);
    } else {
      types.add(typeName);
    }
    return {
      hasType: value => Boolean(value) && value[typeNameKey] === typeName,
      applyType: object => {
        if (object) {
          object[typeNameKey] = typeName;
        }
        return object;
      },
    };
  };
};

export default createTypeCreator();
