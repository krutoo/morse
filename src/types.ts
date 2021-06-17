export type Noop = () => void;

export type AnyFn = (...args: any[]) => any;

export interface Message<T extends string = string> {
  topic: T;
}

export interface PayloadMessage<T extends string = string, P = undefined>
  extends Message<T> {
  payload: P;
}

export type MessageCreator<
  T extends string,
  P extends AnyFn | Noop
> = Message<T> &
  (P extends Noop
    ? {
        (): PayloadMessage<T, undefined>;
        match: (message: Message) => message is PayloadMessage<T, undefined>;
      }
    : {
        (...args: Parameters<P>): PayloadMessage<T, ReturnType<P>>;
        match: (
          message: Message
        ) => message is PayloadMessage<T, ReturnType<P>>;
      });

export type TopicLike = string | Message;

export type TopicOf<T extends TopicLike> = T extends Message ? T['topic'] : T;

export interface MessageContainer<T extends string = string> {
  readonly message: Message<T>;
  readonly author: string;
}

export interface Queue<T> {
  getSize: () => number;
  getItem: (index: number) => T | undefined;
  enqueue: (item: T) => void;
  observe: (fn: (item: T) => void) => { unobserve: Noop };
}

export interface Channel<S extends Message, T extends Message> {
  send: (message: S) => void;
  take: () => Promise<T>;
}
