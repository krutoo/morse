import { isFunction } from '../utils';
import { isMessage } from '../messages';

export const Queue = ({ isValid = () => true } = {}) => {
  const items = [];
  const listeners = [];

  return {
    getSize: () => items.length,
    getItem: index => items[index],
    enqueue: value => {
      if (!isValid(value)) {
        throw Error(`Trying to enqueue invalid value: ${value}`);
      }

      items.push(value);
      listeners.forEach(listener => listener(value));
    },
    subscribe: listener => {
      isFunction(listener) && listeners.push(listener);
    },
  };
};

export const MessageQueue = () => Queue({ isValid: isMessage });
