import { isFunction } from './utils';

export const Queue = () => {
  const items = [];
  const listeners = [];

  return {
    getSize: () => items.length,
    getItem: index => items[index],
    enqueue: value => {
      items.push(value);
      listeners.forEach(listener => listener(value));
    },
    subscribe: listener => {
      isFunction(listener) && listeners.push(listener);
    },
  };
};
