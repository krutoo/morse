export const StringSet = strings => {
  const data = strings.reduce(setTrue, {});

  return {
    has: value => data[value] === true,
  };
};

const setTrue = (source, propKey) => {
  source[propKey] = true;
  return source;
};
