import { MessageQueue } from '../helpers/queue';
import { GLOBAL_BUS_KEY } from '../constants';

window[GLOBAL_BUS_KEY] = window[GLOBAL_BUS_KEY] || {
  globalQueue: MessageQueue(),
};

export const GlobalBus = window[GLOBAL_BUS_KEY];
