import { Type } from './helpers/type';

export const { is: isMessage, apply: asMessage } = Type('morse::message');

export const { is: isFactory, apply: asFactory } = Type('morse::message-factory');

const MessageFactory = type => {
  const createFactory = topic => {
    const factory = payload => asMessage({ type, topic, payload });

    factory.toString = () => topic;
    factory.topic = topic;
    factory.type = type;

    return asFactory(factory);
  };

  createFactory.is = message => message?.type === type;

  return createFactory;
};

const Command = MessageFactory('@@command');

const Query = MessageFactory('@@query');

Query.responseOf = (message, payload) => Response(`[@@response]${message.topic}`)(payload);

const Response = MessageFactory('@@response'); // eslint-disable-line no-shadow

export {
  Command,
  Query,
  Response,
};
