import { MessageQueue } from '../helpers/queue';
import { GLOBAL_BUS_KEY } from '../constants';
import { globalQueueMiddleware } from '../cqrs';

// @todo рассмотреть вариант c window.dispatchEvent (учесть возможное использование в worker'ах)
window[GLOBAL_BUS_KEY] = window[GLOBAL_BUS_KEY] || {
  globalQueue: MessageQueue({ middleware: globalQueueMiddleware }),
};

export const GlobalBus = window[GLOBAL_BUS_KEY];
