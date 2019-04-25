# Morse.js
CQRS transport API for messaging between apps in one HTML document.

## Motivation
This may be necessary when one page contains applications written on different technologies
(for example, React and Backbone) or when there are two applications on the page divided
into different bundles (separate scripts).

## Install

Using **npm**: coming soon...

## Usage

Simple interface allows to communicate using *commands* and *queries*:

## Example

### `header.js` - entry point of header app

```javascript
import { register } from 'morse';
import HeaderView from './views/header-view.js';

// create a new service and get a interface for messaging.
const headerService = register('backbone-header');

const headerView = new HeaderView({});
headerView.on('log-out', () => headerService.command('user-logout'));
```

### `sidebar.js` - entry point of sidebar app

```javascript
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { register } from 'morse';
import store from './store.js';
import Sidebar from './connectors/sidebar.js';

const sidebarService = register('react-sidebar');

sidebarService.subscribeOnCommand('user-logout', () => {
    store.dispatch({ type: 'CLEAR_USER_DATA' });
});

render((
    <Provider store={store}>
        <Sidebar />
    </Provider>
), document.getElementById('sidebar-container'));
```

## Core concepts

### Transport

Bus that receives *messages* from *services* and issues new messages to services.
Transport adds all new messages to the queues by their type.

Transport can only receive messages and issue them.
It knows nothing about what the message is and what it is for.

### Service

Interface for sending and subscribing to *messages*.
This is a presentation of the application on the page.

Service divides messages into commands and queries (according to the СQRS pattern).
It stores information about how to handle incoming commands and queries of certain types.
It knows nothing about when and how many messages it will receive.

### Message

Messages can store information ready for serialization (no functions or other non-JSON data structures).
