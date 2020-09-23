import { GlobalBus } from './global/bus';
import { isMessage, isTopic } from './messages';
import { MessageQueue } from './helpers/queue';
import { StringSet } from './helpers/string-set';
import { generateId, isFunction, Validator } from './utils';

// @todo хранить статусы вопросов и отвечать шине о статусе по необходимости?

/*
 * Creates a new channel for sending/receiving messages.
 */
export const Channel = ({ send = [], take = [], needMissed = true } = {}) => {
  const SENT_TOPICS = StringSet(mapTopics(send));
  const RECEIVED_TOPICS = StringSet(mapTopics(take));

  const id = generateId();

  const markAsOwn = message => ({ ...message, meta: { ...message.meta, author: id } });

  const isSuitableMessage = message => {
    const { author, recipient } = message.meta || {};

    return RECEIVED_TOPICS.has(message.topic)
      && author !== id
      && (!recipient || recipient === id);
  };

  const queue = MessageQueue();
  const messageHandlers = [];
  let queuePosition = 0;

  needMissed && copyMessages(GlobalBus.globalQueue, queue, isSuitableMessage);

  GlobalBus.globalQueue.subscribe(newMessage => {
    isSuitableMessage(newMessage) && queue.enqueue(newMessage);
  });

  queue.subscribe(newMessage => {
    // @todo похоже при получении сообщений нужно вызывать ВСЕ зарегистрированные callback'и а не только крайний
    const messageHandler = messageHandlers.shift();

    if (messageHandler) {
      queuePosition < queue.getSize() && queuePosition++;
      messageHandler(newMessage);
    }
  });

  return {
    send: message => {
      Validate.message(message);

      if (SENT_TOPICS.has(message.topic)) {
        GlobalBus.globalQueue.enqueue(markAsOwn(message));
      } else {
        console.error(`Topic "${message.topic}" is not specified as sent`);
      }
    },
    take: handler => {
      Validate.takeCallback(handler);

      if (queuePosition < queue.getSize()) {
        handler(queue.getItem(queuePosition++));
      } else {
        messageHandlers.push(handler);
      }
    },
  };
};

const mapTopics = list => list.map(value => value?.topic || value).filter(isTopic);

const copyMessages = (sourceQueue, targetQueue, isSuitableMessage) => {
  const watchStartPosition = sourceQueue.getSize();

  for (let i = 0; i < watchStartPosition; i++) {
    const missedMessage = sourceQueue.getItem(i);

    isSuitableMessage(missedMessage) && targetQueue.enqueue(missedMessage);
  }
};

const Validate = {
  takeCallback: Validator(
    isFunction,
    value => `Expected a function, received: ${value}`
  ),
  message: Validator(
    isMessage,
    value => `Expected valid message, received: ${value}`
  ),
};
