import { Channel } from '../../src/index'; // aka 'morse'
import { Query } from '../../src/cqrs';
import { delay } from '../utils';
import sample from 'lodash/sample';
import { STATUSES, Messages } from '../constants';

window.addEventListener('DOMContentLoaded', () => {
  // creating channel
  const channel = Channel({
    take: [Messages.statusQuery.queryTopic],
    send: [Messages.statusQuery.responseTopic],
  });

  const handleMessage = message => {
    if (message.topic === Messages.statusQuery.queryTopic) {
      delay(2000).then(() => {
        channel.send(Query.responseOf(message, sample(STATUSES)));
      });
    }
  };

  // handle message and immediately start waiting next
  const watch = message => {
    handleMessage(message);
    channel.take(watch);
  };

  // start watching
  channel.take(watch);
});
