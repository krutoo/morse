import { PayloadMessage, MessageCreator, PreparePayload, Message, Noop } from './types';

export function createMessage <T extends string> (
  topic: T
): MessageCreator<T, Noop>

export function createMessage <T extends string, P extends PreparePayload> (
  topic: T,
  prepare: P
): MessageCreator<T, P>

export function createMessage <T extends string, P extends PreparePayload> (
  topic: T,
  prepare?: P
) {
  const creator: MessageCreator<T, Noop> | MessageCreator<T, P> = Object.assign(
    prepare
      ? (...args: Parameters<P>): PayloadMessage<T, ReturnType<P>> => ({
        topic,
        payload: prepare(...args),
      })
      : (): PayloadMessage<T, undefined> => ({
        topic,
        payload: undefined,
      }),
    {
      topic,
      match: (msg: Message): msg is PayloadMessage<T, ReturnType<P>> => msg.topic === topic,
    }
  );

  return creator;
}
