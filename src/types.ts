export interface Message <T extends string = string> {
  topic: T
}

export interface PayloadMessage <T extends string = string, P = undefined> extends Message<T> {
  payload: P
}

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