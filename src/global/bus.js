import { MessageQueue } from '../helpers/queue';
import { GLOBAL_BUS_KEY } from '../constants';
import { queueMiddleware } from '../cqrs';

// @todo рассмотреть вариант c window.dispatchEvent (учесть возможное использование в worker'ах)
window[GLOBAL_BUS_KEY] = window[GLOBAL_BUS_KEY] || {
  globalQueue: MessageQueue({ middleware: queueMiddleware }),
};

export const GlobalBus = window[GLOBAL_BUS_KEY];
