import { createQuery, isQuery } from './query.js';
import { isFunction } from './utils.js';

export function createService (serviceId, transport) {
    let isReady = true;
    const watchingQueueNames = []; // @todo хранить позиции в очередях - не задача сервиса
    const queuesPositions = {};
    const handlers = {};
    const service = {
        get id () {
            return serviceId;
        },
        get isReady () {
            return isReady;
        },
        getPublicInterface () {
            const { command, query, subscribeOnCommand, subscribeOnQuery } = service;
            return { command, query, subscribeOnCommand, subscribeOnQuery };
        },
        query (queryName, { data, timeout = 5000 } = {}) {
            // @todo validate arguments
            return new Promise((resolve, reject) => {
                const queueName = `query:${queryName}`;
                transport.enqueue(queueName, createQuery({
                    data,
                    timeout,
                    onResolve: resolve,
                    onReject: reject,
                }));
            });
        },
        command (commandName, commandData) {
            if (commandName) {
                const queueName = `command:${commandName}`;
                transport.enqueue(queueName, commandData);
            }
        },
        subscribeOnQuery (queryName, handleQuery) {
            if (queryName && isFunction(handleQuery)) {
                const queueName = `query:${queryName}`;
                if (!watchingQueueNames.includes(queueName)) {
                    watchingQueueNames.push(queueName);
                    queuesPositions[queueName] = 0;
                }
                service.addHandler(queueName, handleQuery);
            }
        },
        subscribeOnCommand (commandName, handleCommand) {
            if (commandName && isFunction(handleCommand)) {
                const queueName = `command:${commandName}`;
                if (!watchingQueueNames.includes(queueName)) {
                    watchingQueueNames.push(queueName);
                    queuesPositions[queueName] = 0;
                }
                service.addHandler(queueName, handleCommand);
            }
        },
        addHandler (queueName, handler) {
            if (isFunction(handler)) {
                if (!handlers[queueName]) {
                    handlers[queueName] = [];
                }
                if (!handlers[queueName].includes(handler)) {
                    handlers[queueName].push(handler);
                }
            }
        },
        getWatchingQueueNames () {
            return [...watchingQueueNames];
        },
        getQueuePosition (queueName) {
            return queuesPositions[queueName] || 0;
        },
        takeMessage (queueName, messageData) {
            if (queuesPositions.hasOwnProperty(queueName)) {
                if (isQuery(messageData)) {
                    if (!messageData.isPending() && !messageData.isDone()) {
                        isReady = false;
                        messageData.start();
                        service.callHandlers(queueName, messageData);
                    }
                } else {
                    service.callHandlers(queueName, messageData);
                }
                queuesPositions[queueName] += 1;
            }
        },
        callHandlers (queueName, messageData) {
            const targetHandlers = handlers[queueName];
            if (Array.isArray(targetHandlers)) {
                for (const handler of targetHandlers) {
                    service.callHandler(handler, messageData);
                }
            }
        },
        callHandler (handleMessage, messageData) {
            if (isFunction(handleMessage)) {
                if (isQuery(messageData)) {
                    if (!messageData.isDone()) {
                        handleMessage(
                            messageData.getData(),
                            response => {
                                if (!messageData.isDone()) {
                                    messageData.resolve(response);
                                    isReady = true;
                                }
                            },
                            error => {
                                messageData.reject(error);
                                isReady = true;
                            },
                        );
                    }
                } else {
                    handleMessage(messageData);
                }
            }
        },
    };
    return service;
}
