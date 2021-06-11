export interface Message <T extends string = string> {
  topic: T
}

export interface PayloadMessage <T extends string = string, P = undefined> extends Message<T> {
  payload: P
}
export interface MessageCreator <T extends string, P extends (...args: any[]) => any> extends Message<T> {
  (...args: Parameters<P>): PayloadMessage<T, ReturnType<P>>
  match: (msg: Message) => msg is PayloadMessage<T, ReturnType<P>>
}

export type TopicLike = string | { topic: string };

export type TopicOf <T extends TopicLike> = T extends { topic: string } ? T['topic'] : T;

export interface MessageContainer <T extends string = string> {
  message: Message<T>
  author: string
}

export interface Queue<T> {
  getSize: () => number
  getItem: (index: number) => T | undefined
  enqueue: (item: T) => void
  observe: (fn: (item: T) => void) => { unobserve: () => void }
}

export interface Channel<S extends Message, T extends Message> {
  send: (message: S) => void
  take: () => Promise<T>
}
