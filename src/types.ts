export type Noop = () => void;
export interface Message <T extends string = string> {
  topic: T
}

export interface PayloadMessage <T extends string = string, P = undefined> extends Message<T> {
  payload: P
}

export type PreparePayload =
((...args: any[]) => any)
| Noop;

export type MessageCreator <T extends string, P extends PreparePayload> =
Message<T>
& (P extends Noop ? {
  (): PayloadMessage<T, undefined>
  match: (message: Message) => message is PayloadMessage<T, undefined>
} : {
  (...args: Parameters<P>): PayloadMessage<T, ReturnType<P>>
  match: (message: Message) => message is PayloadMessage<T, ReturnType<P>>
});

export type TopicLike = string | Message;

export type TopicOf <T extends TopicLike> = T extends Message ? T['topic'] : T;

export interface MessageContainer <T extends string = string> {
  message: Message<T>
  author: string
}

export interface Queue<T> {
  getSize: () => number
  getItem: (index: number) => T | undefined
  enqueue: (item: T) => void
  observe: (fn: (item: T) => void) => { unobserve: Noop }
}

export interface Channel<S extends Message, T extends Message> {
  send: (message: S) => void
  take: () => Promise<T>
}
