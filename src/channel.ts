import {
  Message,
  Channel,
  MessageContainer,
} from './types';
import { copyMessages, generateId } from './utils';
import { GlobalBus } from './bus';
import { createQueue } from './queue';

export interface ChannelCreatorOptions <S extends string = string, T extends string = string> {
  send?: S[]
  take?: T[]
  needMissed?: boolean
}

export const createChannel = <S extends string, T extends string> ({
  send = [],
  take = [],
  needMissed = true,
}: ChannelCreatorOptions<S, T>): Channel<Message<S>, Message<T>> => {
  const id = generateId();

  const SENT_TOPICS = new Set<string>(send);
  const RECEIVED_TOPICS = new Set<string>(take);

  const received = createQueue<MessageContainer<T>>();
  const resolvers: Array<(message: Message<T>) => void> = [];

  const toContainer = (message: Message<S>): MessageContainer<S> => ({
    message,
    author: id,
  });

  const isSuitable = (container: MessageContainer): container is MessageContainer<T> =>
    RECEIVED_TOPICS.has(container.message.topic)
    && container.author !== id;

  let queuePosition = 0;

  needMissed && copyMessages(GlobalBus.queue, received, isSuitable);

  GlobalBus.queue.observe(container => {
    isSuitable(container) && received.enqueue(container);
  });

  received.observe(container => {
    // copy handlers to new list for prevent loops "take, handle, take..."
    const actualResolvers = [...resolvers];

    actualResolvers.length > 0 && queuePosition < received.getSize() && queuePosition++;

    for (const handle of actualResolvers) {
      handle(container.message);
    }
  });

  return {
    send: message => {
      if (SENT_TOPICS.has(message.topic)) {
        GlobalBus.queue.enqueue(toContainer(message));
      } else {
        console.error(`Topic "${message.topic}" is not specified as sent`);
      }
    },
    take: () => new Promise(resolve => {
      if (queuePosition < received.getSize()) {
        resolve(received.getItem(queuePosition++)?.message as any);
      } else {
        resolvers.push(resolve);
      }
    }),
  };
};
