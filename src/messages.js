const MessageFactory = type => {
  const Factory = topic => {
    const creator = payload => ({ type, topic, payload });

    creator.toString = () => topic;
    creator.topic = topic;

    return creator;
  };

  Factory.is = message => message?.type === type;

  return Factory;
};

export const Command = MessageFactory('command');

export const Query = MessageFactory('query');
