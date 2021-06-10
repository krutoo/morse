import { createQueue } from './queue';
import { GLOBAL_BUS_KEY } from './constants';
import { MessageContainer, Queue } from './types';

interface GlobalBus {
  queue: Queue<MessageContainer>
}

declare global {
  interface Window { [GLOBAL_BUS_KEY]: GlobalBus }
}

window[GLOBAL_BUS_KEY] = window[GLOBAL_BUS_KEY] || {
  queue: createQueue<MessageContainer>(),
};

export const GlobalBus = window[GLOBAL_BUS_KEY];
