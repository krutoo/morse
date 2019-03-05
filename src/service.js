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
        query (queryName, { data, timeout = 5000, receive: onResolve } = {}) {
            if (queryName && isFunction(onResolve)) {
                const queueName = `query:${queryName}`;
                transport.enqueue(queueName, createQuery({ data, timeout, onResolve }));
            }
            return service.getPublicInterface();
        },
        command (commandName, commandData) {
            if (commandName) {
                const queueName = `command:${commandName}`;
                transport.enqueue(queueName, commandData);
            }
            return service.getPublicInterface();
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
            return service.getPublicInterface();
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
            return service.getPublicInterface();
        },
        getPublicInterface () {
            const { command, query, subscribeOnCommand, subscribeOnQuery } = service;
            return { command, query, subscribeOnCommand, subscribeOnQuery };
        },
        isReady () {
            return isReady;
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
                    if (!messageData.isPending() && !messageData.isResolved()) {
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
                for (const handleMessage of targetHandlers) {
                    if (isFunction(handleMessage)) {
                        if (isQuery(messageData)) {
                            if (!messageData.isResolved()) {
                                handleMessage(messageData.getData(), response => {
                                    if (!messageData.isResolved()) {
                                        messageData.resolve(response);
                                        isReady = true;
                                    }
                                });
                            }
                        } else {
                            handleMessage(messageData);
                        }
                    }
                }
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
    };
    return service;
}
