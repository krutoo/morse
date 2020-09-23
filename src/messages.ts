import { Validator, isString, isObject } from './utils';

export type Message<T extends string> = {
  topic: T,
  meta?: any,
  payload?: any,
}

export interface MessageCreator<T extends string> {
  (payload: any): Message<T>
  topic: T
}

export const Message = <T extends string>(topic: T): MessageCreator<T> => {
  validateTopic(topic);

  const createMessage: MessageCreator<T> = payload => ({ topic, payload });

  createMessage.topic = topic;

  return createMessage;
};

export const isTopic = (value: any): boolean => isString(value) && value.length > 0;

export const isMessage = (value: any): boolean => isObject(value) && isTopic(value.topic);

const validateTopic = Validator(isTopic, () => 'Message topic must be a non empty string');
