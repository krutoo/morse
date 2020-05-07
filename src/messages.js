import { Type } from './helpers/type';
import { Validator, isString } from './utils';

const MessageFactory = type => {
  const createFactory = topic => {
    Validate.topic(topic);

    const factory = payload => asMessage({ type, topic, payload });

    factory.topic = topic;
    factory.type = type;

    return asFactory(factory);
  };

  createFactory.is = message => message?.type === type;

  return createFactory;
};

export const { is: isMessage, apply: asMessage } = Type('morse::message');

export const { is: isFactory, apply: asFactory } = Type('morse::message-factory');

const Validate = {
  topic: Validator(
    value => isString(value) && value.length > 0,
    () => 'Message topic must be a non empty string'
  ),
};

const Command = MessageFactory('@@command');

const Response = MessageFactory('@@response'); // eslint-disable-line no-shadow

const Query = MessageFactory('@@query');

Query.responseOf = (message, payload) => Response(`[@@response]${message.topic}`)(payload);

export {
  Command,
  Query,
  Response,
};
