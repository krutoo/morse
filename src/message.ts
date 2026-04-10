import type { PayloadMessage, MessageCreator, AnyFn, Message } from './types.ts';

export function createMessage<T extends string>(topic: T): MessageCreator<T, VoidFunction>;

export function createMessage<T extends string, P extends AnyFn | VoidFunction>(
  topic: T,
  prepare: P,
): MessageCreator<T, P>;

export function createMessage<T extends string, P extends AnyFn | VoidFunction>(
  topic: T,
  prepare?: P,
) {
  const creator: MessageCreator<T, VoidFunction> | MessageCreator<T, P> = Object.assign(
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
    },
  );

  return creator;
}
