import { MessageCreator, PayloadMessage } from './types';

export function createMessage <T extends string, P extends (...args: any[]) => any> (
  topic: T,
  prepare?: P
): MessageCreator<T, P> {
  const creator: MessageCreator<T, P> = (...args) => ({
    topic,
    payload: prepare?.(...args),
  });

  creator.topic = topic;

  creator.match = (msg): msg is PayloadMessage<T, ReturnType<P>> => msg.topic === topic;

  return creator;
}
