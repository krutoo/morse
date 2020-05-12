import { GlobalBus } from './global/bus';
import { Query, isMessage, isFactory, asMessage } from './messages';
import { MessageQueue } from './helpers/queue';
import { StringSet } from './helpers/string-set';
import { generateId, isFunction, Validator } from './utils';

// @todo хранить статусы вопросов и отвечать шине о статусе по необходимости?
export const Channel = ({ send = [], take = [], needMissed = true } = {}) => {
  Validate.messageFactories(send);
  Validate.messageFactories(take);

  const SENT_TOPICS = StringSet(mapTopics([
    ...send,
    ...take.filter(Query.is).map(Query.responseOf), // add responses for taking queries to send
  ]));
  const RECEIVED_TOPICS = StringSet(mapTopics([
    ...take,
    ...send.filter(Query.is).map(Query.responseOf), // add responses for sent queries to take
  ]));

  const id = generateId(); // @todo хранить все id в глобальной шине чтобы гарантировать уникальность?
  const markAsOwn = message => asMessage({ ...message, meta: { ...message.meta, author: id } });

  const queue = MessageQueue();
  const messageHandlers = [];
  let queuePosition = 0;

  needMissed && copyMessages(GlobalBus.globalQueue, queue, RECEIVED_TOPICS.has);

  // @todo возможно стоит подписываться на конкретные топики чтобы не проверять топик лишний раз
  // можно написать поверх глобальной очереди сортировщик распределяющий дополнительно по очередям конкретных топиков
  GlobalBus.globalQueue.subscribe(newMessage => {
    RECEIVED_TOPICS.has(newMessage.topic)
      && newMessage.meta.author !== id
      && queue.enqueue(newMessage);
  });

  queue.subscribe(newMessage => {
    const messageHandler = messageHandlers.pop();

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
        throw Error(`Topic "${message.topic}" is not specified as sent`);
      }
    },
    take: handler => {
      Validate.callback(handler);

      if (queuePosition < queue.getSize()) {
        handler(queue.getItem(queuePosition++));
      } else {
        messageHandlers.push(handler);
      }
    },
  };
};

const mapTopics = list => list.map(factory => factory.topic);

const copyMessages = (sourceQueue, targetQueue, isSuitableMessage) => {
  const watchStartPosition = sourceQueue.getSize();

  for (let i = 0; i < watchStartPosition; i++) {
    const missedMessage = sourceQueue.getItem(i);

    isSuitableMessage(missedMessage.topic) && targetQueue.enqueue(missedMessage);
  }
};

const Validate = {
  callback: Validator(
    isFunction,
    value => `Expected a function, received: ${value}`
  ),
  message: Validator(
    isMessage,
    value => `Expected valid message, received: ${value}`
  ),
  messageFactories: Validator(
    value => Array.isArray(value) && value.every(isFactory),
    value => `Expected array of message factories, received: ${value}`
  ),
};
