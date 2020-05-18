import { Message } from '../src';
import { Query } from '../src/cqrs';

/**
 * Message factories for communication between microservices.
 */
export const Messages = {
  chatMessage: Message('CHAT_MESSAGE'),
  statusQuery: Query('STATUS'),
};

export const PHRASES = [
  'How do you do!',
  'I\'m bored',
  'Is it a your real name?',
  'AFK',
  'I am here =)',
  'idk',
  'do you like pizza?',
  'Miss you',
];

export const STATUSES = [
  'Your ad could be here...',
  'This is my new status!',
  '=)',
  'Avada Kedavra!',
  'Away',
  'Active',
  'At home',
];
