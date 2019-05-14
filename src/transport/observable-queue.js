import { isFunction } from '../utils.js';

export const makeFunctionOnlyPush = list => handler => {
  isFunction(handler) && list.push(handler);
};

export const createObservableQueue = queue => {
  const handlers = [];
  const temporaryHandlers = [];
  return {
    ...queue,
    enqueue: item => {
      queue.enqueue(item);

      // при большом количестве слушателей здесь заметно провиснет производительность
      for (const handler of handlers) {
        handler(item);
      }
      while (temporaryHandlers.length > 0) {
        temporaryHandlers.pop()(item);
      }
    },
    handleEnqueue: makeFunctionOnlyPush(handlers),
    handleEnqueueOnce: makeFunctionOnlyPush(temporaryHandlers),
  };
};
