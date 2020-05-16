import { Validator, isString, isObject } from './utils';

const Message = topic => {
  Validate.topic(topic);

  const createMessage = payload => ({ topic, payload });

  createMessage.topic = topic;

  return createMessage;
};

export const isTopic = value => isString(value) && value.length > 0;

export const isMessage = value => isObject(value) && isTopic(value.topic);

const Validate = {
  topic: Validator(
    isTopic,
    () => 'Message topic must be a non empty string'
  ),
};

export { Message };
