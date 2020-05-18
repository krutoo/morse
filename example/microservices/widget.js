import React from 'react';
import { render } from 'react-dom';
import { Channel } from '../../src/index'; // aka 'morse'
import { Widget } from '../components/widget.jsx';
import { Messages } from '../constants';

const { currentScript } = document;
const rootElement = currentScript.parentElement;

window.addEventListener('DOMContentLoaded', () => {
  const startButton = document.createElement('button');

  startButton.onclick = initService;
  startButton.innerHTML = 'Run service';

  rootElement.append(startButton);
});

const initService = () => {
  const avatarUrl = rootElement.getAttribute('data-avatar');
  const serviceKey = rootElement.getAttribute('data-service-key');

  // creating channel
  const channel = Channel({
    send: [Messages.chatMessage, Messages.statusQuery.queryTopic],
    take: [Messages.chatMessage, Messages.statusQuery.responseTopic],
  });

  // init view
  rootElement.innerHTML = '';
  render(
    (
      <Widget
        channel={channel}
        title={serviceKey}
        avatarUrl={avatarUrl}
      />
    ),
    rootElement
  );
};
