import type { MessageContainer, Queue, TopicLike } from './types.ts';

export const generateId = (): string => Math.random().toString(16).slice(2) + `::${Date.now()}`;

export const mapTopic = (t: TopicLike): string => (typeof t === 'string' ? t : t.topic);

export const copyMessages = <T extends string>(
  source: Queue<MessageContainer>,
  target: Queue<MessageContainer<T>>,
  predicate: (container: MessageContainer) => container is MessageContainer<T>,
): void => {
  const startPosition = source.getSize();

  for (let i = 0; i < startPosition; i++) {
    const container = source.getItem(i);

    container && predicate(container) && target.enqueue(container);
  }
};
