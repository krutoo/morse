import { Queue } from './types';

export const createQueue = <T>(): Queue<T> => {
  const items: T[] = [];
  const listeners: Array<(item: T) => void> = [];

  const queue: Queue<T> = {
    getSize: () => items.length,

    getItem: index => items[index],

    enqueue: value => {
      items.push(value);
      listeners.forEach(listener => listener(value));
    },

    observe: fn => {
      listeners.push(fn);

      return {
        unobserve: () => {
          listeners.splice(listeners.indexOf(fn), 1);
        },
      };
    },
  };

  return queue;
};
