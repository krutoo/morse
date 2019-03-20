import Service from './service.js';
import { makeAutoGenerator } from './helpers/generator-helpers.js';
import { getTag } from './utils.js';

export const transportTypeName = 'MorseTransport';

export function createTransport () {
    const queues = {};
    const services = [];
    let watcher = makeAutoGenerator(createWatcher(services, queues));
    const transport = {
        [Symbol.toStringTag]: transportTypeName,
        register (serviceId) {
            const service = new Service(serviceId);
            services.push(service);
            return service;
        },
        enqueue (messageName = '', messageData = {}) {
            if (messageName) {
                if (!Array.isArray(queues[messageName])) {
                    queues[messageName] = [];
                }

                // @todo возможно стоит ввести сущность Message({ data })
                queues[messageName].push({ ...messageData });
            }
        },
        watch () {
            const { done } = watcher.next();
            if (done) {
                watcher = makeAutoGenerator(createWatcher(services, queues));
            }
            setTimeout(transport.watch, 50); // задержка для отладки
        },
    };
    transport.watch();
    return transport;
}

export function isTransport (value) {
    return getTag(value) === transportTypeName;
}

export function* createWatcher (services = [], queues = {}) {
    if (Array.isArray(services) && queues) {
        for (const service of services) {
            if (service.isReady) {
                const queueNames = yield service.getWatchingQueueNames();
                for (const messageName of queueNames) {
                    const queue = queues[messageName];
                    const position = yield service.getQueuePosition(messageName);
                    if (Array.isArray(queue) && position < queue.length) {
                        yield service.takeMessage(messageName, queue[position]);
                    }
                }
            }
        }
    }
}
