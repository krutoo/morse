import createService from './create-service.js';
import { packGenerator } from './utils/generator-helpers.js';

export default function createTransport () {
    const queues = {};
    const services = [];
    let watcher = packGenerator(checkServices(services, queues));
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
                if (!Array.isArray(queues[messageName])) {
                    queues[messageName] = [];
                }
                queues[messageName].push({ ...messageData });
            }
        },
        watch () {
            const { done } = watcher.next();
            if (done) {
                watcher = packGenerator(checkServices(services, queues));
            }
            setTimeout(transport.watch, 100); // задержка для отладки
        },
    };
    transport.watch();
    return transport;
}

export function* checkServices (services = [], queues = {}) {
    if (Array.isArray(services) && queues) {
        for (const service of services) {
            const {
                takeMessage,
                getQueuePosition,
                getWatchingQueueNames,
            } = service;
            const messageNames = yield getWatchingQueueNames();
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
