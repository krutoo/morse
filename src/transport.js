import { createService } from './service.js';
import { makeAutoGenerator } from './helpers/generator-helpers.js';

export function createTransport () {
    const queues = {};
    const services = [];
    let watcher = makeAutoGenerator(createWatcher(services, queues));
    const transport = {
        createService (serviceId) {
            const service = createService(serviceId, transport);
            services.push(service);
            return service.getPublicInterface();
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

export function* createWatcher (services = [], queues = {}) {
    if (Array.isArray(services) && queues) {
        for (const service of services) {
            const {
                isReady,
                takeMessage,
                getQueuePosition,
                getWatchingQueueNames,
            } = service;
            const messageNames = yield getWatchingQueueNames();
            if (isReady) {
                for (const messageName of messageNames) {
                    const queue = queues[messageName];
                    const position = yield getQueuePosition(messageName);
                    if (Array.isArray(queue) && position < queue.length) {
                        yield takeMessage(messageName, queue[position]);
                    }
                }
            }
        }
    }
}
