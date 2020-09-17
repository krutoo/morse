import { Validator, isString, isObject } from './utils';

const Message = topic => {
  validateTopic(topic);

  const createMessage = payload => ({ topic, payload });

  createMessage.topic = topic;

  return createMessage;
};

const isTopic = value => isString(value) && value.length > 0;

const isMessage = value => isObject(value) && isTopic(value.topic);

const validateTopic = Validator(
  isTopic,
  () => 'Message topic must be a non empty string'
);

export { Message, isTopic, isMessage };
