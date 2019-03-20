import getTransport from './get-transport.js';
import { createQuery, isQuery } from './query.js';
import { isFunction } from './utils.js';

const states = new WeakMap();
const handlers = new WeakMap();
const queuesPositions = new WeakMap();
const watchingQueueNames = new WeakMap();

export default class Service {
    constructor (id) {
        initializePrivateData.call(this);
        toggleReadyState.call(this, true);
        Object.assign(this, {
            get id () {
                return id;
            },
        });
    }

    get isReady () {
        return states.get(this);
    }

    getWatchingQueueNames () {
        // @todo возможно сервис не должен знать о том какие сообщения он обрабатывает
        return Array.from(watchingQueueNames.get(this) || []);
    }

    getQueuePosition (queryName) {
        // @todo возможно сервис не должен знать о том какие сообщения он обрабатывает
        const positions = queuesPositions.get(this) || {};
        return positions[queryName] || 0;
    }

    query (queryName, { data, timeout = 5000 } = {}) {
        return new Promise((resolve, reject) => {
            const queueName = makeQueriesQueueName(queryName);
            getTransport().enqueue(queueName, createQuery({
                data,
                timeout,
                onResolve: resolve,
                onReject: reject,
            }));
        });
    }

    command (commandName, commandData) {
        if (commandName) { // @todo if (!isValid(commandName, isString)) {
            const queueName = makeCommandsQueueName(commandName);
            getTransport().enqueue(queueName, commandData);
        }
    }

    takeMessage (queueName, message) {
        const positions = queuesPositions.get(this) || {};
        if (positions.hasOwnProperty(queueName)) {
            if (isQuery(message)) {
                if (!message.isPending() && !message.isDone()) {
                    toggleReadyState.call(this, false);
                    message.start();
                    callHandlers.call(this, queueName, message);
                }
            } else {
                callHandlers.call(this, queueName, message);
            }
            positions[queueName] += 1; // не менять позицию сразу
        }
    }

    subscribeOnQuery (queryName, handleQuery) {
        if (queryName) {
            const queueName = makeQueriesQueueName(queryName);
            subscribeOnQueue.call(this, queueName, handleQuery);
        }
    }

    subscribeOnCommand (commandName, handleCommand) {
        if (commandName) {
            const queueName = makeCommandsQueueName(commandName);
            subscribeOnQueue.call(this, queueName, handleCommand);
        }
    }
}

export function makeQueriesQueueName (queryName = '') {
    return `query:${queryName}`;
}

export function makeCommandsQueueName (commandName = '') {
    return `command:${commandName}`;
}

export function initializePrivateData () {
    watchingQueueNames.set(this, []);
    queuesPositions.set(this, {});
    handlers.set(this, {});
}

export function callHandlers (queueName, message) {
    const targetHandlers = handlers[queueName];
    if (Array.isArray(targetHandlers)) {
        const handlerArguments = getHandlerPayload.call(this, message);
        if (handlerArguments && handlerArguments.length > 0) {
            for (const handler of targetHandlers) {
                callHandler.call(this, handler, handlerArguments);
            }
        }
    }
}

export function getHandlerPayload (message) {
    const handlerArguments = []
    if (isQuery(message) && !message.isDone()) {
        handlerArguments.push(
            message.getData(),
            response => {
                if (!message.isDone()) {
                    message.resolve(response);
                    toggleReadyState.call(this, true);
                }
            },
            error => {
                message.reject(error);
                toggleReadyState.call(this, true);
            },
        );
    } else {
        handlerArguments.push(message);
    }
    return handlerArguments;
}

export function callHandler (handleMessage, payload) {
    if (isFunction(handleMessage) && Array.isArray(payload)) {
        handleMessage(...payload);
    }
}

export function subscribeOnQueue (queueName, handleMessage) {
    if (queueName && isFunction(handleMessage)) {
        const queueNames = watchingQueueNames.get(this);
        const positions = queuesPositions.get(this);
        if (!queueNames.includes(queueName)) {
            queueNames.push(queueName);
            positions[queueName] = 0;
        }
        addHandler.call(this, queueName, handleMessage);
    }
}

export function addHandler (queueName, handler) {
    if (isFunction(handler)) {
        if (!handlers[queueName]) {
            handlers[queueName] = [];
        }
        if (!handlers[queueName].includes(handler)) {
            handlers[queueName].push(handler);
        }
    }
}

export function toggleReadyState (isReady) {
    states.set(this, Boolean(isReady));
}
