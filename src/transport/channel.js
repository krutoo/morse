import { createObservableQueue } from './observable-queue.js';

export const createPush = queue => item => {
    queue.enqueue(item);
};

export const createTake = (observableQueue, startIndex = 0) => {
    let index = Number(startIndex) || 0;
    return () => new Promise(resolve => {
        if (index < observableQueue.getLength()) {
            resolve(observableQueue.getItem(index));
            index++;
        } else {
            observableQueue.handleEnqueueOnce(item => {
                resolve(item);
                index++;
            });
        }
    });
};

export const createChannel = queue => {
    const observableQueue = createObservableQueue(queue);
    return {
        send: createPush(observableQueue),
        take: createTake(observableQueue),
    };
};
