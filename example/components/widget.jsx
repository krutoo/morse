import React, { Fragment, useState, useEffect, useReducer } from 'react';
import sample from 'lodash/sample';
import { Messages, PHRASES } from '../constants';

export const Widget = ({
  avatarUrl,
  title,
  channel,
}) => {
  const [widgetStatus, setStatus] = useState('[no status]');
  const [chatMessages, addChatMessage] = useReducer((list, item) => [...list, item], []);

  // handle message from channel
  const handleMessage = message => {
    switch (message.topic) {
      case Messages.chatMessage.topic: {
        addChatMessage(message);
        break;
      }
      case Messages.statusQuery.responseTopic: {
        setStatus(message.payload);
        break;
      }
    }
  };

  useEffect(() => {
    // start infinite watching messages
    const watch = message => {
      handleMessage(message);
      channel.take(watch);
    };

    channel.take(watch);
  }, []);

  return (
    <Fragment>
      <img src={avatarUrl} className='avatar' />

      <div className='title'>{title}</div>
      <div className='status'>{widgetStatus}</div>
      <div className='log'>
        {chatMessages.map((message, index) => (
          <div key={index}>{message.payload}</div>
        ))}
      </div>

      <button
        onClick={() => {
          const newMessage = Messages.chatMessage(sample(PHRASES));
          channel.send(newMessage);

          // add self message to own list
          addChatMessage(newMessage);
        }}
      >
        Say something
      </button>
      <button onClick={() => channel.send(Messages.statusQuery())}>
        Request status
      </button>
    </Fragment>
  );
};
