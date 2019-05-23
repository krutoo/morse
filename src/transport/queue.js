import createType from '../helpers/create-type.js';

const {
  hasType: isQueue,
  applyType: applyQueueType,
} = createType(Symbol('Morse.Queue'));

const createQueue = startItems => {
  const items = Array.isArray(startItems)
    ? [...startItems]
    : [];
  return applyQueueType({
    enqueue: item => items.push(item),
    dequeue: () => items.pop(),
    getItem: index => items[index],
    getLength: () => items.length,
  });
};

export { createQueue, isQueue };
