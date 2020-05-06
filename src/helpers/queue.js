import { isFunction, Validator } from '../utils';
import { isMessage } from '../messages';

export const Queue = ({ isValidItem = () => true } = {}) => {
  const items = [];
  const listeners = [];
  const validate = Validator(
    isValidItem,
    value => `Trying to enqueue invalid value: ${value}`
  );

  return {
    getSize: () => items.length,
    getItem: index => items[index],
    enqueue: value => {
      validate(value);
      items.push(value);
      listeners.forEach(listener => listener(value));
    },
    subscribe: listener => {
      isFunction(listener) && listeners.push(listener);
    },
  };
};

export const MessageQueue = () => Queue({ isValidItem: isMessage });
