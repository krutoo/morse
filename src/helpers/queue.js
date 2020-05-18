import { isFunction, Validator } from '../utils';
import { isMessage } from '../messages';

export const Queue = ({ validate = stubTrue, middleware } = {}) => {
  const items = [];
  const listeners = [];

  const queue = {
    getSize: () => items.length,
    getItem: index => items[index],
    enqueue: value => {
      validate(value);

      const newSize = items.push(value);

      listeners.forEach(listener => listener(value));

      return newSize;
    },
    subscribe: listener => {
      isFunction(listener) && listeners.push(listener);
    },
  };

  if (middleware) {
    queue.enqueue = middleware(queue)(queue.enqueue);
  }

  return queue;
};

const stubTrue = () => true;

export const MessageQueue = options => Queue({
  ...options,
  validate: Validator(
    isMessage,
    value => `Expected a valid message to enqueue, received: ${value}`
  ),
});
