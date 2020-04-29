export const ReadOnlyMap = list => {
  const data = list.reduce((result, item) => {
    result[item] = true;
    return result;
  }, {});

  return {
    has: value => data[value] === true,
  };
};
