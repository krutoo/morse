import createQuery from './create-query.js';

export default function createService (serviceId, transport) {
    const watchingQueueNames = [];
    const queuesPositions = {};
    const handlers = {};
    const service = {
        query (queryName, handleResponse) {
            if (queryName && handleResponse instanceof Function) { // @todo isFunction(handleResponse)
                const queueName = `query:${queryName}`;
                service.addHandler(queueName, handleResponse);
                transport.pushMessage(queueName, createQuery());
            }
        },
        command (commandName, commandData) {
            if (commandName) {
                const queueName = `command:${commandName}`;
                transport.pushMessage(queueName, commandData);
            }
        },
        subscribeOnQuery (queryName, handleQuery) {
            if (queryName && handleQuery instanceof Function) {
                const queueName = `query:${queryName}`;
                // @todo доделать запросы
            }
        },
        subscribeOnCommand (commandName, handleCommand) {
            if (commandName && handleCommand instanceof Function) { // @todo isFunction(handleCommand)
                const queueName = `command:${commandName}`;
                if (!watchingQueueNames.includes(queueName)) {
                    watchingQueueNames.push(queueName);
                }
                queuesPositions[queueName] = 0;
                service.addHandler(queueName, handleCommand);
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
                service.callHandlers(queueName, messageData);
                queuesPositions[queueName] += 1;
            }
        },
        callHandlers (queueName, messageData) {
            if (Array.isArray(handlers[queueName])) {
                for (const handleMessage of handlers[queueName]) {
                    handleMessage(messageData);
                }
            }
        },
        addHandler (queueName, handler) {
            if (handler instanceof Function) { // @todo isFunction(handleCommand)
                if (!handlers[queueName]) {
                    handlers[queueName] = [];
                }
                handlers[queueName].push(handler);
            }
        },
    };
    return service;
}
