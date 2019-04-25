import getTransport from './get-transport.js';
import { createQuery, isQuery } from './query.js';
import { isFunction, getTag } from './utils.js';

/**
 * Service type name.
 * @type {string}
 */
export const TYPE_NAME = 'Morse.Service';

/**
 * Check that value is a Service.
 * @param {*} value Checked value.
 * @return {boolean} Is it value a service.
 */
export const isService = value => getTag(value) === TYPE_NAME;

export const states = new WeakMap();
export const handlers = new WeakMap();
export const watchingTopicNames = new WeakMap();

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

    get [Symbol.toStringTag] () {
        return TYPE_NAME;
    }

    isReady () {
        return states.get(this);
    }

    getWatchingTopicNames () {
        const topicNames = watchingTopicNames.get(this);
        return Array.from(topicNames || []);
    }

    query (queryName, { data, timeout = 5000 } = {}) {
        // @todo if (!isValid(queryName, isString)) {
        return new Promise((resolve, reject) => {
            const topicName = makeQueriesTopicName(queryName);
            getTransport().enqueueMessage(topicName, createQuery({
                data,
                timeout,
                onResolve: resolve,
                onReject: reject,
            }));
        });
    }

    command (commandName, commandData) {
        if (commandName) { // @todo if (!isValid(commandName, isString)) {
            const topicName = makeCommandsTopicName(commandName);
            getTransport().enqueueMessage(topicName, commandData);
        }
    }

    takeMessage (topicName, message) {
        return new Promise(resolveTaking => {
            if (isWatchingTopic.call(this, topicName)) {
                if (isQuery(message)) {
                    if (!message.isPending() && !message.isDone()) {
                        toggleReadyState.call(this, false);
                        message.start().finally(resolveTaking);
                        callHandlers.call(this, topicName, message);
                    } else {
                        resolveTaking();
                    }
                } else {
                    callHandlers.call(this, topicName, message);
                    resolveTaking();
                }
            }
        });
    }

    subscribeOnQuery (queryName, handleQuery) {
        if (queryName) {
            const topicName = makeQueriesTopicName(queryName);
            subscribeOnTopic.call(this, topicName, handleQuery);
        }
    }

    subscribeOnCommand (commandName, handleCommand) {
        if (commandName) {
            const topicName = makeCommandsTopicName(commandName);
            subscribeOnTopic.call(this, topicName, handleCommand);
        }
    }
}

export function makeQueriesTopicName (queryName = '') {
    return `query:${queryName}`;
}

export function makeCommandsTopicName (commandName = '') {
    return `command:${commandName}`;
}

export function initializePrivateData () {
    watchingTopicNames.set(this, new Set());
    handlers.set(this, {});
}

export function isWatchingTopic (topicName = '') {
    const topicNames = watchingTopicNames.get(this);
    let isWatchingTopic = false;
    if (topicNames instanceof Set) {
        isWatchingTopic = topicNames.has(topicName);
    }
    return isWatchingTopic;
}

export function callHandlers (topicName, message) {
    const targetHandlers = handlers[topicName];
    if (Array.isArray(targetHandlers)) {
        const handlerArguments = getHandlerPayload.call(this, message);
        if (handlerArguments && handlerArguments.length > 0) {
            for (const handler of targetHandlers) {
                callHandler.call(this, handler, ...handlerArguments);
            }
        }
    }
}

export function getHandlerPayload (message) {
    const handlerArguments = [];
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
        handlerArguments.push(message); // @todo message.getData()
    }
    return handlerArguments;
}

export function callHandler (handleMessage, ...payload) {
    if (isFunction(handleMessage) && Array.isArray(payload)) {
        handleMessage(...payload);
    }
}

export function subscribeOnTopic (topicName, handleMessage) {
    if (topicName && isFunction(handleMessage)) {
        const topicNames = watchingTopicNames.get(this);
        if (topicNames instanceof Set) {
            topicNames.add(topicName);
            addHandler.call(this, topicName, handleMessage);
        }
        getTransport().subscribeOnTopic(this.id, topicName);
    }
}

export function addHandler (topicName, handler) {
    if (isFunction(handler)) {
        if (!handlers[topicName]) {
            handlers[topicName] = [];
        }
        if (!handlers[topicName].includes(handler)) {
            handlers[topicName].push(handler);
        }
    }
}

export function toggleReadyState (isReady) {
    states.set(this, Boolean(isReady));
}
