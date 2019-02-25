const morseRadioKey = `MorseRadio-${(1791).toString(2)}`;

export function register (id) {
    return getTransport().createService(id);
}

export function getTransport () {
    if (!window[morseRadioKey]) {
        const { queues, createService } = createTransport();
        window[morseRadioKey] = { queues, createService  }; // public transport API
    }
    return window[morseRadioKey];
}

// @todo отделить CQRS от транспорта!
export function createTransport () {
    const queues = {};
    const services = [];
    const transport = {
        createService (serviceId = Math.random().toString(16).slice(2)) {
            const service = createService(serviceId, transport);
            const {
                query,
                command,
                subscribeOnQuery,
                subscribeOnCommand,
            } = service;
            services.push(service);
            return { query, command, subscribeOnQuery, subscribeOnCommand }; // public service API
        },
        pushMessage (messageName = '', messageData = {}) {
            if (messageName) {
                transport.checkQueueExisting(messageName);
                queues[messageName].push({ ...messageData });
            }
        },
        checkQueueExisting (messageName = '') {
            if (!Array.isArray(queues[messageName])) {
                queues[messageName] = [];
            }
        },
        watch () {
            // @todo чтобы при большом количестве сервисов/сообщений не было зависаний
            // нужно сделать генератор и бесконечно его итерировать
            for (const service of services) {
                const {
                    takeMessage,
                    getWatchingQueueNames,
                    getQueuePosition,
                } = service;
                const messageNames = getWatchingQueueNames();
                for (const messageName of messageNames) {
                    const queue = queues[messageName];
                    const position = getQueuePosition(messageName);
                    if (Array.isArray(queue) && position < queue.length) {
                        takeMessage(messageName, queue[position]);
                    }
                }
            }
            setTimeout(transport.watch, 100); // 200 мс для отладки
        },
    };
    transport.watch();
    return transport;
}

export function createService (serviceId, transport) {
    const watchingQueueNames = [];
    const queuePositions = {};
    const handlers = {};
    const service = {
        query (queryName, handleResponse) {
            if (queryName && handleResponse instanceof Function) { // @todo isFunction(handleResponse)
                handlers[queryName] = handleResponse;
                transport.pushMessage(queryName, createQuery());
            }
        },
        command (commandName, commandData) {
            transport.pushMessage(commandName, commandData);
        },
        subscribeOnQuery (queryName, handleQuery) {
            if (queryName && handleQuery instanceof Function) {
                // @todo доделать запросы
            }
        },
        subscribeOnCommand (commandName, handleCommand) {
            if (commandName && handleCommand instanceof Function) { // @todo isFunction(handleCommand)
                if (!watchingQueueNames.includes(commandName)) {
                    watchingQueueNames.push(commandName);
                }
                queuePositions[commandName] = 0;
                handlers[commandName] = handleCommand;
                transport.checkQueueExisting(commandName);
            }
        },
        getWatchingQueueNames () {
            return [...watchingQueueNames];
        },
        getQueuePosition (messageName) {
            transport.checkQueueExisting(messageName);
            return queuePositions[messageName] || 0;
        },
        takeMessage (messageName, messageData) {
            if (queuePositions.hasOwnProperty(messageName)) {
                handlers[messageName](messageData);
                queuePositions[messageName] += 1;
            }
        },
    };
    return service;
}

export function createQuery () {
    let isPending = false;
    let isResolved = false;
    return {
        isResolved () {
            return !isPending && isResolved;
        },
        isPending () {
            return isPending;
        },
        start () {
            isPending = true;
        },
        resolve () {
            isPending = false;
            isResolved = true;
        },
    };
}
