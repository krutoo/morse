import { PayloadMessage, MessageCreator, PreparePayload, Message, Noop } from './types';

export function createMessage <T extends string, P extends PreparePayload> (
  topic: T,
  prepare?: P
): P extends Noop ? MessageCreator<T, Noop> : MessageCreator<T, P> {
  const creator: any = prepare
    ? (...args: any[]) => ({
      topic,
      payload: prepare(...args),
    })
    : () => ({
      topic,
      payload: undefined,
    });

  creator.topic = topic;

  creator.match = (msg: Message): msg is PayloadMessage<T, ReturnType<P>> => msg.topic === topic;

  return creator;
}
