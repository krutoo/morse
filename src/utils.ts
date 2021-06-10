import { MessageContainer, Queue } from './types';

export const generateId = () => Math.random().toString(16).slice(2);

export const copyMessages = <T extends string> (
  source: Queue<MessageContainer>,
  target: Queue<MessageContainer<T>>,
  isSuitable: (container: MessageContainer) => container is MessageContainer<T>
) => {
  const startPosition = source.getSize();

  for (let i = 0; i < startPosition; i++) {
    const container = source.getItem(i);

    container && isSuitable(container) && target.enqueue(container);
  }
};
