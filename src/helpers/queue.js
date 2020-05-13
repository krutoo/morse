import { isFunction, Validator } from '../utils';
import { isMessage } from '../messages';

export const Queue = ({ validate = stubTrue } = {}) => {
  const items = [];
  const listeners = [];

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

const stubTrue = () => true;

export const MessageQueue = () => Queue({
  validate: Validator(
    isMessage,
    value => `Trying to enqueue invalid value: ${value}`
  ),
});
