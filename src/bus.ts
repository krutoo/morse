import { createQueue } from './queue.ts';
import { GLOBAL_BUS_KEY } from './constants.ts';
import type { MessageContainer, Queue } from './types.ts';

interface GlobalBus {
  queue: Queue<MessageContainer>;
}

declare global {
  interface Window {
    [GLOBAL_BUS_KEY]: GlobalBus;
  }
}

window[GLOBAL_BUS_KEY] = window[GLOBAL_BUS_KEY] || {
  queue: createQueue<MessageContainer>(),
};

export const GlobalBus: GlobalBus = window[GLOBAL_BUS_KEY];
